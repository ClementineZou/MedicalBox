<template>
  <div class="flex flex-col min-h-screen overflow-x-hidden">
    <!-- Header -->
    <header class="bg-md-primary text-md-on-primary shadow-md relative">
      <div class="container mx-auto px-4 py-3 md:py-4">
        <nav class="flex items-center justify-between">
          <!-- Logo -->
          <NuxtLink to="/" class="text-xl md:text-2xl font-bold flex-shrink-0">
            🏥 MedicalBox
          </NuxtLink>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-4 lg:gap-6 flex-shrink-0">
            <NuxtLink to="/" class="hover:opacity-80 transition-opacity">
              首页
            </NuxtLink>
            <template v-if="isAuthenticated">
              <NuxtLink to="/medicines" class="hover:opacity-80 transition-opacity">
                药品管理
              </NuxtLink>
              <NuxtLink to="/reminders" class="hover:opacity-80 transition-opacity">
                用药提醒
              </NuxtLink>
              <NuxtLink to="/records" class="hover:opacity-80 transition-opacity">
                用药记录
              </NuxtLink>
              <NuxtLink to="/vitals" class="hover:opacity-80 transition-opacity">
                健康监测
              </NuxtLink>
              
              <!-- Desktop User Menu -->
              <div class="relative">
                <button 
                  @click="toggleUserMenu"
                  class="flex items-center space-x-2 hover:opacity-80 transition-opacity user-avatar-button"
                >
                  <img 
                    v-if="gravatarUrl"
                    :src="gravatarUrl" 
                    :alt="user?.name || 'User avatar'"
                    class="w-8 h-8 rounded-full object-cover border border-white border-opacity-20"
                  />
                  <div 
                    v-else
                    class="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-sm font-medium"
                  >
                    {{ userInitial }}
                  </div>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <!-- Desktop Dropdown Menu -->
                <Transition
                  enter-active-class="transition duration-100 ease-out"
                  enter-from-class="transform scale-95 opacity-0"
                  enter-to-class="transform scale-100 opacity-100"
                  leave-active-class="transition duration-75 ease-in"
                  leave-from-class="transform scale-100 opacity-100"
                  leave-to-class="transform scale-95 opacity-0"
                >
                  <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 user-menu-dropdown">
                    <NuxtLink 
                      to="/profile" 
                      @click="showUserMenu = false"
                      class="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition"
                    >
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        账户中心
                      </span>
                    </NuxtLink>
                    <button @click="handleLogout" class="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition">
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        退出登录
                      </span>
                    </button>
                  </div>
                </Transition>
              </div>
            </template>
          </div>

          <!-- Mobile Menu Button & User Avatar -->
          <div class="md:hidden flex items-center gap-3">
            <!-- Mobile User Avatar (when authenticated) -->
            <template v-if="isAuthenticated">
              <button 
                @click="toggleUserMenu"
                class="flex items-center hover:opacity-80 transition-opacity user-avatar-button"
              >
                <img 
                  v-if="gravatarUrl"
                  :src="gravatarUrl" 
                  :alt="user?.name || 'User avatar'"
                  class="w-9 h-9 rounded-full object-cover border-2 border-white border-opacity-30"
                />
                <div 
                  v-else
                  class="w-9 h-9 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-sm font-medium border-2 border-white border-opacity-30"
                >
                  {{ userInitial }}
                </div>
              </button>
            </template>

            <!-- Hamburger Menu Button -->
            <button 
              @click="toggleMobileMenu" 
              class="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg v-if="!showMobileMenu" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </nav>

        <!-- Mobile Menu -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div v-if="showMobileMenu" class="md:hidden mt-4 pb-2 border-t border-white border-opacity-20 pt-4 mobile-menu-dropdown">
            <div class="flex flex-col space-y-3">
              <NuxtLink 
                to="/" 
                @click="closeMobileMenu"
                class="px-4 py-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
              >
                首页
              </NuxtLink>
              <template v-if="isAuthenticated">
                <NuxtLink 
                  to="/medicines" 
                  @click="closeMobileMenu"
                  class="px-4 py-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                >
                  药品管理
                </NuxtLink>
                <NuxtLink 
                  to="/reminders" 
                  @click="closeMobileMenu"
                  class="px-4 py-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                >
                  用药提醒
                </NuxtLink>
                <NuxtLink 
                  to="/records" 
                  @click="closeMobileMenu"
                  class="px-4 py-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                >
                  用药记录
                </NuxtLink>
                <NuxtLink 
                  to="/vitals" 
                  @click="closeMobileMenu"
                  class="px-4 py-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                >
                  健康监测
                </NuxtLink>
              </template>
            </div>
          </div>
        </Transition>

        <!-- Mobile User Menu (Popup) -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div 
            v-if="showUserMenu && isAuthenticated" 
            class="md:hidden fixed left-4 right-4 top-16 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-200 max-w-sm mx-auto user-menu-dropdown"
          >
            <!-- User Info -->
            <div class="px-4 py-3 border-b border-gray-200">
              <div class="flex items-center space-x-3">
                <img 
                  v-if="gravatarUrl"
                  :src="gravatarUrl" 
                  :alt="user?.name || 'User avatar'"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div 
                  v-else
                  class="w-12 h-12 rounded-full bg-md-primary text-md-on-primary flex items-center justify-center text-lg font-medium"
                >
                  {{ userInitial }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ user?.name || '用户' }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
                </div>
              </div>
            </div>
            
            <!-- Menu Items -->
            <NuxtLink 
              to="/profile" 
              @click="closeUserMenu"
              class="block px-4 py-3 text-gray-800 hover:bg-gray-100 transition"
            >
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                账户中心
              </span>
            </NuxtLink>
            <button 
              @click="handleLogout" 
              class="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition"
            >
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                退出登录
              </span>
            </button>
          </div>
        </Transition>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 container mx-auto px-4 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-md-surface-variant text-md-on-surface-variant py-6">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; 2025 MedicalBox. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth()
const showUserMenu = ref(false)
const showMobileMenu = ref(false)

// Gravatar support
const userEmail = computed(() => user.value?.email)
const { gravatarUrl } = useGravatar(userEmail, 80)

const userInitial = computed(() => {
  if (user.value?.name) {
    return user.value.name.charAt(0).toUpperCase()
  }
  if (user.value?.email) {
    return user.value.email.charAt(0).toUpperCase()
  }
  return "U"
})

const toggleUserMenu = (e: Event) => {
  e.stopPropagation()
  showUserMenu.value = !showUserMenu.value
  if (showUserMenu.value) {
    showMobileMenu.value = false
  }
}

const toggleMobileMenu = (e: Event) => {
  e.stopPropagation()
  showMobileMenu.value = !showMobileMenu.value
  if (showMobileMenu.value) {
    showUserMenu.value = false
  }
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const closeAllMenus = () => {
  showUserMenu.value = false
  showMobileMenu.value = false
}

const handleLogout = async () => {
  closeAllMenus()
  await logout()
}

// Close menus when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  
  // 如果点击的是菜单内部或触发按钮，不关闭
  if (target.closest('.user-menu-dropdown') || 
      target.closest('.mobile-menu-dropdown') || 
      target.closest('.user-avatar-button') ||
      target.closest('button[aria-label="Toggle menu"]')) {
    return
  }
  
  // 点击外部，关闭所有菜单
  closeAllMenus()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})

// Close mobile menu on route change
const route = useRoute()
watch(() => route.path, () => {
  closeAllMenus()
})
</script>
