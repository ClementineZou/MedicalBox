<template>
  <div class="space-y-6">
    <!-- 顶部导航和操作 -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-4">
        <NuxtLink to="/medicines" class="text-md-primary hover:underline">
          &larr; 返回药品列表
        </NuxtLink>
        <h1 class="text-3xl font-bold">{{ medicine?.name || '药品详情' }}</h1>
      </div>
      <div>
        <button 
          @click="openEditModal"
          class="bg-md-primary text-md-on-primary px-4 py-3 rounded-md-md hover:opacity-90 transition-opacity"
        >
          ✏️ 编辑药品
        </button>
      </div>
    </div>

    <!-- 药品详情 -->
    <div v-if="loading" class="bg-white rounded-md-lg shadow-md p-6 text-center">
      <p>加载中...</p>
    </div>

    <div v-else-if="!medicine" class="bg-white rounded-md-lg shadow-md p-6 text-center">
      <p class="text-md-error">未找到药品信息</p>
    </div>

    <div v-else class="grid md:grid-cols-2 gap-6">
      <!-- 基本信息 -->
      <div class="bg-white rounded-md-lg shadow-md p-6 space-y-4">
        <h2 class="text-xl font-semibold border-b border-md-surface-variant pb-2">基本信息</h2>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-md-on-surface-variant">药品通用名</p>
            <p class="font-medium">{{ medicine.name }}</p>
          </div>
          <div>
            <p class="text-sm text-md-on-surface-variant">品牌/厂家</p>
            <p class="font-medium">{{ medicine.brand || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-md-on-surface-variant">分类</p>
            <p class="font-medium">{{ medicine.category || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-md-on-surface-variant">剂量规格</p>
            <p class="font-medium">{{ medicine.dosage }}{{ medicine.dosageUnit }}</p>
          </div>
          <div>
            <p class="text-sm text-md-on-surface-variant">管制分类</p>
            <p class="font-medium">{{ medicine.controlTypes || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-md-on-surface-variant">库存数量</p>
            <p class="font-medium">{{ medicine.quantity }} {{ medicine.quantityUnit }}</p>
          </div>
          <div>
            <p class="text-sm text-md-on-surface-variant">存放位置</p>
            <p class="font-medium">{{ medicine.location || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-md-on-surface-variant">有效期至</p>
            <p :class="isExpiringSoon(medicine.expiryDate) ? 'text-md-error font-semibold' : 'font-medium'">
              {{ formatDate(medicine.expiryDate) }}
              <span v-if="isExpiringSoon(medicine.expiryDate)" class="text-xs">(即将过期)</span>
            </p>
          </div>
        </div>
      </div>

      <!-- 使用信息 -->
      <div class="bg-white rounded-md-lg shadow-md p-6 space-y-4">
        <h2 class="text-xl font-semibold border-b border-md-surface-variant pb-2">使用信息</h2>
        
        <div>
          <p class="text-sm text-md-on-surface-variant">适应症</p>
          <p class="mt-1">{{ medicine.indications || '-' }}</p>
        </div>
        
        <div>
          <p class="text-sm text-md-on-surface-variant">用法用量</p>
          <p class="mt-1 whitespace-pre-line">{{ medicine.usage || '-' }}</p>
        </div>
        
        <div>
          <p class="text-sm text-md-on-surface-variant">备注</p>
          <p class="mt-1 whitespace-pre-line">{{ medicine.notes || '-' }}</p>
        </div>
      </div>

      <!-- 用药记录 -->
      <div class="md:col-span-2 bg-white rounded-md-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">用药记录 ({{ records.length }}条)</h2>
          <button 
            @click="openAddRecordModal"
            class="bg-md-tertiary text-md-on-tertiary px-4 py-2 rounded-md-sm hover:opacity-90 transition-opacity text-sm"
          >
            + 添加记录
          </button>
        </div>
        
        <div v-if="records.length === 0" class="text-center text-md-on-surface-variant py-8">
          暂无用药记录
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="record in records" 
            :key="record.id"
            class="border border-md-surface-variant rounded-md-md p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="font-semibold">{{ formatDateTime(record.usageTime) }}</div>
                <div class="mt-1 space-y-1 text-sm">
                  <p><span class="text-md-on-surface-variant">服用剂量:</span> {{ record.dosage }}</p>
                  <p v-if="record.notes"><span class="text-md-on-surface-variant">备注:</span> {{ record.notes }}</p>
                  <p v-if="record.sideEffectNotes" class="text-md-error">
                    <span class="text-md-on-surface-variant">副作用:</span> {{ record.sideEffectNotes }}
                  </p>
                </div>
              </div>
              <button 
                @click="deleteRecord(record.id)"
                class="bg-md-error text-md-on-error px-3 py-1 rounded-md-sm hover:opacity-90 transition-opacity text-sm"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 提醒信息 -->
      <div class="md:col-span-2 bg-white rounded-md-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">提醒设置 ({{ reminders.length }}条)</h2>
          <button 
            @click="openAddReminderModal"
            class="bg-md-tertiary text-md-on-tertiary px-4 py-2 rounded-md-sm hover:opacity-90 transition-opacity text-sm"
          >
            + 添加提醒
          </button>
        </div>
        
        <div v-if="reminders.length === 0" class="text-center text-md-on-surface-variant py-8">
          暂无提醒设置
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="reminder in reminders" 
            :key="reminder.id"
            :class="[
              'border rounded-md-md p-4 hover:shadow-md transition-shadow',
              !reminder.isActive ? 'border-gray-300 bg-gray-50' : 'border-md-surface-variant',
              reminder.isCompleted ? 'opacity-70' : ''
            ]"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="font-semibold">{{ reminder.title }}</div>
                <div class="mt-1 space-y-1 text-sm">
                  <p><span class="text-md-on-surface-variant">提醒时间:</span> {{ formatDateTime(reminder.reminderTime) }}</p>
                  <p><span class="text-md-on-surface-variant">频率:</span> {{ getFrequencyLabel(reminder.frequency) }}</p>
                  <p v-if="reminder.description"><span class="text-md-on-surface-variant">描述:</span> {{ getUserDescription(reminder.description) }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <span 
                      :class="[
                        'px-2 py-0.5 rounded-full text-xs',
                        reminder.isActive 
                          ? 'bg-md-primary-container text-md-on-primary-container' 
                          : 'bg-gray-200 text-gray-600'
                      ]"
                    >
                      {{ reminder.isActive ? '已激活' : '已禁用' }}
                    </span>
                    <span 
                      v-if="reminder.isCompleted"
                      class="px-2 py-0.5 bg-md-tertiary-container text-md-on-tertiary-container rounded-full text-xs"
                    >
                      已完成
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <button 
                  v-if="!reminder.isCompleted"
                  @click="toggleReminderStatus(reminder)"
                  :class="[
                    'px-3 py-1 rounded-md-sm hover:opacity-90 transition-opacity text-sm',
                    reminder.isActive 
                      ? 'bg-gray-200 text-gray-700' 
                      : 'bg-md-secondary text-md-on-secondary'
                  ]"
                >
                  {{ reminder.isActive ? '禁用' : '启用' }}
                </button>
                <button 
                  @click="deleteReminder(reminder.id)"
                  class="bg-md-error text-md-on-error px-3 py-1 rounded-md-sm hover:opacity-90 transition-opacity text-sm"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Medicine Modal -->
    <MedicineModal 
      :is-open="isEditModalOpen"
      :medicine="medicine"
      @close="closeEditModal"
      @success="handleSuccess"
    />

    <!-- Record Modal -->
    <RecordModal 
      :is-open="isRecordModalOpen"
      :medicines="[medicine!]"
      @close="closeRecordModal"
      @success="handleSuccess"
    />

    <!-- Reminder Modal -->
    <ReminderModal 
      :is-open="isReminderModalOpen"
      :reminder="null"
      :medicines="[medicine!]"
      @close="closeReminderModal"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import type { Medicine, MedicineUsageRecord, Reminder } from '~/types'
import { useNotification } from '~/composables/useNotification'

const route = useRoute()
const id = route.params.id as string

useHead({
  title: '药品详情'
})

const medicine = ref<Medicine | null>(null)
const records = ref<MedicineUsageRecord[]>([])
const reminders = ref<Reminder[]>([])
const loading = ref(true)
const isEditModalOpen = ref(false)
const isRecordModalOpen = ref(false)
const isReminderModalOpen = ref(false)

// 管制分类已改为单选，不需要处理和转换

// 获取频率标签
const getFrequencyLabel = (frequency: string) => {
  switch (frequency) {
    case 'once': return '一次性'
    case 'daily': return '每日'
    case 'weekly': return '每周'
    case 'monthly': return '每月'
    case 'custom': return '自定义'
    default: return frequency
  }
}

// 从描述JSON中提取用户描述
const getUserDescription = (description: string | undefined): string => {
  if (!description) return '';
  try {
    const data = JSON.parse(description)
    return data.userDescription || description
  } catch {
    return description
  }
}

// 加载药品详情和相关记录
const loadData = async () => {
  loading.value = true
  try {
    const [medicineRes, recordsRes, remindersRes] = await Promise.all([
      $fetch(`/api/medicines/${id}`),
      $fetch('/api/records', { query: { medicineId: id } }),
      $fetch('/api/reminders', { query: { medicineId: id } })
    ])
    
    medicine.value = (medicineRes as any).data || null
    records.value = (recordsRes as any).data || []
    reminders.value = (remindersRes as any).data || []
    
    if (medicine.value) {
      useHead({
        title: `药品详情 - ${medicine.value.name}`
      })
    }
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

// 打开编辑模态框
const openEditModal = () => {
  isEditModalOpen.value = true
}

// 关闭编辑模态框
const closeEditModal = () => {
  isEditModalOpen.value = false
}

// 打开添加记录模态框
const openAddRecordModal = () => {
  isRecordModalOpen.value = true
}

// 关闭添加记录模态框
const closeRecordModal = () => {
  isRecordModalOpen.value = false
}

// 打开添加提醒模态框
const openAddReminderModal = () => {
  isReminderModalOpen.value = true
}

// 关闭添加提醒模态框
const closeReminderModal = () => {
  isReminderModalOpen.value = false
}

// 删除记录
const deleteRecord = async (recordId: string) => {
  // 使用通知系统代替原生确认对话框
  const { confirm } = useNotification()
  
  const shouldDelete = await confirm('确定要删除这条记录吗？', {
    confirmText: '删除',
    cancelText: '取消'
  })
  
  if (!shouldDelete) return

  try {
    await $fetch(`/api/records/${recordId}`, {
      method: 'DELETE' as any
    })
    loadData()
    
    const { success } = useNotification()
    success('记录已删除')
  } catch (error) {
    console.error('Error deleting record:', error)
    
    const { error: showError } = useNotification()
    showError('删除失败，请重试')
  }
}

// 切换提醒状态
const toggleReminderStatus = async (reminder: Reminder) => {
  try {
    await $fetch(`/api/reminders/${reminder.id}`, {
      method: 'PUT',
      body: {
        isActive: !reminder.isActive
      }
    })
    loadData()
    
    const { success } = useNotification()
    success(reminder.isActive ? '提醒已禁用' : '提醒已启用')
  } catch (error) {
    console.error('Error toggling reminder status:', error)
    
    const { error: showError } = useNotification()
    showError('操作失败，请重试')
  }
}

// 删除提醒
const deleteReminder = async (reminderId: string) => {
  // 使用通知系统的确认对话框
  const { confirm, success, error: showError } = useNotification()
  
  const shouldDelete = await confirm('确定要删除这个提醒吗？', {
    confirmText: '删除',
    cancelText: '取消'
  })
  
  if (!shouldDelete) return

  try {
    await $fetch(`/api/reminders/${reminderId}`, {
      method: 'DELETE' as any
    })
    loadData()
    
    success('提醒已删除')
  } catch (error) {
    console.error('Error deleting reminder:', error)
    showError('删除失败，请重试')
  }
}

// 导出相关功能已移除

// 使用全局注入的格式化函数
const { $formatDate, $formatDateTime, $isExpiringSoon } = useNuxtApp()

// 代码兼容性处理
const formatDate = (date: string | Date) => {
  return $formatDate(date)
}

const formatDateTime = (date: string | Date) => {
  return $formatDateTime(date)
}

// 判断是否即将过期
const isExpiringSoon = (expiryDate: string | Date) => {
  return $isExpiringSoon(expiryDate)
}

// 成功保存后刷新数据
const handleSuccess = () => {
  loadData()
}

// 初始加载
onMounted(() => {
  loadData()
})
</script>