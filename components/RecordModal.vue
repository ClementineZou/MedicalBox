<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-md-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
      <!-- Header -->
      <div class="bg-md-primary text-md-on-primary px-6 py-4 rounded-t-md-lg flex justify-between items-center">
        <h2 class="text-2xl font-bold">{{ isEdit ? '编辑用药记录' : '添加用药记录' }}</h2>
        <button @click="closeModal" class="text-md-on-primary hover:opacity-80">
          <span class="text-2xl">&times;</span>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- 选择药品 -->
        <div>
          <label class="block text-sm font-medium mb-1">选择药品 *</label>
          <select 
            v-model="form.medicineId"
            required
            class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
          >
            <option value="">请选择药品</option>
            <option v-for="medicine in medicines" :key="medicine.id" :value="medicine.id">
              {{ medicine.name }}
            </option>
          </select>
        </div>

        <div v-if="selectedMedicine" class="bg-md-surface-variant bg-opacity-30 p-3 rounded-md-sm">
          <p class="font-medium">{{ selectedMedicine.name }} {{ selectedMedicine.dosage }}{{ selectedMedicine.dosageUnit }}</p>
          <p class="text-sm text-gray-600">{{ selectedMedicine.brand }}</p>
          <p v-if="selectedMedicine.usage" class="text-sm mt-1">
            <span class="font-medium">用法用量：</span>{{ selectedMedicine.usage }}
          </p>
        </div>

        <!-- 服用剂量选择器 -->
        <div v-if="selectedMedicine">
          <label class="block text-sm font-medium mb-1">服用剂量 *</label>
          <div class="flex gap-2">
            <div class="flex-1 flex flex-wrap gap-2">
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
                {{ amount }}{{ selectedMedicine ? selectedMedicine.quantityUnit : '' }}
              </button>
            </div>
            <div class="flex">
              <input 
                v-model="dosageAmount"
                type="number"
                required
                min="0.5"
                step="0.5"
                class="w-20 px-3 py-2 border border-md-surface-variant rounded-l-md-sm focus:outline-none focus:border-md-primary"
                placeholder="数量"
              >
              <span 
                class="px-3 py-2 border border-l-0 border-md-surface-variant rounded-r-md-sm bg-gray-50 inline-flex items-center"
              >
                {{ selectedMedicine.quantityUnit }}
              </span>
            </div>
          </div>
        </div>

        <!-- 服用时间 -->
        <div>
          <label class="block text-sm font-medium mb-1">服用时间 *</label>
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              class="bg-md-primary text-md-on-primary px-3 py-2 rounded-md-sm"
              @click="setCurrentTime"
            >
              当前时间
            </button>
            <input 
              v-model="form.usageTime"
              type="datetime-local"
              required
              class="flex-1 px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            >
          </div>
        </div>

        <!-- 副作用记录 -->
        <div>
          <label class="block text-sm font-medium mb-1 flex items-center">
            <span>副作用记录 *</span>
            <button 
              type="button"
              @click="() => toggleSideEffectInput()"
              class="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
            >
              {{ showSideEffectInput ? '收起' : '展开' }}
            </button>
          </label>
          
          <div v-if="!showSideEffectInput" class="flex flex-wrap gap-2">
            <button 
              type="button" 
              class="bg-md-surface text-md-on-surface border border-md-surface-variant px-3 py-1 rounded-md-sm hover:bg-md-surface-variant"
              @click="form.sideEffectNotes = '无副作用'; toggleSideEffectInput(false)"
            >
              无副作用
            </button>
            <button 
              type="button" 
              class="bg-md-surface text-md-on-surface border border-md-surface-variant px-3 py-1 rounded-md-sm hover:bg-md-surface-variant"
              @click="form.sideEffectNotes = '轻微头晕'; toggleSideEffectInput(false)"
            >
              轻微头晕
            </button>
            <button 
              type="button" 
              class="bg-md-surface text-md-on-surface border border-md-surface-variant px-3 py-1 rounded-md-sm hover:bg-md-surface-variant"
              @click="form.sideEffectNotes = '轻微胃部不适'; toggleSideEffectInput(false)"
            >
              轻微胃部不适
            </button>
            <button 
              type="button" 
              class="bg-md-surface text-md-on-surface border border-md-surface-variant px-3 py-1 rounded-md-sm hover:bg-md-surface-variant"
              @click="form.sideEffectNotes = '嗜睡'; toggleSideEffectInput(false)"
            >
              嗜睡
            </button>
          </div>
          
          <textarea 
            v-if="showSideEffectInput"
            v-model="form.sideEffectNotes"
            rows="2"
            required
            class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary mt-1"
            placeholder="是否有副作用反应（必填）"
          ></textarea>
          
          <div v-else-if="form.sideEffectNotes" class="mt-1 px-3 py-2 bg-gray-50 rounded-md-sm text-sm">
            {{ form.sideEffectNotes }}
          </div>
        </div>

        <!-- 备注 -->
        <div>
          <label class="block text-sm font-medium mb-1">备注</label>
          <textarea 
            v-model="form.notes"
            rows="2"
            class="w-full px-4 py-2 border border-md-surface-variant rounded-md-sm focus:outline-none focus:border-md-primary"
            placeholder="其他备注信息"
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
import type { Medicine, MedicineUsageRecord } from '~/types'
import { useNotification } from '~/composables/useNotification'
import { toLocalISOString, toLocalISOStringForInput } from '~/utils/localTime'

const props = defineProps<{
  isOpen: boolean
  medicines: Medicine[]
  reminderId?: string
  record?: MedicineUsageRecord | null
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const loading = ref(false)
const showSideEffectInput = ref(false)

// 是否是编辑模式
const isEdit = computed(() => !!props.record)

// 剂量数量
const dosageAmount = ref(1)

// 剂量数量预设选项
const dosageValues = [0.5, 1, 2, 3, 5]

// 获取日期时间格式化工具
const { $getCurrentISOString } = useNuxtApp()

const form = ref({
  medicineId: '',
  dosage: '',
  usageTime: toLocalISOStringForInput(new Date()),
  notes: '',
  sideEffectNotes: '',
  reminderId: '',
  id: ''
})

// 监听props.reminderId变化
watch(() => props.reminderId, (id) => {
  if (id) {
    form.value.reminderId = id
    // 如果是从提醒创建的记录，自动设置当前时间
    setCurrentTime()
  }
}, { immediate: true })

// 监听props.record变化，加载记录数据
watch(() => props.record, (record) => {
  if (record) {
    form.value = {
      id: record.id,
      medicineId: record.medicineId,
      dosage: record.dosage || '',
      usageTime: toLocalISOStringForInput(new Date(record.usageTime)),
      notes: record.notes || '',
      sideEffectNotes: record.sideEffectNotes || '',
      reminderId: ''
    }
    
    // 从剂量字符串中提取数量
    if (record.dosage) {
      const match = record.dosage.match(/^([\d.]+)/)
      if (match && match[1]) {
        dosageAmount.value = parseFloat(match[1])
      }
    }
    
    // 如果有副作用记录，显示副作用输入框
    if (record.sideEffectNotes) {
      showSideEffectInput.value = true
    }
  }
}, { immediate: true })

// 选中的药品信息
const selectedMedicine = computed(() => {
  return props.medicines.find(m => m.id === form.value.medicineId)
})

// 当选择药品变化时，自动设置建议剂量
watch(() => form.value.medicineId, (medicineId) => {
  if (medicineId && selectedMedicine.value) {
    // 根据药品用法推荐剂量
    if (selectedMedicine.value.usage) {
      const usageText = selectedMedicine.value.usage.toLowerCase()
      if (usageText.includes('1片') || usageText.includes('一片')) {
        dosageAmount.value = 1
      } else if (usageText.includes('2片') || usageText.includes('两片')) {
        dosageAmount.value = 2
      } else if (usageText.includes('半片') || usageText.includes('1/2片')) {
        dosageAmount.value = 0.5
      } else {
        // 默认剂量
        dosageAmount.value = 1
      }
    } else {
      // 默认剂量为1
      dosageAmount.value = 1
    }
  }
})

const setCurrentTime = () => {
  form.value.usageTime = $getCurrentISOString()
}

const toggleSideEffectInput = (state?: boolean) => {
  if (state !== undefined) {
    showSideEffectInput.value = state
  } else {
    showSideEffectInput.value = !showSideEffectInput.value
  }
}

const closeModal = () => {
  emit('close')
  // 重置表单
  form.value = {
    medicineId: '',
    dosage: '',
    usageTime: $getCurrentISOString(),
    notes: '',
    sideEffectNotes: '',
    reminderId: '',
    id: ''
  }
  dosageAmount.value = 1
  showSideEffectInput.value = false
}

// 监听剂量值，自动更新表单中的剂量字符串
watch(dosageAmount, (amount) => {
  if (selectedMedicine.value && amount) {
    form.value.dosage = `${amount}${selectedMedicine.value.quantityUnit}`
  }
})

const handleSubmit = async () => {
  // 验证必填项
  if (!form.value.sideEffectNotes) {
    const { error: showError } = useNotification()
    showError('请填写副作用反应信息（无副作用也需填写）')
    return
  }
  
  loading.value = true
  try {
    // 确保剂量字符串已正确更新
    if (selectedMedicine.value) {
      form.value.dosage = `${dosageAmount.value}${selectedMedicine.value.quantityUnit}`
    }
    
    if (isEdit.value && form.value.id) {
      // 编辑现有记录
      await $fetch(`/api/records/${form.value.id}`, {
        method: 'PUT' as any,
        body: form.value
      })
    } else {
      // 创建新记录
      await $fetch('/api/records', {
        method: 'POST',
        body: form.value
      })

      // 如果是从提醒创建的记录，完成该提醒
      if (form.value.reminderId) {
        try {
          await $fetch(`/api/reminders/${form.value.reminderId}`, {
            method: 'PUT',
            body: {
              isCompleted: true
            }
          })
        } catch (error) {
          console.error('Error completing reminder:', error)
        }
      }
    }

    // 显示成功消息
    const { success } = useNotification()
    success(isEdit.value ? '用药记录已更新' : '用药记录已保存')
    
    emit('success')
    closeModal()
  } catch (error) {
    console.error('Error saving record:', error)
    // 使用Material Design风格的通知
    const { error: showError } = useNotification()
    showError('保存失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>
