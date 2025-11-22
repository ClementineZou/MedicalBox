<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div v-if="loading" class="space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-gray-600">正在关联GitHub账户...</p>
      </div>
      <div v-else-if="error" class="space-y-4">
        <div class="text-red-600 text-5xl">✕</div>
        <p class="text-gray-900 font-semibold">关联失败</p>
        <p class="text-gray-600">{{ error }}</p>
        <button 
          @click="router.push('/profile')"
          class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          返回个人中心
        </button>
      </div>
      <div v-else class="space-y-4">
        <div class="text-green-600 text-5xl">✓</div>
        <p class="text-gray-900 font-semibold">关联成功</p>
        <p class="text-gray-600">GitHub账户已成功关联</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
const route = useRoute();
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const code = route.query.code as string;
    const state = route.query.state as string;
    const storedState = sessionStorage.getItem('github_link_state');
    
    if (!code) {
      error.value = '未收到授权码';
      loading.value = false;
      return;
    }
    
    if (state !== storedState) {
      error.value = '状态验证失败，可能存在安全风险';
      loading.value = false;
      return;
    }
    
    // Clear stored state
    sessionStorage.removeItem('github_link_state');
    
    // Call backend to link account
    const response = await $fetch('/api/user/link-github', {
      method: 'POST',
      body: { code, state }
    });
    
    if ((response as any).success) {
      loading.value = false;
      // Redirect to profile after 2 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } else {
      error.value = (response as any).error || '关联失败';
      loading.value = false;
    }
  } catch (e: any) {
    console.error('Error linking GitHub:', e);
    error.value = e.message || '关联过程中发生错误';
    loading.value = false;
  }
});
</script>
