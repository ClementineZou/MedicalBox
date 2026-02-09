<template>
  <div class="emergency-card bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-2 border-red-500">
    <!-- Header -->
    <div class="print-header-group">
      <div class="bg-red-600 text-white px-6 py-4 flex justify-between items-center print:bg-red-600 print:text-white print-color-adjust-exact">
        <h2 class="text-2xl font-bold flex items-center">
          <span class="material-icons-outlined mr-2">medical_services</span>
          医疗急救卡 / Emergency Card
        </h2>
        <div class="text-sm opacity-90">MedicalBox ID</div>
      </div>
    </div>

    <div class="print-body-group">
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 print:block print:space-y-6">
        <!-- 1. Personal Info -->
      <div class="space-y-4 md:col-span-2 print:col-span-2">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2 flex items-center">
            <span class="material-icons-outlined mr-2 text-red-500">person</span>
            基本信息 / Personal Info
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="text-xs text-gray-500 uppercase">姓名 Name</label>
            <div class="font-medium text-lg">{{ card.fullName || '-' }}</div>
          </div>
          <div>
            <label class="text-xs text-gray-500 uppercase">性别 Gender</label>
            <div class="font-medium text-lg">{{ getGenderLabel(card.gender) }}</div>
          </div>
          <div>
             <label class="text-xs text-gray-500 uppercase">出生日期 DOB</label>
             <div class="font-medium">{{ formatDate(card.birthDate) }}</div>
          </div>
           <div>
            <label class="text-xs text-gray-500 uppercase">血型 Blood Type</label>
            <div class="font-medium text-lg text-red-600 font-bold">{{ card.bloodType || 'Unknown' }}</div>
          </div>
          <div>
            <label class="text-xs text-gray-500 uppercase">国籍 Nationality</label>
            <div class="font-medium">{{ getNationalityLabel(card.nationality) }}</div>
          </div>
          <div>
            <label class="text-xs text-gray-500 uppercase">语言 Language</label>
            <div class="font-medium">{{ getLanguageLabel(card.primaryLanguage) }}</div>
          </div>
           <div>
            <label class="text-xs text-gray-500 uppercase">身高 Height</label>
            <div class="font-medium">{{ card.height ? card.height + ' cm' : '-' }}</div>
          </div>
           <div>
            <label class="text-xs text-gray-500 uppercase">体重 Weight</label>
            <div class="font-medium">{{ card.weight ? card.weight + ' kg' : '-' }}</div>
          </div>
           <div class="col-span-2">
            <label class="text-xs text-gray-500 uppercase">器官捐献 Donor</label>
            <div class="font-medium">{{ card.organDonor ? '是 / Yes' : '否 / No' }}</div>
          </div>
        </div>
      </div>

      <!-- 2. Emergency Contacts -->
      <div class="space-y-4 md:col-span-2 print:col-span-2">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2 flex items-center">
             <span class="material-icons-outlined mr-2 text-red-500">contact_phone</span>
            紧急联系人 / Contacts
        </h3>
        <div v-if="card.emergencyContacts?.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="(contact, idx) in card.emergencyContacts" :key="idx" class="bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-100 dark:border-gray-600">
                <div class="font-bold flex justify-between">
                    <span>{{ contact.name }} <span class="text-sm font-normal text-gray-500">({{ contact.relation }})</span></span>
                </div>
                <div class="text-lg font-mono">{{ contact.phone }}</div>
            </div>
        </div>
        <div v-else class="text-gray-400 italic">未填写 No Record</div>
      </div>

       <!-- 3. Allergies -->
       <div class="space-y-4 md:col-span-2 print:col-span-2">
         <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2 flex items-center">
             <span class="material-icons-outlined mr-2 text-red-500">warning</span>
            过敏史 / Allergies
        </h3>
        <ul v-if="card.allergies?.length > 0" class="list-disc list-inside text-red-600 font-medium grid grid-cols-1 sm:grid-cols-2 gap-1">
            <li v-for="(alg, idx) in card.allergies" :key="idx" class="pl-2">{{ alg }}</li>
        </ul>
        <div v-else-if="card.hasAllergies === false" class="text-gray-400 italic">无已知过敏史 / No Known Allergies</div>
        <div v-else class="text-gray-400 italic">无记录 / No Record</div>
      </div>

      <!-- 4. Medical History -->
      <div class="md:col-span-2 space-y-4 print:col-span-2">
         <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2 flex items-center">
             <span class="material-icons-outlined mr-2 text-red-500">history</span>
            既往病史 / Medical History (ICD-11)
        </h3>
        <ul v-if="card.medicalConditions?.length > 0" class="list-disc list-inside text-gray-800 dark:text-gray-200 space-y-1">
            <li v-for="(cond, idx) in card.medicalConditions" :key="idx" class="pl-2">
                <span class="font-medium">{{ cond.title }}</span>
                <span v-if="cond.code !== 'CUSTOM'" class="text-xs text-gray-500 ml-1">({{ cond.code }})</span>
            </li>
        </ul>
        <div v-else-if="card.hasMedicalConditions === false" class="text-gray-400 italic">无 / None</div>
        <div v-else class="text-gray-400 italic">无记录 / No Record</div>
      </div>

      <!-- 5. Surgical History -->
      <div class="md:col-span-2 space-y-4 print:col-span-2">
         <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2 flex items-center">
             <span class="material-icons-outlined mr-2 text-red-500">content_cut</span>
            既往手术史 / Surgical History
        </h3>
        <ul v-if="card.surgicalHistory?.length > 0" class="list-disc list-inside text-gray-800 dark:text-gray-200 space-y-1">
            <li v-for="(item, idx) in card.surgicalHistory" :key="idx" class="pl-2">
                <span class="font-medium inline-block">{{ item.title }}</span>
                <span v-if="item.date" class="text-sm text-gray-500 ml-2">({{ item.date }})</span>
                <div v-if="item.notes" class="text-xs text-gray-500 mt-0.5 ml-4 italic leading-tight text-gray-600">{{ item.notes }}</div>
            </li>
        </ul>
        <div v-else-if="card.hasSurgicalHistory === false" class="text-gray-400 italic">无 / None</div>
        <div v-else class="text-gray-400 italic">无记录 / No Record</div>
      </div>

      <!-- 6. Medications -->
      <div class="space-y-4 md:col-span-2 print:col-span-2">
         <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2 flex items-center">
             <span class="material-icons-outlined mr-2 text-red-500">medication</span>
            当前用药 / Current Medications
        </h3>
        <ul v-if="card.medications?.length > 0" class="list-disc list-inside grid grid-cols-1 sm:grid-cols-2 gap-1 text-gray-800 dark:text-gray-200">
            <li v-for="(med, idx) in card.medications" :key="idx" class="pl-2">
                <template v-if="typeof med === 'string'">{{ med }}</template>
                <template v-else>
                    <span class="font-medium">{{ med.name }}</span>
                    <span v-if="med.dosage" class="text-sm text-gray-600 dark:text-gray-400 ml-1">({{ med.dosage }})</span>
                    <span v-if="med.notes" class="text-xs text-gray-500 ml-1 italic">- {{ med.notes }}</span>
                </template>
            </li>
        </ul>
        <div v-else-if="card.hasMedications === false" class="text-gray-400 italic">无 / None</div>
        <div v-else class="text-gray-400 italic">无记录 / No Record</div>
      </div>

      <!-- 7. Insurance Info -->
      <div class="space-y-4 md:col-span-2 print:col-span-2 break-inside-avoid">
         <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2 flex items-center">
             <span class="material-icons-outlined mr-2 text-red-500">policy</span>
            商业保险信息 / Insurance Info
        </h3>
        <div v-if="card.hasInsurance">
             <!-- New List View -->
             <div v-if="card.insurancePolicies && card.insurancePolicies.length > 0" class="space-y-3">
                <div v-for="(policy, idx) in card.insurancePolicies" :key="idx" class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pb-3 border-b last:border-0 border-dashed border-gray-200">
                     <div class="col-span-1 sm:col-span-2 font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                         <span class="bg-gray-100 text-gray-700 border border-gray-200 text-xs px-2 py-0.5 rounded">{{ getInsuranceTypeLabel(policy.type) }}</span>
                         {{ policy.provider }}
                     </div>
                     <div class="text-sm">
                        <span class="text-xs text-gray-500 uppercase mr-1">保单号码 / Policy No.</span>
                        <span class="font-mono font-medium">{{ policy.policyNumber || '-' }}</span>
                     </div>
                     <div class="text-sm">
                        <span class="text-xs text-gray-500 uppercase mr-1">联系电话 / Contact No.</span>
                        <span class="font-mono">{{ policy.phone || '-' }}</span>
                     </div>
                     <div v-if="policy.notes" class="col-span-1 sm:col-span-2 text-sm text-gray-500 italic mt-1">
                        <span class="not-italic text-gray-400 mr-1">备注 / Notes:</span>{{ policy.notes }}
                     </div>
                </div>
            </div>
            <!-- Backward Compatibility View -->
            <div v-else-if="card.insuranceProvider" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label class="text-xs text-gray-500 uppercase">保险公司 Provider</label>
                    <div class="font-medium">{{ card.insuranceProvider || '-' }}</div>
                 </div>
                 <div>
                    <label class="text-xs text-gray-500 uppercase">保单号码 Policy No.</label>
                    <div class="font-medium">{{ card.insurancePolicyNumber || '-' }}</div>
                 </div>
                 <div v-if="card.insurancePhone">
                    <label class="text-xs text-gray-500 uppercase">联系电话 Contact No.</label>
                    <div class="font-medium">{{ card.insurancePhone }}</div>
                 </div>
                  <div>
                    <label class="text-xs text-gray-500 uppercase">保险备注 Notes</label>
                    <div class="font-medium">{{ card.insuranceNotes || '-' }}</div>
                 </div>
            </div>
             <div v-else class="text-gray-400 italic">无记录 / No Record</div>
        </div>
        <div v-else class="text-gray-400 italic">无 / None</div>
      </div>
      
      <!-- 8. Notes -->
      <div v-if="card.notes" class="md:col-span-2 print:col-span-2 mt-4 pt-4 border-t border-dashed border-gray-300 break-inside-avoid">
          <p class="text-sm text-gray-600 italic">备注 / Notes: {{ card.notes }}</p>
      </div>

      <!-- Signature Line (Print Only) -->
      <div class="hidden print:block md:col-span-2 break-inside-avoid">
          <h3 class="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center mb-6">
             <span class="material-icons-outlined mr-2 text-red-500">verified_user</span>
             声明与签署 / Declaration & Signature
          </h3>
          <div class="flex justify-between items-end">
              <div class="text-sm text-gray-500">
                  <p>本人确认上述信息真实有效。</p>
                  <p>I confirm the above information is correct.</p>
              </div>
              <div class="text-right">
                  <div class="border-b border-black w-48 mb-2 flex justify-end items-end px-2 pb-1 font-mono">{{ new Date().toLocaleDateString() }}</div>
                  <p class="text-sm font-medium">签名 / Date & Signature</p>
              </div>
          </div>
      </div>

    </div>
    </div>
    
    <!-- Footer -->
    <div class="print-footer-group">
        <div class="bg-gray-100 dark:bg-gray-900 p-3 text-center text-xs text-gray-500 print:bg-white flex justify-between items-center px-6">
            <span>Created with MedicalBox</span>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { COUNTRIES, LANGUAGES } from '~/utils/cardOptions'

const props = defineProps<{
  card: any
}>()

const formatDate = (d: string) => {
    if(!d) return '-'
    return new Date(d).toLocaleDateString()
}

const getGenderLabel = (val: string) => {
    switch(val) {
        case 'Male': return '男 / Male'
        case 'Female': return '女 / Female'
        case 'Non-binary': return '非二元 / Non-binary'
        case 'Prefer not to say': return '不愿透露 / Prefer not to say'
        case 'Other': return '其他 / Other'
        default: return val || '-'
    }
}

const getNationalityLabel = (val: string) => {
    if (!val) return '-'
    const c = COUNTRIES.find(i => i.name === val)
    return c ? c.label : val
}

const getLanguageLabel = (val: string) => {
    if(!val) return '-'
    const l = LANGUAGES.find(i => i.name === val)
    return l ? `${l.name} / ${l.native}` : val
}

const getInsuranceTypeLabel = (val: string) => {
    switch(val) {
        case 'Medical': return '医疗 / Medical'
        case 'Accident': return '意外 / Accident'
        case 'Life': return '寿险 / Life'
        case 'Travel': return '旅行 / Travel'
        case 'Dental': return '牙科 / Dental'
        case 'Vision': return '视力 / Vision'
        case 'CriticalIllness': return '重疾 / Critical Illness'
        default: return '其他 / Other'
    }
}
</script>

<style scoped>
@media print {
    @page {
        size: A4 portrait;
        margin: 10mm;
    }
    
    .emergency-card {
        width: 100%;
        border: none;
        border-radius: 0;
        box-shadow: none;
        display: table;
        background-color: white !important;
    }

    .print-header-group {
        display: table-header-group;
    }

    .print-body-group {
        display: table-row-group;
    }

    .print-footer-group {
        display: table-footer-group;
    }

    .print-color-adjust-exact {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
}
</style>

<style>
@media print {
    html, body, #__nuxt {
        background-color: white !important;
        background: white !important;
    }
}
</style>
