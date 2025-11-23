<template>
  <div 
    v-if="modelValue" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="handleClose"
  >
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
      <!-- Header -->
      <div class="flex items-start mb-4">
        <div class="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
          <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900">解绑{{ providerName }}账户</h3>
          <p class="text-sm text-gray-600 mt-1">此操作不可恢复</p>
        </div>
      </div>

      <!-- Content -->
      <div class="mb-6">
        <p class="text-gray-700 mb-4">
          您确定要解绑{{ providerName }}账户吗？解绑后，您将无法使用此{{ providerName }}账户登录系统。
        </p>
        
        <div v-if="!hasPassword" class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <div>
              <p class="text-yellow-800 text-sm font-medium">警告</p>
              <p class="text-yellow-700 text-sm mt-1">
                您尚未设置密码。解绑后，如果没有其他登录方式，您将无法登录账户。建议先设置密码。
              </p>
            </div>
          </div>
        </div>

        <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-red-700 text-sm">{{ error }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex space-x-3">
        <button
          @click="handleClose"
          :disabled="loading"
          class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          取消
        </button>
        <button
          @click="handleConfirm"
          :disabled="loading"
          class="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span v-if="!loading">确认解绑</span>
          <span v-else>处理中...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  accountId: string;
  providerId: string;
  hasPassword?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
}

const props = withDefaults(defineProps<Props>(), {
  hasPassword: false
});

const emit = defineEmits<Emits>();

const loading = ref(false);
const error = ref('');

const providerName = computed(() => {
  const names: Record<string, string> = {
    'github': 'GitHub',
    'google': 'Google',
    'facebook': 'Facebook',
  };
  return names[props.providerId] || props.providerId;
});

const handleClose = () => {
  if (!loading.value) {
    error.value = '';
    emit('update:modelValue', false);
  }
};

const handleConfirm = () => {
  error.value = '';
  emit('confirm');
};

// Expose methods for parent component
const setLoading = (value: boolean) => {
  loading.value = value;
};

const setError = (value: string) => {
  error.value = value;
};

defineExpose({
  setLoading,
  setError
});
</script>
