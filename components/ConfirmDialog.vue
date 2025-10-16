<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-md-lg max-w-md w-full shadow-xl p-6 space-y-4">
      <h2 class="text-xl font-semibold">{{ title }}</h2>
      <p>{{ message }}</p>
      <div class="flex gap-3 justify-end">
        <button 
          @click="handleCancel"
          class="bg-md-surface-variant text-md-on-surface-variant px-4 py-2 rounded-md-sm hover:opacity-90 transition-opacity"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="handleConfirm"
          class="bg-md-primary text-md-on-primary px-4 py-2 rounded-md-sm hover:opacity-90 transition-opacity"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/useNotification'

// 使用通知系统的确认状态
const { 
  confirmVisible: visible, 
  confirmMessage: message, 
  confirmTitle: title,
  confirmButtonText: confirmText,
  cancelButtonText: cancelText,
  handleConfirm: notificationHandleConfirm
} = useNotification()

// 处理确认
const handleConfirm = () => {
  notificationHandleConfirm(true)
}

// 处理取消
const handleCancel = () => {
  notificationHandleConfirm(false)
}
</script>