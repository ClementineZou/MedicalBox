<template>
  <Teleport to="body">
    <!-- 通知提示 -->
    <Transition name="notification-fade">
      <div 
        v-if="visible" 
        :class="[
          'fixed z-50 bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-md shadow-lg',
          'flex items-center min-w-[300px] max-w-md',
          typeClasses
        ]"
      >
        <div class="mr-3">
          <span v-if="type === 'success'" class="material-icons">check_circle</span>
          <span v-else-if="type === 'error'" class="material-icons">error</span>
          <span v-else-if="type === 'info'" class="material-icons">info</span>
        </div>
        <div class="flex-1">{{ message }}</div>
        <button 
          @click="hideNotification" 
          class="ml-3 hover:opacity-80 focus:outline-none"
        >
          <span class="material-icons">close</span>
        </button>
      </div>
    </Transition>
    
    <!-- 确认对话框 -->
    <ConfirmDialog />
  </Teleport>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/useNotification'

const { visible, message, type, hideNotification } = useNotification()

// 根据类型设置样式
const typeClasses = computed(() => {
  const typeValue = type.value
  switch (typeValue) {
    case 'success':
      return 'bg-md-primary-container text-md-on-primary-container'
    case 'error':
      return 'bg-md-error-container text-md-on-error-container'
    case 'info':
      return 'bg-md-tertiary-container text-md-on-tertiary-container'
    default:
      return 'bg-md-surface-variant text-md-on-surface-variant'
  }
})
</script>

<style scoped>
.notification-fade-enter-active,
.notification-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.notification-fade-enter-from,
.notification-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>