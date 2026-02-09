<template>
  <div class="relative">
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索 ICD-11 疾病名称或代码..."
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
        @input="handleInput"
        @focus="showResults = true"
      />
      <div v-if="loading" class="absolute right-3 top-2.5">
        <div class="animate-spin h-5 w-5 border-2 border-primary-500 rounded-full border-t-transparent"></div>
      </div>
    </div>

    <!-- Search Results Dropdown -->
    <div
      v-if="showResults && (results.length > 0 || searchQuery)"
      class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <ul v-if="results.length > 0">
        <li
          v-for="item in results"
          :key="item.code"
          @click="selectCondition(item)"
          class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
        >
          <span v-html="item.term"></span>
          <span class="text-xs text-gray-500 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">{{ item.code }}</span>
        </li>
      </ul>
      
      <!-- Custom Entry Option -->
      <div 
        @click="addCustomCondition"
        class="px-4 py-3 border-t dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-red-600 dark:text-red-400 font-medium flex items-center gap-2"
      >
        <span class="material-icons-outlined text-sm">edit</span>
        使用 "{{ searchQuery }}" 作为自定义病史
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['select'])

const searchQuery = ref('')
const loading = ref(false)
const results = ref<any[]>([])
const showResults = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const handleInput = () => {
    showResults.value = true
    
    if (debounceTimer) clearTimeout(debounceTimer)
    
    debounceTimer = setTimeout(async () => {
        const query = searchQuery.value?.trim() || ''
        if (query.length < 2) {
            results.value = []
            return
        }
        
        loading.value = true
        try {
            const data = await $fetch('/api/icd/search', {
                params: { q: query }
            })
            results.value = data as any[]
        } catch (e) {
            console.error('Search failed', e)
            results.value = []
        } finally {
            loading.value = false
        }
    }, 600)
}

const selectCondition = (item: any) => {
  // Strip HTML tags for the selected value
  const cleanTitle = item.term.replace(/<[^>]*>?/gm, '')
  emit('select', { title: cleanTitle, code: item.code })
  searchQuery.value = ''
  results.value = []
  showResults.value = false
}

const addCustomCondition = () => {
  if (searchQuery.value) {
    emit('select', { title: searchQuery.value, code: 'CUSTOM' })
    searchQuery.value = ''
    results.value = []
    showResults.value = false
  }
}
</script>
