<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">可信设备管理</h2>
    
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
    </div>

    <div v-else-if="trustedDevices.length === 0" class="text-center py-8 text-gray-500">
      暂无可信设备
      <p class="text-sm mt-2">登录时选择"信任此设备"后，设备将显示在这里</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="device in trustedDevices"
        :key="device.id"
        class="border rounded-lg p-4 hover:shadow-md transition-shadow"
        :class="[
          'border-gray-200',
          isCurrentDevice(device) ? 'ring-2 ring-blue-300 bg-blue-50' : ''
        ]"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-medium text-gray-900">{{ device.deviceName }}</h3>
              <span
                v-if="isCurrentDevice(device)"
                class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                当前设备
              </span>
              <span
                class="px-2 py-1 rounded text-xs font-medium"
                :class="isExpiringSoon(device.trustExpires) ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'"
              >
                {{ isExpiringSoon(device.trustExpires) ? '即将过期' : '有效' }}
              </span>
            </div>

            <div class="text-sm text-gray-700 space-y-1">
              <div v-if="device.ipAddress">
                <span class="font-medium">IP地址:</span> {{ device.ipAddress }}
              </div>
              <div>
                <span class="font-medium">最后使用:</span> {{ formatDateTime(device.lastUsed) }}
              </div>
              <div>
                <span class="font-medium">信任过期:</span> {{ formatDateTime(device.trustExpires) }}
              </div>
              <div v-if="device.userAgent" class="text-xs text-gray-500 truncate">
                {{ device.userAgent }}
              </div>
            </div>
          </div>

          <button
            v-if="!isCurrentDevice(device)"
            @click="confirmRemoveDevice(device.id)"
            :disabled="removing === device.id"
            class="ml-4 px-3 py-2 bg-red-600 text-white text-sm rounded-xl font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {{ removing === device.id ? '移除中...' : '移除' }}
          </button>
          <span v-else class="ml-4 px-3 py-2 bg-gray-200 text-gray-600 text-sm rounded-xl cursor-not-allowed">
            当前设备
          </span>
        </div>
      </div>

      <div class="pt-4 border-t">
        <button
          @click="confirmRemoveAllDevices"
          :disabled="removingAll"
          class="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
        >
          {{ removingAll ? '移除中...' : '移除所有其他可信设备' }}
        </button>
      </div>
    </div>

    <!-- 确认对话框 -->
    <SecurityConfirmDialog
      v-model="showConfirm"
      :title="confirmTitle"
      :message="confirmMessage"
      @confirm="handleConfirmAction"
    />
  </div>
</template>

<script setup lang="ts">
interface TrustedDevice {
  id: string;
  userId: string;
  deviceName: string;
  deviceId: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastUsed: Date;
  trustExpires: Date;
  isActive: boolean;
}

const trustedDevices = ref<TrustedDevice[]>([]);
const loading = ref(true);
const removing = ref<string | null>(null);
const removingAll = ref(false);
const { showNotification } = useNotification();
const currentUserAgent = ref<string | null>(null);
const currentDeviceId = ref<string | null>(null);
const showConfirm = ref(false);
const confirmTitle = ref('');
const confirmMessage = ref('');
const pendingAction = ref<(() => void) | null>(null);

// 生成设备指纹
const generateDeviceId = () => {
  const ua = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return btoa(`${ua}-${screen}-${timezone}`).substring(0, 32);
};

const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isCurrentDevice = (device: TrustedDevice) => {
  // 通过deviceId或userAgent判断是否为当前设备
  if (device.deviceId === currentDeviceId.value) return true;
  if (device.userAgent === currentUserAgent.value) return true;
  return false;
};

const isExpiringSoon = (expiresAt: Date) => {
  const now = new Date();
  const expires = new Date(expiresAt);
  const daysUntilExpiry = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 7;
};

const loadTrustedDevices = async () => {
  try {
    loading.value = true;
    const data = await $fetch<TrustedDevice[]>('/api/security/trusted-devices');
    trustedDevices.value = data;
  } catch (error) {
    console.error('加载可信设备失败:', error);
    showNotification({ message: '加载可信设备失败', type: 'error' });
  } finally {
    loading.value = false;
  }
};

const confirmRemoveDevice = (deviceId: string) => {
  confirmTitle.value = '移除可信设备';
  confirmMessage.value = '确定要移除此可信设备吗？下次登录时需要重新验证。';
  pendingAction.value = () => removeDevice(deviceId);
  showConfirm.value = true;
};

const confirmRemoveAllDevices = () => {
  const otherDevices = trustedDevices.value.filter(d => !isCurrentDevice(d));
  if (otherDevices.length === 0) {
    showNotification({ message: '没有其他可信设备需要移除', type: 'info' });
    return;
  }
  confirmTitle.value = '移除所有其他可信设备';
  confirmMessage.value = `确定要移除所有其他可信设备吗（${otherDevices.length}个）？下次登录时需要重新验证。`;
  pendingAction.value = () => removeAllDevices();
  showConfirm.value = true;
};

const handleConfirmAction = () => {
  if (pendingAction.value) {
    pendingAction.value();
    pendingAction.value = null;
  }
};

const removeDevice = async (deviceId: string) => {
  try {
    removing.value = deviceId;
    await $fetch(`/api/security/trusted-devices/${deviceId}`, {
      method: 'DELETE',
    });
    showNotification({ message: '可信设备已移除', type: 'success' });
    await loadTrustedDevices();
  } catch (error) {
    console.error('移除设备失败:', error);
    showNotification({ message: '移除设备失败', type: 'error' });
  } finally {
    removing.value = null;
  }
};

const removeAllDevices = async () => {
  const otherDevices = trustedDevices.value.filter(d => !isCurrentDevice(d));

  try {
    removingAll.value = true;
    await Promise.all(
      otherDevices.map(device =>
        $fetch(`/api/security/trusted-devices/${device.id}`, {
          method: 'DELETE',
        })
      )
    );
    showNotification({ message: '所有其他可信设备已移除', type: 'success' });
    await loadTrustedDevices();
  } catch (error) {
    console.error('移除设备失败:', error);
    showNotification({ message: '移除设备失败', type: 'error' });
  } finally {
    removingAll.value = false;
  }
};

onMounted(() => {
  currentUserAgent.value = navigator.userAgent;
  currentDeviceId.value = generateDeviceId();
  loadTrustedDevices();
});
</script>
