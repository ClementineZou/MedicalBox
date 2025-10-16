<template>
  <Teleport to="body">
    <Transition name="notification-fade">
      <div 
        v-if="isVisible" 
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
          @click="hide" 
          class="ml-3 text-md-on-primary-container hover:opacity-80 focus:outline-none"
        >
          <span class="material-icons">close</span>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const isVisible = ref(false)
const message = ref('')
const type = ref<'success' | 'error' | 'info'>('info')
const timeoutId = ref<number | null>(null)

// 根据类型设置样式
const typeClasses = computed(() => {
  switch (type.value) {
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

// 显示通知
const show = (msg: string, notificationType: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
  // 如果已有定时器，先清除
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
  }
  
  message.value = msg
  type.value = notificationType
  isVisible.value = true
  
  // 设置自动隐藏
  timeoutId.value = setTimeout(() => {
    hide()
  }, duration) as unknown as number
}

// 隐藏通知
const hide = () => {
  isVisible.value = false
}

// 暴露方法给其他组件使用
defineExpose({
  show,
  hide
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