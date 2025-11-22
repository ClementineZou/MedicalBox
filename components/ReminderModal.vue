<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-md-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
      <!-- Header -->
      <div class="bg-md-primary text-md-on-primary px-6 py-4 rounded-t-md-lg flex justify-between items-center">
        <h2 class="text-2xl font-bold">{{ isEdit ? '编辑提醒' : '添加提醒' }}</h2>
        <button @click="closeModal" class="text-md-on-primary hover:opacity-80">
          <span class="text-2xl">&times;</span>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- 选择药品 -->
        <div v-if="!isEdit">
          <label class="block text-sm font-medium mb-1">选择药品 <span class="text-red-500">*</span></label>
          <select 
            v-model="form.medicineId"
            class="w-full px-4 py-2 border rounded-md-sm focus:outline-none focus:border-md-primary"
            :class="errors.medicineId ? 'border-red-500' : 'border-md-surface-variant'"
            @blur="validateField('medicineId', form.medicineId)"
          >
            <option value="">请选择药品</option>
            <option v-for="medicine in medicines" :key="medicine.id" :value="medicine.id">
              {{ medicine.name }}
            </option>
          </select>
          <p v-if="errors.medicineId" class="text-red-500 text-xs mt-1">{{ errors.medicineId }}</p>
        </div>

        <!-- 提醒标题由系统自动生成，不需要用户输入 -->

        <!-- 频率选择 -->
        <div>
          <label class="block text-sm font-medium mb-1">提醒频率 <span class="text-red-500">*</span></label>
          <select 
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
        <template v-if="form.frequency === 'once' || form.frequency === 'custom'">
          <!-- 单次提醒时间 -->
          <div>
            <label class="block text-sm font-medium mb-1">提醒时间 <span class="text-red-500">*</span></label>
            <input 
              v-model="form.reminderTime"
              type="datetime-local"
              class="w-full px-4 py-2 border rounded-md-sm focus:outline-none focus:border-md-primary"
              :class="errors.reminderTime ? 'border-red-500' : 'border-md-surface-variant'"
              @blur="validateField('reminderTime', form.reminderTime)"
            >
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

        <!-- 自动创建用药记录功能默认开启，无需用户选择 -->

        <!-- 服用剂量 -->
        <div v-if="selectedMedicine">
          <label class="block text-sm font-medium mb-1">服用剂量 <span class="text-red-500">*</span></label>
          <div class="flex">
            <div class="flex items-center w-full">
              <div class="flex-1 flex flex-wrap gap-2 mr-2">
                <button 
                  v-for="amount in dosageValues" 
                  :key="amount"
                  type="button"
                  :class="[
                    'px-3 py-2 rounded-md-sm',
                    dosageAmount === amount 
                      ? 'bg-md-primary text-md-on-primary' 
                      : 'bg-md-surface text-md-on-surface border border-md-surface-variant'
                  ]"
                  @click="dosageAmount = amount"
                >
                  {{ amount }}{{ selectedMedicine.quantityUnit }}
                </button>
              </div>
              <div class="flex flex-col w-32">
                <div class="flex">
                  <input 
                    v-model="dosageAmount" 
                    type="number"
                    min="0.5"
                    step="0.5"
                    class="w-20 px-4 py-2 border rounded-l-md-sm focus:outline-none focus:border-md-primary"
                    :class="errors.dosageAmount ? 'border-red-500' : 'border-md-surface-variant'"
                  >
                  <span class="flex items-center px-2 py-2 border border-l-0 border-md-surface-variant rounded-r-md-sm bg-gray-50">
                    {{ selectedMedicine.quantityUnit }}
                  </span>
                </div>
                <p v-if="errors.dosageAmount" class="text-red-500 text-xs mt-1">{{ errors.dosageAmount }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 备注 -->
        <div>
          <label class="block text-sm font-medium mb-1">备注</label>
          <textarea 
            v-model="form.description"
            rows="3"
            class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            placeholder="用药提醒的备注信息"
          ></textarea>
        </div>

        <!-- Buttons -->
        <div class="flex gap-4 pt-4">
          <button 
            type="button"
            @click="closeModal"
            class="flex-1 bg-md-surface-variant text-md-on-surface-variant px-6 py-3 rounded-md-md hover:opacity-90 transition-opacity"
          >
            取消
          </button>
          <button 
            type="submit"
            :disabled="loading"
            class="flex-1 bg-md-primary text-md-on-primary px-6 py-3 rounded-md-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {{ loading ? '保存中...' : '保存' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Reminder, Medicine } from '~/types'
import { useNotification } from '~/composables/useNotification'
import useReminderFrequency from '~/composables/useReminderFrequency'
import { toLocalISOString, toLocalISOStringForInput } from '~/utils/localTime'
import { useFormValidation, validators } from '~/composables/useFormValidation'

const props = defineProps<{
  isOpen: boolean
  reminder?: Reminder | null
  medicines: Medicine[]
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const isEdit = computed(() => !!props.reminder)
const loading = ref(false)
// 自动创建记录功能始终开启
const autoCreateRecord = ref(true)

// 提醒相关设置
const dailyTimes = ref('1')
const reminderTimeSlots = ref<string[]>(['08:00'])
const weeklyDays = ref<number[]>([1]) // 默认周一
const weeklyTime = ref('08:00')
const monthlyDay = ref(1)
const monthlyTime = ref('08:00')

// 剂量设置
const dosageAmount = ref(1)

// 剂量数量预设选项
const dosageValues = [0.5, 1, 2, 3, 5]

// 使用提醒频率处理composable
const { 
  getWeekDayLabel,
  handleDailyTimesChange,
  validateReminderData,
  createReminderData
} = useReminderFrequency()

// 选中的药品
const selectedMedicine = computed(() => {
  if (!form.value.medicineId) return null;
  return props.medicines.find(m => m.id === form.value.medicineId);
})

// 表单数据
const form = ref({
  medicineId: '',
  title: '用药提醒', // 默认标题，将在提交时根据药品名称自动生成
  description: '',
  reminderTime: toLocalISOStringForInput(new Date()),
  frequency: 'once',
  isActive: true,
  isCompleted: false
})

// 验证规则
const rules = computed(() => {
  const baseRules = {
    medicineId: [validators.required()],
    frequency: [validators.required()]
  }

  if (form.value.frequency === 'once') {
    return {
      ...baseRules,
      reminderTime: [validators.required()]
    }
  } else if (form.value.frequency === 'weekly') {
    return {
      ...baseRules,
      weeklyDays: [(val: any) => (weeklyDays.value.length > 0) || '请至少选择一天']
    }
  }
  
  return baseRules
})

const { errors, validateField, validateForm, clearErrors, setError } = useFormValidation(form.value, rules.value)

// 监听每日次数变化，自动调整时间槽数量
watch(dailyTimes, (newVal) => {
  handleDailyTimesChange(newVal, reminderTimeSlots)
}, { immediate: true })

// 切换星期几选中状态
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
  if (form.value.frequency === 'weekly') {
    if (weeklyDays.value.length === 0) {
      setError('weeklyDays', '请至少选择一天')
    } else {
      if (errors.value.weeklyDays) delete errors.value.weeklyDays
    }
  }
}

watch(() => props.reminder, (reminder) => {
  if (reminder) {
    form.value = {
      medicineId: reminder.medicineId,
      title: reminder.title,
      description: reminder.description || '',
      reminderTime: toLocalISOStringForInput(new Date(reminder.reminderTime)),
      frequency: reminder.frequency,
      isActive: reminder.isActive,
      isCompleted: reminder.isCompleted
    }

    // 根据频率解析特定设置
    if (reminder.frequency === 'daily') {
      // 解析每日提醒时间设置
      try {
        const frequencyData = JSON.parse(reminder.description || '{}')
        if (frequencyData.times) {
          dailyTimes.value = frequencyData.times.length.toString()
          reminderTimeSlots.value = frequencyData.times
        }
      } catch (e) {
        console.error('解析每日提醒设置失败:', e)
      }
    } else if (reminder.frequency === 'weekly') {
      // 解析每周提醒设置
      try {
        const frequencyData = JSON.parse(reminder.description || '{}')
        if (frequencyData.days) {
          weeklyDays.value = frequencyData.days
        }
        if (frequencyData.time) {
          weeklyTime.value = frequencyData.time
        }
      } catch (e) {
        console.error('解析每周提醒设置失败:', e)
      }
    } else if (reminder.frequency === 'monthly') {
      // 解析每月提醒设置
      try {
        const frequencyData = JSON.parse(reminder.description || '{}')
        if (frequencyData.day) {
          monthlyDay.value = frequencyData.day
        }
        if (frequencyData.time) {
          monthlyTime.value = frequencyData.time
        }
      } catch (e) {
        console.error('解析每月提醒设置失败:', e)
      }
    }

    // 解析自动创建记录和剂量设置
    try {
      const metadata = JSON.parse(reminder.description || '{}')
      if (metadata.autoCreateRecord !== undefined) {
        autoCreateRecord.value = metadata.autoCreateRecord
      }
      if (metadata.dosageAmount !== undefined) {
        dosageAmount.value = metadata.dosageAmount
      }
    } catch (e) {
      console.error('解析提醒设置失败:', e)
    }
  } else {
    // 重置表单
    form.value = {
      medicineId: '',
      title: '',
      description: '',
      reminderTime: toLocalISOStringForInput(new Date()),
      frequency: 'once',
      isActive: true,
      isCompleted: false
    }
    dailyTimes.value = '1'
    reminderTimeSlots.value = ['08:00']
    weeklyDays.value = [1]
    weeklyTime.value = '08:00'
    monthlyDay.value = 1
    monthlyTime.value = '08:00'
    autoCreateRecord.value = true
  }
  clearErrors()
}, { immediate: true })

const closeModal = () => {
  emit('close')
}

// 准备提交数据
const prepareSubmitData = () => {
  const submitData = { ...form.value }
  const metadata: any = {
    autoCreateRecord: true, // 始终启用自动创建记录
    dosageAmount: dosageAmount.value // 添加服用剂量信息
  }
  
  // 根据药品自动生成提醒标题
  const selectedMedicine = props.medicines.find(m => m.id === form.value.medicineId)
  if (selectedMedicine) {
    submitData.title = `服用${selectedMedicine.name}`
  }

  // 根据不同频率处理数据
  if (form.value.frequency === 'daily') {
    metadata.times = reminderTimeSlots.value
    // 使用当前日期加上第一个时间槽作为提醒时间
    const [hours, minutes] = reminderTimeSlots.value[0].split(':').map(Number)
    const reminderDate = new Date()
    reminderDate.setHours(hours, minutes, 0, 0)
    submitData.reminderTime = toLocalISOString(reminderDate)
  } else if (form.value.frequency === 'weekly') {
    metadata.days = weeklyDays.value
    metadata.time = weeklyTime.value
    
    // 计算下一个符合条件的日期
    const now = new Date()
    const dayOfWeek = now.getDay() || 7 // 将周日(0)转换为7
    let nextDay = weeklyDays.value[0]
    
    // 找到下一个提醒日
    for (const day of weeklyDays.value.sort()) {
      if (day >= dayOfWeek) {
        nextDay = day
        break
      }
    }
    
    // 如果今天过了所有提醒日，则下一个提醒日是下周的第一天
    if (nextDay < dayOfWeek) {
      nextDay = weeklyDays.value[0]
    }
    
    // 计算天数差
    const daysToAdd = (nextDay - dayOfWeek + 7) % 7
    
    // 设置提醒日期和时间
    const reminderDate = new Date()
    reminderDate.setDate(now.getDate() + daysToAdd)
    const [hours, minutes] = weeklyTime.value.split(':').map(Number)
    reminderDate.setHours(hours, minutes, 0, 0)
    submitData.reminderTime = toLocalISOString(reminderDate)
  } else if (form.value.frequency === 'monthly') {
    metadata.day = monthlyDay.value
    metadata.time = monthlyTime.value
    
    // 计算下一个符合条件的日期
    const now = new Date()
    const today = now.getDate()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    let nextDate = new Date(currentYear, currentMonth, monthlyDay.value)
    
    // 如果当月的这一天已经过了，就设置为下个月
    if (monthlyDay.value < today) {
      nextDate = new Date(currentYear, currentMonth + 1, monthlyDay.value)
    }
    
    // 设置提醒时间
    const [hours, minutes] = monthlyTime.value.split(':').map(Number)
    nextDate.setHours(hours, minutes, 0, 0)
    submitData.reminderTime = toLocalISOString(nextDate)
  }

  // 将元数据添加到描述字段中
  try {
    // 保存原始描述
    const userDescription = submitData.description
    
    // 合并元数据和用户描述
    metadata.userDescription = userDescription
    submitData.description = JSON.stringify(metadata)
  } catch (e) {
    console.error('准备提交数据失败:', e)
  }

  return submitData
}

const handleSubmit = async () => {
  // Manual validation
  let localIsValid = true
  clearErrors()
  
  const currentRulesObj = rules.value
  for (const field in currentRulesObj) {
    const fieldRules = (currentRulesObj as any)[field]
    // Handle weeklyDays special case
    let val = form.value[field as keyof typeof form.value]
    if (field === 'weeklyDays') val = weeklyDays.value as any
    
    for (const rule of fieldRules) {
      const result = rule(val)
      if (result !== true) {
        errors.value[field] = typeof result === 'string' ? result : 'Invalid value'
        localIsValid = false
        break
      }
    }
  }
  
  // Validate dosageAmount
  if (dosageAmount.value <= 0) {
    setError('dosageAmount', '剂量必须大于0')
    localIsValid = false
  }
  
  if (!localIsValid) return
  
  // 使用共享组件验证提醒数据
  const reminderData = {
    frequency: form.value.frequency,
    reminderTime: form.value.reminderTime,
    dailyTimes: dailyTimes.value,
    reminderTimeSlots: reminderTimeSlots.value,
    weeklyDays: weeklyDays.value,
    weeklyTime: weeklyTime.value,
    monthlyDay: monthlyDay.value,
    monthlyTime: monthlyTime.value,
    dosageAmount: dosageAmount.value,
    userDescription: form.value.description
  }
  
  // 验证数据
  const validationResult = validateReminderData(reminderData)
  if (!validationResult.valid) {
    const { error: showError } = useNotification()
    showError(validationResult.message || '提醒数据无效')
    return
  }
  
  loading.value = true
  try {
    const url = isEdit.value ? `/api/reminders/${props.reminder!.id}` : '/api/reminders'
    const method = isEdit.value ? 'PUT' : 'POST'
    
    // 准备提交数据
    const submitData = prepareSubmitData()

    // 如果是每日多次提醒，需要创建多个提醒
    if (form.value.frequency === 'daily' && parseInt(dailyTimes.value) > 1 && !isEdit.value) {
      // 创建第一个提醒
      const firstResponse = await $fetch(url, {
        method: method as any,
        body: submitData
      })
      
      // 如果第一个创建成功，创建其余提醒
      if ((firstResponse as any).success) {
        // 从第二个时间槽开始创建提醒
        for (let i = 1; i < reminderTimeSlots.value.length; i++) {
          const timeSlot = reminderTimeSlots.value[i]
          const [hours, minutes] = timeSlot.split(':').map(Number)
          
          const reminderDate = new Date()
          reminderDate.setHours(hours, minutes, 0, 0)
          
          const additionalData = { ...submitData }
          additionalData.title = `${submitData.title} (${i + 1})`
          additionalData.reminderTime = toLocalISOString(reminderDate)
          
          await $fetch('/api/reminders', {
            method: 'POST',
            body: additionalData
          })
        }
      }
    } else {
      // 普通单次提醒创建/编辑
      await $fetch(url, {
        method: method as any,
        body: submitData
      })
    }

    // 显示成功消息
    const { success } = useNotification()
    success(isEdit.value ? '提醒更新成功' : '提醒创建成功')
    
    emit('success')
    closeModal()
  } catch (error) {
    console.error('Error saving reminder:', error)
    // 使用Material Design风格的通知替代alert
    const { error: showError } = useNotification()
    showError('保存失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>
