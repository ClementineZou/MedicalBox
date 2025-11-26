<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">药品管理</h1>
      <div class="flex gap-3">
        <button 
          v-if="medicines.length > 0"
          @click="exportToPDF"
          class="bg-md-secondary text-md-on-secondary px-4 py-3 rounded-md-md hover:opacity-90 transition-opacity"
        >
          📄 导出清单
        </button>
        <button 
          v-if="medicines.length > 0"
          @click="toggleLabelMode"
          class="bg-md-tertiary text-md-on-tertiary px-4 py-3 rounded-md-md hover:opacity-90 transition-opacity"
        >
          🏷️ {{ isLabelMode ? '取消选择' : '导出标签' }}
        </button>
        <button 
          @click="openAddModal"
          class="bg-md-primary text-md-on-primary px-4 py-3 rounded-md-md hover:opacity-90 transition-opacity"
        >
          + 添加药品
        </button>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="bg-white rounded-md-lg shadow-md p-6">
      <!-- 标签模式提示 -->
      <div v-if="isLabelMode" class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div class="flex justify-between items-center">
          <div>
            <p class="font-semibold text-blue-900">标签导出模式</p>
            <p class="text-sm text-blue-700 mt-1">
              已选择 {{ selectedMedicines.length }} 个药品
              {{ selectedMedicines.length > 0 ? '，点击下方按钮导出标签' : '，请点击药品卡片进行选择' }}
            </p>
          </div>
          <div class="flex gap-2">
            <button 
              v-if="selectedMedicines.length > 0"
              @click="exportLabels"
              class="bg-md-primary text-md-on-primary px-4 py-2 rounded-md-sm hover:opacity-90 transition-opacity"
            >
              🖨️ 打印标签 ({{ selectedMedicines.length }})
            </button>
            <button 
              v-if="medicines.length > 0"
              @click="selectAllMedicines"
              class="bg-md-secondary text-md-on-secondary px-4 py-2 rounded-md-sm hover:opacity-90 transition-opacity"
            >
              {{ selectedMedicines.length === medicines.length ? '取消全选' : '全选' }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="flex gap-4">
        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索药品名称..." 
            class="w-full pl-10 pr-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
          >
        </div>
        <select 
          v-model="categoryFilter"
          class="px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
        >
          <option value="">所有分类</option>
          <option value="解热镇痛药">解热镇痛药</option>
          <option value="抗过敏药">抗过敏药</option>
          <option value="抗感染药">抗感染药</option>
          <option value="呼吸系统用药">呼吸系统用药</option>
          <option value="消化系统用药">消化系统用药</option>
          <option value="神经系统用药">神经系统用药</option>
          <option value="心血管系统用药">心血管系统用药</option>
          <option value="血液系统用药">血液系统用药</option>
          <option value="泌尿系统用药">泌尿系统用药</option>
          <option value="内分泌系统用药">内分泌系统用药</option>
          <option value="维生素矿物质类">维生素矿物质类</option>
          <option value="眼部用药">眼部用药</option>
          <option value="口腔用药">口腔用药</option>
          <option value="皮肤用药">皮肤用药</option>
          <option value="其他">其他</option>
        </select>
      </div>
    </div>

    <!-- Medicine List -->
    <div v-if="loading" class="bg-white rounded-md-lg shadow-md p-6 text-center">
      <p>加载中...</p>
    </div>

    <div v-else-if="medicines.length === 0" class="bg-white rounded-md-lg shadow-md p-6">
      <div class="text-center text-md-on-surface-variant py-12">
        <div class="text-6xl mb-4">💊</div>
        <p class="text-lg">暂无药品信息</p>
        <p class="text-sm mt-2">点击上方"添加药品"按钮开始记录</p>
      </div>
    </div>

    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="medicine in medicines" 
        :key="medicine.id"
        class="bg-white rounded-md-lg shadow-md p-6 hover:shadow-lg transition-shadow relative"
        :class="{ 
          'ring-4 ring-md-primary': isLabelMode && selectedMedicines.includes(medicine.id),
          'cursor-pointer': isLabelMode
        }"
        @click="isLabelMode ? toggleSelection(medicine.id) : null"
      >
        <!-- 选中标记 -->
        <div 
          v-if="isLabelMode && selectedMedicines.includes(medicine.id)"
          class="absolute top-3 right-3 bg-md-primary text-md-on-primary w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shadow-lg z-10"
        >
          ✓
        </div>
        
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-semibold">{{ medicine.name }}</h3>
            <p v-if="medicine.brand" class="text-sm text-md-on-surface-variant">{{ medicine.brand }}</p>
          </div>
          <span 
            v-if="medicine.category"
            class="px-3 py-1 bg-md-primary-container text-md-on-primary-container rounded-full text-xs transition-all duration-200"
            :class="{ 'mr-8': isLabelMode && selectedMedicines.includes(medicine.id) }"
          >
            {{ medicine.category }}
          </span>
        </div>

        <div class="space-y-2 text-sm">
          <div v-if="medicine.controlTypes" class="flex justify-between">
            <span class="text-md-on-surface-variant">管控分类:</span>
            <span class="font-medium" :class="getControlTypeColor(medicine.controlTypes)">
              {{ medicine.controlTypes.replace(/,/g, '、') }}
            </span>
          </div>
          <div v-if="medicine.dosage" class="flex justify-between">
            <span class="text-md-on-surface-variant">剂量规格:</span>
            <span>{{ medicine.dosage }} {{ medicine.dosageUnit || '' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-md-on-surface-variant">库存数量:</span>
            <span>{{ medicine.quantity }} {{ medicine.quantityUnit }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-md-on-surface-variant">有效期至:</span>
            <span :class="isExpiringSoon(medicine.expiryDate) ? 'text-md-error font-semibold' : ''">
              {{ formatDate(medicine.expiryDate) }}
              <span v-if="isExpiringSoon(medicine.expiryDate)" class="text-xs">(即将过期)</span>
            </span>
          </div>
          <div v-if="medicine.location" class="flex justify-between">
            <span class="text-md-on-surface-variant">存放位置:</span>
            <span>{{ medicine.location }}</span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-md-surface-variant flex gap-2">
          <button 
            v-if="!isLabelMode"
            @click="openEditModal(medicine)"
            class="flex-1 bg-md-secondary text-md-on-secondary px-4 py-2 rounded-md-sm hover:opacity-90 transition-opacity text-sm"
          >
            编辑
          </button>
          <button 
            v-if="!isLabelMode"
            @click="deleteMedicine(medicine.id)"
            class="flex-1 bg-md-error text-md-on-error px-4 py-2 rounded-md-sm hover:opacity-90 transition-opacity text-sm"
          >
            删除
          </button>
          <button 
            v-if="isLabelMode"
            @click.stop="exportSingleLabel(medicine)"
            class="flex-1 bg-md-tertiary text-md-on-tertiary px-4 py-2 rounded-md-sm hover:opacity-90 transition-opacity text-sm"
          >
            🏷️ 单独导出
          </button>
        </div>
      </div>
    </div>

    <!-- Medicine Modal -->
    <MedicineModal 
      :is-open="isModalOpen"
      :medicine="selectedMedicine"
      @close="closeModal"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import type { Medicine } from '~/types'
import { useNotification } from '~/composables/useNotification'

useHead({
  title: '药品管理'
})

const medicines = ref<Medicine[]>([])
const loading = ref(false)
const searchQuery = ref('')
const categoryFilter = ref('')
const isModalOpen = ref(false)
const selectedMedicine = ref<Medicine | null>(null)
const isLabelMode = ref(false)
const selectedMedicines = ref<string[]>([])

// 加载药品列表
const loadMedicines = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/medicines', {
      query: {
        search: searchQuery.value,
        category: categoryFilter.value
      }
    })
    medicines.value = (response as any).data || []
  } catch (error) {
    console.error('Error loading medicines:', error)
  } finally {
    loading.value = false
  }
}

// 打开添加模态框
const openAddModal = () => {
  selectedMedicine.value = null
  isModalOpen.value = true
}

// 打开编辑模态框
const openEditModal = (medicine: Medicine) => {
  selectedMedicine.value = medicine
  isModalOpen.value = true
}

// 关闭模态框
const closeModal = () => {
  isModalOpen.value = false
  selectedMedicine.value = null
}

// 保存成功后刷新列表
const handleSuccess = () => {
  loadMedicines()
}

// 删除药品
const deleteMedicine = async (id: string) => {
  const { confirm } = useNotification()
  
  const result = await confirm('确定要删除这个药品吗？')
  if (!result) return
  
  try {
    await $fetch(`/api/medicines/${id}`, {
      method: 'DELETE' as any
    })
    loadMedicines()
    const { success } = useNotification()
    success('药品已删除')
  } catch (error) {
    console.error('Error deleting medicine:', error)
    const { error: showError } = useNotification()
    showError('删除失败，请重试')
  }
}

// 导出PDF功能
const exportToPDF = async () => {
  const { exportMedicinesToPDF } = await import('~/utils/pdfExport')
  const { success, error: showError } = useNotification()
  
  try {
    await exportMedicinesToPDF(medicines.value, {
      searchQuery: searchQuery.value || undefined,
      category: categoryFilter.value || undefined
    })
    success('PDF导出成功')
  } catch (error) {
    console.error('Error exporting PDF:', error)
    showError('PDF导出失败，请重试')
  }
}

// 切换标签模式
const toggleLabelMode = () => {
  isLabelMode.value = !isLabelMode.value
  if (!isLabelMode.value) {
    selectedMedicines.value = []
  }
}

// 切换药品选择
const toggleSelection = (medicineId: string) => {
  const index = selectedMedicines.value.indexOf(medicineId)
  if (index > -1) {
    selectedMedicines.value.splice(index, 1)
  } else {
    selectedMedicines.value.push(medicineId)
  }
}

// 全选/取消全选
const selectAllMedicines = () => {
  if (selectedMedicines.value.length === medicines.value.length) {
    selectedMedicines.value = []
  } else {
    selectedMedicines.value = medicines.value.map(m => m.id)
  }
}

// 导出选中的标签
const exportLabels = async () => {
  const { exportSelectedMedicineLabels } = await import('~/utils/medicineLabelExport')
  const { success, error: showError } = useNotification()
  
  if (selectedMedicines.value.length === 0) {
    showError('请至少选择一个药品')
    return
  }
  
  try {
    await exportSelectedMedicineLabels(medicines.value, selectedMedicines.value)
    success(`已导出 ${selectedMedicines.value.length} 个药品标签`)
  } catch (error) {
    console.error('Error exporting labels:', error)
    showError('标签导出失败，请重试')
  }
}

// 导出单个药品标签
const exportSingleLabel = async (medicine: Medicine) => {
  const { exportMedicineLabels } = await import('~/utils/medicineLabelExport')
  const { success, error: showError } = useNotification()
  
  try {
    await exportMedicineLabels([medicine])
    success('标签导出成功')
  } catch (error) {
    console.error('Error exporting label:', error)
    showError('标签导出失败，请重试')
  }
}

// 根据药品控制类型返回对应的颜色类名
const getControlTypeColor = (controlTypes: string) => {
  // 按照优先级顺序判断：精神药品 > 非处方药 > 处方药 > 默认
  if (controlTypes.includes('第一类精神药品') || controlTypes.includes('第二类精神药品')) {
    return 'text-md-error';
  } else if (controlTypes.includes('甲类非处方药') || controlTypes.includes('乙类非处方药')) {
    return 'text-green-600';
  } else if (controlTypes.includes('处方药')) {
    return 'text-orange-500';
  }
  // 默认返回空类，使用默认文本颜色
  return '';
}

// 格式化日期
const formatDate = (date: string | Date) => {
  const dateObj = date instanceof Date ? date : new Date(date)
  return dateObj.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })
}

// 判断是否即将过期（30天内）
const isExpiringSoon = (expiryDate: string | Date) => {
  const expiry = new Date(expiryDate)
  const today = new Date()
  const thirtyDaysLater = new Date()
  thirtyDaysLater.setDate(today.getDate() + 30)
  return expiry <= thirtyDaysLater && expiry >= today
}

// 监听搜索和筛选变化
watch([searchQuery, categoryFilter], () => {
  loadMedicines()
})

// 初始加载
onMounted(() => {
  loadMedicines()
})
</script>
