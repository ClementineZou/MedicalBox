<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="visible" class="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200" style="z-index: 9999;">
        <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-md-on-surface mb-2">
                Cookie 使用说明
              </h3>
              <p class="text-sm text-md-on-surface-variant leading-relaxed">
                我们使用 Cookie 来改善您的浏览体验，提供个性化内容和分析网站流量。
                继续使用本网站即表示您同意我们使用 Cookie。
                您可以随时在浏览器设置中更改 Cookie 偏好。
              </p>
            </div>
            <div class="flex gap-3 shrink-0">
              <button 
                @click="handleReject"
                class="bg-md-surface-variant text-md-on-surface-variant px-6 py-3 rounded-md-sm hover:opacity-90 transition-opacity font-medium whitespace-nowrap min-w-[80px]"
              >
                拒绝
              </button>
              <button 
                @click="handleAccept"
                class="bg-md-primary text-md-on-primary px-6 py-3 rounded-md-sm hover:opacity-90 transition-opacity font-medium whitespace-nowrap shadow-md min-w-[80px]"
              >
                接受
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { enableOptionalFeatures, disableOptionalFeatures } from '~/utils/cookieManager'

const visible = ref(false)

// 检查是否已经同意过
const hasConsented = () => {
  if (process.client) {
    return localStorage.getItem('cookie-consent') !== null
  }
  return true
}

// 处理接受
const handleAccept = () => {
  if (process.client) {
    localStorage.setItem('cookie-consent', 'accepted')
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    visible.value = false
    // 启用可选功能
    enableOptionalFeatures()
  }
}

// 处理拒绝
const handleReject = () => {
  if (process.client) {
    localStorage.setItem('cookie-consent', 'rejected')
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    visible.value = false
    // 禁用可选功能并清除非必要数据
    disableOptionalFeatures()
  }
}

// 组件挂载时检查
onMounted(() => {
  // 延迟显示，避免页面加载时立即弹出
  setTimeout(() => {
    if (!hasConsented()) {
      visible.value = true
    }
  }, 1000)
})
</script>

<style scoped>
/* 滑入动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
