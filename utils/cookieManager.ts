/**
 * Cookie 管理工具
 * 用于根据用户同意状态启用或禁用可选功能
 */

/**
 * 启用可选功能（分析、追踪等）
 */
export const enableOptionalFeatures = () => {
  if (!process.client) return;

  console.log('启用可选功能');
  
  // 1. 启用 Google Analytics（如果配置了）
  // if (window.gtag) {
  //   window.gtag('consent', 'update', {
  //     analytics_storage: 'granted'
  //   });
  // }

  // 2. 启用其他第三方服务
  // 例如：热力图、用户行为分析等
  
  // 3. 启用功能性 localStorage
  // 可以存储用户偏好设置等非必要数据
  
  // 标记可选功能已启用
  localStorage.setItem('optional-features-enabled', 'true');
}

/**
 * 禁用可选功能
 */
export const disableOptionalFeatures = () => {
  if (!process.client) return;

  console.log('禁用可选功能');
  
  // 1. 禁用 Google Analytics（如果配置了）
  // if (window.gtag) {
  //   window.gtag('consent', 'update', {
  //     analytics_storage: 'denied'
  //   });
  // }

  // 2. 清除非必要的 localStorage 项
  // 保留必要的项：认证信息、Cookie 同意记录
  const essentialKeys = [
    'token',
    'user',
    'cookie-consent',
    'cookie-consent-date',
    // Better Auth 相关的必要项
    'better-auth.session_token',
    'better-auth.csrf_token',
  ];
  
  // 获取所有 localStorage 键
  const allKeys = Object.keys(localStorage);
  
  // 清除非必要的键
  allKeys.forEach(key => {
    // 保留认证相关和 cookie 同意记录
    const isEssential = essentialKeys.some(essential => key.includes(essential));
    if (!isEssential && !key.startsWith('auth-')) {
      // 这里可以根据实际需要决定是否清除
      // localStorage.removeItem(key);
    }
  });
  
  // 3. 清除非必要的 sessionStorage
  // sessionStorage.clear(); // 根据需要决定是否清除
  
  // 标记可选功能已禁用
  localStorage.setItem('optional-features-enabled', 'false');
}

/**
 * 检查可选功能是否已启用
 */
export const isOptionalFeaturesEnabled = (): boolean => {
  if (!process.client) return false;
  
  const cookieConsent = localStorage.getItem('cookie-consent');
  return cookieConsent === 'accepted';
}

/**
 * 根据当前同意状态初始化功能
 */
export const initializeFeaturesBasedOnConsent = () => {
  if (!process.client) return;
  
  const cookieConsent = localStorage.getItem('cookie-consent');
  
  if (cookieConsent === 'accepted') {
    enableOptionalFeatures();
  } else if (cookieConsent === 'rejected') {
    disableOptionalFeatures();
  }
  // 如果没有同意记录，等待用户做出选择
}

/**
 * 清除所有非必要的浏览器数据
 */
export const clearNonEssentialData = () => {
  if (!process.client) return;
  
  // 清除非必要的 cookies
  // 注意：JavaScript 只能清除同域的 cookies
  document.cookie.split(";").forEach((cookie) => {
    const [name] = cookie.split("=");
    const trimmedName = name.trim();
    
    // 保留必要的 cookies（认证相关）
    const essentialCookieNames = [
      'better-auth',
      'session',
      'csrf',
      '__Host-authjs',
      '__Secure-authjs'
    ];
    
    const isEssential = essentialCookieNames.some(essential => 
      trimmedName.includes(essential)
    );
    
    if (!isEssential) {
      // 删除 cookie
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
  
  disableOptionalFeatures();
}

/**
 * 获取当前 Cookie 使用情况统计
 */
export const getCookieStats = () => {
  if (!process.client) return {
    total: 0,
    essential: 0,
    optional: 0
  };
  
  const allCookies = document.cookie.split(";");
  const essentialCookieNames = [
    'better-auth',
    'session',
    'csrf',
    '__Host-authjs',
    '__Secure-authjs'
  ];
  
  let essential = 0;
  let optional = 0;
  
  allCookies.forEach((cookie) => {
    const [name] = cookie.split("=");
    const trimmedName = name.trim();
    
    const isEssential = essentialCookieNames.some(essentialName => 
      trimmedName.includes(essentialName)
    );
    
    if (isEssential) {
      essential++;
    } else {
      optional++;
    }
  });
  
  return {
    total: allCookies.length,
    essential,
    optional
  };
}
