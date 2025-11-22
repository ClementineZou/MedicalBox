<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <section class="bg-md-primary-container rounded-md-lg p-8 text-center">
      <div v-if="isAuthenticated" class="mb-4">
        <p class="text-xl font-semibold text-md-on-primary-container opacity-90">
          你好，{{ user?.name || user?.email }}
        </p>
      </div>
      <h1 class="text-4xl font-bold text-md-on-primary-container mb-4">
        欢迎使用 MedicalBox
      </h1>
      <p class="text-lg text-md-on-primary-container mb-6">
        智能管理您的家庭药箱，及时提醒用药，记录健康历史
      </p>
      <div v-if="!isAuthenticated" class="flex gap-4 justify-center flex-wrap mb-6">
        <NuxtLink 
          to="/login" 
          class="bg-md-primary text-md-on-primary px-8 py-3 rounded-md-md hover:opacity-90 transition-opacity font-medium"
        >
          登录
        </NuxtLink>
        <NuxtLink 
          to="/register" 
          class="bg-md-secondary text-md-on-secondary px-8 py-3 rounded-md-md hover:opacity-90 transition-opacity font-medium"
        >
          注册
        </NuxtLink>
      </div>
      <div v-else class="flex gap-4 justify-center flex-wrap">
        <NuxtLink 
          to="/medicines" 
          class="bg-md-primary text-md-on-primary px-6 py-3 rounded-md-md hover:opacity-90 transition-opacity"
        >
          管理药品
        </NuxtLink>
        <NuxtLink 
          to="/reminders" 
          class="bg-md-tertiary text-md-on-tertiary px-6 py-3 rounded-md-md hover:opacity-90 transition-opacity"
        >
          设置提醒
        </NuxtLink>
        <NuxtLink 
          to="/vitals" 
          class="bg-md-secondary text-md-on-secondary px-6 py-3 rounded-md-md hover:opacity-90 transition-opacity"
        >
          健康监测
        </NuxtLink>
      </div>
    </section>

    <!-- Features Section -->
    <section class="grid md:grid-cols-4 gap-6">
      <div class="bg-white rounded-md-lg shadow-md p-6 flex flex-col items-center justify-center text-center">
        <div class="text-4xl mb-4">💊</div>
        <h3 class="text-xl font-semibold mb-2">药品管理</h3>
        <p class="text-md-on-surface-variant">
          记录药品信息、有效期、存放位置等详细信息
        </p>
      </div>
      
      <div class="bg-white rounded-md-lg shadow-md p-6 flex flex-col items-center justify-center text-center">
        <div class="text-4xl mb-4">⏰</div>
        <h3 class="text-xl font-semibold mb-2">用药提醒</h3>
        <p class="text-md-on-surface-variant">
          设置定时提醒，不错过任何一次用药时间
        </p>
      </div>
      
      <div class="bg-white rounded-md-lg shadow-md p-6 flex flex-col items-center justify-center text-center">
        <div class="text-4xl mb-4">📊</div>
        <h3 class="text-xl font-semibold mb-2">用药记录</h3>
        <p class="text-md-on-surface-variant">
          完整记录用药历史，跟踪用药效果
        </p>
      </div>
      
      <div class="bg-white rounded-md-lg shadow-md p-6 flex flex-col items-center justify-center text-center">
        <div class="text-4xl mb-4">📈</div>
        <h3 class="text-xl font-semibold mb-2">健康监测</h3>
        <p class="text-md-on-surface-variant">
          记录身高、体重、血压等体征数据，监测健康状况
        </p>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="bg-white rounded-md-lg shadow-md p-8">
      <h2 class="text-2xl font-bold mb-6">快速统计</h2>
      <div v-if="loading" class="text-center py-8">
        <p>加载中...</p>
      </div>
      <div v-else class="grid md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
        <div>
          <div class="text-3xl font-bold text-md-primary">{{ stats.totalMedicines }}</div>
          <div class="text-md-on-surface-variant">药品总数</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-md-error">{{ stats.expiringMedicines }}</div>
          <div class="text-md-on-surface-variant">即将过期</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-md-secondary">{{ stats.todayReminders }}</div>
          <div class="text-md-on-surface-variant">今日待服药</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-md-primary">{{ stats.monthlyRecords }}</div>
          <div class="text-md-on-surface-variant">本月用药记录</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-md-tertiary">{{ stats.vitalSignsCount || 0 }}</div>
          <div class="text-md-on-surface-variant">健康监测记录</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-md-tertiary">{{ stats.todayVitalSignReminders || 0 }}</div>
          <div class="text-md-on-surface-variant">今日待监测</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '首页'
})

const { user, isAuthenticated } = useAuth()

const loading = ref(true)
const stats = ref({
  totalMedicines: 0,
  expiringMedicines: 0,
  todayReminders: 0,
  monthlyRecords: 0,
  vitalSignsCount: 0,
  todayVitalSignReminders: 0
})

const loadStats = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/stats')
    if ((response as any).success) {
      stats.value = (response as any).data
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>
