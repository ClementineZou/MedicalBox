<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Gravatar 测试</h1>
      
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">测试邮箱</h2>
        <input 
          v-model="testEmail"
          type="email"
          placeholder="输入邮箱地址"
          class="w-full px-4 py-2 border rounded-lg mb-4"
        />
        <button 
          @click="testGravatar"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          测试
        </button>
      </div>

      <div v-if="result" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">结果</h2>
        
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-600">邮箱:</p>
            <p class="font-mono">{{ result.email }}</p>
          </div>
          
          <div>
            <p class="text-sm text-gray-600">MD5 Hash:</p>
            <p class="font-mono text-sm break-all">{{ result.hash }}</p>
          </div>
          
          <div>
            <p class="text-sm text-gray-600">Gravatar URL:</p>
            <a :href="result.url" target="_blank" class="font-mono text-sm text-blue-600 hover:underline break-all">
              {{ result.url }}
            </a>
          </div>
          
          <div>
            <p class="text-sm text-gray-600 mb-2">头像预览:</p>
            <img :src="result.url" class="w-32 h-32 rounded-full border-2 border-gray-200" />
          </div>
          
          <div>
            <p class="text-sm text-gray-600">使用 identicon 后备:</p>
            <img :src="result.url + '&d=identicon'" class="w-32 h-32 rounded-full border-2 border-gray-200" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const testEmail = ref('clementine.zou@proton.me')
const result = ref<any>(null)

const testGravatar = async () => {
  try {
    const response = await $fetch('/api/user/gravatar', {
      method: 'POST',
      body: {
        email: testEmail.value,
        size: 200,
        defaultImage: 'identicon'
      }
    })
    
    // Also calculate client-side for comparison
    const trimmed = testEmail.value.trim().toLowerCase()
    
    result.value = {
      email: trimmed,
      hash: 'Generated server-side',
      url: (response as any).url
    }
  } catch (error) {
    console.error('Error:', error)
    alert('测试失败: ' + error)
  }
}

// Auto-test on mount
onMounted(() => {
  testGravatar()
})
</script>
