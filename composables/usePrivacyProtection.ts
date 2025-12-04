import type { PrivacySettings, PrivacyVerificationStatus } from '~/types';

// 本地存储验证状态的key
const PRIVACY_VERIFIED_KEY = 'privacy_verified_until';

export const usePrivacyProtection = () => {
  const isVerified = ref(false);
  const isLoading = ref(false);
  const showVerifyDialog = ref(false);
  const privacySettings = ref<PrivacySettings | null>(null);
  const verificationStatus = ref<PrivacyVerificationStatus | null>(null);
  
  // 验证完成后的回调
  const onVerifiedCallback = ref<(() => void) | null>(null);

  // 检查本地缓存的验证状态
  const checkLocalVerification = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const verifiedUntil = localStorage.getItem(PRIVACY_VERIFIED_KEY);
    if (verifiedUntil) {
      const expiresAt = new Date(verifiedUntil);
      if (expiresAt > new Date()) {
        return true;
      }
      // 已过期，清除
      localStorage.removeItem(PRIVACY_VERIFIED_KEY);
    }
    return false;
  };

  // 设置本地验证状态
  const setLocalVerification = (expiresAt: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PRIVACY_VERIFIED_KEY, expiresAt);
  };

  // 清除本地验证状态
  const clearLocalVerification = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PRIVACY_VERIFIED_KEY);
  };

  // 加载隐私设置
  const loadPrivacySettings = async (): Promise<PrivacySettings | null> => {
    try {
      const response = await $fetch('/api/user/privacy-settings');
      if ((response as any).success) {
        privacySettings.value = (response as any).data;
        return privacySettings.value;
      }
      return null;
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
      return null;
    }
  };

  // 检查验证状态
  const checkVerificationStatus = async (): Promise<PrivacyVerificationStatus> => {
    isLoading.value = true;
    
    try {
      // 先检查本地缓存
      if (checkLocalVerification()) {
        isVerified.value = true;
        return {
          isVerified: true,
        };
      }

      // 从服务器检查
      const response = await $fetch('/api/user/privacy-status');
      const data = (response as any).data;

      if (!data.requiresVerification) {
        // 未启用强化隐私保护
        isVerified.value = true;
        verificationStatus.value = { isVerified: true };
        return { isVerified: true };
      }

      if (data.isVerified) {
        // 已验证，更新本地缓存
        isVerified.value = true;
        if (data.expiresAt) {
          setLocalVerification(data.expiresAt);
        }
        verificationStatus.value = {
          isVerified: true,
          expiresAt: data.expiresAt,
          remainingMinutes: data.remainingMinutes,
        };
        return verificationStatus.value;
      }

      // 需要验证
      isVerified.value = false;
      verificationStatus.value = { isVerified: false };
      return { isVerified: false };
    } catch (error) {
      console.error('Failed to check verification status:', error);
      // 发生错误时，保守起见认为需要验证
      isVerified.value = false;
      return { isVerified: false };
    } finally {
      isLoading.value = false;
    }
  };

  // 请求验证（如果需要）
  const requireVerification = async (callback?: () => void): Promise<boolean> => {
    isLoading.value = true;
    
    try {
      // 加载设置
      const settings = await loadPrivacySettings();
      
      // 如果未启用强化隐私保护，直接返回true
      if (!settings?.enhancedPrivacyEnabled) {
        isVerified.value = true;
        callback?.();
        return true;
      }

      // 检查是否已验证
      const status = await checkVerificationStatus();
      
      if (status.isVerified) {
        callback?.();
        return true;
      }

      // 需要验证，显示对话框
      onVerifiedCallback.value = callback || null;
      showVerifyDialog.value = true;
      return false;
    } catch (error) {
      console.error('Failed to require verification:', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 验证成功回调
  const handleVerified = async () => {
    // 重新获取状态以更新过期时间
    const status = await checkVerificationStatus();
    
    if (status.isVerified && status.expiresAt) {
      // 确保 expiresAt 是字符串类型
      const expiresAtStr = typeof status.expiresAt === 'string' 
        ? status.expiresAt 
        : new Date(status.expiresAt).toISOString();
      setLocalVerification(expiresAtStr);
    }
    
    isVerified.value = true;
    showVerifyDialog.value = false;
    
    // 调用回调
    if (onVerifiedCallback.value) {
      onVerifiedCallback.value();
      onVerifiedCallback.value = null;
    }
  };

  // 关闭验证对话框
  const closeVerifyDialog = () => {
    showVerifyDialog.value = false;
    onVerifiedCallback.value = null;
  };

  // 重置验证状态（用于测试或手动刷新）
  const resetVerification = () => {
    clearLocalVerification();
    isVerified.value = false;
    verificationStatus.value = null;
  };

  return {
    isVerified: readonly(isVerified),
    isLoading: readonly(isLoading),
    showVerifyDialog,
    privacySettings: readonly(privacySettings),
    verificationStatus: readonly(verificationStatus),
    loadPrivacySettings,
    checkVerificationStatus,
    requireVerification,
    handleVerified,
    closeVerifyDialog,
    resetVerification,
  };
};
