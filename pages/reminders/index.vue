<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">用药提醒</h1>
      <button 
        @click="openAddModal"
        class="bg-md-primary text-md-on-primary px-6 py-3 rounded-md-md hover:opacity-90 transition-opacity"
      >
        + 添加提醒
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-md-lg shadow-md p-6 text-center">
      <p>加载中...</p>
    </div>

    <!-- Active Reminders -->
    <div v-else class="bg-white rounded-md-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">今日提醒</h2>
      <div v-if="todayReminders.length === 0" class="text-center text-md-on-surface-variant py-12">
        <div class="text-6xl mb-4">⏰</div>
        <p class="text-lg font-semibold mb-2">暂无今日提醒</p>
        <p class="text-sm mt-2">设置用药提醒，确保按时服药</p>
      </div>
      <div v-else class="space-y-3">
        <div 
          v-for="reminder in todayReminders" 
          :key="reminder.id"
          class="border border-md-surface-variant rounded-md-md p-4 flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div class="flex-1">
            <h3 class="font-semibold">{{ reminder.title }}</h3>
            <div class="flex items-center gap-2">
              <p class="text-sm text-md-on-surface-variant">
                {{ reminder.medicine?.name }}{{ reminder.medicine?.brand ? `（${reminder.medicine?.brand}）` : '' }} - {{ formatTime(reminder.reminderTime) }}
              </p>
              <span v-if="getDosage(reminder.description)" class="px-2 py-0.5 bg-md-tertiary-container text-md-on-tertiary-container rounded-full text-xs">
                {{ getDosage(reminder.description) }}{{ reminder.medicine?.quantityUnit || '单位' }}
              </span>
            </div>
            <p v-if="getDescription(reminder.description)" class="text-sm text-md-on-surface-variant mt-1">
              {{ getDescription(reminder.description) }}
            </p>
            <span class="inline-block mt-1 px-2 py-1 bg-md-primary-container text-md-on-primary-container rounded text-xs">
              {{ getFrequencyText(reminder.frequency) }}
            </span>
          </div>
          <div class="flex gap-2">
            <button 
              @click="completeAndRecord(reminder.id)"
              class="bg-md-primary text-md-on-primary px-3 py-2 rounded-md-sm hover:opacity-90 transition-opacity text-sm"
            >
              完成并记录
            </button>
            <button 
              @click="openEditModal(reminder)"
              class="bg-md-secondary text-md-on-secondary px-4 py-2 rounded-md-sm hover:opacity-90 transition-opacity text-sm"
            >
              编辑
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

    <!-- Completed Reminders -->
    <div class="bg-white rounded-md-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">已完成的提醒</h2>
      <div v-if="completedReminders.length === 0" class="text-center text-md-on-surface-variant py-8">
        <p>暂无已完成的提醒</p>
      </div>
      <div v-else class="space-y-3">
        <div 
          v-for="reminder in completedReminders" 
          :key="reminder.id"
          class="border border-gray-300 bg-gray-50 rounded-md-md p-4 flex items-center justify-between opacity-75"
        >
          <div class="flex-1">
            <h3 class="font-semibold text-gray-700">{{ reminder.title }}</h3>
            <div class="flex items-center gap-2">
              <p class="text-sm text-gray-600">
                {{ reminder.medicine?.name }}{{ reminder.medicine?.brand ? `（${reminder.medicine?.brand}）` : '' }} - {{ $formatDateTime(reminder.reminderTime) }}
              </p>
              <span v-if="getDosage(reminder.description)" class="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                {{ getDosage(reminder.description) }}{{ reminder.medicine?.quantityUnit || '单位' }}
              </span>
            </div>
            <span class="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
              ✓ 已完成
            </span>
          </div>
          <div class="flex gap-2">
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

    <!-- Reminder Modal -->
    <ReminderModal 
      :is-open="isModalOpen"
      :reminder="selectedReminder"
      :medicines="medicines"
      @close="closeModal"
      @success="handleSuccess"
    />

    <!-- 服用时间确认弹窗 -->
    <div v-if="showTimeConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-md-lg max-w-md w-full p-6 space-y-4">
        <h3 class="text-xl font-bold">确认服用时间</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">请选择服用时间:</label>
            <div class="space-y-3">
              <div class="flex items-center">
                <input 
                  type="radio" 
                  id="time-now" 
                  name="time-selection"
                  :value="currentTimeISO" 
                  v-model="timeOption"
                  class="mr-2"
                >
                <label for="time-now">当前时间 ({{ $formatFullDateTime(new Date()) }})</label>
              </div>
              <div class="flex items-center">
                <input 
                  type="radio" 
                  id="time-reminder" 
                  name="time-selection"
                  :value="reminderTime" 
                  v-model="timeOption"
                  class="mr-2"
                >
                <label for="time-reminder">提醒时间 ({{ $formatFullDateTime(reminderTime) }})</label>
              </div>
              <div class="flex items-center">
                <input 
                  type="radio" 
                  id="time-custom" 
                  name="time-selection"
                  value="custom" 
                  v-model="timeOption"
                  class="mr-2"
                >
                <label for="time-custom">自定义时间:</label>
              </div>
              <div v-if="timeOption === 'custom'" class="ml-6 mt-2">
                <input 
                  type="datetime-local" 
                  v-model="customTime"
                  class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
                >
              </div>
            </div>
          </div>
          <div class="flex gap-3">
            <button 
              @click="showTimeConfirmation = false"
              class="flex-1 bg-md-surface-variant text-md-on-surface-variant px-4 py-3 rounded-md-sm hover:opacity-90 transition-opacity"
            >
              取消
            </button>
            <button 
              @click="confirmTimeAndRecord"
              class="flex-1 bg-md-primary text-md-on-primary px-4 py-3 rounded-md-sm hover:opacity-90 transition-opacity"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Reminder, Medicine } from '~/types'
import { toLocalISOString, toLocalISOStringForInput } from '~/utils/localTime'

useHead({
  title: '用药提醒'
})

const loading = ref(true)
const reminders = ref<Reminder[]>([])
const medicines = ref<Medicine[]>([])
const isModalOpen = ref(false)
const selectedReminder = ref<Reminder | null>(null)

// 今日提醒
const todayReminders = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return reminders.value.filter(r => {
    const reminderDate = new Date(r.reminderTime)
    return !r.isCompleted && reminderDate >= today && reminderDate < tomorrow
  })
})

// 已完成的提醒
const completedReminders = computed(() => {
  return reminders.value.filter(r => r.isCompleted).slice(0, 10)
})

// 加载提醒和药品
const loadData = async () => {
  loading.value = true
  try {
    const [remindersRes, medicinesRes] = await Promise.all([
      $fetch('/api/reminders', { query: { isActive: true } }),
      $fetch('/api/medicines')
    ])
    
    reminders.value = (remindersRes as any).data || []
    medicines.value = (medicinesRes as any).data || []
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  selectedReminder.value = null
  isModalOpen.value = true
}

const openEditModal = (reminder: Reminder) => {
  selectedReminder.value = reminder
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedReminder.value = null
}

const handleSuccess = () => {
  loadData()
}

const completeReminder = async (id: string) => {
  try {
    await $fetch(`/api/reminders/${id}`, {
      method: 'PUT' as any,
      body: { isCompleted: true }
    })
    loadData()
    const { success } = useNotification()
    success('提醒已标记为完成')
  } catch (error) {
    console.error('Error completing reminder:', error)
    const { error: showError } = useNotification()
    showError('操作失败，请重试')
  }
}

// 确认时间弹窗状态
const showTimeConfirmation = ref(false)
const currentReminderId = ref('')
const selectedTime = ref('')
const reminderTime = ref('')
const timeOption = ref('now') // 时间选项：now, reminder, custom
const customTime = ref('') // 自定义时间
const { $getCurrentISOString } = useNuxtApp()
const currentTimeISO = computed(() => $getCurrentISOString())

// 使用全局注入的格式化函数
const { $formatFullDateTime } = useNuxtApp()

// 打开时间确认弹窗
const openTimeConfirmation = (id: string) => {
  const reminder = reminders.value.find(r => r.id === id)
  if (reminder) {
    currentReminderId.value = id
    // 设置默认时间为当前时间
    const now = new Date()
    const time = new Date(reminder.reminderTime)
    
    // 默认选择当前时间
    timeOption.value = 'now'
    
    // 当前时间作为默认选项
    selectedTime.value = toLocalISOStringForInput(now)
    
    // 提醒时间作为选项
    reminderTime.value = toLocalISOStringForInput(time)
    
    // 自定义时间默认为当前时间
    customTime.value = toLocalISOStringForInput(now)
    
    // 显示弹窗
    showTimeConfirmation.value = true
  }
}

// 确认服用时间并完成记录
const confirmTimeAndRecord = async () => {
  try {
    // 根据选择的选项确定最终时间
    let finalTime = '';
    
    if (timeOption.value === 'now') {
      finalTime = toLocalISOString(new Date());
    } else if (timeOption.value === 'reminder') {
      finalTime = reminderTime.value;
    } else if (timeOption.value === 'custom') {
      finalTime = customTime.value;
    }
    
    // 调用API，完成提醒并创建用药记录，传递选择的时间
    await $fetch(`/api/reminders/${currentReminderId.value}/record`, {
      method: 'POST' as any,
      body: {
        usageTime: finalTime
      }
    })
    showTimeConfirmation.value = false
    loadData()
  } catch (error) {
    console.error('Error completing reminder and creating record:', error)
    const { error: showError } = useNotification()
    showError('操作失败，请重试')
  }
}

const completeAndRecord = (id: string) => {
  openTimeConfirmation(id)
}

const deleteReminder = async (id: string) => {
  // 使用通知系统的确认对话框
  const { confirm, success, error: showError } = useNotification()
  
  const shouldDelete = await confirm('确定要删除这个提醒吗？', {
    confirmText: '删除',
    cancelText: '取消'
  })
  
  if (!shouldDelete) return

  try {
    await $fetch(`/api/reminders/${id}`, {
      method: 'DELETE' as any
    })
    loadData()
    success('提醒已删除')
  } catch (error) {
    console.error('Error deleting reminder:', error)
    showError('删除失败，请重试')
  }
}

// 使用全局注入的时间格式化函数
const { $formatDateTime, $formatTime } = useNuxtApp()

// 本地格式化时间函数（用于显示）
const formatTime = (dateInput: string | Date) => {
  if ($formatTime && typeof dateInput === 'string') {
    return $formatTime(dateInput)
  }
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const getFrequencyText = (frequency: string) => {
  const map: Record<string, string> = {
    once: '仅一次',
    daily: '每天',
    weekly: '每周',
    monthly: '每月'
  }
  return map[frequency] || frequency
}

// 从JSON字符串中提取用户描述
const getDescription = (description: string | undefined) => {
  if (!description) return '';
  try {
    const data = JSON.parse(description);
    return data.userDescription || '';
  } catch (e) {
    return description;
  }
}

// 从JSON字符串中提取剂量信息
const getDosage = (description: string | undefined) => {
  if (!description) return null;
  try {
    const data = JSON.parse(description);
    return data.dosageAmount || null;
  } catch (e) {
    return null;
  }
}

onMounted(() => {
  loadData()
})
</script>
