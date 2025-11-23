<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">账户中心</h1>
        <p class="text-gray-600 mt-2">管理你的个人信息和账户设置</p>
      </div>

      <!-- Profile Card -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">个人信息</h2>
        
        <div class="space-y-6">
          <!-- Avatar -->
          <div class="flex items-center space-x-4">
            <img 
              v-if="gravatarUrl"
              :src="gravatarUrl" 
              :alt="user?.name || 'User avatar'"
              class="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
            <div 
              v-else
              class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold"
            >
              {{ userInitial }}
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ user?.name || '未设置姓名' }}</h3>
              <p class="text-sm text-gray-600">{{ user?.email }}</p>
            </div>
          </div>

          <!-- User Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">姓名</label>
              <p class="text-gray-900">{{ user?.name || '未设置' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
              <p class="text-gray-900">{{ user?.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">账户创建时间</label>
              <p class="text-gray-900">{{ formatDate(user?.createdAt) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">邮箱验证状态</label>
              <span v-if="user?.emailVerified" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                已验证
              </span>
              <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                未验证
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Change Password Card -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">修改密码</h2>
        
        <div v-if="passwordSuccess" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p class="text-green-700 text-sm">{{ passwordSuccess }}</p>
        </div>
        
        <div v-if="passwordError" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-red-700 text-sm">{{ passwordError }}</p>
        </div>

        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2">
              当前密码
            </label>
            <input
              id="currentPassword"
              v-model="currentPassword"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入当前密码"
            />
          </div>

          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
              新密码
            </label>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              required
              minlength="8"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="至少8个字符"
            />
          </div>

          <div>
            <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700 mb-2">
              确认新密码
            </label>
            <input
              id="confirmNewPassword"
              v-model="confirmNewPassword"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="再次输入新密码"
            />
            <p v-if="confirmNewPassword && newPassword !== confirmNewPassword" class="mt-2 text-sm text-red-600">
              密码不匹配
            </p>
          </div>

          <button
            type="submit"
            :disabled="passwordLoading || (!!confirmNewPassword && newPassword !== confirmNewPassword)"
            class="bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span v-if="!passwordLoading">更新密码</span>
            <span v-else>更新中...</span>
          </button>
        </form>
      </div>

      <!-- Connected Accounts Card -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">关联账户</h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <div>
                <p class="font-medium text-gray-900">GitHub</p>
                <p class="text-sm text-gray-600">关联你的GitHub账户</p>
              </div>
            </div>
            <button 
              v-if="!isGithubLinked"
              @click="handleConnectGithub"
              class="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              关联
            </button>
            <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              已关联
            </span>
          </div>
        </div>
      </div>

      <!-- Danger Zone Card -->
      <div class="bg-white rounded-2xl shadow-lg p-8 border-2 border-red-200">
        <h2 class="text-xl font-semibold text-red-600 mb-6">危险操作</h2>
        
        <div class="space-y-4">
          <div>
            <h3 class="font-medium text-gray-900 mb-2">删除账户</h3>
            <p class="text-sm text-gray-600 mb-4">
              删除你的账户将永久删除所有数据，包括药品信息、用药记录、生命体征记录等。此操作不可恢复。
            </p>
            <button
              @click="showDeleteDialog = true"
              class="bg-red-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
            >
              删除账户
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Account Dialog -->
      <DeleteAccountDialog 
        v-model="showDeleteDialog" 
        @confirm="handleDeleteAccount"
        ref="deleteDialogRef"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { authClient } from "~/lib/auth-client";

// 设置页面标题
useHead({
  title: '账户中心'
});

const { user, logout, deleteAccount } = useAuth();
const router = useRouter();

const currentPassword = ref("");
const newPassword = ref("");
const confirmNewPassword = ref("");
const passwordLoading = ref(false);
const passwordSuccess = ref("");
const passwordError = ref("");
const showDeleteDialog = ref(false);
const linkedAccounts = ref<any[]>([]);
const accountsLoading = ref(true);
const deleteDialogRef = ref<any>(null);

// Gravatar support
const userEmail = computed(() => user.value?.email);
const { gravatarUrl } = useGravatar(userEmail, 200);

// Computed
const userInitial = computed(() => {
  if (user.value?.name) {
    return user.value.name.charAt(0).toUpperCase();
  }
  if (user.value?.email) {
    return user.value.email.charAt(0).toUpperCase();
  }
  return "U";
});

// Methods
const formatDate = (date: any) => {
  if (!date) return "未知";
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const handleChangePassword = async () => {
  if (newPassword.value !== confirmNewPassword.value) {
    passwordError.value = "新密码不匹配";
    return;
  }
  
  passwordLoading.value = true;
  passwordSuccess.value = "";
  passwordError.value = "";
  
  try {
    const response = await $fetch('/api/user/change-password', {
      method: 'POST',
      body: {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      }
    });
    
    if ((response as any).success) {
      passwordSuccess.value = "密码已成功更新";
      currentPassword.value = "";
      newPassword.value = "";
      confirmNewPassword.value = "";
      
      // Show success notification
      const { success } = useNotification();
      success('密码已成功更新');
    } else {
      passwordError.value = (response as any).message || "密码更新失败";
    }
  } catch (e: any) {
    passwordError.value = e.data?.statusMessage || e.message || "密码更新失败";
  } finally {
    passwordLoading.value = false;
  }
};

const loadLinkedAccounts = async () => {
  accountsLoading.value = true;
  try {
    const response = await $fetch('/api/auth/get-session');
    if (response) {
      // Fetch user's linked accounts from database
      const accountsResponse = await $fetch(`/api/user/accounts`);
      if ((accountsResponse as any).success) {
        linkedAccounts.value = (accountsResponse as any).data || [];
      }
    }
  } catch (e: any) {
    console.error('Failed to load linked accounts:', e);
  } finally {
    accountsLoading.value = false;
  }
};

const isGithubLinked = computed(() => {
  return linkedAccounts.value.some(acc => acc.providerId === 'github');
});

const handleConnectGithub = async () => {
  try {
    // Get GitHub client ID from runtime config or env
    const config = useRuntimeConfig();
    const clientId = config.public.githubClientId || 'Ov23li6HpGTLgDQAGVq7';
    const redirectUri = `${window.location.origin}/profile/github-callback`;
    const state = Math.random().toString(36).substring(7);
    
    // Store state in sessionStorage for validation
    sessionStorage.setItem('github_link_state', state);
    
    // Redirect to GitHub OAuth
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=read:user,user:email`;
    window.location.href = authUrl;
  } catch (e: any) {
    console.error("GitHub连接失败:", e);
    alert("连接GitHub失败: " + e.message);
  }
};

const handleDeleteAccount = async (password: string) => {
  if (!deleteDialogRef.value) return;
  
  try {
    deleteDialogRef.value.setLoading(true);
    deleteDialogRef.value.setError('');
    
    await deleteAccount(password);
    
    // Show success notification
    const { success } = useNotification();
    success('账户已成功删除');
    
    // Close dialog
    showDeleteDialog.value = false;
    
    // Redirect to home page
    await navigateTo('/');
  } catch (e: any) {
    console.error("删除账户失败:", e);
    deleteDialogRef.value.setError(e.message || '删除账户失败，请重试');
  } finally {
    deleteDialogRef.value.setLoading(false);
  }
};

// Load linked accounts on mount
onMounted(() => {
  loadLinkedAccounts();
});

// Redirect if not logged in
watchEffect(() => {
  if (!user.value) {
    router.push("/login");
  }
});
</script>
