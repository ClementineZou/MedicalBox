import { ref } from 'vue'

export interface NotificationOptions {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

export interface ConfirmOptions {
  title?: string
  confirmText?: string
  cancelText?: string
}

// 单例通知状态
const visible = ref(false)
const message = ref('')
const type = ref<'success' | 'error' | 'info'>('info')
const duration = ref(3000)
let timer: NodeJS.Timeout | null = null

// 单例确认对话框状态
const confirmVisible = ref(false)
const confirmMessage = ref('')
const confirmTitle = ref('确认')
const confirmButtonText = ref('确定')
const cancelButtonText = ref('取消')
let resolveConfirmPromise: ((value: boolean) => void) | null = null

export function useNotification() {
  // 显示通知
  const showNotification = (options: NotificationOptions) => {
    // 如果已有定时器，先清除
    if (timer) {
      clearTimeout(timer)
    }
    
    message.value = options.message
    type.value = options.type || 'info'
    duration.value = options.duration || 3000
    visible.value = true
    
    // 设置自动隐藏
    timer = setTimeout(() => {
      hideNotification()
    }, duration.value)
  }
  
  // 隐藏通知
  const hideNotification = () => {
    visible.value = false
  }
  
  // 确认对话框
  const confirm = (msg: string, options?: ConfirmOptions): Promise<boolean> => {
    confirmMessage.value = msg
    confirmTitle.value = options?.title || '确认'
    confirmButtonText.value = options?.confirmText || '确定'
    cancelButtonText.value = options?.cancelText || '取消'
    confirmVisible.value = true
    
    return new Promise(resolve => {
      resolveConfirmPromise = resolve
    })
  }
  
  // 处理确认结果
  const handleConfirm = (result: boolean) => {
    confirmVisible.value = false
    if (resolveConfirmPromise) {
      resolveConfirmPromise(result)
      resolveConfirmPromise = null
    }
  }
  
  // 快捷方法
  const success = (msg: string, dur?: number) => {
    showNotification({ message: msg, type: 'success', duration: dur })
  }
  
  const error = (msg: string, dur?: number) => {
    showNotification({ message: msg, type: 'error', duration: dur })
  }
  
  const info = (msg: string, dur?: number) => {
    showNotification({ message: msg, type: 'info', duration: dur })
  }
  
  return {
    // 通知相关
    visible,
    message,
    type,
    duration,
    showNotification,
    hideNotification,
    success,
    error,
    info,
    
    // 确认对话框相关
    confirmVisible,
    confirmMessage,
    confirmTitle,
    confirmButtonText,
    cancelButtonText,
    confirm,
    handleConfirm
  }
}