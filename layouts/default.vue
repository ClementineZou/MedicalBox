<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="bg-md-primary text-md-on-primary shadow-md">
      <div class="container mx-auto px-4 py-4">
        <nav class="flex items-center justify-between">
          <NuxtLink to="/" class="text-2xl font-bold">
            🏥 MedicalBox
          </NuxtLink>
          <div class="flex items-center gap-6">
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
              
              <!-- User Menu -->
              <div class="relative" @click="showUserMenu = !showUserMenu">
                <button class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                  <div class="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-sm font-medium">
                    {{ userInitial }}
                  </div>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <!-- Dropdown Menu -->
                <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
                  <NuxtLink to="/profile" class="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition">
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
              </div>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="hover:opacity-80 transition-opacity">
                登录
              </NuxtLink>
              <NuxtLink to="/register" class="bg-white bg-opacity-20 px-4 py-2 rounded-md hover:bg-opacity-30 transition">
                注册
              </NuxtLink>
            </template>
          </div>
        </nav>
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

const userInitial = computed(() => {
  if (user.value?.name) {
    return user.value.name.charAt(0).toUpperCase()
  }
  if (user.value?.email) {
    return user.value.email.charAt(0).toUpperCase()
  }
  return "U"
})

const handleLogout = async () => {
  showUserMenu.value = false
  await logout()
}

// Close menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showUserMenu.value = false
    }
  })
})
</script>
