<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="handleCancel"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
          @click.stop
        >
          <!-- Dialog Header -->
          <div class="bg-md-primary text-md-on-primary px-6 py-4">
            <h3 class="text-lg font-semibold">{{ title }}</h3>
          </div>

          <!-- Dialog Content -->
          <div class="px-6 py-5">
            <p v-if="message" class="text-sm text-md-on-surface-variant mb-4">
              {{ message }}
            </p>

            <div class="space-y-2">
              <label for="password-input" class="block text-sm font-medium text-md-on-surface">
                密码
              </label>
              <input
                id="password-input"
                ref="passwordInput"
                v-model="password"
                type="password"
                placeholder="请输入您的密码"
                class="w-full px-4 py-2.5 border border-md-outline rounded-md-sm focus:outline-none focus:ring-2 focus:ring-md-primary focus:border-transparent"
                @keyup.enter="handleConfirm"
                @keyup.esc="handleCancel"
              />
              <p v-if="error" class="text-sm text-red-600 mt-1">
                {{ error }}
              </p>
            </div>
          </div>

          <!-- Dialog Actions -->
          <div class="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button
              @click="handleCancel"
              class="px-4 py-2 text-md-on-surface hover:bg-gray-100 rounded-md-sm font-medium transition"
            >
              取消
            </button>
            <button
              @click="handleConfirm"
              :disabled="!password || loading"
              class="px-4 py-2 bg-md-primary text-md-on-primary rounded-md-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
            >
              {{ loading ? '确认中...' : '确认' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

interface Props {
  isOpen: boolean;
  title?: string;
  message?: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '需要验证',
  message: '为了安全，请输入您的密码',
  loading: false,
});

const emit = defineEmits<{
  confirm: [password: string];
  cancel: [];
  'update:isOpen': [value: boolean];
}>();

const password = ref('');
const error = ref('');
const passwordInput = ref<HTMLInputElement | null>(null);

// Watch isOpen to focus input and reset state
watch(() => props.isOpen, async (newValue) => {
  if (newValue) {
    password.value = '';
    error.value = '';
    await nextTick();
    passwordInput.value?.focus();
  }
});

const handleConfirm = () => {
  if (!password.value) {
    error.value = '请输入密码';
    return;
  }
  error.value = '';
  emit('confirm', password.value);
};

const handleCancel = () => {
  password.value = '';
  error.value = '';
  emit('cancel');
  emit('update:isOpen', false);
};
</script>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-active > div,
.dialog-fade-leave-active > div {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from > div,
.dialog-fade-leave-to > div {
  transform: scale(0.95);
  opacity: 0;
}
</style>
