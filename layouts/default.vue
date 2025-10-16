<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="bg-md-primary text-md-on-primary shadow-md">
      <div class="container mx-auto px-4 py-4">
        <nav class="flex items-center justify-between">
          <NuxtLink to="/" class="text-2xl font-bold">
            🏥 MedicalBox
          </NuxtLink>
          <div class="flex gap-6">
            <NuxtLink to="/" class="hover:opacity-80 transition-opacity">
              首页
            </NuxtLink>
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
        <p>&copy; 2025 MedicalBox.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>
