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

      <!-- Password Management Card -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">
          {{ hasPassword ? '修改密码' : '设置密码' }}
        </h2>
        
        <!-- Info message for GitHub users without password -->
        <div v-if="!hasPassword && !passwordCheckLoading" class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            <div>
              <p class="text-blue-700 text-sm font-medium">您当前使用第三方账户登录</p>
              <p class="text-blue-600 text-sm mt-1">设置密码后，您可以使用邮箱和密码直接登录系统</p>
            </div>
          </div>
        </div>
        
        <div v-if="passwordSuccess" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p class="text-green-700 text-sm">{{ passwordSuccess }}</p>
        </div>
        
        <div v-if="passwordError" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-red-700 text-sm">{{ passwordError }}</p>
        </div>

        <!-- Loading state -->
        <div v-if="passwordCheckLoading" class="text-center py-8">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p class="text-gray-600 mt-2">加载中...</p>
        </div>

        <!-- Set Password Form (for users without password) -->
        <form v-else-if="!hasPassword" @submit.prevent="handleSetPassword" class="space-y-4">
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
            <span v-if="!passwordLoading">设置密码</span>
            <span v-else>设置中...</span>
          </button>
        </form>

        <!-- Change Password Form (for users with password) -->
        <form v-else @submit.prevent="handleChangePassword" class="space-y-4">
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
        
        <!-- Loading state -->
        <div v-if="accountsLoading" class="text-center py-8">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p class="text-gray-600 mt-2">加载中...</p>
        </div>
        
        <div v-else class="space-y-4">
          <!-- GitHub Account -->
          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <div>
                <p class="font-medium text-gray-900">GitHub</p>
                <p class="text-sm text-gray-600">
                  <template v-if="githubAccount">
                    已关联 · {{ formatDate(githubAccount.createdAt) }}
                  </template>
                  <template v-else>
                    关联你的GitHub账户
                  </template>
                </p>
              </div>
            </div>
            <div v-if="!githubAccount">
              <button 
                @click="handleConnectGithub"
                class="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                关联
              </button>
            </div>
            <div v-else class="flex items-center space-x-2">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                已关联
              </span>
              <button
                @click="handleUnlinkAccount(githubAccount.id, 'github')"
                class="text-red-600 hover:text-red-700 font-medium text-sm px-3 py-1 hover:bg-red-50 rounded-lg transition-colors"
                title="解绑GitHub账户"
              >
                解绑
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Settings Card -->
      <div v-if="notificationSupported" class="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">通知设置</h2>
        
        <div class="space-y-4">
          <div class="p-4 bg-gray-50 rounded-xl">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                  </svg>
                  <h3 class="font-medium text-gray-900">浏览器通知</h3>
                </div>
                <p class="text-sm text-gray-600 mb-3">
                  启用后，您将在用药时间和体征监测提醒时间前收到浏览器通知
                </p>
                
                <!-- 通知权限状态 -->
                <div v-if="notificationPermission === 'granted'" class="flex items-center gap-2 mb-3">
                  <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm font-medium text-green-600">通知权限已授予</span>
                </div>
                <div v-else-if="notificationPermission === 'denied'" class="flex items-center gap-2 mb-3">
                  <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm font-medium text-red-600">通知权限已拒绝</span>
                  <p class="text-xs text-gray-500 ml-7">请在浏览器设置中手动启用通知权限</p>
                </div>
                <div v-else class="flex items-center gap-2 mb-3">
                  <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm font-medium text-orange-600">需要授予通知权限</span>
                </div>
              </div>
              
              <div class="flex flex-col gap-3 ml-4">
                <!-- 请求权限按钮 -->
                <button 
                  v-if="notificationPermission !== 'granted'"
                  @click="handleRequestNotificationPermission"
                  class="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm whitespace-nowrap"
                >
                  授予权限
                </button>
                
                <!-- 提醒开关 -->
                <div v-if="notificationPermission === 'granted'" class="flex items-center gap-3">
                  <span class="text-sm font-medium text-gray-700">提醒通知</span>
                  <button 
                    @click="toggleNotificationReminders"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      areNotificationRemindersEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    ]"
                  >
                    <span 
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        areNotificationRemindersEnabled ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                  <span class="text-sm" :class="areNotificationRemindersEnabled ? 'text-blue-600 font-semibold' : 'text-gray-500'">
                    {{ areNotificationRemindersEnabled ? '已启用' : '已禁用' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cookie Preferences Card -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Cookie 偏好设置</h2>
        
        <div class="space-y-4">
          <div v-if="cookieConsentStatus" class="p-4 bg-gray-50 rounded-xl">
            <div class="flex items-center justify-between mb-2">
              <div>
                <p class="font-medium text-gray-900">当前状态</p>
                <p class="text-sm text-gray-600 mt-1">
                  您已{{ cookieConsentStatus === 'accepted' ? '接受' : '拒绝' }}使用 Cookie
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ cookieConsentDate ? '设置于 ' + formatDate(cookieConsentDate) : '' }}
                </p>
              </div>
              <span 
                :class="cookieConsentStatus === 'accepted' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ cookieConsentStatus === 'accepted' ? '已接受' : '已拒绝' }}
              </span>
            </div>
          </div>

          <div class="space-y-3">
            <div class="p-4 border border-gray-200 rounded-xl">
              <h3 class="font-medium text-gray-900 mb-2">必要 Cookie</h3>
              <p class="text-sm text-gray-600 mb-2">
                这些 Cookie 对于网站正常运行是必需的，包括身份验证、会话管理等。无法禁用。
              </p>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">状态</span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  始终启用
                </span>
              </div>
            </div>

            <div class="p-4 border border-gray-200 rounded-xl">
              <h3 class="font-medium text-gray-900 mb-2">功能性 Cookie</h3>
              <p class="text-sm text-gray-600 mb-2">
                这些 Cookie 用于记住您的偏好设置，提供个性化体验。
              </p>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">状态</span>
                <span 
                  :class="cookieConsentStatus === 'accepted' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                >
                  {{ cookieConsentStatus === 'accepted' ? '已启用' : '已禁用' }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              v-if="cookieConsentStatus === 'rejected'"
              @click="updateCookieConsent(true)"
              class="bg-blue-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              接受 Cookie
            </button>
            <button
              v-if="cookieConsentStatus === 'accepted'"
              @click="updateCookieConsent(false)"
              class="bg-gray-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
            >
              拒绝 Cookie
            </button>
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

      <!-- Unlink Account Dialog -->
      <UnlinkAccountDialog
        v-model="showUnlinkDialog"
        :accountId="accountToUnlink?.id || ''"
        :providerId="accountToUnlink?.providerId || ''"
        :hasPassword="hasPassword"
        @confirm="confirmUnlinkAccount"
        ref="unlinkDialogRef"
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
const { hasConsented, isAccepted, getConsentDate, resetConsent, setConsent } = useCookieConsent();
const { isSupported: notificationSupported, permission: notificationPermission, requestPermission, areRemindersEnabled, enableReminders, disableReminders } = useBrowserNotifications();
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
const hasPassword = ref(false);
const passwordCheckLoading = ref(true);
const showUnlinkDialog = ref(false);
const accountToUnlink = ref<any>(null);
const unlinkDialogRef = ref<any>(null);

// Cookie consent state
const cookieConsentStatus = ref<string | null>(null);
const cookieConsentDate = ref<Date | null>(null);

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

const handleSetPassword = async () => {
  if (newPassword.value !== confirmNewPassword.value) {
    passwordError.value = "新密码不匹配";
    return;
  }
  
  passwordLoading.value = true;
  passwordSuccess.value = "";
  passwordError.value = "";
  
  try {
    const response = await $fetch('/api/user/set-password', {
      method: 'POST',
      body: {
        newPassword: newPassword.value,
      }
    });
    
    if ((response as any).success) {
      passwordSuccess.value = "密码已成功设置，您现在可以使用邮箱和密码登录";
      newPassword.value = "";
      confirmNewPassword.value = "";
      hasPassword.value = true; // Update state to show change password form
      
      // Show success notification
      const { success } = useNotification();
      success('密码已成功设置');
    } else {
      passwordError.value = (response as any).message || "密码设置失败";
    }
  } catch (e: any) {
    passwordError.value = e.data?.statusMessage || e.message || "密码设置失败";
  } finally {
    passwordLoading.value = false;
  }
};

const checkHasPassword = async () => {
  passwordCheckLoading.value = true;
  try {
    const response = await $fetch('/api/user/has-password');
    if ((response as any).success) {
      hasPassword.value = (response as any).hasPassword;
    }
  } catch (e: any) {
    console.error('Failed to check password status:', e);
    // Default to showing change password form on error
    hasPassword.value = true;
  } finally {
    passwordCheckLoading.value = false;
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

const githubAccount = computed(() => {
  return linkedAccounts.value.find(acc => acc.providerId === 'github');
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

const handleUnlinkAccount = (accountId: string, providerId: string) => {
  accountToUnlink.value = { id: accountId, providerId };
  showUnlinkDialog.value = true;
};

const confirmUnlinkAccount = async () => {
  if (!unlinkDialogRef.value || !accountToUnlink.value) return;
  
  try {
    unlinkDialogRef.value.setLoading(true);
    unlinkDialogRef.value.setError('');
    
    const response = await $fetch('/api/user/unlink-account', {
      method: 'DELETE',
      body: {
        accountId: accountToUnlink.value.id
      }
    });
    
    if ((response as any).success) {
      // Show success notification
      const { success } = useNotification();
      success('账户已成功解绑');
      
      // Close dialog
      showUnlinkDialog.value = false;
      accountToUnlink.value = null;
      
      // Reload linked accounts
      await loadLinkedAccounts();
    } else {
      unlinkDialogRef.value.setError((response as any).error || '解绑失败，请重试');
    }
  } catch (e: any) {
    console.error("解绑账户失败:", e);
    unlinkDialogRef.value.setError(e.data?.error || e.message || '解绑失败，请重试');
  } finally {
    unlinkDialogRef.value.setLoading(false);
  }
};

// Notification methods
const areNotificationRemindersEnabled = computed(() => areRemindersEnabled.value);

const handleRequestNotificationPermission = async () => {
  const result = await requestPermission();
  
  if (result === 'granted') {
    const { success } = useNotification();
    success('通知权限已授予');
  } else if (result === 'denied') {
    const { error } = useNotification();
    error('通知权限被拒绝，请在浏览器设置中手动启用');
  }
};

const toggleNotificationReminders = () => {
  if (areRemindersEnabled.value) {
    disableReminders();
    const { success } = useNotification();
    success('提醒通知已禁用');
  } else {
    enableReminders();
    const { success } = useNotification();
    success('提醒通知已启用');
  }
};

// Cookie consent methods
const loadCookieConsent = () => {
  if (process.client) {
    const consent = localStorage.getItem('cookie-consent');
    cookieConsentStatus.value = consent;
    cookieConsentDate.value = getConsentDate();
  }
};

const updateCookieConsent = (accepted: boolean) => {
  setConsent(accepted);
  loadCookieConsent();
  
  const { success } = useNotification();
  success(accepted ? 'Cookie 偏好已更新为接受' : 'Cookie 偏好已更新为拒绝');
  
  // Reload the page to apply changes
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

const resetCookieConsent = () => {
  resetConsent();
  loadCookieConsent();
  
  const { success } = useNotification();
  success('Cookie 偏好已重置，页面将重新加载以显示同意提示');
  
  // Reload the page to show consent banner again
  setTimeout(() => {
    window.location.reload();
  }, 1500);
};

// Load linked accounts on mount
onMounted(() => {
  loadLinkedAccounts();
  checkHasPassword();
  loadCookieConsent();
});

// Redirect if not logged in
watchEffect(() => {
  if (!user.value) {
    router.push("/login");
  }
});
</script>
