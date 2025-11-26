/**
 * Cookie 同意初始化插件
 * 在应用启动时根据用户的同意状态初始化相关功能
 */
export default defineNuxtPlugin(async () => {
  if (process.client) {
    // 导入 cookie 管理工具
    const { initializeFeaturesBasedOnConsent } = await import('~/utils/cookieManager');
    
    // 根据用户的同意状态初始化功能
    initializeFeaturesBasedOnConsent();
  }
});
