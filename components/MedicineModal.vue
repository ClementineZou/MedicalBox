<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-md-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
      <!-- Header -->
      <div class="bg-md-primary text-md-on-primary px-6 py-4 rounded-t-md-lg flex justify-between items-center sticky top-0">
        <h2 class="text-2xl font-bold">{{ isEdit ? '编辑药品' : '添加药品' }}</h2>
        <button @click="closeModal" class="text-md-on-primary hover:opacity-80">
          <span class="text-2xl">&times;</span>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div class="grid md:grid-cols-2 gap-4">
          <!-- 药品通用名 -->
          <div>
            <label class="block text-sm font-medium mb-1">药品通用名 *</label>
            <input 
              v-model="form.name" 
              type="text" 
              required
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
              placeholder="例如：阿莫西林"
            >
          </div>
          
          <!-- 品牌/厂家 -->
          <div>
            <label class="block text-sm font-medium mb-1">品牌/厂家 *</label>
            <input 
              v-model="form.brand" 
              type="text"
              required
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
              placeholder="例如：XX制药"
            >
          </div>

          <!-- 批准文号 (单独一行) -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">批准文号 *</label>
            <input 
              v-model="form.approvalNo" 
              type="text"
              required
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
              placeholder="例如：国药准字H12345678"
            >
          </div>
          
          <!-- 用途分类 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">用途分类 *</label>
            <select 
              v-model="form.category"
              required
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            >
              <option value="">请选择分类</option>
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

          <!-- 管制分类 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">管制分类 *</label>
            <div class="grid grid-cols-2 gap-2 p-2 border border-md-surface-variant rounded-md-sm">
              <div v-for="(type, index) in controlTypeOptions" :key="index" class="flex items-center">
                <input 
                  type="checkbox" 
                  :id="`control-${type.value}`" 
                  :value="type.value" 
                  v-model="selectedControlTypes"
                  class="mr-2"
                >
                <label :for="`control-${type.value}`" class="text-sm">{{ type.label }}</label>
              </div>
              <div class="col-span-2 text-xs text-md-on-surface-variant mt-1">
                (请至少选择一项)
              </div>
            </div>
          </div>

          <!-- 适应症 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">适应症 *</label>
            <textarea 
              v-model="form.indications" 
              rows="3"
              required
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
              placeholder="例如：用于感冒引起的发热、咽痛、头痛等症状"
            ></textarea>
          </div>

          <!-- 用法用量 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">用法用量 *</label>
            <textarea 
              v-model="form.usage"
              rows="3"
              required
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
              placeholder="例如：每日3次，每次1粒，饭后服用"
            ></textarea>
          </div>

          <!-- 剂量规格 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">剂量规格 *</label>
            <div class="flex gap-2">
              <input 
                v-model="form.dosage" 
                type="text"
                required
                class="flex-1 px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
                placeholder="例如：500"
              >
              <select 
                v-model="form.dosageUnit"
                required
                class="w-24 px-2 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
              >
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="iu">IU</option>
                <option value="mcg">mcg</option>
                <option value="mg/ml">mg/ml</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          <!-- 库存数量 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">库存数量 *</label>
            <div class="flex gap-2">
              <input 
                v-model.number="form.quantity" 
                type="number"
                required
                min="0"
                class="flex-1 px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
              >
              <select 
                v-model="form.quantityUnit"
                required
                class="w-24 px-2 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
              >
                <option value="片">片</option>
                <option value="粒">粒</option>
                <option value="支">支</option>
                <option value="袋">袋</option>
                <option value="包">包</option>
                <option value="丸">丸</option>
                <option value="贴">贴</option>
                <option value="瓶">瓶</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          <!-- 有效期至 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">有效期至 *</label>
            <input 
              v-model="form.expiryDate" 
              type="date"
              required
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            >
          </div>

          <!-- 存放位置 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">存放位置 *</label>
            <input 
              v-model="form.location" 
              type="text"
              required
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
              placeholder="例如：卧室抽屉、客厅药箱"
            >
          </div>

          <!-- 备注 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">备注</label>
            <textarea 
              v-model="form.notes"
              rows="2"
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
              placeholder="其他需要注意的信息"
            ></textarea>
          </div>
        </div>

        <!-- 设置用药提醒 -->
        <div class="pt-4 border-t border-md-surface-variant">
          <div class="flex items-center mb-3">
            <input 
              type="checkbox" 
              id="create-reminder" 
              v-model="createReminder"
              class="mr-2"
            >
            <label for="create-reminder" class="text-md font-medium">同时创建用药提醒</label>
          </div>

          <div v-if="createReminder" class="grid md:grid-cols-2 gap-4 pl-6 border-l-2 border-md-primary">
            <!-- 提醒频率 -->
            <div>
              <label class="block text-sm font-medium mb-1">提醒频率</label>
              <select 
                v-model="reminderForm.frequency"
                class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
              >
                <option value="once">仅一次</option>
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
                <option value="custom">自定义</option>
              </select>
            </div>
            
            <div></div> <!-- 占位，保持布局平衡 -->

            <template v-if="reminderForm.frequency === 'daily'">
              <!-- 每日频率 -->
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
                <label class="block text-sm font-medium mb-1">用药时间</label>
                <div class="flex flex-wrap gap-2">
                  <div v-for="(time, index) in reminderTimeSlots" :key="index" class="flex gap-2 items-center">
                    <input 
                      type="time" 
                      v-model="reminderTimeSlots[index]" 
                      class="px-2 py-1 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
                    >
                  </div>
                </div>
              </div>
            </template>

            <template v-if="reminderForm.frequency === 'weekly'">
              <!-- 每周频率 -->
              <div>
                <label class="block text-sm font-medium mb-1">每周几</label>
                <div class="grid grid-cols-7 gap-2">
                  <button 
                    v-for="day in 7"
                    :key="day"
                    type="button"
                    :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                      weeklyDays.includes(day)
                        ? 'bg-md-primary text-md-on-primary'
                        : 'bg-md-surface text-md-on-surface border border-md-surface-variant'
                    ]"
                    @click="toggleWeekDay(day)"
                  >
                    {{ getWeekDayLabel(day) }}
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">提醒时间</label>
                <input 
                  type="time"
                  v-model="weeklyTime"
                  class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
                >
              </div>
            </template>

            <template v-if="reminderForm.frequency === 'monthly'">
              <!-- 每月频率 -->
              <div>
                <label class="block text-sm font-medium mb-1">每月几号</label>
                <select 
                  v-model.number="monthlyDay"
                  class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
                >
                  <option v-for="d in 31" :key="d" :value="d">{{ d }}号</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">提醒时间</label>
                <input 
                  type="time"
                  v-model="monthlyTime"
                  class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
                >
              </div>
            </template>

            <template v-if="reminderForm.frequency === 'once' || reminderForm.frequency === 'custom'">
              <!-- 单次提醒时间 -->
              <div>
                <label class="block text-sm font-medium mb-1">提醒时间</label>
                <input 
                  v-model="reminderForm.reminderTime"
                  type="datetime-local"
                  class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
                >
              </div>
            </template>

            <!-- 服用剂量 -->
            <div>
              <label class="block text-sm font-medium mb-1">服用剂量 *</label>
              <div class="flex gap-2">
                <input 
                  v-model="reminderDosage" 
                  type="number"
                  required
                  min="0.5"
                  step="0.5"
                  class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
                >
                <span class="flex items-center px-2 w-24 border border-md-surface-variant rounded-md-sm bg-gray-50">{{ form.quantityUnit }}</span>
              </div>
            </div>

            <!-- 提醒备注 -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1">备注</label>
              <textarea 
                v-model="reminderForm.description"
                rows="2"
                class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
                placeholder="用药提醒的备注信息"
              ></textarea>
            </div>
          </div>
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
import type { Medicine } from '~/types'
import { useNotification } from '~/composables/useNotification'
import useReminderFrequency from '~/composables/useReminderFrequency'
import { toLocalISOStringForInput, toLocalDateString } from '~/utils/localTime'

const props = defineProps<{
  isOpen: boolean
  medicine?: Medicine | null
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const isEdit = computed(() => !!props.medicine)
const loading = ref(false)
const createReminder = ref(false)

// 控制类型选项
const controlTypeOptions = [
  { value: '甲类非处方药', label: '甲类非处方药' },
  { value: '乙类非处方药', label: '乙类非处方药' },
  { value: '处方药', label: '处方药' },
  { value: '第一类精神药品', label: '第一类精神药品' },
  { value: '第二类精神药品', label: '第二类精神药品' },
  { value: '其他', label: '其他' }
]
const selectedControlTypes = ref<string[]>([])

// 提醒相关
const dailyTimes = ref('1')
const reminderTimeSlots = ref<string[]>(['08:00'])
const reminderDosage = ref(1) // 提醒的服用剂量
const reminderForm = ref({
  frequency: 'once',
  reminderTime: toLocalISOStringForInput(new Date()),
  description: ''
})

// 每周/每月相关
const weeklyDays = ref<number[]>([1])
const weeklyTime = ref('08:00')
const monthlyDay = ref(1)
const monthlyTime = ref('08:00')

// 使用提醒频率处理composable
const { 
  getWeekDayLabel, 
  validateReminderData, 
  handleDailyTimesChange, 
  toggleWeekDay: toggleWeekDayFn,
  createReminderData: createReminderDataFromComposable
} = useReminderFrequency()

// 监听每日次数变化，自动调整时间槽数量
watch(dailyTimes, (newVal) => {
  handleDailyTimesChange(newVal, reminderTimeSlots)
}, { immediate: true })

const form = ref({
  name: '',
  brand: '',
  category: '',
  controlTypes: '',
  dosage: '',
  dosageUnit: 'mg',
  quantity: 0,
  quantityUnit: '片',
  indications: '',
  usage: '',
  expiryDate: '',
  location: '',
  approvalNo: '',
  notes: ''
})

// 当 medicine prop 变化时更新表单
watch(() => props.medicine, (medicine) => {
  if (medicine) {
    form.value = {
      name: medicine.name,
      brand: medicine.brand || '',
      category: medicine.category || '',
      controlTypes: medicine.controlTypes || '',
      dosage: medicine.dosage || '',
      dosageUnit: medicine.dosageUnit || 'mg',
      quantity: medicine.quantity,
      quantityUnit: medicine.quantityUnit || '盒',
      indications: medicine.indications || '',
      usage: medicine.usage || '',
      expiryDate: toLocalDateString(new Date(medicine.expiryDate)),
      location: medicine.location || '',
      approvalNo: medicine.approvalNo || '',
      notes: medicine.notes || ''
    }
    
    // 处理控制类型
    selectedControlTypes.value = medicine.controlTypes ? medicine.controlTypes.split(',') : []
  } else {
    // 重置表单
    form.value = {
      name: '',
      brand: '',
      category: '',
      controlTypes: '',
      dosage: '',
      dosageUnit: 'mg',
      quantity: 14,
      quantityUnit: '片',
      indications: '',
      usage: '',
      expiryDate: '',
      location: '',
      approvalNo: '',
      notes: ''
    }
    selectedControlTypes.value = []
    createReminder.value = false
    reminderForm.value = {
      frequency: 'once',
      reminderTime: toLocalISOStringForInput(new Date()),
      description: ''
    }
    dailyTimes.value = '1'
    reminderTimeSlots.value = ['08:00']
  }
}, { immediate: true })

const closeModal = () => {
  emit('close')
}

// 在提交前处理数据
const prepareFormData = () => {
  // 处理控制类型，将数组转为逗号分隔的字符串
  const formData = { ...form.value }
  formData.controlTypes = selectedControlTypes.value.join(',')
  return formData
}

// 创建提醒数据
const createReminderData = (medicineId: string) => {
  // 使用共享composable创建提醒数据
  const reminderData = {
    frequency: reminderForm.value.frequency,
    reminderTime: reminderForm.value.reminderTime,
    dailyTimes: dailyTimes.value,
    reminderTimeSlots: reminderTimeSlots.value,
    weeklyDays: weeklyDays.value,
    weeklyTime: weeklyTime.value,
    monthlyDay: monthlyDay.value,
    monthlyTime: monthlyTime.value,
    dosageAmount: reminderDosage.value,
    userDescription: reminderForm.value.description
  }
  
  return createReminderDataFromComposable(medicineId, form.value.name, reminderData)
}

// 使用 composable 中的 toggleWeekDay 方法
const toggleWeekDay = (day: number) => {
  toggleWeekDayFn(day, weeklyDays)
}

const handleSubmit = async () => {
  // 检查是否至少选择了一个管制分类
  if (selectedControlTypes.value.length === 0) {
    const { error: showError } = useNotification()
    showError('请至少选择一个管制分类')
    return
  }
  
  // 验证用药提醒表单
  if (createReminder.value) {
    // 使用通用验证函数验证提醒数据
    const reminderData = {
      frequency: reminderForm.value.frequency,
      reminderTime: reminderForm.value.reminderTime,
      dailyTimes: dailyTimes.value,
      reminderTimeSlots: reminderTimeSlots.value,
      weeklyDays: weeklyDays.value,
      weeklyTime: weeklyTime.value,
      monthlyDay: monthlyDay.value,
      monthlyTime: monthlyTime.value,
      dosageAmount: reminderDosage.value,
      userDescription: reminderForm.value.description
    }
    
    // 验证数据
    const validationResult = validateReminderData(reminderData)
    if (!validationResult.valid) {
      const { error: showError } = useNotification()
      showError(validationResult.message || '提醒数据无效')
      return
    }
  }

  loading.value = true
  try {
    const url = isEdit.value ? `/api/medicines/${props.medicine!.id}` : '/api/medicines'
    const method = isEdit.value ? 'PUT' : 'POST'
    
    const formData = prepareFormData()
    
    const response = await $fetch(url, {
      method,
      body: formData
    })

    if ((response as any).success) {
      // 如果选择了创建提醒且新增药品成功
      if (createReminder.value && (response as any).data && (response as any).data.id) {
        const medicineId = (response as any).data.id
        const reminderDataArray = createReminderData(medicineId)
        
        // 批量创建提醒
        for (const reminder of reminderDataArray) {
          await $fetch('/api/reminders', {
            method: 'POST',
            body: reminder
          })
        }
        
        const { success } = useNotification()
        success(isEdit.value ? '药品更新成功并创建了提醒' : '药品添加成功并创建了提醒')
      } else {
        // 显示成功提示
        const { success } = useNotification()
        success(isEdit.value ? '药品更新成功' : '药品添加成功')
      }
      
      emit('success')
      closeModal()
    }
  } catch (error) {
    console.error('Error saving medicine:', error)
    // 使用Material Design风格的通知替代alert
    const { error: showError } = useNotification()
    showError('保存失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>
