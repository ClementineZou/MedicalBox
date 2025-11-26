/**
 * Google Analytics 插件
 * 处理 Google Analytics 的初始化和 Consent Mode 管理
 */

export default defineNuxtPlugin(() => {
  const { gtag } = useGtag()
  
  // 设置默认 consent 为拒绝
  if (gtag) {
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted',
      wait_for_update: 500
    })
    console.log('Google Analytics 已加载，默认 consent 已设置为 denied')
  }

  // 更新 Google Analytics consent 状态
  const updateConsent = (granted: boolean) => {
    if (!gtag) {
      console.warn('Google Analytics gtag 函数不可用')
      return
    }

    gtag('consent', 'update', {
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
      analytics_storage: granted ? 'granted' : 'denied',
      functionality_storage: granted ? 'granted' : 'denied',
      personalization_storage: granted ? 'granted' : 'denied'
    })

    console.log(`Google Analytics: Consent ${granted ? 'granted' : 'denied'}`)
  }

  // 初始化时根据已有的 cookie 同意状态设置 consent
  const initializeConsent = () => {
    const cookieConsent = localStorage.getItem('cookie-consent')
    
    if (cookieConsent === 'accepted') {
      // 用户已接受，启用分析
      updateConsent(true)
    } else if (cookieConsent === 'rejected') {
      // 用户已拒绝，保持禁用状态
      updateConsent(false)
    }
    // 如果没有同意记录，保持默认的 denied 状态
  }

  // 监听 storage 事件（用于同步多个标签页）
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'cookie-consent' && e.newValue) {
      updateConsent(e.newValue === 'accepted')
    }
  }

  // 初始化
  if (process.client) {
    // 检查 gtag ID 是否配置
    const config = useRuntimeConfig()
    if (config.public.googleAnalyticsId) {
      initializeConsent()
      console.log('Google Analytics 插件已初始化')
    } else {
      console.warn('Google Analytics ID 未配置')
    }
    
    window.addEventListener('storage', handleStorageChange)
  }

  // 提供更新 consent 的方法
  return {
    provide: {
      updateGAConsent: updateConsent
    }
  }
})
