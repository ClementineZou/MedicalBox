<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">登录历史</h2>
    
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
    </div>

    <div v-else-if="loginHistory.length === 0" class="text-center py-8 text-gray-500">
      暂无登录记录
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="record in loginHistory"
        :key="record.id"
        class="border rounded-lg p-4 hover:shadow-md transition-shadow"
        :class="[
          record.success ? 'border-gray-200' : 'border-red-200 bg-red-50',
          isCurrentDevice(record) ? 'ring-2 ring-blue-300 bg-blue-50' : ''
        ]"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span
                v-if="isCurrentDevice(record)"
                class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                当前设备
              </span>
              <span
                class="px-2 py-1 rounded text-xs font-medium"
                :class="record.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ record.success ? '成功' : '失败' }}
              </span>
              <span class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {{ getLoginMethodText(record.loginMethod) }}
              </span>
              <span class="text-sm text-gray-600">
                {{ formatDateTime(record.createdAt) }}
              </span>
            </div>

            <div class="text-sm text-gray-700 space-y-1">
              <div v-if="record.ipAddress">
                <span class="font-medium">IP地址:</span> {{ record.ipAddress }}
                <span v-if="record.location" class="text-gray-500 ml-2">({{ record.location }})</span>
              </div>
              <div v-if="record.deviceInfo">
                <span class="font-medium">设备:</span> {{ record.deviceInfo }}
              </div>
              <div v-if="record.userAgent" class="text-xs text-gray-500 truncate">
                {{ record.userAgent }}
              </div>
              <div v-if="!record.success && record.failReason" class="text-red-600">
                <span class="font-medium">失败原因:</span> {{ record.failReason }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface LoginHistory {
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  location: string | null;
  deviceInfo: string | null;
  loginMethod: string;
  success: boolean;
  failReason: string | null;
  createdAt: Date;
}

const loginHistory = ref<LoginHistory[]>([]);
const loading = ref(true);
const currentIpAddress = ref<string | null>(null);
const currentUserAgent = ref<string | null>(null);

// 获取当前设备信息
onMounted(() => {
  currentUserAgent.value = navigator.userAgent;
  // 从第一条成功的登录记录推断当前IP（因为就是刚登录的）
});

const getLoginMethodText = (method: string) => {
  const methodMap: Record<string, string> = {
    email: '邮箱密码',
    passkey: 'Passkey',
    oauth: 'OAuth',
  };
  return methodMap[method] || method;
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

const isCurrentDevice = (record: LoginHistory) => {
  // 如果是最近的成功登录且UserAgent匹配，认为是当前设备
  if (!record.success || !record.userAgent) return false;
  return record.userAgent === currentUserAgent.value;
};

const loadLoginHistory = async () => {
  try {
    loading.value = true;
    const data = await $fetch<LoginHistory[]>('/api/security/login-history');
    loginHistory.value = data;
    // 设置当前IP为最近一次成功登录的IP
    const latestSuccess = data.find(r => r.success);
    if (latestSuccess) {
      currentIpAddress.value = latestSuccess.ipAddress;
    }
  } catch (error) {
    console.error('加载登录历史失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadLoginHistory();
});
</script>
