<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background-color: rgba(0, 0, 0, 0.5);"
        @click.self="cancel"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
          <!-- Header -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-900">{{ title }}</h3>
              <p class="text-sm text-gray-600">{{ message }}</p>
            </div>
          </div>

          <!-- Input -->
          <div class="mb-6">
            <label for="passkey-name" class="block text-sm font-medium text-gray-700 mb-2">
              Passkey 名称
            </label>
            <input
              id="passkey-name"
              ref="inputRef"
              v-model="inputValue"
              type="text"
              :placeholder="placeholder"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              @keydown.enter="confirm"
              @keydown.esc="cancel"
            />
            <p class="text-xs text-gray-500 mt-2">可选，留空将使用设备名称</p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              @click="cancel"
              class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              {{ cancelText }}
            </button>
            <button
              @click="confirm"
              class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
            >
              {{ confirmText }}
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
  modelValue: boolean;
  title?: string;
  message?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  defaultValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '设置 Passkey 名称',
  message: '为您的 Passkey 设置一个易于识别的名称',
  placeholder: '例如：我的 iPhone、Surface Book 等',
  confirmText: '确认',
  cancelText: '取消',
  defaultValue: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'confirm': [value: string];
  'cancel': [];
}>();

const inputValue = ref(props.defaultValue);
const inputRef = ref<HTMLInputElement | null>(null);

// Watch for dialog open to focus input
watch(() => props.modelValue, async (newVal) => {
  if (newVal) {
    inputValue.value = props.defaultValue;
    await nextTick();
    inputRef.value?.focus();
  }
});

const confirm = () => {
  emit('update:modelValue', false);
  emit('confirm', inputValue.value.trim());
};

const cancel = () => {
  emit('update:modelValue', false);
  emit('cancel');
};
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
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
  opacity: 0;
}
</style>
