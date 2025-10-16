<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-md-lg w-full max-w-2xl p-6">
      <h2 class="text-2xl font-bold mb-4">{{ reminder ? '编辑体征监测提醒' : '新增体征监测提醒' }}</h2>
      
      <form @submit.prevent="submit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 提醒标题 -->
          <div>
            <label for="title" class="block text-sm font-medium mb-1">提醒标题 <span class="text-red-500">*</span></label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              placeholder="例如：每周体重监测"
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            />
          </div>
          
          <!-- 体征类型 -->
          <div>
            <label for="vitalSignType" class="block text-sm font-medium mb-1">体征类型 <span class="text-red-500">*</span></label>
            <select
              id="vitalSignType"
              v-model="form.vitalSignType"
              required
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            >
              <option value="height">身高</option>
              <option value="weight">体重</option>
              <option value="temperature">体温</option>
              <option value="bloodPressure">血压</option>
              <option value="bloodOxygen">血氧</option>
              <option value="bloodGlucose">血糖</option>
              <option value="heartRate">心率</option>
              <option value="other">其他</option>
            </select>
          </div>
          
          <!-- 提醒时间 -->
          <div>
            <label for="reminderTime" class="block text-sm font-medium mb-1">提醒时间 <span class="text-red-500">*</span></label>
            <input
              id="reminderTime"
              v-model="form.reminderTime"
              type="datetime-local"
              required
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            />
          </div>
          
          <!-- 频率 -->
          <div>
            <label for="frequency" class="block text-sm font-medium mb-1">提醒频率 <span class="text-red-500">*</span></label>
            <select
              id="frequency"
              v-model="form.frequency"
              required
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            >
              <option value="once">仅一次</option>
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
            </select>
          </div>
        </div>
        
        <!-- 提醒描述 -->
        <div>
          <label for="description" class="block text-sm font-medium mb-1">提醒描述</label>
          <textarea
            id="description"
            v-model="form.description"
            rows="3"
            placeholder="请输入提醒描述"
            class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
          ></textarea>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button
            type="button"
            @click="close"
            class="flex-1 bg-md-surface-variant text-md-on-surface-variant px-4 py-3 rounded-md-sm hover:opacity-90 transition-opacity"
          >
            取消
          </button>
          <button
            type="submit"
            class="flex-1 bg-md-primary text-md-on-primary px-4 py-3 rounded-md-sm hover:opacity-90 transition-opacity"
          >
            {{ reminder ? '更新' : '保存' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VitalSignReminder } from '~/types'
import { toLocalISOString, toLocalISOStringForInput } from '~/utils/localTime'

const props = defineProps<{
  isOpen: boolean
  reminder: VitalSignReminder | null
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

// 表单数据
const form = reactive({
  title: '',
  vitalSignType: 'weight',
  reminderTime: toLocalISOStringForInput(new Date()),
  frequency: 'once',
  description: ''
})

// 重置表单
const resetForm = () => {
  form.title = ''
  form.vitalSignType = 'weight'
  form.reminderTime = toLocalISOStringForInput(new Date())
  form.frequency = 'once'
  form.description = ''
}

// 监听 reminder 变化，更新表单
watch(() => props.reminder, (newReminder) => {
  if (newReminder) {
    form.title = newReminder.title
    form.vitalSignType = newReminder.vitalSignType
    form.reminderTime = newReminder.reminderTime instanceof Date
      ? toLocalISOStringForInput(newReminder.reminderTime)
      : String(newReminder.reminderTime).slice(0, 16)
    form.frequency = newReminder.frequency
    form.description = newReminder.description || ''
  } else {
    resetForm()
  }
}, { immediate: true })

// 提交表单
const submit = async () => {
  try {
    // 构建请求体
    const payload = {
      title: form.title,
      vitalSignType: form.vitalSignType,
      reminderTime: form.reminderTime,
      frequency: form.frequency,
      description: form.description
    }
    
    // 根据是否有ID决定是创建还是更新
    if (props.reminder) {
      await $fetch(`/api/vitals/reminders/${props.reminder.id}`, {
        method: 'PUT' as any,
        body: payload
      })
    } else {
      await $fetch('/api/vitals/reminders', {
        method: 'POST' as any,
        body: payload
      })
    }
    
    const { success } = useNotification()
    success(props.reminder ? '体征监测提醒已更新' : '体征监测提醒已添加')
    emit('success')
    emit('close')
  } catch (error) {
    console.error('Error submitting vital sign reminder:', error)
    const { error: showError } = useNotification()
    showError('操作失败，请重试')
  }
}

// 关闭模态窗口
const close = () => {
  emit('close')
}
</script>