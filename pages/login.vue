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

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
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
      </form>

      <!-- Sign Up Link -->
      <div class="mt-6 text-center">
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
const { login } = useAuth();
const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const turnstileToken = ref("");
const turnstileRef = ref<any>(null);

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
    await login(email.value, password.value);
    
    // 登录成功后重定向
    router.push("/");
  } catch (e: any) {
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

// Redirect if already logged in
const { isAuthenticated } = useAuth();
watchEffect(() => {
  if (isAuthenticated.value) {
    router.push("/");
  }
});
</script>
