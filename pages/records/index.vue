<template>
  <div class="space-y-6">
    <!-- Privacy Protection Verification Loading -->
    <div v-if="privacyLoading" class="bg-white rounded-md-lg shadow-md p-16 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      <p class="mt-4 text-gray-600">正在验证访问权限...</p>
    </div>

    <!-- Privacy Verification Required -->
    <div v-else-if="requiresVerification && !isPrivacyVerified" class="bg-white rounded-md-lg shadow-md p-16 text-center">
      <div class="text-6xl mb-4">🔐</div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">需要身份验证</h2>
      <p class="text-gray-600 mb-6">此页面受强化隐私保护，请验证您的身份以继续访问</p>
      <button 
        @click="showVerifyDialog = true"
        class="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
      >
        验证身份
      </button>
    </div>

    <!-- Main Content (only show when verified) -->
    <template v-else>
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold">用药记录</h1>
        <div class="flex gap-3">
          <button 
            v-if="records.length > 0"
            @click="handleExportPDF"
            class="bg-md-secondary text-md-on-secondary px-6 py-3 rounded-md-md hover:opacity-90 transition-opacity"
          >
            ↓ 导出记录
          </button>
          <button 
            @click="openAddModal"
            class="bg-md-primary text-md-on-primary px-6 py-3 rounded-md-md hover:opacity-90 transition-opacity"
          >
            + 添加记录
          </button>
        </div>
      </div>

      <!-- Filter Options -->
      <div class="bg-white rounded-md-lg shadow-md p-6">
        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">开始日期</label>
            <input 
              v-model="filters.startDate"
              type="date"
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">结束日期</label>
            <input 
              v-model="filters.endDate"
              type="date"
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">药品筛选</label>
            <select 
              v-model="filters.medicineId"
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            >
              <option value="">全部药品</option>
              <option v-for="medicine in medicines" :key="medicine.id" :value="medicine.id">
                {{ medicine.name }}
              </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Records List -->
    <div v-if="loading" class="bg-white rounded-md-lg shadow-md p-6 text-center">
      <p>加载中...</p>
    </div>

    <div v-else-if="records.length === 0" class="bg-white rounded-md-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">用药历史</h2>
      <div class="text-center text-md-on-surface-variant py-12">
        <div class="text-6xl mb-4">📊</div>
        <p class="text-lg">暂无用药记录</p>
        <p class="text-sm mt-2">开始记录您的用药情况</p>
      </div>
    </div>

    <div v-else class="bg-white rounded-md-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">用药历史 (共 {{ records.length }} 条记录)</h2>
      <div class="space-y-3">
        <div 
          v-for="record in records" 
          :key="record.id"
          class="border border-md-surface-variant rounded-md-md p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="font-semibold text-lg">{{ record.medicine?.name }}{{ record.medicine?.brand ? `（${record.medicine?.brand}）` : '' }}</h3>
              <div class="mt-2 space-y-1 text-sm text-md-on-surface-variant">
                <p>
                  <strong>服用剂量:</strong> {{ record.dosage }}<span v-if="record.medicine?.dosage && record.medicine?.dosageUnit" class="text-gray-500">（{{ calculateTotalDosage(record.dosage, record.medicine.dosage, record.medicine.dosageUnit) }}）</span>
                </p>
                <p><strong>服用时间:</strong> {{ $formatDateTime(record.usageTime) }}</p>
                <p v-if="record.notes"><strong>备注:</strong> {{ record.notes }}</p>
                <p v-if="record.sideEffectNotes" class="text-md-error">
                  <strong>副作用:</strong> {{ record.sideEffectNotes }}
                </p>
              </div>
            </div>
            <div class="flex gap-2">
              <button 
                @click="editRecord(record)"
                class="bg-md-secondary text-md-on-secondary px-4 py-2 rounded-md-sm hover:opacity-90 transition-opacity text-sm"
              >
                编辑
              </button>
              <button 
                @click="deleteRecord(record.id)"
                class="bg-md-error text-md-on-error px-4 py-2 rounded-md-sm hover:opacity-90 transition-opacity text-sm"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Record Modal -->
    <RecordModal 
      :is-open="isModalOpen"
      :medicines="medicines"
      :record="selectedRecord"
      @close="closeModal"
      @success="handleSuccess"
    />
    </template>

    <!-- Privacy Verify Dialog -->
    <PrivacyVerifyDialog
      :is-open="showVerifyDialog"
      :has-two-factor="privacySettings?.hasTwoFactor || false"
      :has-passkey="privacySettings?.hasPasskey || false"
      @close="showVerifyDialog = false"
      @verified="handlePrivacyVerified"
    />
  </div>
</template>

<script setup lang="ts">
import type { MedicineUsageRecord, Medicine, PrivacySettings } from '~/types'

useHead({
  title: '用药记录'
})

// Privacy protection state
const privacyLoading = ref(true)
const requiresVerification = ref(false)
const isPrivacyVerified = ref(false)
const showVerifyDialog = ref(false)
const privacySettings = ref<PrivacySettings | null>(null)

const loading = ref(true)
const records = ref<MedicineUsageRecord[]>([])
const medicines = ref<Medicine[]>([])
const isModalOpen = ref(false)
const selectedRecord = ref<MedicineUsageRecord | null>(null)

const filters = ref({
  startDate: '',
  endDate: '',
  medicineId: ''
})

// Check privacy status on mount
const checkPrivacyStatus = async () => {
  privacyLoading.value = true
  
  try {
    // First load privacy settings
    const settingsRes = await $fetch('/api/user/privacy-settings')
    if ((settingsRes as any).success) {
      privacySettings.value = (settingsRes as any).data
    }

    // Then check verification status
    const statusRes = await $fetch('/api/user/privacy-status')
    const data = (statusRes as any).data

    if (!data.requiresVerification) {
      // Privacy protection not enabled
      requiresVerification.value = false
      isPrivacyVerified.value = true
    } else if (data.isVerified) {
      // Already verified
      requiresVerification.value = true
      isPrivacyVerified.value = true
    } else {
      // Needs verification
      requiresVerification.value = true
      isPrivacyVerified.value = false
    }
  } catch (error) {
    console.error('Error checking privacy status:', error)
    // On error, allow access (don't block)
    isPrivacyVerified.value = true
  } finally {
    privacyLoading.value = false
  }
}

const handlePrivacyVerified = async () => {
  showVerifyDialog.value = false
  isPrivacyVerified.value = true
  // Load data after verification
  await loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const [recordsRes, medicinesRes] = await Promise.all([
      $fetch('/api/records', { query: filters.value }),
      $fetch('/api/medicines')
    ])
    
    records.value = (recordsRes as any).data || []
    medicines.value = (medicinesRes as any).data || []
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  selectedRecord.value = null
  isModalOpen.value = true
}

const editRecord = (record: MedicineUsageRecord) => {
  selectedRecord.value = record
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedRecord.value = null
}

const handleSuccess = () => {
  loadData()
}

const deleteRecord = async (id: string) => {
  // 使用通知系统的确认对话框
  const { confirm, success, error: showError } = useNotification()
  
  const shouldDelete = await confirm('确定要删除这条记录吗？', {
    confirmText: '删除',
    cancelText: '取消'
  })
  
  if (!shouldDelete) return

  try {
    await $fetch(`/api/records/${id}`, {
      method: 'DELETE' as any
    })
    loadData()
    success('记录已删除')
  } catch (error) {
    console.error('Error deleting record:', error)
    showError('删除失败，请重试')
  }
}

// 导出PDF功能 - 需要检查验证状态
const exportToPDF = async () => {
  const { exportMedicineRecordsToPDF } = await import('~/utils/pdfExport')
  const { success, error: showError } = useNotification()
  
  try {
    await exportMedicineRecordsToPDF(records.value, {
      medicineId: filters.value.medicineId || undefined,
      dateFrom: filters.value.startDate || undefined,
      dateTo: filters.value.endDate || undefined
    })
    success('PDF导出成功')
  } catch (error) {
    console.error('Error exporting PDF:', error)
    showError('PDF导出失败，请重试')
  }
}

// Handle export with privacy check
const handleExportPDF = async () => {
  // If privacy protection is enabled, check verification status
  if (requiresVerification.value) {
    try {
      const statusRes = await $fetch('/api/user/privacy-status')
      const data = (statusRes as any).data
      
      if (data.requiresVerification && !data.isVerified) {
        // Need to verify again for export
        showVerifyDialog.value = true
        return
      }
    } catch (error) {
      console.error('Error checking privacy status for export:', error)
    }
  }
  
  // Proceed with export
  await exportToPDF()
}

// 计算总剂量
const calculateTotalDosage = (dosage: string, unitDosage: string, unit: string): string => {
  // 从服用剂量中提取数字（如 "2片" -> 2）
  const match = dosage.match(/(\d+(\.\d+)?)/);
  if (!match) return `${unitDosage}${unit}`;
  
  const quantity = parseFloat(match[1]);
  const unitDosageNum = parseFloat(unitDosage);
  
  if (isNaN(quantity) || isNaN(unitDosageNum)) {
    return `${unitDosage}${unit}`;
  }
  
  const total = quantity * unitDosageNum;
  return `${total}${unit}`;
}

// 使用全局注入的格式化函数
const { $formatDateTime } = useNuxtApp()

watch(filters, () => {
  if (isPrivacyVerified.value) {
    loadData()
  }
}, { deep: true })

onMounted(async () => {
  await checkPrivacyStatus()
  if (isPrivacyVerified.value) {
    await loadData()
  }
})
</script>
