<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-md-lg w-full max-w-2xl p-6">
      <h2 class="text-2xl font-bold mb-4">{{ vitalSign ? '编辑生命体征记录' : '新增生命体征记录' }}</h2>
      
      <form @submit.prevent="submit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 体征类型 -->
          <div>
            <label for="type" class="block text-sm font-medium mb-1">体征类型 <span class="text-red-500">*</span></label>
            <select
              id="type"
              v-model="form.type"
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
          
          <!-- 数值 -->
          <div>
            <label for="value" class="block text-sm font-medium mb-1">数值 <span class="text-red-500">*</span></label>
            <div class="flex items-center">
              <input
                id="value"
                v-model="form.value"
                type="number"
                step="0.01"
                required
                class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
              />
              <div class="relative ml-2 w-24">
                <select
                  v-model="form.unit"
                  required
                  class="w-full px-2 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
                >
                  <option v-for="unit in getUnitsForType(form.type)" :key="unit" :value="unit">{{ unit }}</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- 测量时间 -->
          <div>
            <label for="measureTime" class="block text-sm font-medium mb-1">测量时间 <span class="text-red-500">*</span></label>
            <input
              id="measureTime"
              v-model="form.measureTime"
              type="datetime-local"
              required
              class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            />
          </div>
          
          <!-- 是否在正常范围内 -->
          <div>
            <label class="block text-sm font-medium mb-1">是否在正常范围内</label>
            <div class="flex items-center space-x-4 py-2">
              <div class="flex items-center">
                <input
                  id="normal-yes"
                  v-model="form.isNormal"
                  :value="true"
                  type="radio"
                  class="mr-2"
                />
                <label for="normal-yes">正常</label>
              </div>
              <div class="flex items-center">
                <input
                  id="normal-no"
                  v-model="form.isNormal"
                  :value="false"
                  type="radio"
                  class="mr-2"
                />
                <label for="normal-no">异常</label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 参考范围 -->
        <div>
          <label for="referenceRange" class="block text-sm font-medium mb-1">参考范围</label>
          <input
            id="referenceRange"
            v-model="form.referenceRange"
            type="text"
            placeholder="请输入参考范围，例如：97-99 mmHg"
            class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
          />
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
import type { VitalSign } from '~/types'
import { toLocalISOString, toLocalISOStringForInput } from '~/utils/localTime'

const props = defineProps<{
  isOpen: boolean
  vitalSign: VitalSign | null
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

// 表单数据
const form = reactive({
  type: 'weight',
  value: '',
  unit: 'kg',
  measureTime: toLocalISOStringForInput(new Date()),
  isNormal: true,
  referenceRange: '',
  notes: ''
})

// 重置表单
const resetForm = () => {
  form.type = 'weight'
  form.value = ''
  form.unit = 'kg'
  form.measureTime = toLocalISOStringForInput(new Date())
  form.isNormal = true
  form.referenceRange = ''
  form.notes = ''
}

// 监听 vitalSign 变化，更新表单
watch(() => props.vitalSign, (newVitalSign) => {
  if (newVitalSign) {
    form.type = newVitalSign.type
    form.value = String(newVitalSign.value)
    form.unit = newVitalSign.unit
    form.measureTime = newVitalSign.measureTime instanceof Date
      ? toLocalISOStringForInput(newVitalSign.measureTime)
      : String(newVitalSign.measureTime).slice(0, 16)
    form.isNormal = newVitalSign.isNormal
    form.referenceRange = newVitalSign.referenceRange || ''
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
})

// 提交表单
const submit = async () => {
  try {
    // 构建请求体
    const payload = {
      type: form.type,
      value: parseFloat(form.value),
      unit: form.unit,
      measureTime: form.measureTime,
      isNormal: form.isNormal,
      referenceRange: form.referenceRange,
      notes: form.notes
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
</script>