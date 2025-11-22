<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-md-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
      <!-- Header -->
      <div class="bg-md-primary text-md-on-primary px-6 py-4 rounded-t-md-lg flex justify-between items-center">
        <h2 class="text-2xl font-bold">{{ reminder ? '编辑体征监测提醒' : '新增体征监测提醒' }}</h2>
        <button @click="close" class="text-md-on-primary hover:opacity-80">
          <span class="text-2xl">&times;</span>
        </button>
      </div>
      
      <form @submit.prevent="submit" class="p-6 space-y-4">
        <!-- 体征类型 -->
        <div>
          <label for="vitalSignType" class="block text-sm font-medium mb-1">体征类型 <span class="text-red-500">*</span></label>
          <select
            id="vitalSignType"
            v-model="form.vitalSignType"
            class="w-full px-4 py-2 border rounded-md-sm focus:outline-none focus:border-md-primary"
            :class="errors.vitalSignType ? 'border-red-500' : 'border-md-surface-variant'"
            @blur="validateField('vitalSignType', form.vitalSignType)"
          >
            <option value="height">身高</option>
            <option value="weight">体重</option>
            <option value="temperature">体温</option>
            <option value="bloodPressure">血压</option>
            <option value="bloodOxygen">血氧</option>
            <option value="bloodGlucose">血糖</option>
            <option value="heartRate">心率</option>
          </select>
          <p v-if="errors.vitalSignType" class="text-red-500 text-xs mt-1">{{ errors.vitalSignType }}</p>
        </div>
        
        <!-- 提醒频率 -->
        <div>
          <label for="frequency" class="block text-sm font-medium mb-1">提醒频率 <span class="text-red-500">*</span></label>
          <select
            id="frequency"
            v-model="form.frequency"
            class="w-full px-4 py-2 border rounded-md-sm focus:outline-none focus:border-md-primary"
            :class="errors.frequency ? 'border-red-500' : 'border-md-surface-variant'"
            @blur="validateField('frequency', form.frequency)"
          >
            <option value="once">仅一次</option>
            <option value="daily">每天</option>
            <option value="weekly">每周</option>
            <option value="monthly">每月</option>
          </select>
          <p v-if="errors.frequency" class="text-red-500 text-xs mt-1">{{ errors.frequency }}</p>
        </div>

        <!-- 根据不同频率显示不同设置 -->
        <template v-if="form.frequency === 'once'">
          <!-- 单次提醒时间 -->
          <div>
            <label class="block text-sm font-medium mb-1">提醒时间 <span class="text-red-500">*</span></label>
            <input
              v-model="form.reminderTime"
              type="datetime-local"
              class="w-full px-4 py-2 border rounded-md-sm focus:outline-none focus:border-md-primary"
              :class="errors.reminderTime ? 'border-red-500' : 'border-md-surface-variant'"
              @blur="validateField('reminderTime', form.reminderTime)"
            />
            <p v-if="errors.reminderTime" class="text-red-500 text-xs mt-1">{{ errors.reminderTime }}</p>
          </div>
        </template>

        <template v-else-if="form.frequency === 'daily'">
          <!-- 每日提醒设置 -->
          <div>
            <label class="block text-sm font-medium mb-1">每日几次</label>
            <select 
              v-model="dailyTimes"
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            >
              <option value="1">每日1次</option>
              <option value="2">每日2次</option>
              <option value="3">每日3次</option>
              <option value="4">每日4次</option>
            </select>
          </div>

          <!-- 时间选择 -->
          <div>
            <label class="block text-sm font-medium mb-1">提醒时间</label>
            <div class="space-y-2">
              <div v-for="(time, index) in reminderTimeSlots" :key="index" class="flex gap-2 items-center">
                <input 
                  type="time" 
                  v-model="reminderTimeSlots[index]" 
                  class="flex-1 px-2 py-1 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
                >
                <span class="text-sm text-gray-500">第 {{ index + 1 }} 次</span>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="form.frequency === 'weekly'">
          <!-- 每周设置 -->
          <div>
            <label class="block text-sm font-medium mb-1">每周几 <span class="text-red-500">*</span></label>
            <div class="grid grid-cols-7 gap-2">
              <button 
                v-for="day in 7" 
                :key="day" 
                type="button"
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  weeklyDays.includes(day) 
                    ? 'bg-md-primary text-md-on-primary' 
                    : 'bg-md-surface text-md-on-surface border border-md-surface-variant'
                ]"
                @click="toggleWeekDay(day)"
              >
                {{ getWeekDayLabel(day) }}
              </button>
            </div>
            <p v-if="errors.weeklyDays" class="text-red-500 text-xs mt-1">{{ errors.weeklyDays }}</p>
          </div>

          <!-- 时间选择 -->
          <div>
            <label class="block text-sm font-medium mb-1">提醒时间</label>
            <input 
              type="time" 
              v-model="weeklyTime" 
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            >
          </div>
        </template>

        <template v-else-if="form.frequency === 'monthly'">
          <!-- 每月设置 -->
          <div>
            <label class="block text-sm font-medium mb-1">每月几号</label>
            <select 
              v-model="monthlyDay"
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            >
              <option v-for="day in 31" :key="day" :value="day">{{ day }} 号</option>
            </select>
          </div>

          <!-- 时间选择 -->
          <div>
            <label class="block text-sm font-medium mb-1">提醒时间</label>
            <input 
              type="time" 
              v-model="monthlyTime" 
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            >
          </div>
        </template>
        
        <!-- 备注 -->
        <div>
          <label for="description" class="block text-sm font-medium mb-1">备注</label>
          <textarea
            id="description"
            v-model="form.description"
            rows="3"
            placeholder="健康监测提醒的备注信息"
            class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
          ></textarea>
        </div>
        
        <div class="flex gap-4 pt-4">
          <button
            type="button"
            @click="close"
            class="flex-1 bg-md-surface-variant text-md-on-surface-variant px-6 py-3 rounded-md-md hover:opacity-90 transition-opacity"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 bg-md-primary text-md-on-primary px-6 py-3 rounded-md-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {{ loading ? '保存中...' : (reminder ? '更新' : '保存') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VitalSignReminder } from '~/types'
import { toLocalISOString, toLocalISOStringForInput } from '~/utils/localTime'
import useReminderFrequency from '~/composables/useReminderFrequency'
import { useFormValidation, validators } from '~/composables/useFormValidation'

const props = defineProps<{
  isOpen: boolean
  reminder: VitalSignReminder | null
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const loading = ref(false)

// 使用 composable
const { 
  getWeekDayLabel,
  handleDailyTimesChange
} = useReminderFrequency()

// 提醒相关设置
const dailyTimes = ref('1')
const reminderTimeSlots = ref<string[]>(['08:00'])
const weeklyDays = ref<number[]>([1]) // 默认周一
const weeklyTime = ref('08:00')
const monthlyDay = ref(1)
const monthlyTime = ref('08:00')

// 表单数据
const form = reactive({
  vitalSignType: 'weight',
  reminderTime: toLocalISOStringForInput(new Date()),
  frequency: 'once',
  description: ''
})

// 验证规则
const rules = computed(() => {
  const baseRules = {
    vitalSignType: [validators.required()],
    frequency: [validators.required()]
  }

  if (form.frequency === 'once') {
    return {
      ...baseRules,
      reminderTime: [validators.required()]
    }
  } else if (form.frequency === 'weekly') {
    // Custom validator for weeklyDays
    return {
      ...baseRules,
      weeklyDays: [(val: any) => (weeklyDays.value.length > 0) || '请至少选择一天']
    }
  }
  
  return baseRules
})

const { errors, validateField, validateForm, clearErrors, setError } = useFormValidation(form, rules.value)

// 切换星期几选中状态 (Local implementation as composable version needs Ref<number[]>)
const toggleWeekDay = (day: number) => {
  const index = weeklyDays.value.indexOf(day)
  if (index > -1) {
    weeklyDays.value.splice(index, 1)
  } else {
    weeklyDays.value.push(day)
  }
  // 确保至少选择一天
  if (weeklyDays.value.length === 0) {
    weeklyDays.value.push(day)
  }
  
  // Manually validate weeklyDays
  if (form.frequency === 'weekly') {
    if (weeklyDays.value.length === 0) {
      setError('weeklyDays', '请至少选择一天')
    } else {
      if (errors.value.weeklyDays) delete errors.value.weeklyDays
    }
  }
}

// 监听每日次数变化
watch(dailyTimes, (newVal) => {
  handleDailyTimesChange(newVal, reminderTimeSlots)
}, { immediate: true })

// 重置表单
const resetForm = () => {
  form.vitalSignType = 'weight'
  form.reminderTime = toLocalISOStringForInput(new Date())
  form.frequency = 'once'
  form.description = ''
  
  dailyTimes.value = '1'
  reminderTimeSlots.value = ['08:00']
  weeklyDays.value = [1]
  weeklyTime.value = '08:00'
  monthlyDay.value = 1
  monthlyTime.value = '08:00'
  clearErrors()
}

// 监听 reminder 变化，更新表单
watch(() => props.reminder, (newReminder) => {
  if (newReminder) {
    form.vitalSignType = newReminder.vitalSignType
    form.reminderTime = newReminder.reminderTime instanceof Date
      ? toLocalISOStringForInput(newReminder.reminderTime)
      : String(newReminder.reminderTime).slice(0, 16)
    form.frequency = newReminder.frequency
    
    // 解析描述中的元数据
    try {
      const metadata = JSON.parse(newReminder.description || '{}')
      form.description = metadata.userDescription || newReminder.description || ''
      
      if (newReminder.frequency === 'daily') {
        if (metadata.times) {
          dailyTimes.value = metadata.times.length.toString()
          reminderTimeSlots.value = metadata.times
        }
      } else if (newReminder.frequency === 'weekly') {
        if (metadata.days) weeklyDays.value = metadata.days
        if (metadata.time) weeklyTime.value = metadata.time
      } else if (newReminder.frequency === 'monthly') {
        if (metadata.day) monthlyDay.value = metadata.day
        if (metadata.time) monthlyTime.value = metadata.time
      }
    } catch (e) {
      // 如果解析失败，说明是旧数据或纯文本描述
      form.description = newReminder.description || ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// 准备提交数据
const prepareSubmitData = () => {
  const typeNameMap: Record<string, string> = {
    height: '身高',
    weight: '体重',
    temperature: '体温',
    bloodPressure: '血压',
    bloodOxygen: '血氧',
    bloodGlucose: '血糖',
    heartRate: '心率'
  }
  const typeName = typeNameMap[form.vitalSignType] || form.vitalSignType

  const submitData = {
    title: `${typeName}监测提醒`,
    vitalSignType: form.vitalSignType,
    reminderTime: form.reminderTime,
    frequency: form.frequency,
    description: ''
  }

  const metadata: any = {
    userDescription: form.description
  }

  // 根据不同频率处理数据
  if (form.frequency === 'daily') {
    metadata.times = reminderTimeSlots.value
    // 使用当前日期加上第一个时间槽作为提醒时间
    const [hours, minutes] = reminderTimeSlots.value[0].split(':').map(Number)
    const reminderDate = new Date()
    reminderDate.setHours(hours, minutes, 0, 0)
    submitData.reminderTime = toLocalISOString(reminderDate)
  } else if (form.frequency === 'weekly') {
    metadata.days = weeklyDays.value
    metadata.time = weeklyTime.value
    
    // 计算下一个符合条件的日期
    const now = new Date()
    const dayOfWeek = now.getDay() || 7
    let nextDay = weeklyDays.value[0]
    
    for (const day of weeklyDays.value.sort()) {
      if (day >= dayOfWeek) {
        nextDay = day
        break
      }
    }
    
    if (nextDay < dayOfWeek) {
      nextDay = weeklyDays.value[0]
    }
    
    const daysToAdd = (nextDay - dayOfWeek + 7) % 7
    const reminderDate = new Date()
    reminderDate.setDate(now.getDate() + daysToAdd)
    const [hours, minutes] = weeklyTime.value.split(':').map(Number)
    reminderDate.setHours(hours, minutes, 0, 0)
    submitData.reminderTime = toLocalISOString(reminderDate)
  } else if (form.frequency === 'monthly') {
    metadata.day = monthlyDay.value
    metadata.time = monthlyTime.value
    
    const now = new Date()
    const today = now.getDate()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    let nextDate = new Date(currentYear, currentMonth, monthlyDay.value)
    if (monthlyDay.value < today) {
      nextDate = new Date(currentYear, currentMonth + 1, monthlyDay.value)
    }
    
    const [hours, minutes] = monthlyTime.value.split(':').map(Number)
    nextDate.setHours(hours, minutes, 0, 0)
    submitData.reminderTime = toLocalISOString(nextDate)
  }

  submitData.description = JSON.stringify(metadata)
  return submitData
}

// 提交表单
const submit = async () => {
  // Manual validation logic
  let localIsValid = true
  clearErrors()
  
  const currentRulesObj = rules.value
  for (const field in currentRulesObj) {
    const fieldRules = (currentRulesObj as any)[field]
    for (const rule of fieldRules) {
      // Special handling for weeklyDays which is not in form
      let val = form[field as keyof typeof form]
      if (field === 'weeklyDays') val = weeklyDays.value as any
      
      const result = rule(val)
      if (result !== true) {
        errors.value[field] = typeof result === 'string' ? result : 'Invalid value'
        localIsValid = false
        break
      }
    }
  }
  
  if (!localIsValid) return

  loading.value = true
  try {
    const submitData = prepareSubmitData()
    
    // 根据是否有ID决定是创建还是更新
    if (props.reminder) {
      await $fetch(`/api/vitals/reminders/${props.reminder.id}`, {
        method: 'PUT' as any,
        body: submitData
      })
    } else {
      // 如果是每日多次提醒，且是新建，则创建多个提醒
      if (form.frequency === 'daily' && parseInt(dailyTimes.value) > 1) {
        // 创建第一个
        await $fetch('/api/vitals/reminders', {
          method: 'POST' as any,
          body: submitData
        })
        
        // 创建其余的
        for (let i = 1; i < reminderTimeSlots.value.length; i++) {
          const timeSlot = reminderTimeSlots.value[i]
          const [hours, minutes] = timeSlot.split(':').map(Number)
          
          const reminderDate = new Date()
          reminderDate.setHours(hours, minutes, 0, 0)
          
          const additionalData = { ...submitData }
          additionalData.title = `${submitData.title} (${i + 1})`
          additionalData.reminderTime = toLocalISOString(reminderDate)
          
          await $fetch('/api/vitals/reminders', {
            method: 'POST' as any,
            body: additionalData
          })
        }
      } else {
        await $fetch('/api/vitals/reminders', {
          method: 'POST' as any,
          body: submitData
        })
      }
    }
    
    const { success } = useNotification()
    success(props.reminder ? '体征监测提醒已更新' : '体征监测提醒已添加')
    emit('success')
    emit('close')
  } catch (error) {
    console.error('Error submitting vital sign reminder:', error)
    const { error: showError } = useNotification()
    showError('操作失败，请重试')
  } finally {
    loading.value = false
  }
}

// 关闭模态窗口
const close = () => {
  emit('close')
}
</script>