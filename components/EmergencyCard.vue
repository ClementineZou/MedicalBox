<template>
  <div class="emergency-card bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-2 border-red-500">
    <!-- Header -->
    <div class="bg-red-600 text-white p-4 flex justify-between items-center print:bg-red-600 print:text-white print-color-adjust-exact">
      <h2 class="text-2xl font-bold flex items-center">
        <span class="material-icons-outlined mr-2">medical_services</span>
        医疗急救卡 / Emergency Card
      </h2>
      <div class="text-sm opacity-90">MedicalBox ID</div>
    </div>

    <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Personal Info -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2 flex items-center">
            <span class="material-icons-outlined mr-2 text-red-500">person</span>
            基本信息 / Personal Info
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-gray-500 uppercase">姓名 Name</label>
            <div class="font-medium text-lg">{{ card.fullName || '-' }}</div>
          </div>
          <div>
            <label class="text-xs text-gray-500 uppercase">血型 Blood Type</label>
            <div class="font-medium text-lg text-red-600 font-bold">{{ card.bloodType || 'Unknown' }}</div>
          </div>
          <div>
            <label class="text-xs text-gray-500 uppercase">出生日期 DOB</label>
            <div class="font-medium">{{ formatDate(card.birthDate) }}</div>
          </div>
           <div>
            <label class="text-xs text-gray-500 uppercase">器官捐献 Donor</label>
            <div class="font-medium">{{ card.organDonor ? 'Yes' : 'No' }}</div>
          </div>
        </div>
      </div>

      <!-- Emergency Contacts -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2 flex items-center">
             <span class="material-icons-outlined mr-2 text-red-500">contact_phone</span>
            紧急联系人 / Contacts
        </h3>
        <div v-if="card.emergencyContacts?.length > 0" class="space-y-2">
            <div v-for="(contact, idx) in card.emergencyContacts" :key="idx" class="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <div class="font-bold">{{ contact.name }} <span class="text-sm font-normal text-gray-500">({{ contact.relation }})</span></div>
                <div class="text-lg font-mono">{{ contact.phone }}</div>
            </div>
        </div>
        <div v-else class="text-gray-400 italic">未填写 No Record</div>
      </div>

      <!-- Medical Conditions -->
      <div class="md:col-span-2 space-y-4">
         <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2 flex items-center">
             <span class="material-icons-outlined mr-2 text-red-500">history</span>
            既往病史 / Medical History (ICD-11)
        </h3>
        <div v-if="card.medicalConditions?.length > 0" class="flex flex-wrap gap-2">
            <span 
                v-for="(cond, idx) in card.medicalConditions" 
                :key="idx" 
                class="px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full text-sm font-medium print:border-red-500"
            >
                {{ cond.title }} <span v-if="cond.code !== 'CUSTOM'" class="text-xs opacity-75">({{ cond.code }})</span>
            </span>
        </div>
        <div v-else class="text-gray-400 italic">无记录 No Record</div>
      </div>

       <!-- Allergies & Meds -->
       <div class="space-y-4">
         <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2 flex items-center">
             <span class="material-icons-outlined mr-2 text-red-500">warning</span>
            过敏史 / Allergies
        </h3>
        <ul v-if="card.allergies?.length > 0" class="list-disc list-inside text-red-600 font-medium">
            <li v-for="(alg, idx) in card.allergies" :key="idx">{{ alg }}</li>
        </ul>
        <div v-else class="text-gray-400 italic">无 Known Allergies: None</div>
      </div>

      <div class="space-y-4">
         <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2 flex items-center">
             <span class="material-icons-outlined mr-2 text-red-500">medication</span>
            当前用药 / Medications
        </h3>
        <ul v-if="card.medications?.length > 0" class="list-disc list-inside">
            <li v-for="(med, idx) in card.medications" :key="idx">{{ med }}</li>
        </ul>
        <div v-else class="text-gray-400 italic">无 None</div>
      </div>
      
      <!-- Notes -->
      <div v-if="card.notes" class="md:col-span-2 mt-4 pt-4 border-t border-dashed border-gray-300">
          <p class="text-sm text-gray-600 italic">备注/Notes: {{ card.notes }}</p>
      </div>

    </div>
    
    <!-- Footer -->
    <div class="bg-gray-100 dark:bg-gray-900 p-3 text-center text-xs text-gray-500 print:bg-white">
        Created with MedicalBox - Your Personal Health Assistant
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  card: any
}>()

const formatDate = (d: string) => {
    if(!d) return '-'
    return new Date(d).toLocaleDateString()
}
</script>

<style scoped>
@media print {
    .print-color-adjust-exact {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
}
</style>
