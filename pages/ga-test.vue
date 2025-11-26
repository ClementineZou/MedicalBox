<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">Google Analytics 测试页面</h1>
      
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">配置状态</h2>
        <div class="space-y-2">
          <p><strong>GA ID:</strong> {{ gaId || '未配置' }}</p>
          <p><strong>gtag 函数:</strong> {{ gtagAvailable ? '✅ 可用' : '❌ 不可用' }}</p>
          <p><strong>useGtag:</strong> {{ useGtagAvailable ? '✅ 可用' : '❌ 不可用' }}</p>
          <p><strong>Cookie 同意状态:</strong> {{ consentStatus }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">测试操作</h2>
        <div class="space-x-4">
          <button 
            @click="testGtag"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            测试 gtag 函数
          </button>
          <button 
            @click="testEvent"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            发送测试事件
          </button>
          <button 
            @click="checkConsent"
            class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            检查 Consent
          </button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">控制台输出</h2>
        <div class="bg-gray-100 p-4 rounded font-mono text-sm whitespace-pre-wrap">
          {{ logs }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const gaId = ref(config.public.googleAnalyticsId || '')
const gtagAvailable = ref(false)
const useGtagAvailable = ref(false)
const consentStatus = ref('')
const logs = ref('')

const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value += `[${timestamp}] ${message}\n`
  console.log(message)
}

onMounted(() => {
  // 检查 window.gtag
  gtagAvailable.value = typeof window.gtag === 'function'
  addLog(`window.gtag 可用: ${gtagAvailable.value}`)
  
  // 检查 useGtag
  try {
    const { gtag } = useGtag()
    useGtagAvailable.value = typeof gtag === 'function'
    addLog(`useGtag 可用: ${useGtagAvailable.value}`)
  } catch (e) {
    addLog(`useGtag 错误: ${e}`)
  }
  
  // 检查 cookie 同意状态
  const consent = localStorage.getItem('cookie-consent')
  consentStatus.value = consent || '未设置'
  addLog(`Cookie 同意状态: ${consentStatus.value}`)
})

const testGtag = () => {
  if (window.gtag) {
    addLog('✅ window.gtag 存在')
    try {
      window.gtag('event', 'test_event', {
        event_category: 'test',
        event_label: 'manual_test'
      })
      addLog('✅ 测试事件已发送（通过 window.gtag）')
    } catch (e) {
      addLog(`❌ 错误: ${e}`)
    }
  } else {
    addLog('❌ window.gtag 不存在')
  }
}

const testEvent = () => {
  try {
    const { gtag } = useGtag()
    if (gtag) {
      gtag('event', 'page_view', {
        page_title: 'GA Test Page',
        page_location: window.location.href
      })
      addLog('✅ page_view 事件已发送（通过 useGtag）')
    } else {
      addLog('❌ gtag 函数不可用')
    }
  } catch (e) {
    addLog(`❌ useGtag 错误: ${e}`)
  }
}

const checkConsent = () => {
  addLog('--- Consent 检查 ---')
  addLog(`GA ID: ${gaId.value}`)
  addLog(`Cookie 同意: ${localStorage.getItem('cookie-consent')}`)
  addLog(`可选功能启用: ${localStorage.getItem('optional-features-enabled')}`)
  
  if (window.gtag) {
    addLog('✅ window.gtag 可用，尝试获取 consent 状态...')
  } else {
    addLog('❌ window.gtag 不可用')
  }
}
</script>
