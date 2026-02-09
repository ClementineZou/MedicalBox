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
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 class="text-3xl font-bold">健康监测</h1>
        <div class="grid grid-cols-2 sm:flex gap-3 w-full sm:w-auto">
          <button 
            v-if="vitalsData.length > 0"
            @click="handleExportPDF"
            class="bg-md-secondary text-md-on-secondary px-4 py-3 rounded-md-md hover:opacity-90 transition-opacity flex justify-center items-center"
          >
            ↓ 导出记录
          </button>
          <button 
            @click="openAddReminderModal"
            class="bg-md-tertiary text-md-on-tertiary px-4 py-3 rounded-md-md hover:opacity-90 transition-opacity flex justify-center items-center"
          >
            + 监测提醒
          </button>
          <button 
            @click="openAddModal"
            class="bg-md-primary text-md-on-primary px-4 py-3 rounded-md-md hover:opacity-90 transition-opacity col-span-2 sm:col-span-1 flex justify-center items-center"
          >
            + 添加监测记录
          </button>
        </div>
      </div>

      <!-- 过滤器 -->
      <div class="bg-white rounded-md-lg shadow-md p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">体征类型</label>
          <select
            v-model="filters.type"
            class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
          >
            <option value="">全部类型</option>
            <option value="height">身高</option>
            <option value="weight">体重</option>
            <option value="bmi">BMI</option>
            <option value="temperature">体温</option>
            <option value="bloodPressure">血压</option>
            <option value="bloodOxygen">血氧</option>
            <option value="bloodGlucose">血糖</option>
            <option value="heartRate">心率</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">日期范围</label>
          <div class="flex items-center gap-2">
            <input
              v-model="filters.dateFrom"
              type="date"
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            />
            <span>至</span>
            <input
              v-model="filters.dateTo"
              type="date"
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            />
          </div>
        </div>
        <div class="flex items-end">
          <button 
            @click="loadData"
            class="w-full bg-md-primary text-md-on-primary px-6 py-2 rounded-md-md hover:opacity-90 transition-opacity"
          >
            查询
          </button>
        </div>
      </div>
    </div>

    <!-- 数据展示 -->
    <div v-if="loading" class="bg-white rounded-md-lg shadow-md p-6 text-center">
      <p>加载中...</p>
    </div>

    <!-- 图表展示 (只在选择了类型且有数据时显示) -->
    <div v-if="!loading && filters.type && filteredVitalsData.length > 0" ref="chartContainer" class="bg-white rounded-md-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">趋势分析</h2>
      <VitalSignChart 
        :data="filteredVitalsData" 
        :reference-range="selectedReferenceRange"
        :type="filters.type"
      />
      <!-- 参考范围信息 -->
      <div v-if="selectedReferenceRange" class="mt-4 text-sm text-gray-600">
        <span v-if="filters.type === 'bloodPressure' && bloodPressureDiastolicRange">
          {{ getReferenceLabel(filters.type) }}：
          收缩压 {{ selectedReferenceRange.minValue }}-{{ selectedReferenceRange.maxValue }} {{ selectedReferenceRange.unit }}，
          舒张压 {{ bloodPressureDiastolicRange.minValue }}-{{ bloodPressureDiastolicRange.maxValue }} {{ bloodPressureDiastolicRange.unit }}
        </span>
        <span v-else>
          {{ getReferenceLabel(filters.type) }}：{{ selectedReferenceRange.minValue }}-{{ selectedReferenceRange.maxValue }} {{ selectedReferenceRange.unit }}
        </span>
      </div>
    </div>

    <div v-if="!loading && vitalsData.length === 0" class="bg-white rounded-md-lg shadow-md p-16 text-center">
      <div class="text-6xl mb-4">📊</div>
      <p class="text-lg font-semibold mb-2">暂无监测数据</p>
      <p class="text-sm text-md-on-surface-variant">点击“添加监测记录”按钮开始记录您的健康数据</p>
    </div>

    <div v-else-if="!loading" class="bg-white rounded-md-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">监测记录</h2>
        <span class="text-sm text-gray-500">共 {{ vitalsData.length }} 条记录</span>
      </div>
      
      <!-- 数据表格 -->
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b-2 border-md-surface-variant">
              <th class="py-3 px-4 text-left">类型</th>
              <th class="py-3 px-4 text-left">数值</th>
              <th class="py-3 px-4 text-left">测量时间</th>
              <th class="py-3 px-4 text-left">状态</th>
              <th class="py-3 px-4 text-left">备注</th>
              <th class="py-3 px-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vitalSign in vitalsData" :key="vitalSign.id" class="border-b border-md-surface-variant">
              <td class="py-4 px-4">{{ getVitalSignTypeName(vitalSign.type) }}</td>
              <td class="py-4 px-4">
                <span v-if="vitalSign.type === 'bloodPressure' && vitalSign.systolic && vitalSign.diastolic">
                  {{ vitalSign.systolic }}/{{ vitalSign.diastolic }} {{ vitalSign.unit }}
                </span>
                <span v-else>
                  {{ vitalSign.value }} {{ vitalSign.unit }}
                </span>
              </td>
              <td class="py-4 px-4">{{ $formatDateTime(vitalSign.measureTime) }}</td>
              <td class="py-4 px-4">
                <span :class="[
                  'px-2 py-1 rounded text-xs', 
                  vitalSign.isNormal 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                ]">
                  {{ vitalSign.isNormal ? '正常' : '异常' }}
                </span>
              </td>
              <td class="py-4 px-4 text-sm max-w-xs truncate" :title="vitalSign.notes">
                {{ vitalSign.notes || '-' }}
              </td>
              <td class="py-4 px-4 text-right">
                <div class="flex justify-end gap-2">
                  <button 
                    v-if="vitalSign.type !== 'bmi'"
                    @click="openEditModal(vitalSign)"
                    class="bg-md-secondary text-md-on-secondary px-3 py-1 rounded-md-sm text-xs hover:opacity-90 transition-opacity"
                  >
                    编辑
                  </button>
                  <span 
                    v-else
                    class="text-xs text-gray-500 px-3 py-1"
                    title="BMI 由系统自动计算，不可编辑"
                  >
                    自动计算
                  </span>
                  <button 
                    @click="deleteVitalSign(vitalSign.id)"
                    class="bg-md-error text-md-on-error px-3 py-1 rounded-md-sm text-xs hover:opacity-90 transition-opacity"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 参考范围显示 -->
      <div v-if="selectedReferenceRange" class="mt-6 p-4 bg-gray-50 rounded-md border-l-4 border-md-primary">
        <h3 class="text-sm font-semibold text-md-on-surface mb-2">参考范围</h3>
        <div class="text-sm text-md-on-surface-variant">
          <template v-if="filters.type === 'bloodPressure'">
            <div class="flex flex-wrap gap-4">
              <div>
                <span class="font-medium">收缩压：</span>
                <span>{{ selectedReferenceRange.minValue || 90 }} - {{ selectedReferenceRange.maxValue || 120 }} {{ selectedReferenceRange.unit }}</span>
              </div>
              <div>
                <span class="font-medium">舒张压：</span>
                <span>60 - 80 {{ selectedReferenceRange.unit }}</span>
              </div>
            </div>
          </template>
          <template v-else>
            <span class="font-medium">{{ getReferenceLabel(filters.type) }}：</span>
            <span>{{ selectedReferenceRange.minValue }} - {{ selectedReferenceRange.maxValue }} {{ selectedReferenceRange.unit }}</span>
          </template>
        </div>
      </div>
    </div>
    
    <!-- 提醒列表 -->
    <div class="bg-white rounded-md-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">监测提醒</h2>
      
      <div v-if="remindersData.length === 0" class="text-center py-8 text-md-on-surface-variant">
        <div class="text-6xl mb-4">📅</div>
        <p class="text-lg font-semibold mb-2">暂无监测提醒</p>
        <p class="text-sm mt-2">添加提醒以便定期记录您的健康数据</p>
      </div>
      
      <div v-else class="space-y-3">
        <div 
          v-for="reminder in remindersData" 
          :key="reminder.id"
          class="border border-md-surface-variant rounded-md-md p-4 flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <div class="text-3xl">
                {{ getVitalSignTypeIcon(reminder.vitalSignType) }}
              </div>
              <div>
                <h3 class="font-semibold">{{ reminder.title }}</h3>
                <div class="flex items-center gap-2">
                  <p class="text-sm text-md-on-surface-variant">
                    {{ getVitalSignTypeName(reminder.vitalSignType) }} - {{ $formatDateTime(reminder.reminderTime) }}
                  </p>
                </div>
                <span class="inline-block mt-1 px-2 py-1 bg-md-primary-container text-md-on-primary-container rounded text-xs">
                  {{ getFrequencyText(reminder.frequency) }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button 
              @click="openEditReminderModal(reminder)"
              class="bg-md-secondary text-md-on-secondary px-4 py-2 rounded-md-sm hover:opacity-90 transition-opacity text-sm"
            >
              编辑
            </button>
            <button 
              @click="recordFromReminder(reminder)"
              class="bg-md-primary text-md-on-primary px-3 py-2 rounded-md-sm hover:opacity-90 transition-opacity text-sm"
            >
              记录
            </button>
            <button 
              @click="deleteReminder(reminder.id)"
              class="bg-md-error text-md-on-error px-4 py-2 rounded-md-sm hover:opacity-90 transition-opacity text-sm"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 生命体征记录模态窗口 -->
    <VitalSignModal
      :is-open="isModalOpen"
      :vital-sign="selectedVitalSign"
      @close="closeModal"
      @success="handleSuccess"
    />

    <!-- 生命体征提醒模态窗口 -->
    <VitalSignReminderModal
      :is-open="isReminderModalOpen"
      :reminder="selectedReminder"
      @close="closeReminderModal"
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
import type { VitalSign, VitalSignReminder, VitalSignReferenceRange, PrivacySettings } from '~/types'

useHead({
  title: '健康监测'
})

// Privacy protection state
const privacyLoading = ref(true)
const requiresVerification = ref(false)
const isPrivacyVerified = ref(false)
const showVerifyDialog = ref(false)
const privacySettings = ref<PrivacySettings | null>(null)

// 状态
const loading = ref(true)
const vitalsData = ref<VitalSign[]>([])
const remindersData = ref<VitalSignReminder[]>([])
const referenceRanges = ref<VitalSignReferenceRange[]>([])
const isModalOpen = ref(false)
const isReminderModalOpen = ref(false)
const selectedVitalSign = ref<VitalSign | null>(null)
const selectedReminder = ref<VitalSignReminder | null>(null)
const chartContainer = ref<HTMLElement | null>(null)

// 过滤器
const filters = reactive({
  type: '',
  dateFrom: '',
  dateTo: ''
})

// 计算当前选中的参考范围
const selectedReferenceRange = computed(() => {
  if (!filters.type) return undefined
  return referenceRanges.value.find((r: VitalSignReferenceRange) => r.type === filters.type)
})

// 获取血压的舒张压参考范围
const bloodPressureDiastolicRange = computed(() => {
  if (filters.type !== 'bloodPressure') return undefined
  // 血压有两条记录，第一条是收缩压，第二条是舒张压
  const ranges = referenceRanges.value.filter((r: VitalSignReferenceRange) => r.type === 'bloodPressure')
  return ranges.length > 1 ? ranges[1] : undefined
})

// 过滤后的体征数据，用于图表显示，防止显示其他类型的数据
const filteredVitalsData = computed(() => {
  if (!filters.type) return []
  return vitalsData.value.filter(v => v.type === filters.type)
})

// 获取体征类型名称
const getVitalSignTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    'height': '身高',
    'weight': '体重',
    'bmi': 'BMI',
    'temperature': '体温',
    'bloodPressure': '血压',
    'bloodOxygen': '血氧',
    'bloodGlucose': '血糖',
    'heartRate': '心率'
  }
  return typeMap[type] || type
}

// 获取参考范围标签
const getReferenceLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    'height': '身高参考范围',
    'weight': '体重参考范围',
    'bmi': 'BMI参考范围',
    'temperature': '体温参考范围',
    'bloodPressure': '血压参考范围',
    'bloodOxygen': '血氧参考范围',
    'bloodGlucose': '空腹血糖参考范围',
    'heartRate': '静息心率参考范围'
  }
  return labelMap[type] || '正常参考范围'
}

// 获取体征类型图标
const getVitalSignTypeIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'height': '📏',
    'weight': '⚖️',
    'bmi': '📊',
    'temperature': '🌡️',
    'bloodPressure': '💉',
    'bloodOxygen': '🫁',
    'bloodGlucose': '🩸',
    'heartRate': '❤️'
  }
  return iconMap[type] || '📊'
}

// 获取频率文本
const getFrequencyText = (frequency: string) => {
  const map: Record<string, string> = {
    once: '仅一次',
    daily: '每天',
    weekly: '每周',
    monthly: '每月'
  }
  return map[frequency] || frequency
}

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

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const query: Record<string, string> = {}
    if (filters.type) query.type = filters.type
    if (filters.dateFrom) query.dateFrom = filters.dateFrom
    if (filters.dateTo) query.dateTo = filters.dateTo
    
    // 请求数据
    const [vitalsRes, remindersRes, rangesRes] = await Promise.all([
      $fetch('/api/vitals', { query }),
      $fetch('/api/vitals/reminders'),
      $fetch('/api/vitals/reference-ranges')
    ])
    
    vitalsData.value = (vitalsRes as any).data || []
    remindersData.value = (remindersRes as any).data || []
    referenceRanges.value = (rangesRes as any).data || []
    
    // Debug: log reference ranges
    console.log('Loaded reference ranges:', referenceRanges.value)
  } catch (error) {
    console.error('Error loading vital signs data:', error)
    const { error: showError } = useNotification()
    showError('加载数据失败，请重试')
  } finally {
    loading.value = false
  }
}

// 打开添加模态窗口
const openAddModal = () => {
  selectedVitalSign.value = null
  isModalOpen.value = true
}

// 打开编辑模态窗口
const openEditModal = (vitalSign: VitalSign) => {
  selectedVitalSign.value = vitalSign
  isModalOpen.value = true
}

// 关闭模态窗口
const closeModal = () => {
  isModalOpen.value = false
  selectedVitalSign.value = null
}

// 打开添加提醒模态窗口
const openAddReminderModal = () => {
  selectedReminder.value = null
  isReminderModalOpen.value = true
}

// 打开编辑提醒模态窗口
const openEditReminderModal = (reminder: VitalSignReminder) => {
  selectedReminder.value = reminder
  isReminderModalOpen.value = true
}

// 关闭提醒模态窗口
const closeReminderModal = () => {
  isReminderModalOpen.value = false
  selectedReminder.value = null
}

// 从提醒中记录体征数据
const recordFromReminder = (reminder: VitalSignReminder) => {
  // 预填充相关数据，打开添加记录模态窗口
  selectedVitalSign.value = null
  isModalOpen.value = true
  
  // 手动触发一下表单默认值设置
  nextTick(() => {
    // 这里通过事件触发或其他方式设置表单数据
    // 暂时实现为简单地打开一个新表单
  })
}

// 删除体征数据
const deleteVitalSign = async (id: string) => {
  // 使用通知系统的确认对话框
  const { confirm, success, error: showError } = useNotification()
  
  const shouldDelete = await confirm('确定要删除这条记录吗？', {
    confirmText: '删除',
    cancelText: '取消'
  })
  
  if (!shouldDelete) return
  
  try {
    await $fetch(`/api/vitals/${id}`, {
      method: 'DELETE' as any
    })
    success('记录已删除')
    loadData()
  } catch (error) {
    console.error('Error deleting vital sign:', error)
    showError('删除失败，请重试')
  }
}

// 删除提醒
const deleteReminder = async (id: string) => {
  // 使用通知系统的确认对话框
  const { confirm, success, error: showError } = useNotification()
  
  const shouldDelete = await confirm('确定要删除这条提醒吗？', {
    confirmText: '删除',
    cancelText: '取消'
  })
  
  if (!shouldDelete) return
  
  try {
    await $fetch(`/api/vitals/reminders/${id}`, {
      method: 'DELETE' as any
    })
    success('提醒已删除')
    loadData()
  } catch (error) {
    console.error('Error deleting reminder:', error)
    showError('删除失败，请重试')
  }
}

// 处理操作成功
const handleSuccess = () => {
  loadData()
}

// 导出PDF功能
const exportToPDF = async () => {
  const { exportVitalSignsToPDF } = await import('~/utils/pdfExport')
  const { success, error: showError } = useNotification()
  
  try {
    // 如果没有选择类型，导出全部数据；否则只导出筛选后的数据
    const dataToExport = filters.type ? filteredVitalsData.value : vitalsData.value
    
    await exportVitalSignsToPDF(
      dataToExport,
      {
        type: filters.type || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined
      },
      chartContainer.value
    )
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

// 监听体征类型变化,自动刷新数据
watch(() => filters.type, () => {
  if (isPrivacyVerified.value) {
    loadData()
  }
})

// 页面加载时获取数据
onMounted(async () => {
  await checkPrivacyStatus()
  if (isPrivacyVerified.value) {
    await loadData()
  }
})
</script>