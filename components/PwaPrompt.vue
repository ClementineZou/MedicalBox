<template>
  <div v-if="needRefresh" class="pwa-toast" role="alert">
    <div class="pwa-toast-content">
      <div class="pwa-toast-message">
        <span class="material-icons">update</span>
        <div>
          <strong>新版本可用</strong>
          <p>发现新版本，刷新以获取最新功能</p>
        </div>
      </div>
      <div class="pwa-toast-actions">
        <button @click="handleUpdate()" class="btn-update">
          刷新
        </button>
        <button @click="close()" class="btn-close">
          稍后
        </button>
      </div>
    </div>
  </div>

  <div v-if="showInstallPrompt" class="pwa-install-toast" role="alert">
    <div class="pwa-toast-content">
      <div class="pwa-toast-message">
        <span class="material-icons">get_app</span>
        <div>
          <strong>安装 MedicalBox</strong>
          <p>将应用添加到主屏幕，获得更好的体验</p>
        </div>
      </div>
      <div class="pwa-toast-actions">
        <button @click="install()" class="btn-update">
          安装
        </button>
        <button @click="dismissInstall()" class="btn-close">
          取消
        </button>
      </div>
    </div>
  </div>

  <div v-if="showNotificationPrompt" class="pwa-notification-toast" role="alert">
    <div class="pwa-toast-content">
      <div class="pwa-toast-message">
        <span class="material-icons">notifications_active</span>
        <div>
          <strong>启用用药提醒</strong>
          <p>允许通知以接收用药提醒，不会错过服药时间</p>
        </div>
      </div>
      <div class="pwa-toast-actions">
        <button @click="enableNotifications()" class="btn-update">
          启用
        </button>
        <button @click="dismissNotificationPrompt()" class="btn-close">
          稍后
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBrowserNotifications } from '~/composables/useBrowserNotifications'

// 安装提示
const showInstallPrompt = ref(false)
const deferredPrompt = ref<any>(null)
const needRefresh = ref(false)
const updateServiceWorker = ref<(() => Promise<void>) | null>(null)

// 通知提示 - 延迟初始化，避免在服务端渲染时调用
const showNotificationPrompt = ref(false)
let notificationSupported = ref(false)
let notificationPermission = ref<NotificationPermission>('default')
let shouldShowPermissionPrompt = ref(false)
let requestPermission: (() => Promise<NotificationPermission>) | null = null

// 在客户端初始化通知相关功能
if (process.client) {
  const browserNotifications = useBrowserNotifications()
  notificationSupported = browserNotifications.isSupported
  notificationPermission = browserNotifications.permission
  shouldShowPermissionPrompt = browserNotifications.shouldShowPermissionPrompt
  requestPermission = browserNotifications.requestPermission
}

const close = () => {
  needRefresh.value = false
}

// 仅在客户端初始化 PWA 功能
onMounted(async () => {
  // 动态导入 PWA 注册模块（仅客户端）
  if (typeof window !== 'undefined') {
    try {
      const { useRegisterSW } = await import('virtual:pwa-register/vue')
      const sw = useRegisterSW()
      needRefresh.value = sw.needRefresh.value
      updateServiceWorker.value = sw.updateServiceWorker
      
      // 监听 needRefresh 变化
      watch(() => sw.needRefresh.value, (val) => {
        needRefresh.value = val
      })
    } catch (e) {
      console.warn('PWA registration failed:', e)
    }
  }

  // 检查是否已经安装
  if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
    // 已安装，检查通知权限
    checkNotificationPermission()
    return
  }

  // 检查是否已经拒绝过安装提示
  if (typeof localStorage !== 'undefined') {
    const installDismissed = localStorage.getItem('pwa-install-dismissed')
    if (installDismissed) {
      const dismissedDate = new Date(installDismissed)
      const now = new Date()
      const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      
      // 如果拒绝后超过 7 天，再次显示提示
      if (daysSinceDismissed < 7) {
        // 虽然不显示安装提示，但可以检查通知权限
        checkNotificationPermission()
        return
      }
    }
  }

  // 监听安装提示事件
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e
      // 延迟显示提示，让用户先使用一会
      setTimeout(() => {
        showInstallPrompt.value = true
      }, 30000) // 30秒后显示
    })

    // 监听安装成功事件
    window.addEventListener('appinstalled', () => {
      showInstallPrompt.value = false
      deferredPrompt.value = null
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('pwa-install-dismissed')
      }
      // 安装后提示通知权限
      setTimeout(() => {
        checkNotificationPermission()
      }, 2000)
    })
  }

  // 初始检查通知权限
  checkNotificationPermission()
})

// 检查是否应该显示通知权限提示
const checkNotificationPermission = () => {
  if (!notificationSupported.value) return
  
  // 如果应该显示权限提示
  if (shouldShowPermissionPrompt.value) {
    // 延迟显示，避免一次性弹出太多提示
    setTimeout(() => {
      showNotificationPrompt.value = true
    }, 5000)
  }
}

const install = async () => {
  if (!deferredPrompt.value) {
    return
  }

  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  
  if (outcome === 'accepted') {
    console.log('用户接受了安装提示')
  } else {
    console.log('用户拒绝了安装提示')
  }

  deferredPrompt.value = null
  showInstallPrompt.value = false
}

const dismissInstall = () => {
  showInstallPrompt.value = false
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
  }
  // 稍后检查通知权限
  setTimeout(() => {
    checkNotificationPermission()
  }, 2000)
}

const handleUpdate = async () => {
  if (updateServiceWorker.value) {
    await updateServiceWorker.value()
  }
}

// 启用通知
const enableNotifications = async () => {
  if (!requestPermission) return
  
  const result = await requestPermission()
  if (result === 'granted') {
    showNotificationPrompt.value = false
    // 通知用户启用成功
    const { success } = useNotification()
    success('通知已启用，您将收到用药提醒')
  }
}

// 稍后再说
const dismissNotificationPrompt = () => {
  showNotificationPrompt.value = false
}
</script>

<style scoped>
.pwa-toast,
.pwa-install-toast,
.pwa-notification-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.pwa-toast-content {
  padding: 16px;
}

.pwa-toast-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.pwa-toast-message .material-icons {
  font-size: 24px;
  color: #1976d2;
  flex-shrink: 0;
}

.pwa-toast-message strong {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.pwa-toast-message p {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.pwa-toast-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-update,
.btn-close {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-update {
  background: #1976d2;
  color: white;
}

.btn-update:hover {
  background: #1565c0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.btn-close {
  background: #f5f5f5;
  color: #666;
}

.btn-close:hover {
  background: #e0e0e0;
}

/* 移动端适配 */
@media (max-width: 640px) {
  .pwa-toast,
  .pwa-install-toast,
  .pwa-notification-toast {
    left: 16px;
    right: 16px;
    bottom: 16px;
    max-width: none;
  }
}
</style>
