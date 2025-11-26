/**
 * 浏览器通知管理 Composable
 * 用于管理浏览器通知权限和发送通知
 */

export const useBrowserNotifications = () => {
  // 检查浏览器是否支持通知
  const isSupported = computed(() => {
    return typeof window !== 'undefined' && 'Notification' in window
  })

  // 获取当前通知权限状态
  const permission = ref<NotificationPermission>('default')
  
  if (typeof window !== 'undefined' && 'Notification' in window) {
    permission.value = Notification.permission
  }

  // 请求通知权限
  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported.value) {
      console.warn('浏览器不支持通知功能')
      return 'denied'
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result
      
      // 保存权限状态到 localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('notification-permission-requested', 'true')
        localStorage.setItem('notification-permission-time', new Date().toISOString())
      }
      
      return result
    } catch (error) {
      console.error('请求通知权限失败:', error)
      return 'denied'
    }
  }

  // 检查是否已经请求过权限
  const hasRequestedPermission = computed(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('notification-permission-requested') === 'true'
    }
    return false
  })

  // 发送通知
  const sendNotification = (title: string, options?: NotificationOptions & { onclick?: () => void }): Notification | null => {
    if (!isSupported.value) {
      console.warn('浏览器不支持通知功能')
      return null
    }

    if (permission.value !== 'granted') {
      console.warn('没有通知权限')
      return null
    }

    try {
      const { onclick, ...notificationOptions } = options || {}
      const notification = new Notification(title, {
        icon: '/icon.svg',
        badge: '/icon.svg',
        requireInteraction: true,
        ...notificationOptions
      })

      // 点击通知时聚焦窗口
      notification.onclick = (event) => {
        event.preventDefault()
        window.focus()
        notification.close()
        
        // 如果有自定义点击处理，执行它
        if (onclick) {
          onclick()
        }
      }

      return notification
    } catch (error) {
      console.error('发送通知失败:', error)
      return null
    }
  }

  // 发送用药提醒通知
  const sendMedicationReminder = (reminder: {
    id: string
    title: string
    medicineName: string
    medicineId?: string
    dosage?: string
    time: string
  }) => {
    const body = `${reminder.medicineName}${reminder.dosage ? ` - ${reminder.dosage}` : ''}\n时间: ${reminder.time}`
    
    return sendNotification(reminder.title, {
      body,
      tag: `reminder-${reminder.id}`,
      data: {
        reminderId: reminder.id,
        medicineId: reminder.medicineId,
        type: 'medication-reminder'
      },
      onclick: () => {
        // 导航到提醒页面
        if (typeof window !== 'undefined') {
          window.location.href = '/reminders'
        }
      }
    })
  }

  // 发送过期提醒通知
  const sendExpiryReminder = (medicine: {
    id: string
    name: string
    expiryDate: string
    daysUntilExpiry: number
  }) => {
    const body = medicine.daysUntilExpiry > 0
      ? `${medicine.name} 将在 ${medicine.daysUntilExpiry} 天后过期`
      : `${medicine.name} 已过期`
    
    return sendNotification('药品过期提醒', {
      body,
      tag: `expiry-${medicine.id}`,
      data: {
        medicineId: medicine.id,
        type: 'expiry-reminder'
      },
      onclick: () => {
        // 导航到药品详情页面
        if (typeof window !== 'undefined') {
          window.location.href = `/medicines/${medicine.id}`
        }
      }
    })
  }

  // 检查是否应该显示权限请求提示
  const shouldShowPermissionPrompt = computed(() => {
    if (!isSupported.value) return false
    if (permission.value === 'granted') return false
    if (permission.value === 'denied') return false
    
    // 如果从未请求过权限，显示提示
    if (!hasRequestedPermission.value) return true
    
    // 如果请求过但用户选择了默认（未做决定），7天后再次提示
    if (typeof localStorage !== 'undefined') {
      const requestTime = localStorage.getItem('notification-permission-time')
      if (requestTime) {
        const daysSinceRequest = (new Date().getTime() - new Date(requestTime).getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceRequest > 7
      }
    }
    
    return false
  })

  // 启用/禁用提醒通知
  const enableReminders = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('reminders-enabled', 'true')
    }
  }

  const disableReminders = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('reminders-enabled', 'false')
    }
  }

  const areRemindersEnabled = computed(() => {
    if (typeof localStorage !== 'undefined') {
      const enabled = localStorage.getItem('reminders-enabled')
      // 默认启用
      return enabled !== 'false'
    }
    return true
  })

  return {
    isSupported,
    permission,
    hasRequestedPermission,
    shouldShowPermissionPrompt,
    requestPermission,
    sendNotification,
    sendMedicationReminder,
    sendExpiryReminder,
    enableReminders,
    disableReminders,
    areRemindersEnabled
  }
}
