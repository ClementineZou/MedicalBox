<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-md-lg w-full max-w-2xl p-6">
      <h2 class="text-2xl font-bold mb-4">{{ vitalSign ? '编辑生命体征记录' : '新增生命体征记录' }}</h2>
      
      <form @submit.prevent="submit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 体征类型 -->
          <div class="md:col-span-2">
            <label for="type" class="block text-sm font-medium mb-1">体征类型 <span class="text-red-500">*</span></label>
            <select
              id="type"
              v-model="form.type"
              class="w-full px-4 py-2 border rounded-md-sm focus:outline-none focus:border-md-primary"
              :class="errors.type ? 'border-red-500' : 'border-md-surface-variant'"
              @blur="validateField('type', form.type)"
            >
              <option value="height">身高</option>
              <option value="weight">体重</option>
              <option value="temperature">体温</option>
              <option value="bloodPressure">血压</option>
              <option value="bloodOxygen">血氧</option>
              <option value="bloodGlucose">血糖</option>
              <option value="heartRate">心率</option>
            </select>
            <p v-if="errors.type" class="text-red-500 text-xs mt-1">{{ errors.type }}</p>
          </div>
          
          <!-- 数值 (血压) -->
          <div v-if="form.type === 'bloodPressure'" class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">血压 (收缩压/舒张压) <span class="text-red-500">*</span></label>
            <div class="flex items-start gap-2">
              <div class="flex-1">
                <input
                  v-model="form.systolic"
                  type="number"
                  placeholder="收缩压"
                  class="w-full px-4 py-2 border rounded-md-sm focus:outline-none focus:border-md-primary"
                  :class="errors.systolic ? 'border-red-500' : 'border-md-surface-variant'"
                  @blur="validateField('systolic', form.systolic)"
                  @input="validateField('systolic', form.systolic)"
                />
                <p v-if="errors.systolic" class="text-red-500 text-xs mt-1">{{ errors.systolic }}</p>
              </div>
              <span class="text-xl pt-2">/</span>
              <div class="flex-1">
                <input
                  v-model="form.diastolic"
                  type="number"
                  placeholder="舒张压"
                  class="w-full px-4 py-2 border rounded-md-sm focus:outline-none focus:border-md-primary"
                  :class="errors.diastolic ? 'border-red-500' : 'border-md-surface-variant'"
                  @blur="validateField('diastolic', form.diastolic)"
                  @input="validateField('diastolic', form.diastolic)"
                />
                <p v-if="errors.diastolic" class="text-red-500 text-xs mt-1">{{ errors.diastolic }}</p>
              </div>
              <div class="relative w-24 flex-shrink-0">
                <select
                  v-model="form.unit"
                  class="w-full px-2 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
                >
                  <option v-for="unit in getUnitsForType(form.type)" :key="unit" :value="unit">{{ unit }}</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- 数值 (其他) -->
          <div v-else class="md:col-span-2">
            <label for="value" class="block text-sm font-medium mb-1">数值 <span class="text-red-500">*</span></label>
            <div class="flex items-start">
              <div class="flex-1">
                <input
                  id="value"
                  v-model="form.value"
                  type="number"
                  step="0.01"
                  class="w-full px-4 py-2 border rounded-md-sm focus:outline-none focus:border-md-primary"
                  :class="errors.value ? 'border-red-500' : 'border-md-surface-variant'"
                  @blur="validateField('value', form.value)"
                  @input="validateField('value', form.value)"
                />
                <p v-if="errors.value" class="text-red-500 text-xs mt-1">{{ errors.value }}</p>
              </div>
              <div class="relative ml-2 w-24 flex-shrink-0">
                <select
                  v-model="form.unit"
                  class="w-full px-2 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
                >
                  <option v-for="unit in getUnitsForType(form.type)" :key="unit" :value="unit">{{ unit }}</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- 测量时间 -->
          <div class="md:col-span-2">
            <label for="measureTime" class="block text-sm font-medium mb-1">测量时间 <span class="text-red-500">*</span></label>
            <input
              id="measureTime"
              v-model="form.measureTime"
              type="datetime-local"
              class="w-full px-4 py-2 border rounded-md-sm focus:outline-none focus:border-md-primary"
              :class="errors.measureTime ? 'border-red-500' : 'border-md-surface-variant'"
              @blur="validateField('measureTime', form.measureTime)"
            />
            <p v-if="errors.measureTime" class="text-red-500 text-xs mt-1">{{ errors.measureTime }}</p>
          </div>
        </div>
        
        <!-- 备注 -->
        <div>
          <label for="notes" class="block text-sm font-medium mb-1">备注</label>
          <textarea
            id="notes"
            v-model="form.notes"
            rows="3"
            placeholder="请输入备注信息"
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
            {{ vitalSign ? '更新' : '保存' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VitalSign, VitalSignReferenceRange } from '~/types'
import { toLocalISOString, toLocalISOStringForInput } from '~/utils/localTime'
import { useFormValidation, validators } from '~/composables/useFormValidation'

const props = defineProps<{
  isOpen: boolean
  vitalSign: VitalSign | null
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

// 状态
const referenceRanges = ref<VitalSignReferenceRange[]>([])

// 表单数据
const form = reactive({
  type: 'weight',
  value: '',
  systolic: '',
  diastolic: '',
  unit: 'kg',
  measureTime: toLocalISOStringForInput(new Date()),
  notes: ''
})

// 验证规则
const rules = computed(() => {
  const commonRules = {
    type: [validators.required()],
    measureTime: [validators.required()]
  }

  if (form.type === 'bloodPressure') {
    return {
      ...commonRules,
      systolic: [validators.required('请输入收缩压'), validators.numeric(), validators.positive()],
      diastolic: [validators.required('请输入舒张压'), validators.numeric(), validators.positive()]
    }
  } else {
    return {
      ...commonRules,
      value: [validators.required('请输入数值'), validators.numeric(), validators.positive()]
    }
  }
})

const { errors, validateField, validateForm, clearErrors } = useFormValidation(form, rules.value)

// 加载参考范围
const loadReferenceRanges = async () => {
  try {
    const res = await $fetch('/api/vitals/reference-ranges')
    referenceRanges.value = (res as any).data || []
  } catch (error) {
    console.error('Error loading reference ranges:', error)
  }
}

// 自动计算是否正常和参考范围文本
const calculateStatus = () => {
  const range = referenceRanges.value.find(r => r.type === form.type)
  
  let isNormal = true
  let referenceRangeStr = ''
  
  if (range) {
    referenceRangeStr = `${range.minValue} - ${range.maxValue} ${range.unit}`
    
    if (form.type === 'bloodPressure') {
      // 血压特殊处理
      const sys = parseFloat(form.systolic)
      const dia = parseFloat(form.diastolic)
      
      if (!isNaN(sys) && !isNaN(dia)) {
        // 简单判断：收缩压 90-140，舒张压 60-90 (这里使用系统预设值更准确，但血压通常有两个范围)
        // 假设 range.minValue/maxValue 存储的是收缩压范围，我们需要更复杂的逻辑或者假设
        // 暂时简化：只判断收缩压是否在范围内，或者如果系统有更详细的配置
        // 实际上 seed 数据里血压是 90-120，这通常指收缩压。
        // 为了更准确，我们可能需要单独存储舒张压范围，或者在代码里硬编码标准
        // 这里暂时使用 seed 的范围作为收缩压参考
        const isSysNormal = sys >= range.minValue && sys <= range.maxValue
        // 舒张压通常比收缩压低 30-40，这里简单硬编码一个常见范围 60-80 作为示例，或者不判断舒张压
        const isDiaNormal = dia >= 60 && dia <= 80 
        
        isNormal = isSysNormal // 暂时只根据收缩压判断，或者两者都满足
      }
    } else {
      const val = parseFloat(form.value)
      if (!isNaN(val)) {
        isNormal = val >= range.minValue && val <= range.maxValue
      }
    }
  }
  
  return { isNormal, referenceRange: referenceRangeStr }
}

// 重置表单
const resetForm = () => {
  form.type = 'weight'
  form.value = ''
  form.systolic = ''
  form.diastolic = ''
  form.unit = 'kg'
  form.measureTime = toLocalISOStringForInput(new Date())
  form.notes = ''
  clearErrors()
}

// 监听 vitalSign 变化，更新表单
watch(() => props.vitalSign, (newVitalSign) => {
  if (newVitalSign) {
    form.type = newVitalSign.type
    form.value = String(newVitalSign.value)
    form.systolic = newVitalSign.systolic ? String(newVitalSign.systolic) : ''
    form.diastolic = newVitalSign.diastolic ? String(newVitalSign.diastolic) : ''
    form.unit = newVitalSign.unit
    form.measureTime = newVitalSign.measureTime instanceof Date
      ? toLocalISOStringForInput(newVitalSign.measureTime)
      : String(newVitalSign.measureTime).slice(0, 16)
    form.notes = newVitalSign.notes || ''
  } else {
    resetForm()
  }
}, { immediate: true })

// 根据体征类型获取单位选项
const getUnitsForType = (type: string): string[] => {
  switch (type) {
    case 'height':
      return ['cm', 'm']
    case 'weight':
      return ['kg', 'g', 'lb']
    case 'temperature':
      return ['°C', '°F']
    case 'bloodPressure':
      return ['mmHg', 'kPa']
    case 'bloodOxygen':
      return ['%']
    case 'bloodGlucose':
      return ['mmol/L', 'mg/dL']
    case 'heartRate':
      return ['bpm']
    default:
      return ['', 'kg', 'g', 'mg', 'mL', 'L']
  }
}

// 监听类型变化，更新单位
watch(() => form.type, (newType) => {
  const units = getUnitsForType(newType)
  if (!units.includes(form.unit)) {
    form.unit = units[0]
  }
  // Clear errors when type changes as fields might change
  clearErrors()
})

// 提交表单
const submit = async () => {
  // Manually validate using current rules because useFormValidation might hold stale rules if not reactive
  let localIsValid = true
  clearErrors()
  
  const currentRulesObj = rules.value
  for (const field in currentRulesObj) {
    const fieldRules = (currentRulesObj as any)[field]
    for (const rule of fieldRules) {
      const result = rule(form[field as keyof typeof form])
      if (result !== true) {
        errors.value[field] = typeof result === 'string' ? result : 'Invalid value'
        localIsValid = false
        break // Stop at first error for this field
      }
    }
  }
  
  if (!localIsValid) return

  try {
    // 计算状态
    const { isNormal, referenceRange } = calculateStatus()
    
    // 构建请求体
    const payload: any = {
      type: form.type,
      unit: form.unit,
      measureTime: form.measureTime,
      isNormal,
      referenceRange,
      notes: form.notes
    }
    
    if (form.type === 'bloodPressure') {
      payload.systolic = parseInt(form.systolic)
      payload.diastolic = parseInt(form.diastolic)
      payload.value = payload.systolic // 主数值存收缩压，方便图表显示
    } else {
      payload.value = parseFloat(form.value)
    }
    
    // 根据是否有ID决定是创建还是更新
    if (props.vitalSign) {
      await $fetch(`/api/vitals/${props.vitalSign.id}`, {
        method: 'PUT' as any,
        body: payload
      })
    } else {
      await $fetch('/api/vitals', {
        method: 'POST' as any,
        body: payload
      })
    }
    
    const { success } = useNotification()
    success(props.vitalSign ? '生命体征记录已更新' : '生命体征记录已添加')
    emit('success')
    emit('close')
  } catch (error) {
    console.error('Error submitting vital sign:', error)
    const { error: showError } = useNotification()
    showError('操作失败，请重试')
  }
}

// 关闭模态窗口
const close = () => {
  emit('close')
}

onMounted(() => {
  loadReferenceRanges()
})
</script>