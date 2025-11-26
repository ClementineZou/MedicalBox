/**
 * 体征监测提醒通知插件
 * 定期检查提醒并发送浏览器通知
 */
import { useBrowserNotifications } from '~/composables/useBrowserNotifications'

export default defineNuxtPlugin((nuxtApp) => {
  // 在客户端环境下使用 composable
  if (!process.client) return

  const { isSupported, permission, sendVitalSignReminder, areRemindersEnabled } = useBrowserNotifications()
  
  let checkInterval: NodeJS.Timeout | null = null
  let notifiedReminders = new Set<string>()

  // 检查是否需要发送提醒
  const checkReminders = async () => {
    // 检查通知是否启用
    if (!isSupported.value || permission.value !== 'granted' || !areRemindersEnabled.value) {
      return
    }

    try {
      // 获取即将到期的提醒（未来30分钟内）
      const response = await $fetch('/api/vitals/reminders/upcoming')
      const reminders = (response as any).data || []

      const now = new Date()
      const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000)

      reminders.forEach((reminder: any) => {
        const reminderTime = new Date(reminder.reminderTime)
        
        // 如果提醒时间在当前时间到30分钟后之间，并且还没有发送过通知
        if (reminderTime >= now && reminderTime <= thirtyMinutesLater && !notifiedReminders.has(reminder.id)) {
          // 计算提前多久提醒
          const minutesUntil = Math.round((reminderTime.getTime() - now.getTime()) / (1000 * 60))
          
          let title = reminder.title
          if (minutesUntil > 0) {
            title = `${minutesUntil}分钟后: ${reminder.title}`
          }

          // 格式化时间
          const timeStr = reminderTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

          // 发送通知
          sendVitalSignReminder({
            id: reminder.id,
            title,
            vitalSignType: reminder.vitalSignType,
            time: timeStr
          })

          // 标记已发送
          notifiedReminders.add(reminder.id)
          
          // 30分钟后清除标记，允许下次再提醒
          setTimeout(() => {
            notifiedReminders.delete(reminder.id)
          }, 30 * 60 * 1000)
        }
      })
    } catch (error) {
      console.error('检查体征监测提醒失败:', error)
    }
  }

  // 启动定期检查
  const startReminderCheck = () => {
    if (checkInterval) return

    // 立即检查一次
    checkReminders()

    // 每分钟检查一次
    checkInterval = setInterval(checkReminders, 60 * 1000)
  }

  // 停止定期检查
  const stopReminderCheck = () => {
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
  }

  // 监听权限变化
  watch(() => permission.value, (newPermission) => {
    if (newPermission === 'granted' && areRemindersEnabled.value) {
      startReminderCheck()
    } else {
      stopReminderCheck()
    }
  })

  // 监听提醒启用状态变化
  watch(() => areRemindersEnabled.value, (enabled) => {
    if (enabled && permission.value === 'granted') {
      startReminderCheck()
    } else {
      stopReminderCheck()
    }
  })

  // 页面可见性变化时检查
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && permission.value === 'granted' && areRemindersEnabled.value) {
        checkReminders()
      }
    })
  }

  // 初始化时启动检查
  if (process.client) {
    onMounted(() => {
      if (permission.value === 'granted' && areRemindersEnabled.value) {
        startReminderCheck()
      }
    })

    onUnmounted(() => {
      stopReminderCheck()
    })
  }

  // 提供给应用使用
  return {
    provide: {
      vitalReminderNotifications: {
        check: checkReminders,
        start: startReminderCheck,
        stop: stopReminderCheck
      }
    }
  }
})
