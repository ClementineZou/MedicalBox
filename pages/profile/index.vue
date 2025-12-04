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

      <!-- Notification Settings Card -->
      <div v-if="notificationSupported" class="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">通知设置</h2>
        
        <div class="space-y-4">
          <div class="p-4 bg-gray-50 rounded-xl">
            <div class="flex items-start justify-between gap-4">
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
                <div v-if="notificationPermission === 'granted'" class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm font-medium text-green-600">通知权限已授予</span>
                </div>
                <div v-else-if="notificationPermission === 'denied'" class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                  <div>
                    <span class="text-sm font-medium text-red-600">通知权限已拒绝</span>
                    <p class="text-xs text-gray-500 mt-1">请在浏览器设置中手动启用通知权限</p>
                  </div>
                </div>
                <div v-else class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm font-medium text-orange-600">需要授予通知权限</span>
                </div>
              </div>

              <!-- 切换开关移到右边 -->
              <div class="flex flex-col items-end gap-2">
                <button
                  @click="toggleNotificationReminders"
                  :disabled="notificationPermission === 'denied'"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="areNotificationRemindersEnabled ? 'bg-blue-600' : 'bg-gray-200'"
                  :title="areNotificationRemindersEnabled ? '点击禁用通知' : '点击启用通知'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="areNotificationRemindersEnabled ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
                <span class="text-sm whitespace-nowrap" :class="areNotificationRemindersEnabled ? 'text-blue-600 font-semibold' : 'text-gray-500'">
                  {{ areNotificationRemindersEnabled ? '已启用' : '已禁用' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cookie Preferences Card -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Cookie 偏好设置</h2>
        
        <div class="space-y-6">
          <!-- 当前状态 -->
          <div v-if="cookieConsentStatus" class="p-4 bg-gray-50 rounded-xl">
            <div class="flex items-center justify-between mb-2">
              <div>
                <p class="font-medium text-gray-900">当前状态</p>
                <p class="text-sm text-gray-600 mt-1">
                  您{{ cookieConsentStatus === 'accepted' ? '已接受' : '已拒绝' }} Cookie
                </p>
              </div>
              <span 
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="cookieConsentStatus === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ cookieConsentStatus === 'accepted' ? '已接受' : '已拒绝' }}
              </span>
            </div>
          </div>

          <!-- Cookie 说明 -->
          <p class="text-sm text-gray-600">
            Cookie 帮助我们提供更好的服务。您可以随时更改您的 Cookie 偏好设置。
          </p>

          <!-- 必须 Cookie -->
          <div class="border border-gray-200 rounded-xl p-4">
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <h3 class="font-medium text-gray-900">必须 Cookie</h3>
                  <span class="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full font-medium">始终启用</span>
                </div>
                <p class="text-sm text-gray-600">
                  这些 Cookie 对于网站正常运行是必需的，包括用户身份验证、会话管理和安全功能。这些 Cookie 无法被禁用。
                </p>
                <ul class="mt-2 ml-6 space-y-1 text-xs text-gray-500 list-disc">
                  <li>身份验证 Cookie (better-auth.session_token)</li>
                  <li>CSRF 保护 Token</li>
                  <li>会话状态管理</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 可选 Cookie -->
          <div class="border border-gray-200 rounded-xl p-4">
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <h3 class="font-medium text-gray-900">可选 Cookie（分析与优化）</h3>
                  <span 
                    class="px-2 py-0.5 text-xs rounded-full font-medium"
                    :class="cookieConsentStatus === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
                  >
                    {{ cookieConsentStatus === 'accepted' ? '已启用' : '已禁用' }}
                  </span>
                </div>
                <p class="text-sm text-gray-600">
                  这些 Cookie 帮助我们了解用户如何使用网站，以便改善用户体验和网站性能。您可以选择是否启用这些 Cookie。
                </p>
                <ul class="mt-2 ml-6 space-y-1 text-xs text-gray-500 list-disc">
                  <li>Google Analytics（用户行为分析）</li>
                  <li>性能监控和错误追踪</li>
                  <li>用户偏好记录</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-3 pt-2">
            <button
              v-if="cookieConsentStatus !== 'accepted'"
              @click="updateCookieConsent(true)"
              class="bg-green-600 text-white py-3 px-4 min-w-[80px] rounded-xl font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all"
            >
              接受 Cookie
            </button>
            <button
              v-if="cookieConsentStatus === 'accepted'"
              @click="updateCookieConsent(false)"
              class="bg-gray-600 text-white py-3 px-4 min-w-[80px] rounded-xl font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
            >
              拒绝 Cookie
            </button>
          </div>
        </div>
      </div>

      <!-- Password Management Card -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">
          {{ hasPassword ? '修改密码' : '设置密码' }}
        </h2>
        
        <!-- Info message for users without password -->
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

      <!-- Two-Factor Authentication Card -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">双因素验证 (2FA)</h2>
        
        <div v-if="twoFactorSuccess" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p class="text-green-700 text-sm">{{ twoFactorSuccess }}</p>
        </div>
        
        <div v-if="twoFactorError" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-red-700 text-sm">{{ twoFactorError }}</p>
        </div>

        <div v-if="twoFactorLoading" class="text-center py-8">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p class="text-gray-600 mt-2">加载中...</p>
        </div>

        <div v-else>
          <!-- 2FA Not Enabled -->
          <div v-if="!twoFactorEnabled && !showTwoFactorSetup" class="space-y-4">
            <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <p class="text-blue-700 text-sm font-medium">双因素验证未启用</p>
                  <p class="text-blue-600 text-sm mt-1">启用双因素验证可以为您的账户提供额外的安全保护</p>
                </div>
              </div>
            </div>
            <button
              @click="startTwoFactorSetup"
              class="bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              启用双因素验证
            </button>
          </div>

          <!-- 2FA Setup Process -->
          <div v-else-if="showTwoFactorSetup" class="space-y-6">
            <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p class="text-blue-700 text-sm font-medium mb-2">设置步骤：</p>
              <ol class="text-blue-600 text-sm space-y-1 ml-4 list-decimal">
                <li>使用验证器应用（如 Google Authenticator、Authy）扫描下方二维码</li>
                <li>输入验证器应用显示的 6 位验证码</li>
                <li>保存备份码（用于恢复访问）</li>
              </ol>
            </div>

            <!-- QR Code -->
            <div v-if="qrCodeDataUrl" class="flex flex-col items-center space-y-4">
              <div class="p-4 bg-white border-2 border-gray-300 rounded-xl">
                <img :src="qrCodeDataUrl" alt="2FA QR Code" class="w-64 h-64" />
              </div>
              <div class="text-center">
                <p class="text-sm text-gray-600 mb-1">或手动输入密钥：</p>
                <code class="text-xs bg-gray-100 px-3 py-1 rounded font-mono">{{ twoFactorSecret }}</code>
              </div>
            </div>

            <!-- Verification Code Input -->
            <div>
              <label for="twoFactorVerifyCode" class="block text-sm font-medium text-gray-700 mb-2">
                验证码
              </label>
              <input
                id="twoFactorVerifyCode"
                v-model="twoFactorVerifyCode"
                type="text"
                maxlength="6"
                pattern="[0-9]{6}"
                placeholder="000000"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              />
            </div>

            <!-- Backup Codes -->
            <div v-if="twoFactorBackupCodes && twoFactorBackupCodes.length > 0" class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div class="flex items-center justify-between mb-2">
                <p class="text-yellow-800 text-sm font-medium">⚠️ 备份码（请妥善保存）：</p>
                <button
                  @click="downloadBackupCodes"
                  class="bg-yellow-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-yellow-700 transition flex items-center gap-1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  打印/保存PDF
                </button>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <code v-for="code in twoFactorBackupCodes" :key="code" class="text-xs bg-white px-2 py-1 rounded font-mono">
                  {{ code }}
                </code>
              </div>
              <p class="text-yellow-700 text-xs mt-2">这些备份码只会显示一次，请将它们保存在安全的地方</p>
            </div>

            <div class="flex gap-3">
              <button
                @click="cancelTwoFactorSetup"
                class="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
              >
                取消
              </button>
              <button
                @click="completeTwoFactorSetup"
                :disabled="twoFactorVerifyCode.length !== 6"
                class="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                完成设置
              </button>
            </div>
          </div>

          <!-- 2FA Enabled -->
          <div v-else-if="twoFactorEnabled" class="space-y-4">
            <div class="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <p class="text-green-700 text-sm font-medium">双因素验证已启用</p>
                  <p class="text-green-600 text-sm mt-1">您的账户已受到双因素验证保护</p>
                </div>
              </div>
            </div>
            <button
              @click="disableTwoFactor"
              class="bg-red-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
            >
              禁用双因素验证
            </button>
          </div>
        </div>
      </div>

      <!-- Passkey Management Card -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Passkey 管理</h2>
        
        <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            <div>
              <p class="text-blue-700 text-sm font-medium">什么是 Passkey？</p>
              <p class="text-blue-600 text-sm mt-1">Passkey 是一种更安全、更便捷的登录方式，使用您的设备（如指纹、面容或 PIN）进行身份验证，无需记忆密码</p>
            </div>
          </div>
        </div>

        <div v-if="passkeySuccess" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p class="text-green-700 text-sm">{{ passkeySuccess }}</p>
        </div>
        
        <div v-if="passkeyError" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-red-700 text-sm">{{ passkeyError }}</p>
        </div>

        <div v-if="passkeyLoading" class="text-center py-8">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p class="text-gray-600 mt-2">加载中...</p>
        </div>

        <div v-else class="space-y-4">
          <!-- Passkey List -->
          <div v-if="passkeys && passkeys.length > 0" class="space-y-3">
            <h3 class="text-sm font-medium text-gray-700">已注册的 Passkey</h3>
            <div v-for="passkey in passkeys" :key="passkey.id" class="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ passkey.name || '未命名设备' }}</p>
                  <p class="text-xs text-gray-500">{{ passkey.deviceType }} • 创建于 {{ formatDate(passkey.createdAt) }}</p>
                </div>
              </div>
              <button
                @click="deletePasskey(passkey.id)"
                class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all"
                title="删除此 Passkey"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div v-else class="p-4 bg-gray-50 rounded-xl text-center text-gray-600 text-sm">
            您还没有注册任何 Passkey
          </div>

          <!-- Add Passkey Button -->
          <button
            @click="registerPasskey"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            添加新的 Passkey
          </button>
        </div>
      </div>

      <!-- Active Sessions Card -->
      <ActiveSessionsCard class="mb-6" />

      <!-- Trusted Devices Card -->
      <TrustedDevicesCard class="mb-6" />

      <!-- Login History Card -->
      <LoginHistoryCard class="mb-6" />

      <!-- Enhanced Privacy Protection Card -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">强化隐私保护</h2>
        
        <div v-if="privacySettingsLoading" class="text-center py-8">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p class="text-gray-600 mt-2">加载中...</p>
        </div>

        <div v-else class="space-y-6">
          <!-- Status Info -->
          <div class="p-4 rounded-xl" :class="privacySettings?.enhancedPrivacyEnabled ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'">
            <div class="flex items-start">
              <svg v-if="privacySettings?.enhancedPrivacyEnabled" class="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
              <div>
                <p :class="privacySettings?.enhancedPrivacyEnabled ? 'text-green-700' : 'text-blue-700'" class="text-sm font-medium">
                  {{ privacySettings?.enhancedPrivacyEnabled ? '强化隐私保护已启用' : '强化隐私保护未启用' }}
                </p>
                <p :class="privacySettings?.enhancedPrivacyEnabled ? 'text-green-600' : 'text-blue-600'" class="text-sm mt-1">
                  {{ privacySettings?.enhancedPrivacyEnabled 
                    ? '访问用药记录、健康监测页面及导出数据时需要进行两步验证' 
                    : '启用后，访问敏感数据时需要进行两步验证以增强隐私保护' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Prerequisite Check -->
          <div v-if="!canEnablePrivacyProtection" class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <div>
                <p class="text-yellow-800 text-sm font-medium">需要先设置两步验证</p>
                <p class="text-yellow-700 text-sm mt-1">
                  请先设置 TOTP 验证器或 Passkey，然后才能启用强化隐私保护功能。
                </p>
              </div>
            </div>
          </div>

          <!-- Settings -->
          <div v-if="canEnablePrivacyProtection" class="space-y-4">
            <!-- Enable/Disable Toggle -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">启用强化隐私保护</h3>
                <p class="text-sm text-gray-600 mt-1">
                  启用后，进入用药记录、健康监测页面时需要两步验证
                </p>
              </div>
              <button
                @click="togglePrivacyProtection"
                :disabled="privacySettingsUpdating"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :class="privacySettings?.enhancedPrivacyEnabled ? 'bg-blue-600' : 'bg-gray-200'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="privacySettings?.enhancedPrivacyEnabled ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>

            <!-- Verify Duration Setting -->
            <div v-if="privacySettings?.enhancedPrivacyEnabled" class="p-4 bg-gray-50 rounded-xl">
              <h3 class="font-medium text-gray-900 mb-2">免验证时长</h3>
              <p class="text-sm text-gray-600 mb-3">
                验证成功后，在指定时间内无需再次验证
              </p>
              <select
                v-model="selectedVerifyDuration"
                @change="updateVerifyDuration"
                :disabled="privacySettingsUpdating"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option v-for="option in verifyDurationOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Success/Error Messages -->
          <div v-if="privacySettingsSuccess" class="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p class="text-green-700 text-sm">{{ privacySettingsSuccess }}</p>
          </div>
          <div v-if="privacySettingsError" class="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p class="text-red-700 text-sm">{{ privacySettingsError }}</p>
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

      <!-- Password Prompt Dialog -->
      <PasswordPromptDialog
        v-model:isOpen="showPasswordPrompt"
        :title="passwordPromptAction === 'enable' ? '启用双因素验证' : '禁用双因素验证'"
        :message="passwordPromptAction === 'enable' ? '为了安全，请输入您的密码以启用双因素验证' : '为了安全，请输入您的密码以禁用双因素验证'"
        :loading="passwordPromptLoading"
        @confirm="handlePasswordConfirm"
        @cancel="showPasswordPrompt = false"
      />

      <!-- Passkey Name Dialog -->
      <PasskeyNameDialog
        v-model="showPasskeyNameDialog"
        @confirm="handlePasskeyNameConfirm"
        @cancel="handlePasskeyNameCancel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { authClient } from "~/lib/auth-client";
import QRCode from 'qrcode';

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
const deleteDialogRef = ref<any>(null);
const hasPassword = ref(false);
const passwordCheckLoading = ref(true);

// Two-Factor Authentication state
const twoFactorEnabled = ref(false);
const twoFactorLoading = ref(false);
const twoFactorSuccess = ref("");
const twoFactorError = ref("");
const showTwoFactorSetup = ref(false);
const twoFactorQrCode = ref("");
const twoFactorSecret = ref("");
const twoFactorVerifyCode = ref("");
const twoFactorBackupCodes = ref<string[]>([]);
const showPasswordPrompt = ref(false);
const passwordPromptAction = ref<'enable' | 'disable'>('enable');
const passwordPromptLoading = ref(false);
const showPasskeyNameDialog = ref(false);

// Generate QR code data URL from TOTP URI
const qrCodeDataUrl = ref<string>("");

// Watch twoFactorQrCode changes and generate QR code
watch(twoFactorQrCode, async (newUri) => {
  if (newUri) {
    try {
      qrCodeDataUrl.value = await QRCode.toDataURL(newUri, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  } else {
    qrCodeDataUrl.value = "";
  }
});

// Passkey state
const passkeys = ref<any[]>([]);
const passkeyLoading = ref(false);
const passkeySuccess = ref("");
const passkeyError = ref("");

// Privacy Protection state
import { PRIVACY_VERIFY_DURATION_OPTIONS } from '~/types';
const privacySettings = ref<{
  enhancedPrivacyEnabled: boolean;
  privacyVerifyDuration: number;
  hasTwoFactor: boolean;
  hasPasskey: boolean;
} | null>(null);
const privacySettingsLoading = ref(true);
const privacySettingsUpdating = ref(false);
const privacySettingsSuccess = ref("");
const privacySettingsError = ref("");
const selectedVerifyDuration = ref(10);
const verifyDurationOptions = PRIVACY_VERIFY_DURATION_OPTIONS;

// Computed: Check if user can enable privacy protection
const canEnablePrivacyProtection = computed(() => {
  return privacySettings.value?.hasTwoFactor || privacySettings.value?.hasPasskey;
});

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

// Two-Factor Authentication methods
const checkTwoFactorStatus = () => {
  // Get 2FA status directly from user data
  if (user.value) {
    twoFactorEnabled.value = (user.value as any).twoFactorEnabled || false;
  }
};

const startTwoFactorSetup = () => {
  twoFactorError.value = "";
  twoFactorSuccess.value = "";
  passwordPromptAction.value = 'enable';
  showPasswordPrompt.value = true;
};

const handlePasswordConfirm = async (password: string) => {
  passwordPromptLoading.value = true;
  twoFactorLoading.value = true;
  twoFactorError.value = "";
  
  try {
    if (passwordPromptAction.value === 'enable') {
      // Use better-auth's twoFactor API
      const result = await authClient.twoFactor.enable({
        password,
      });
      
      if (result && result.data) {
        twoFactorQrCode.value = result.data.totpURI || "";
        twoFactorSecret.value = result.data.totpURI.split('secret=')[1]?.split('&')[0] || "";
        twoFactorBackupCodes.value = result.data.backupCodes || [];
        showTwoFactorSetup.value = true;
        showPasswordPrompt.value = false;
        
        const { success } = useNotification();
        success('请扫描二维码以完成设置');
      }
    } else if (passwordPromptAction.value === 'disable') {
      await authClient.twoFactor.disable({
        password,
      });
      
      twoFactorEnabled.value = false;
      twoFactorSuccess.value = "双因素验证已禁用";
      showPasswordPrompt.value = false;
      
      const { success } = useNotification();
      success('双因素验证已禁用');
    }
  } catch (e: any) {
    console.error('2FA operation failed:', e);
    twoFactorError.value = e.message || (passwordPromptAction.value === 'enable' ? '启动双因素验证设置失败' : '禁用双因素验证失败');
    showPasswordPrompt.value = false;
    
    const { error: showError } = useNotification();
    showError(twoFactorError.value);
  } finally {
    twoFactorLoading.value = false;
    passwordPromptLoading.value = false;
  }
};

const completeTwoFactorSetup = async () => {
  if (twoFactorVerifyCode.value.length !== 6) {
    twoFactorError.value = "请输入 6 位验证码";
    return;
  }

  twoFactorLoading.value = true;
  twoFactorError.value = "";
  
  try {
    // Verify the code
    const result = await authClient.twoFactor.verifyTotp({
      code: twoFactorVerifyCode.value,
    });
    
    if (result && result.data) {
      twoFactorSuccess.value = "双因素验证已成功启用";
      twoFactorEnabled.value = true;
      showTwoFactorSetup.value = false;
      twoFactorVerifyCode.value = "";
      
      const { success } = useNotification();
      success('双因素验证已启用');
    } else {
      twoFactorError.value = "验证码错误，请重试";
    }
  } catch (e: any) {
    console.error('Failed to complete 2FA setup:', e);
    twoFactorError.value = e.message || '验证失败，请重试';
  } finally {
    twoFactorLoading.value = false;
  }
};

const cancelTwoFactorSetup = () => {
  showTwoFactorSetup.value = false;
  twoFactorQrCode.value = "";
  twoFactorSecret.value = "";
  twoFactorVerifyCode.value = "";
  twoFactorBackupCodes.value = [];
  twoFactorError.value = "";
};

const disableTwoFactor = () => {
  if (!confirm('确定要禁用双因素验证吗？这将降低您账户的安全性。')) {
    return;
  }

  twoFactorError.value = "";
  twoFactorSuccess.value = "";
  passwordPromptAction.value = 'disable';
  showPasswordPrompt.value = true;
};

const downloadBackupCodes = () => {
  try {
    // 构建HTML内容用于打印
    let html = `
      <style>
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
            color: #000;
            background: #fff;
          }
          .header {
            text-align: center;
            font-size: 24pt;
            font-weight: bold;
            margin-bottom: 10px;
            color: #4285f4;
          }
          .subtitle {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 30px;
          }
          .warning {
            background: #fff3cd;
            border: 2px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
          }
          .warning-title {
            color: #dc2626;
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .warning-text {
            color: #856404;
            font-size: 11pt;
            line-height: 1.6;
          }
          .codes-container {
            margin: 30px 0;
          }
          .code-item {
            display: inline-block;
            width: 45%;
            margin: 8px 2.5%;
            padding: 12px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 12pt;
            font-weight: bold;
          }
          .code-number {
            color: #6c757d;
            margin-right: 10px;
          }
          .instructions {
            margin: 30px 0;
            padding: 20px;
            background: #e3f2fd;
            border-left: 4px solid #4285f4;
          }
          .instructions-title {
            font-size: 13pt;
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 10px;
          }
          .instructions-list {
            font-size: 10pt;
            line-height: 1.8;
            color: #333;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #4285f4;
            text-align: center;
            font-size: 9pt;
            color: #666;
          }
          .footer .app-name {
            font-size: 14pt;
            font-weight: bold;
            color: #4285f4;
            margin-bottom: 5px;
          }
          .footer .slogan {
            font-style: italic;
            color: #888;
          }
          .footer .timestamp {
            margin-top: 10px;
            color: #999;
            font-size: 8pt;
          }
        }
      </style>
      
      <div class="header">💊 MedicalBox</div>
      <div class="subtitle">双因素验证备份码</div>
      
      <div class="warning">
        <div class="warning-title">⚠️ 重要提示</div>
        <div class="warning-text">
          • 每个备份码只能使用一次<br>
          • 请将此文档保存在安全的地方<br>
          • 不要与他人分享这些备份码<br>
          • 如果丢失设备或验证器应用，可使用这些备份码登录
        </div>
      </div>
      
      <div class="codes-container">
    `;
    
    twoFactorBackupCodes.value.forEach((code, index) => {
      html += `
        <div class="code-item">
          <span class="code-number">${(index + 1).toString().padStart(2, '0')}.</span>
          <span>${code}</span>
        </div>
      `;
    });
    
    html += `
      </div>
      
      <div class="instructions">
        <div class="instructions-title">📋 使用说明</div>
        <div class="instructions-list">
          1. 当您无法访问验证器应用时，可以使用备份码登录<br>
          2. 在登录时选择"使用备份码"选项<br>
          3. 输入上述任意一个未使用的备份码<br>
          4. 每个备份码只能使用一次，使用后将失效<br>
          5. 建议打印此文档并妥善保管
        </div>
      </div>
      
      <div class="footer">
        <div class="app-name">💊 MedicalBox - 智能家庭药箱管理系统</div>
        <div class="slogan">让用药更安全，让健康更可控</div>
        <div class="timestamp">生成时间: ${new Date().toLocaleString('zh-CN')}</div>
      </div>
    `;
    
    // 打开新窗口并打印
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      // 等待内容加载完成后打印
      printWindow.onload = () => {
        printWindow.print();
        // 打印后关闭窗口
        setTimeout(() => {
          printWindow.close();
        }, 100);
      };
      
      const { success } = useNotification();
      success('正在打开打印预览，您可以选择保存为PDF');
    }
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    const { error: showError } = useNotification();
    showError('生成失败，请重试');
  }
};

// Passkey methods
const loadPasskeys = async () => {
  passkeyLoading.value = true;
  try {
    const response = await authClient.passkey.listUserPasskeys();
    passkeys.value = response.data || [];
  } catch (e: any) {
    console.error('Failed to load passkeys:', e);
  } finally {
    passkeyLoading.value = false;
  }
};

const registerPasskey = async () => {
  passkeyLoading.value = true;
  passkeyError.value = "";
  passkeySuccess.value = "";
  
  try {
    // Use better-auth's passkey.addPasskey method (without name first)
    // Note: addPasskey returns { data, error } and doesn't throw
    const { data, error } = await authClient.passkey.addPasskey();
    
    // Check if registration was successful
    if (error) {
      console.error('Failed to register passkey:', error);
      passkeyError.value = error.message || 'Passkey 注册失败';
      
      const { error: showError } = useNotification();
      showError('Passkey 注册失败');
      
      passkeyLoading.value = false;
      return;
    }
    
    // If successful, show dialog to set name
    if (data) {
      showPasskeyNameDialog.value = true;
    } else {
      // User cancelled the registration
      passkeyLoading.value = false;
    }
  } catch (e: any) {
    console.error('Failed to register passkey:', e);
    passkeyError.value = e.message || 'Passkey 注册失败';
    
    const { error: showError } = useNotification();
    showError('Passkey 注册失败');
    
    passkeyLoading.value = false;
  }
};

const handlePasskeyNameConfirm = async (name: string) => {
  try {
    // Reload passkeys to get the newly created one
    await loadPasskeys();
    
    if (name && passkeys.value.length > 0) {
      // Update the name of the most recent passkey
      const latestPasskey = passkeys.value[passkeys.value.length - 1];
      
      // Use Better Auth's updatePasskey method
      const { error } = await authClient.passkey.updatePasskey({
        id: latestPasskey.id,
        name: name
      });
      
      if (error) {
        console.error('Failed to update passkey name:', error);
        // Still show success since passkey was created
      }
    }
    
    passkeySuccess.value = "Passkey 已成功添加";
    
    const { success } = useNotification();
    success('Passkey 已成功添加');
    
    await loadPasskeys();
  } catch (e: any) {
    console.error('Failed to update passkey name:', e);
    // Still show success since passkey was created
    passkeySuccess.value = "Passkey 已成功添加";
    
    const { success } = useNotification();
    success('Passkey 已成功添加');
    
    await loadPasskeys();
  } finally {
    passkeyLoading.value = false;
  }
};

const handlePasskeyNameCancel = async () => {
  // Still successful, just without custom name
  passkeySuccess.value = "Passkey 已成功添加";
  
  const { success } = useNotification();
  success('Passkey 已成功添加');
  
  await loadPasskeys();
  passkeyLoading.value = false;
};

const deletePasskey = async (passkeyId: string) => {
  if (!confirm('确定要删除此 Passkey 吗？')) {
    return;
  }

  passkeyLoading.value = true;
  passkeyError.value = "";
  
  try {
    await authClient.passkey.deletePasskey({
      id: passkeyId,
    });
    
    passkeySuccess.value = "Passkey 已成功删除";
    
    const { success } = useNotification();
    success('Passkey 已删除');
    
    // Reload passkeys
    await loadPasskeys();
  } catch (e: any) {
    console.error('Failed to delete passkey:', e);
    passkeyError.value = e.message || 'Passkey 删除失败';
  } finally {
    passkeyLoading.value = false;
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

// Privacy Protection methods
const loadPrivacySettings = async () => {
  privacySettingsLoading.value = true;
  privacySettingsError.value = "";
  
  try {
    const response = await $fetch('/api/user/privacy-settings');
    if ((response as any).success) {
      privacySettings.value = (response as any).data;
      selectedVerifyDuration.value = privacySettings.value?.privacyVerifyDuration || 10;
    }
  } catch (e: any) {
    console.error('Failed to load privacy settings:', e);
    privacySettingsError.value = '加载隐私设置失败';
  } finally {
    privacySettingsLoading.value = false;
  }
};

const togglePrivacyProtection = async () => {
  if (!canEnablePrivacyProtection.value && !privacySettings.value?.enhancedPrivacyEnabled) {
    privacySettingsError.value = '请先设置两步验证（TOTP 或 Passkey）';
    return;
  }

  privacySettingsUpdating.value = true;
  privacySettingsSuccess.value = "";
  privacySettingsError.value = "";

  try {
    const newValue = !privacySettings.value?.enhancedPrivacyEnabled;
    const response = await $fetch('/api/user/privacy-settings', {
      method: 'POST',
      body: {
        enhancedPrivacyEnabled: newValue,
      },
    });

    if ((response as any).success) {
      if (privacySettings.value) {
        privacySettings.value.enhancedPrivacyEnabled = (response as any).data.enhancedPrivacyEnabled;
      }
      privacySettingsSuccess.value = newValue ? '强化隐私保护已启用' : '强化隐私保护已关闭';
      
      const { success: showSuccess } = useNotification();
      showSuccess(privacySettingsSuccess.value);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        privacySettingsSuccess.value = "";
      }, 3000);
    }
  } catch (e: any) {
    console.error('Failed to toggle privacy protection:', e);
    privacySettingsError.value = e.data?.statusMessage || e.message || '更新设置失败';
    
    const { error: showError } = useNotification();
    showError(privacySettingsError.value);
  } finally {
    privacySettingsUpdating.value = false;
  }
};

const updateVerifyDuration = async () => {
  privacySettingsUpdating.value = true;
  privacySettingsSuccess.value = "";
  privacySettingsError.value = "";

  try {
    const response = await $fetch('/api/user/privacy-settings', {
      method: 'POST',
      body: {
        privacyVerifyDuration: selectedVerifyDuration.value,
      },
    });

    if ((response as any).success) {
      if (privacySettings.value) {
        privacySettings.value.privacyVerifyDuration = (response as any).data.privacyVerifyDuration;
      }
      privacySettingsSuccess.value = '免验证时长已更新';
      
      const { success: showSuccess } = useNotification();
      showSuccess(privacySettingsSuccess.value);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        privacySettingsSuccess.value = "";
      }, 3000);
    }
  } catch (e: any) {
    console.error('Failed to update verify duration:', e);
    privacySettingsError.value = e.data?.statusMessage || e.message || '更新设置失败';
    
    const { error: showError } = useNotification();
    showError(privacySettingsError.value);
  } finally {
    privacySettingsUpdating.value = false;
  }
};

// Load linked accounts on mount
onMounted(() => {
  checkHasPassword();
  loadCookieConsent();
  checkTwoFactorStatus();
  loadPasskeys();
  loadPrivacySettings();
});

// Redirect if not logged in
watchEffect(() => {
  if (!user.value) {
    router.push("/login");
  }
});
</script>
