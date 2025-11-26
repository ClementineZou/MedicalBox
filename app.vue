<template>
  <div class="min-h-screen bg-md-surface">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- 全局通知组件 -->
    <GlobalNotification />
    <!-- Cookie 同意组件 -->
    <CookieConsent />
    <!-- PWA 更新和安装提示 -->
    <PwaPrompt />
  </div>
</template>

<script setup lang="ts">
// 全局标题模板
useHead({
  titleTemplate: '%s - MedicalBox',
})
</script>
