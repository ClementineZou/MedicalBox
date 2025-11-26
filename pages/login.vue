<template>
  <div class="min-h-[60vh] flex items-center justify-center py-10">
    <div class="w-full max-w-md bg-white rounded-md-lg shadow-md border border-md-surface-variant p-8">
      <!-- Header -->
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-md-on-surface mb-2">欢迎回来</h1>
        <p class="text-md-on-surface-variant text-sm">登录到你的 MedicalBox 账户</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
        <p class="text-red-700 text-sm">{{ error }}</p>
      </div>

      <!-- 2FA Code Input (shown after email/password login if 2FA is enabled) -->
      <div v-if="showTwoFactorInput" class="space-y-6">
        <div>
          <label for="twoFactorCode" class="block text-xs font-medium mb-1 text-md-on-surface-variant">
            {{ useBackupCode ? '备份码' : '双因素验证码' }}
          </label>
          <p class="text-xs text-md-on-surface-variant mb-2">
            {{ useBackupCode ? '请输入你的 8 位备份码' : '请输入你的验证器应用中的 6 位验证码' }}
          </p>
          <input
            id="twoFactorCode"
            v-model="twoFactorCode"
            type="text"
            required
            :maxlength="useBackupCode ? 8 : 6"
            :pattern="useBackupCode ? '[0-9]{8}' : '[0-9]{6}'"
            class="w-full px-4 py-2 border border-md-surface-variant rounded-md-md focus:outline-none focus:border-md-primary transition text-center text-2xl tracking-widest"
            :placeholder="useBackupCode ? '00000000' : '000000'"
            @input="validateTwoFactorCode"
          />
        </div>

        <!-- 切换备份码/验证码 -->
        <div class="text-center">
          <button
            type="button"
            @click="toggleBackupCode"
            class="text-sm text-md-primary hover:underline"
          >
            {{ useBackupCode ? '使用验证器验证码' : '使用备份码' }}
          </button>
        </div>

        <!-- 信任此设备选项 -->
        <div class="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <input
            id="trustDevice"
            v-model="trustThisDevice"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label for="trustDevice" class="text-sm text-gray-700 cursor-pointer">
            信任此设备 30 天（下次登录时跳过 2FA 验证）
          </label>
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            @click="cancelTwoFactor"
            class="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md-md font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition"
          >
            取消
          </button>
          <button
            type="button"
            @click="verifyTwoFactor"
            :disabled="loading || (useBackupCode ? twoFactorCode.length !== 8 : twoFactorCode.length !== 6)"
            class="flex-1 bg-md-primary text-md-on-primary py-3 px-4 rounded-md-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-md-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <span v-if="!loading">验证</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              验证中...
            </span>
          </button>
        </div>
      </div>

      <!-- Login Form -->
      <form v-else @submit.prevent="handleLogin" class="space-y-6">
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-xs font-medium mb-1 text-md-on-surface-variant">邮箱地址</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 border border-md-surface-variant rounded-md-md focus:outline-none focus:border-md-primary transition"
            placeholder="your@email.com"
          />
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="block text-xs font-medium mb-1 text-md-on-surface-variant">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 border border-md-surface-variant rounded-md-md focus:outline-none focus:border-md-primary transition"
            placeholder="••••••••"
          />
        </div>

        <!-- Turnstile Widget -->
        <div>
          <TurnstileWidget
            ref="turnstileRef"
            :site-key="turnstileSiteKey"
            @verified="onTurnstileVerified"
            @error="onTurnstileError"
            @expired="onTurnstileExpired"
          />
        </div>

        <!-- Login Button -->
        <button
          type="submit"
          :disabled="loading || !turnstileToken"
          class="w-full bg-md-primary text-md-on-primary py-3 px-4 rounded-md-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-md-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <span v-if="!loading">登录</span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            登录中...
          </span>
        </button>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="px-2 bg-white text-gray-500">或</span>
          </div>
        </div>

        <!-- Passkey Login Button -->
        <button
          type="button"
          @click="handlePasskeyLogin"
          :disabled="loading"
          class="w-full bg-md-primary text-md-on-primary py-3 px-4 rounded-md-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-md-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-md"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
          </svg>
          <span>使用 Passkey 登录</span>
        </button>
      </form>

      <!-- Sign Up Link (只在非2FA验证时显示) -->
      <div v-if="!showTwoFactorInput" class="mt-6 text-center">
        <p class="text-xs text-md-on-surface-variant">
          还没有账户？
          <NuxtLink to="/register" class="text-md-primary hover:opacity-80 font-medium">
            立即注册
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { authClient } from '~/lib/auth-client';

// Set page title
useHead({
  title: '登录'
});

const { login } = useAuth();
const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const turnstileToken = ref("");
const turnstileRef = ref<any>(null);
const showTwoFactorInput = ref(false);
const twoFactorCode = ref("");
const pendingSession = ref<any>(null);
const useBackupCode = ref(false);
const trustThisDevice = ref(false);

// Turnstile site key from environment
const config = useRuntimeConfig();
const turnstileSiteKey = config.public.turnstileSiteKey || "0x4AAAAAACCd0MNT1rTL62Am";

const onTurnstileVerified = (token: string) => {
  turnstileToken.value = token;
  error.value = "";
};

const onTurnstileError = (errorMsg: string) => {
  error.value = errorMsg || "验证码验证失败";
  turnstileToken.value = "";
};

const onTurnstileExpired = () => {
  error.value = "验证码已过期，请重新验证";
  turnstileToken.value = "";
};

const validateTwoFactorCode = (e: Event) => {
  const input = e.target as HTMLInputElement;
  // Only allow numbers
  input.value = input.value.replace(/[^0-9]/g, '');
  twoFactorCode.value = input.value;
};

// 生成设备指纹
const generateDeviceId = () => {
  const ua = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return btoa(`${ua}-${screen}-${timezone}`).substring(0, 32);
};

// 获取设备名称
const getDeviceName = () => {
  const ua = navigator.userAgent;
  let deviceName = '未知设备';
  
  // 检测操作系统
  if (ua.includes('Windows')) deviceName = 'Windows 设备';
  else if (ua.includes('Mac OS X')) deviceName = 'Mac 设备';
  else if (ua.includes('Linux')) deviceName = 'Linux 设备';
  else if (ua.includes('Android')) deviceName = 'Android 设备';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) deviceName = 'iOS 设备';
  
  // 添加浏览器信息
  if (ua.includes('Edg/')) deviceName += ' (Edge)';
  else if (ua.includes('Chrome/')) deviceName += ' (Chrome)';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) deviceName += ' (Safari)';
  else if (ua.includes('Firefox/')) deviceName += ' (Firefox)';
  
  return deviceName;
};

const cancelTwoFactor = () => {
  showTwoFactorInput.value = false;
  twoFactorCode.value = "";
  pendingSession.value = null;
  useBackupCode.value = false;
  trustThisDevice.value = false;
  error.value = "";
};

const toggleBackupCode = () => {
  useBackupCode.value = !useBackupCode.value;
  twoFactorCode.value = "";
  error.value = "";
};

const verifyTwoFactor = async () => {
  const expectedLength = useBackupCode.value ? 8 : 6;
  if (twoFactorCode.value.length !== expectedLength) {
    error.value = `请输入 ${expectedLength} 位${useBackupCode.value ? '备份码' : '验证码'}`;
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    let result;
    if (useBackupCode.value) {
      // 使用备份码验证
      result = await authClient.twoFactor.verifyBackupCode({
        code: twoFactorCode.value,
      });
    } else {
      // 使用 TOTP 验证
      result = await authClient.twoFactor.verifyTotp({
        code: twoFactorCode.value,
      });
    }

    if (result.error) {
      // 记录验证失败
      $fetch('/api/security/log-login', {
        method: 'POST',
        body: {
          email: email.value,
          success: false,
          failReason: `2FA验证失败: ${result.error.message}`,
          loginMethod: 'email',
        },
      }).catch(() => {});
      
      error.value = result.error.message || `${useBackupCode.value ? '备份码' : '验证码'}错误`;
      loading.value = false;
    } else {
      // 如果用户选择信任此设备，添加到可信设备列表
      if (trustThisDevice.value) {
        try {
          const deviceId = generateDeviceId();
          const deviceName = getDeviceName();
          await $fetch('/api/security/trusted-devices', {
            method: 'POST',
            body: {
              deviceId,
              deviceName,
            },
          });
        } catch (err) {
          console.error('添加可信设备失败:', err);
          // 不阻止登录流程
        }
      }
      
      // 记录登录成功
      $fetch('/api/security/log-login', {
        method: 'POST',
        body: {
          email: email.value,
          success: true,
          loginMethod: 'email',
        },
      }).catch(() => {});
      
      // 2FA verification successful, redirect to home
      router.push("/");
    }
  } catch (e: any) {
    console.error("2FA verification error:", e);
    
    // 记录验证失败
    $fetch('/api/security/log-login', {
      method: 'POST',
      body: {
        email: email.value,
        success: false,
        failReason: `2FA验证异常: ${e.message}`,
        loginMethod: 'email',
      },
    }).catch(() => {});
    
    error.value = e.message || "验证失败，请重试";
    loading.value = false;
  }
};

const handleLogin = async () => {
  if (!turnstileToken.value) {
    error.value = "请完成验证码验证";
    return;
  }

  loading.value = true;
  error.value = "";
  
  try {
    // 首先验证 Turnstile
    const turnstileVerification = await $fetch('/api/auth/verify-turnstile', {
      method: 'POST',
      body: {
        token: turnstileToken.value,
      },
    });

    if (!(turnstileVerification as any).success) {
      error.value = "验证码验证失败";
      if (turnstileRef.value) {
        turnstileRef.value.reset();
      }
      turnstileToken.value = "";
      loading.value = false;
      return;
    }

    // 使用 Better Auth 的登录方法
    const result = await login(email.value, password.value) as any;
    
    // Check if 2FA is required (Better Auth returns twoFactorRedirect: true)
    if (result?.twoFactorRedirect) {
      // 检查是否为可信设备（可选：如果是可信设备可以考虑跳过2FA）
      // 目前先显示2FA输入，用户可以选择信任此设备
      showTwoFactorInput.value = true;
      pendingSession.value = result;
      loading.value = false;
      return;
    }
    
    // 记录登录成功（没有2FA的情况）
    $fetch('/api/security/log-login', {
      method: 'POST',
      body: {
        email: email.value,
        success: true,
        loginMethod: 'email',
      },
    }).catch(() => {}); // 静默失败，不影响登录流程
    
    // 登录成功后重定向
    router.push("/");
  } catch (e: any) {
    // 记录登录失败
    $fetch('/api/security/log-login', {
      method: 'POST',
      body: {
        email: email.value,
        success: false,
        failReason: e.message || '登录失败',
        loginMethod: 'email',
      },
    }).catch(() => {}); // 静默失败，不影响登录流程
    
    // Check if error is due to 2FA requirement
    if (e.message?.includes('two-factor') || e.message?.includes('2FA')) {
      showTwoFactorInput.value = true;
      loading.value = false;
      return;
    }
    
    error.value = e.message || "登录失败，请检查你的邮箱和密码";
    // 重置 Turnstile
    if (turnstileRef.value) {
      turnstileRef.value.reset();
    }
    turnstileToken.value = "";
  } finally {
    loading.value = false;
  }
};

const handlePasskeyLogin = async () => {
  loading.value = true;
  error.value = "";

  try {
    // Use the passkey client to sign in
    await authClient.signIn.passkey();
    
    // 记录登录成功
    $fetch('/api/security/log-login', {
      method: 'POST',
      body: {
        success: true,
        loginMethod: 'passkey',
      },
    }).catch(() => {}); // 静默失败，不影响登录流程
    
    // Redirect on success
    router.push("/");
  } catch (e: any) {
    console.error("Passkey login error:", e);
    
    // 记录登录失败
    $fetch('/api/security/log-login', {
      method: 'POST',
      body: {
        success: false,
        failReason: e.message || 'Passkey 登录失败',
        loginMethod: 'passkey',
      },
    }).catch(() => {}); // 静默失败，不影响登录流程
    
    error.value = e.message || "Passkey 登录失败，请重试或使用其他登录方式";
  } finally {
    loading.value = false;
  }
};

// Redirect if already logged in
const { isAuthenticated } = useAuth();
watchEffect(() => {
  if (isAuthenticated.value) {
    router.push("/");
  }
});
</script>