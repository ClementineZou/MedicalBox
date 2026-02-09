<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/emergency-card" class="btn-icon">
        <span class="material-icons-outlined">arrow_back</span>
      </NuxtLink>
      <h1 class="text-2xl font-bold">编辑急救卡信息</h1>
    </div>

    <form @submit.prevent="saveCard" class="space-y-8">
      
      <!-- Basic Info -->
      <section class="card p-6 border-t-4 border-t-gray-200 dark:border-t-gray-700">
        <h2 class="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center">
            <span class="material-icons-outlined mr-2 text-gray-500">person</span>
            基本信息
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label class="form-label">姓名</label>
            <input v-model="form.fullName" type="text" class="form-input" required placeholder="您的真实姓名" />
          </div>
          <div class="form-group">
            <label class="form-label">出生日期</label>
            <input v-model="form.birthDate" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">血型</label>
            <select v-model="form.bloodType" class="form-input">
              <option value="">未选择</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="Unknown">不详</option>
            </select>
          </div>
          <div class="form-group flex items-center mt-6">
             <input v-model="form.organDonor" type="checkbox" class="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300" />
             <label class="ml-2 font-medium text-gray-700 dark:text-gray-300">我是器官捐献志愿者</label>
          </div>
        </div>
      </section>

      <!-- Medical Conditions with ICD-11 Search -->
      <section class="card p-6 border-t-4 border-t-red-400">
        <h2 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100 flex items-center">
            <span class="material-icons-outlined mr-2 text-red-500">history</span>
            既往病史 (ICD-11)
        </h2>
        <p class="text-sm text-gray-500 mb-6 ml-8">从中搜索添加，或直接输入自定义病史。</p>
        
        <div class="mb-4">
            <label class="form-label mb-2 block">添加新病史</label>
            <ICDSearch @select="addCondition" />
        </div>

         <div class="space-y-2">
            <div v-for="(cond, idx) in form.medicalConditions" :key="idx" class="flex items-center justify-between bg-red-50 dark:bg-red-900/10 p-3 rounded border border-red-100 dark:border-red-900/30">
                <div class="flex items-center">
                    <span class="material-icons-outlined text-red-400 mr-2 text-sm">circle</span>
                    <span class="font-medium text-gray-800 dark:text-gray-200">{{ cond.title }}</span>
                    <span v-if="cond.code !== 'CUSTOM'" class="text-xs text-gray-500 ml-2 bg-white dark:bg-gray-800 px-1 rounded border">ICD-11: {{ cond.code }}</span>
                </div>
                <button type="button" @click="removeCondition(idx)" class="text-gray-400 hover:text-red-500 transition-colors">
                    <span class="material-icons-outlined">delete</span>
                </button>
            </div>
             <p v-if="form.medicalConditions.length === 0" class="text-gray-400 italic text-sm text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded dashed-border">暂无记录</p>
         </div>
      </section>

      <!-- Allergies -->
      <section class="card p-6 border-t-4 border-t-orange-400">
        <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
            <span class="material-icons-outlined mr-2 text-orange-500">warning</span>
            过敏史
        </h2>
        <div class="flex gap-2 mb-4">
            <input v-model="newAllergy" type="text" placeholder="输入药物或食物过敏..." class="form-input flex-1" @keydown.enter.prevent="addAllergy" />
            <button type="button" @click="addAllergy" class="px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg font-medium transition-colors">添加</button>
        </div>
        <div class="flex flex-wrap gap-2">
             <span v-for="(alg, idx) in form.allergies" :key="idx" class="px-3 py-1.5 bg-orange-50 text-orange-800 border border-orange-200 rounded-full flex items-center gap-2 text-sm font-medium">
                 {{ alg }}
                 <button type="button" @click="removeAllergy(idx)" class="text-orange-600 hover:text-orange-900 flex items-center"><span class="material-icons-outlined text-sm">close</span></button>
             </span>
        </div>
      </section>
      
       <!-- Medications -->
      <section class="card p-6 border-t-4 border-t-blue-400">
        <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
            <span class="material-icons-outlined mr-2 text-blue-500">medication</span>
            正在使用的药物
        </h2>
         <div class="flex gap-2 mb-4">
            <input v-model="newMed" type="text" placeholder="输入药物名称..." class="form-input flex-1" @keydown.enter.prevent="addMed" />
            <button type="button" @click="addMed" class="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium transition-colors">添加</button>
        </div>
        <ul class="space-y-2">
            <li v-for="(med, idx) in form.medications" :key="idx" class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <span class="text-gray-800 dark:text-gray-200 font-medium">{{ med }}</span>
                 <button type="button" @click="removeMed(idx)" class="text-gray-400 hover:text-blue-600 transition-colors">
                    <span class="material-icons-outlined">close</span>
                </button>
            </li>
        </ul>
      </section>

      <!-- Emergency Contacts -->
      <section class="card p-6 border-t-4 border-t-green-400">
        <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
             <span class="material-icons-outlined mr-2 text-green-500">contact_phone</span>
            紧急联系人
        </h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
             <div class="form-group">
                <input v-model="newContact.name" placeholder="姓名" class="form-input" />
             </div>
             <div class="form-group">
                <input v-model="newContact.relation" placeholder="关系 (如: 父亲)" class="form-input" />
             </div>
             <div class="form-group">
                <input v-model="newContact.phone" placeholder="电话号码" class="form-input" />
             </div>
             <div class="sm:col-span-3 text-right">
                 <button type="button" @click="addContact" class="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-medium transition-colors shadow-sm">
                    添加联系人
                 </button>
             </div>
        </div>

        <div class="space-y-3">
            <div v-for="(contact, idx) in form.emergencyContacts" :key="idx" class="flex items-center justify-between bg-white dark:bg-gray-700 p-4 border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center gap-4">
                    <div class="bg-green-100 p-2 rounded-full text-green-600">
                        <span class="material-icons-outlined">phone_in_talk</span>
                    </div>
                    <div>
                        <div class="font-bold text-gray-900 dark:text-white">{{ contact.name }} <span class="text-sm font-normal text-gray-500">({{ contact.relation }})</span></div>
                        <div class="font-mono text-gray-600 dark:text-gray-300">{{ contact.phone }}</div>
                    </div>
                </div>
                 <button type="button" @click="removeContact(idx)" class="text-gray-400 hover:text-red-500 transition-colors p-2">
                    <span class="material-icons-outlined">delete</span>
                </button>
            </div>
        </div>
      </section>

      <!-- Notes -->
      <section class="card p-6 border-t-4 border-t-gray-400">
          <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
              <span class="material-icons-outlined mr-2 text-gray-500">edit_note</span>
              备注
          </h2>
          <textarea v-model="form.notes" rows="3" class="form-input" placeholder="其他需要注意的医疗事项..."></textarea>
      </section>

      <div class="flex justify-end gap-4 pb-8 sticky bottom-0 bg-gray-50 dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800 -mx-4 md:mx-0 z-10">
        <NuxtLink to="/emergency-card" class="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors">取消</NuxtLink>
        <button type="submit" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md transition-colors flex items-center" :disabled="saving">
            <span v-if="saving" class="material-icons-outlined animate-spin mr-2">refresh</span>
            保存急救卡
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
const { success, error } = useNotification()
const toast = {
    success,
    error
}

const form = reactive({
  fullName: '',
  birthDate: '',
  bloodType: '',
  organDonor: false,
  medicalConditions: [] as any[],
  allergies: [] as string[],
  medications: [] as string[],
  emergencyContacts: [] as any[],
  notes: ''
})

const newAllergy = ref('')
const newMed = ref('')
const newContact = reactive({ name: '', relation: '', phone: '' })
const saving = ref(false)

// Fetch existing data
const { data: existingCard } = await useFetch('/api/emergency-card')
if (existingCard.value && existingCard.value.fullName) {
    const d = existingCard.value as any
    form.fullName = d.fullName || ''
    form.birthDate = d.birthDate ? new Date(d.birthDate).toISOString().split('T')[0] : ''
    form.bloodType = d.bloodType || ''
    form.organDonor = d.organDonor || false
    form.medicalConditions = d.medicalConditions || []
    form.allergies = d.allergies || []
    form.medications = d.medications || []
    form.emergencyContacts = d.emergencyContacts || []
    form.notes = d.notes || ''
}

// Methods
const addCondition = (item: any) => {
    // Avoid duplicates
    if (!form.medicalConditions.some(c => c.title === item.title)) {
        form.medicalConditions.push(item)
    }
}
const removeCondition = (idx: number) => form.medicalConditions.splice(idx, 1)

const addAllergy = () => {
    if(newAllergy.value.trim()) {
        form.allergies.push(newAllergy.value.trim())
        newAllergy.value = ''
    }
}
const removeAllergy = (idx: number) => form.allergies.splice(idx, 1)

const addMed = () => {
     if(newMed.value.trim()) {
        form.medications.push(newMed.value.trim())
        newMed.value = ''
    }
}
const removeMed = (idx: number) => form.medications.splice(idx, 1)

const addContact = () => {
    if(newContact.name && newContact.phone) {
        form.emergencyContacts.push({ ...newContact })
        newContact.name = ''
        newContact.relation = ''
        newContact.phone = ''
    } else {
        toast.error('请至少填写姓名和电话')
    }
}
const removeContact = (idx: number) => form.emergencyContacts.splice(idx, 1)

const saveCard = async () => {
    saving.value = true
    try {
        await $fetch('/api/emergency-card', {
            method: 'POST',
            body: form
        })
        toast.success('急救卡已保存')
        navigateTo('/emergency-card')
    } catch (e) {
        toast.error('保存失败')
    } finally {
        saving.value = false
    }
}
</script>
