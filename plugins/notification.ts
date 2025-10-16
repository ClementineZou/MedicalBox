// 定义通知类型
export type NotificationType = 'success' | 'error' | 'info'

// 定义通知方法
export interface NotificationInstance {
  show: (message: string, type?: NotificationType, duration?: number) => void
  hide: () => void
}

// 定义全局通知方法类型
export interface NotificationGlobal {
  show: (message: string, type?: NotificationType, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

// 全局通知实例
let notificationInstance: NotificationInstance | null = null

export default defineNuxtPlugin((nuxtApp) => {
  // 添加全局方法
  nuxtApp.vueApp.config.globalProperties.$notify = {
    show(message: string, type: NotificationType = 'info', duration = 3000) {
      if (notificationInstance) {
        notificationInstance.show(message, type, duration)
      }
    },
    success(message: string, duration = 3000) {
      if (notificationInstance) {
        notificationInstance.show(message, 'success', duration)
      }
    },
    error(message: string, duration = 3000) {
      if (notificationInstance) {
        notificationInstance.show(message, 'error', duration)
      }
    },
    info(message: string, duration = 3000) {
      if (notificationInstance) {
        notificationInstance.show(message, 'info', duration)
      }
    }
  }
})

// 设置通知实例
export const setNotificationInstance = (instance: NotificationInstance) => {
  notificationInstance = instance
}

// 在组件之外使用通知的辅助方法
export const useNotificationPlugin = (): NotificationGlobal => {
  return {
    show(message: string, type: NotificationType = 'info', duration = 3000) {
      if (notificationInstance) {
        notificationInstance.show(message, type, duration)
      }
    },
    success(message: string, duration = 3000) {
      if (notificationInstance) {
        notificationInstance.show(message, 'success', duration)
      }
    },
    error(message: string, duration = 3000) {
      if (notificationInstance) {
        notificationInstance.show(message, 'error', duration)
      }
    },
    info(message: string, duration = 3000) {
      if (notificationInstance) {
        notificationInstance.show(message, 'info', duration)
      }
    }
  }
}