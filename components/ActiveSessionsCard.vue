<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">活跃会话</h2>
    
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
    </div>

    <div v-else-if="sessions.length === 0" class="text-center py-8 text-gray-500">
      暂无活跃会话
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="border rounded-lg p-4 hover:shadow-md transition-shadow"
        :class="isCurrentSession(session) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span
                v-if="isCurrentSession(session)"
                class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                当前会话
              </span>
              <span class="text-sm text-gray-600">
                {{ formatDateTime(session.createdAt) }}
              </span>
            </div>

            <div class="text-sm text-gray-700 space-y-1">
              <div v-if="session.ipAddress">
                <span class="font-medium">IP地址:</span> {{ session.ipAddress }}
              </div>
              <div v-if="session.userAgent" class="text-xs text-gray-500 truncate">
                {{ session.userAgent }}
              </div>
              <div class="text-xs text-gray-500">
                过期时间: {{ formatDateTime(session.expiresAt) }}
              </div>
            </div>
          </div>

          <button
            v-if="!isCurrentSession(session)"
            @click="confirmRevokeSession(session.id)"
            :disabled="revoking === session.id"
            class="ml-4 px-3 py-2 bg-red-600 text-white text-sm rounded-xl font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {{ revoking === session.id ? '撤销中...' : '撤销' }}
          </button>
        </div>
      </div>

      <div v-if="sessions.length > 1" class="pt-4 border-t">
        <button
          @click="confirmRevokeAllSessions"
          :disabled="revokingAll"
          class="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
        >
          {{ revokingAll ? '撤销中...' : '撤销所有其他会话' }}
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
interface Session {
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  expiresAt: Date;
}

const sessions = ref<Session[]>([]);
const loading = ref(true);
const revoking = ref<string | null>(null);
const revokingAll = ref(false);
const { showNotification } = useNotification();
const showConfirm = ref(false);
const confirmTitle = ref('');
const confirmMessage = ref('');
const pendingAction = ref<(() => void) | null>(null);

// 获取当前会话ID（从cookie中）
const currentSessionId = useCookie('better-auth.session_token').value;

const isCurrentSession = (session: Session) => {
  return session.id === currentSessionId;
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

const loadSessions = async () => {
  try {
    loading.value = true;
    const data = await $fetch<Session[]>('/api/security/sessions');
    sessions.value = data;
  } catch (error) {
    console.error('加载会话列表失败:', error);
    showNotification({ message: '加载会话列表失败', type: 'error' });
  } finally {
    loading.value = false;
  }
};

const confirmRevokeSession = (sessionId: string) => {
  confirmTitle.value = '撤销会话';
  confirmMessage.value = '确定要撤销此会话吗？';
  pendingAction.value = () => revokeSession(sessionId);
  showConfirm.value = true;
};

const confirmRevokeAllSessions = () => {
  confirmTitle.value = '撤销所有其他会话';
  confirmMessage.value = '确定要撤销所有其他会话吗？这将登出所有其他设备。';
  pendingAction.value = () => revokeAllOtherSessions();
  showConfirm.value = true;
};

const handleConfirmAction = () => {
  if (pendingAction.value) {
    pendingAction.value();
    pendingAction.value = null;
  }
};

const revokeSession = async (sessionId: string) => {
  try {
    revoking.value = sessionId;
    await $fetch(`/api/security/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    showNotification({ message: '会话已撤销', type: 'success' });
    await loadSessions();
  } catch (error) {
    console.error('撤销会话失败:', error);
    showNotification({ message: '撤销会话失败', type: 'error' });
  } finally {
    revoking.value = null;
  }
};

const revokeAllOtherSessions = async () => {
  try {
    revokingAll.value = true;
    const otherSessions = sessions.value.filter(s => !isCurrentSession(s));
    await Promise.all(
      otherSessions.map(session =>
        $fetch(`/api/security/sessions/${session.id}`, {
          method: 'DELETE',
        })
      )
    );
    showNotification({ message: '所有其他会话已撤销', type: 'success' });
    await loadSessions();
  } catch (error) {
    console.error('撤销会话失败:', error);
    showNotification({ message: '撤销会话失败', type: 'error' });
  } finally {
    revokingAll.value = false;
  }
};

onMounted(() => {
  loadSessions();
});
</script>
