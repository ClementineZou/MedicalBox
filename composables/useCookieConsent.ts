export const useCookieConsent = () => {
  /**
   * 检查用户是否已同意使用 Cookie
   */
  const hasConsented = (): boolean => {
    if (process.client) {
      return localStorage.getItem('cookie-consent') !== null
    }
    return false
  }

  /**
   * 检查用户是否接受了 Cookie
   */
  const isAccepted = (): boolean => {
    if (process.client) {
      return localStorage.getItem('cookie-consent') === 'accepted'
    }
    return false
  }

  /**
   * 检查用户是否拒绝了 Cookie
   */
  const isRejected = (): boolean => {
    if (process.client) {
      return localStorage.getItem('cookie-consent') === 'rejected'
    }
    return false
  }

  /**
   * 获取同意日期
   */
  const getConsentDate = (): Date | null => {
    if (process.client) {
      const dateStr = localStorage.getItem('cookie-consent-date')
      return dateStr ? new Date(dateStr) : null
    }
    return null
  }

  /**
   * 重置同意状态（用于测试或用户更改偏好）
   */
  const resetConsent = (): void => {
    if (process.client) {
      localStorage.removeItem('cookie-consent')
      localStorage.removeItem('cookie-consent-date')
    }
  }

  /**
   * 设置同意状态
   */
  const setConsent = (accepted: boolean): void => {
    if (process.client) {
      localStorage.setItem('cookie-consent', accepted ? 'accepted' : 'rejected')
      localStorage.setItem('cookie-consent-date', new Date().toISOString())
    }
  }

  return {
    hasConsented,
    isAccepted,
    isRejected,
    getConsentDate,
    resetConsent,
    setConsent
  }
}
