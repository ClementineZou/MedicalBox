<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-verify-title"
      >
        <!-- Backdrop -->
        <div 
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          @click="$emit('close')"
        ></div>
        
        <!-- Dialog Panel -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div 
            class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 id="privacy-verify-title" class="text-lg font-semibold text-gray-900">隐私验证</h2>
                  <p class="text-sm text-gray-500">请完成身份验证以继续访问</p>
                </div>
              </div>
              <button
                @click="$emit('close')"
                class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                aria-label="关闭"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Info Banner -->
            <div class="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p class="text-sm text-blue-700">
                <span class="font-medium">🔐 强化隐私保护已启用</span><br>
                访问敏感数据需要进行身份验证
              </p>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p class="text-sm text-red-700">{{ errorMessage }}</p>
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
              <p class="text-sm text-green-700">{{ successMessage }}</p>
            </div>

            <!-- Verification Options -->
            <div class="space-y-4">
              <!-- Passkey Option -->
              <div v-if="hasPasskey" class="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-medium text-gray-900">Passkey 验证</h3>
                      <p class="text-sm text-gray-500">使用指纹、面容或设备 PIN</p>
                    </div>
                  </div>
                  <button
                    @click="verifyWithPasskey"
                    :disabled="loading"
                    class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    验证
                  </button>
                </div>
              </div>

              <!-- TOTP Option -->
              <div v-if="hasTwoFactor" class="border border-gray-200 rounded-xl p-4">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900">验证器应用</h3>
                    <p class="text-sm text-gray-500">输入 6 位验证码</p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <input
                    v-model="totpCode"
                    type="text"
                    maxlength="6"
                    pattern="[0-9]{6}"
                    placeholder="000000"
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center text-lg tracking-widest focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    @keyup.enter="verifyWithTotp"
                  />
                  <button
                    @click="verifyWithTotp"
                    :disabled="loading || totpCode.length !== 6"
                    class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                  >
                    验证
                  </button>
                </div>
              </div>

              <!-- Backup Code Option -->
              <div v-if="hasTwoFactor">
                <button
                  v-if="!showBackupCodeInput"
                  @click="showBackupCodeInput = true"
                  class="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  使用备份码
                </button>
                <div v-else class="border border-gray-200 rounded-xl p-4">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-medium text-gray-900">备份码</h3>
                      <p class="text-sm text-gray-500">输入备份码（一次性使用）</p>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <input
                      v-model="backupCode"
                      type="text"
                      placeholder="XXXX-XXXX"
                      class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center tracking-wider focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      @keyup.enter="verifyWithBackupCode"
                    />
                    <button
                      @click="verifyWithBackupCode"
                      :disabled="loading || !backupCode"
                      class="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      验证
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Loading Overlay -->
            <div v-if="loading" class="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p class="mt-2 text-sm text-gray-600">验证中...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { authClient } from "~/lib/auth-client";

const props = defineProps<{
  isOpen: boolean;
  hasTwoFactor: boolean;
  hasPasskey: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'verified'): void;
}>();

const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const totpCode = ref('');
const backupCode = ref('');
const showBackupCodeInput = ref(false);

// Reset state when dialog opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    errorMessage.value = '';
    successMessage.value = '';
    totpCode.value = '';
    backupCode.value = '';
    showBackupCodeInput.value = false;
    loading.value = false;
  }
});

const verifyWithPasskey = async () => {
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // 使用 better-auth signIn.passkey 进行验证
    // 这会触发浏览器的 WebAuthn 验证流程
    const result = await authClient.signIn.passkey();
    
    if (result.error) {
      throw new Error(result.error.message || 'Passkey 验证失败');
    }

    // 调用后端记录验证状态
    await $fetch('/api/user/privacy-verify-passkey', {
      method: 'POST',
    });

    successMessage.value = '验证成功！';
    setTimeout(() => {
      emit('verified');
    }, 500);
  } catch (error: any) {
    console.error('Passkey verification failed:', error);
    errorMessage.value = error.message || 'Passkey 验证失败，请重试';
  } finally {
    loading.value = false;
  }
};

const verifyWithTotp = async () => {
  if (totpCode.value.length !== 6) {
    errorMessage.value = '请输入 6 位验证码';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const response = await $fetch('/api/user/privacy-verify', {
      method: 'POST',
      body: {
        code: totpCode.value,
        type: 'totp',
      },
    });

    if ((response as any).success) {
      successMessage.value = '验证成功！';
      setTimeout(() => {
        emit('verified');
      }, 500);
    } else {
      throw new Error((response as any).message || '验证失败');
    }
  } catch (error: any) {
    console.error('TOTP verification failed:', error);
    errorMessage.value = error.data?.statusMessage || error.message || '验证码错误，请重试';
    totpCode.value = '';
  } finally {
    loading.value = false;
  }
};

const verifyWithBackupCode = async () => {
  if (!backupCode.value) {
    errorMessage.value = '请输入备份码';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const response = await $fetch('/api/user/privacy-verify', {
      method: 'POST',
      body: {
        code: backupCode.value,
        type: 'backup_code',
      },
    });

    if ((response as any).success) {
      successMessage.value = '验证成功！';
      setTimeout(() => {
        emit('verified');
      }, 500);
    } else {
      throw new Error((response as any).message || '验证失败');
    }
  } catch (error: any) {
    console.error('Backup code verification failed:', error);
    errorMessage.value = error.data?.statusMessage || error.message || '备份码错误，请重试';
    backupCode.value = '';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95) translateY(10px);
}
</style>
