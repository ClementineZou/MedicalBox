<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
    <div class="card max-w-md w-full bg-white shadow-2xl rounded-3xl p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">创建账户</h1>
        <p class="text-gray-600">开始使用MedicalBox管理你的健康数据</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
        <p class="text-red-700 text-sm">{{ error }}</p>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
        <p class="text-green-700 text-sm">{{ success }}</p>
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="handleRegister" class="space-y-6">
        <!-- Name Field -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            姓名
          </label>
          <input
            id="name"
            v-model="name"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="张三"
          />
        </div>

        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            邮箱地址 <span class="text-red-500">*</span>
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="your@email.com"
          />
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            密码 <span class="text-red-500">*</span>
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            minlength="8"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="至少8个字符"
          />
          <!-- Password Strength Indicator -->
          <div v-if="password" class="mt-2">
            <div class="flex items-center space-x-2">
              <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  :class="passwordStrengthClass"
                  class="h-full transition-all duration-300"
                  :style="{ width: passwordStrength + '%' }"
                ></div>
              </div>
              <span class="text-xs font-medium" :class="passwordStrengthTextClass">
                {{ passwordStrengthText }}
              </span>
            </div>
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
            确认密码 <span class="text-red-500">*</span>
          </label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="再次输入密码"
          />
          <p v-if="confirmPassword && password !== confirmPassword" class="mt-2 text-sm text-red-600">
            密码不匹配
          </p>
        </div>

        <!-- Register Button -->
        <button
          type="submit"
          :disabled="loading || (!!confirmPassword && password !== confirmPassword)"
          class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          <span v-if="!loading">创建账户</span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            注册中...
          </span>
        </button>
      </form>

      <!-- Divider -->
      <div class="flex items-center my-6">
        <div class="flex-1 border-t border-gray-300"></div>
        <span class="px-4 text-sm text-gray-500">或</span>
        <div class="flex-1 border-t border-gray-300"></div>
      </div>

      <!-- GitHub OAuth -->
      <button
        @click="handleGithubRegister"
        type="button"
        :disabled="loading"
        class="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
      >
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        使用GitHub注册
      </button>

      <!-- Login Link -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          已有账户？
          <NuxtLink to="/login" class="text-indigo-600 hover:text-indigo-700 font-medium">
            立即登录
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { register, loginWithGithub } = useAuth();
const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const error = ref("");
const success = ref("");

// Password strength calculator
const passwordStrength = computed(() => {
  const pwd = password.value;
  if (!pwd) return 0;
  
  let strength = 0;
  if (pwd.length >= 8) strength += 25;
  if (pwd.length >= 12) strength += 25;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
  if (/\d/.test(pwd)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(pwd)) strength += 10;
  
  return Math.min(strength, 100);
});

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength < 30) return "弱";
  if (strength < 60) return "中等";
  if (strength < 80) return "强";
  return "非常强";
});

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value;
  if (strength < 30) return "bg-red-500";
  if (strength < 60) return "bg-yellow-500";
  if (strength < 80) return "bg-blue-500";
  return "bg-green-500";
});

const passwordStrengthTextClass = computed(() => {
  const strength = passwordStrength.value;
  if (strength < 30) return "text-red-600";
  if (strength < 60) return "text-yellow-600";
  if (strength < 80) return "text-blue-600";
  return "text-green-600";
});

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = "密码不匹配";
    return;
  }
  
  loading.value = true;
  error.value = "";
  success.value = "";
  
  try {
    await register(email.value, password.value, name.value || undefined);
    success.value = "注册成功！正在跳转...";
    // Redirect to home page after successful registration
    setTimeout(() => {
      router.push("/");
    }, 1500);
  } catch (e: any) {
    console.error("Registration error:", e);
    error.value = e.message || "注册失败，请检查你的输入";
    if (e.body) {
        error.value += ` (${JSON.stringify(e.body)})`;
    }
  } finally {
    loading.value = false;
  }
};

const handleGithubRegister = async () => {
  loading.value = true;
  error.value = "";
  
  try {
    await loginWithGithub();
  } catch (e: any) {
    error.value = e.message || "GitHub注册失败";
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
