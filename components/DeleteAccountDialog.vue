<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style="z-index: 9999;">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl" @click.stop>
          <!-- Header -->
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900">删除账户</h3>
          </div>

          <!-- Warning Message -->
          <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p class="text-red-800 text-sm font-medium mb-2">⚠️ 警告：此操作不可撤销！</p>
            <p class="text-red-700 text-sm">
              删除账户将永久删除以下所有数据：
            </p>
            <ul class="mt-2 text-red-700 text-sm list-disc list-inside space-y-1">
              <li>所有药品信息</li>
              <li>所有用药记录</li>
              <li>所有提醒设置</li>
              <li>所有生命体征记录</li>
              <li>个人账户信息</li>
            </ul>
          </div>

          <!-- Confirmation Steps -->
          <div class="space-y-4 mb-6">
            <!-- Step 1: Confirm Understanding -->
            <div v-if="step === 1">
              <p class="text-gray-700 mb-4">
                请确认你理解此操作的后果，并希望继续。
              </p>
              <label class="flex items-start space-x-3 cursor-pointer">
                <input 
                  v-model="understood" 
                  type="checkbox" 
                  class="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span class="text-sm text-gray-700">
                  我理解删除账户将永久删除所有数据，且此操作不可恢复
                </span>
              </label>
            </div>

            <!-- Step 2: Password Confirmation -->
            <div v-if="step === 2">
              <p class="text-gray-700 mb-4">
                请输入你的密码以确认删除：
              </p>
              <input
                v-model="password"
                type="password"
                placeholder="输入密码"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                @keyup.enter="handleConfirm"
              />
              <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-3">
            <button
              @click="handleCancel"
              :disabled="loading"
              class="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              取消
            </button>
            <button
              v-if="step === 1"
              @click="nextStep"
              :disabled="!understood"
              class="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              继续
            </button>
            <button
              v-if="step === 2"
              @click="handleConfirm"
              :disabled="loading || !password"
              class="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span v-if="!loading">确认删除</span>
              <span v-else class="flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                删除中...
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', password: string): void
}>();

const step = ref(1);
const understood = ref(false);
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleCancel = () => {
  emit('update:modelValue', false);
  resetDialog();
};

const nextStep = () => {
  if (understood.value) {
    step.value = 2;
  }
};

const handleConfirm = () => {
  if (!password.value) {
    error.value = '请输入密码';
    return;
  }
  
  error.value = '';
  emit('confirm', password.value);
};

const resetDialog = () => {
  step.value = 1;
  understood.value = false;
  password.value = '';
  error.value = '';
};

// Reset when dialog closes
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    setTimeout(resetDialog, 300); // Wait for animation
  }
});

defineExpose({
  setLoading: (value: boolean) => {
    loading.value = value;
  },
  setError: (message: string) => {
    error.value = message;
  },
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>
