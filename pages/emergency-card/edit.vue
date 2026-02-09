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
            基本信息 / Personal Info
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label class="form-label">姓名 Name</label>
            <input v-model="form.fullName" type="text" class="form-input" required placeholder="您的真实姓名 / Your Real Name" />
          </div>

          <div class="form-group">
                <label class="form-label">性别 Gender</label>
                <select v-model="form.gender" class="form-input">
                    <option value="">请选择 / Select</option>
                    <option value="Male">男 / Male</option>
                    <option value="Female">女 / Female</option>
                    <option value="Non-binary">非二元 / Non-binary</option>
                    <option value="Prefer not to say">不愿透露 / Prefer not to say</option>
                    <option value="Other">其他 / Other</option>
                </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">出生日期 DOB</label>
            <input v-model="form.birthDate" type="date" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">血型 Blood Type</label>
            <select v-model="form.bloodType" class="form-input">
              <option value="">请选择 / Select</option>
              <option v-for="bt in BLOOD_TYPES" :key="bt" :value="bt">{{ bt }}</option>
            </select>
          </div>

          <div class="form-group">
                <label class="form-label">国籍 Nationality</label>
                <select v-model="form.nationality" class="form-input">
                    <option value="">请选择 / Select</option>
                    <option v-for="c in COUNTRIES" :key="c.code" :value="c.name">{{ c.label }}</option>
                </select>
          </div>
          
          <div class="form-group">
                <label class="form-label">常用语言 Language</label>
                <select v-model="form.primaryLanguage" class="form-input">
                    <option value="">请选择 / Select</option>
                    <option v-for="l in LANGUAGES" :key="l.code" :value="l.name">{{ l.name }} / {{ l.native }}</option>
                </select>
          </div>

          <div class="form-group">
             <label class="form-label">身高 Height (cm)</label>
             <input v-model="form.height" type="number" step="0.1" class="form-input" />
          </div>
          
          <div class="form-group">
             <label class="form-label">体重 Weight (kg)</label>
             <input v-model="form.weight" type="number" step="0.1" class="form-input" />
          </div>
        </div>

        <div class="form-group flex items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
             <input v-model="form.organDonor" type="checkbox" class="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300" />
             <label class="ml-2 font-medium text-gray-700 dark:text-gray-300">我是器官捐献志愿者 / I am an organ donor</label>
        </div>
      </section>

      <!-- Emergency Contacts -->
      <section class="card p-6 border-t-4 border-t-green-400">
        <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
             <span class="material-icons-outlined mr-2 text-green-500">contact_phone</span>
            紧急联系人 / Contacts
        </h2>
        
        <div class="flex flex-col sm:flex-row gap-2 mb-4">
             <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                <input v-model="newContact.name" type="text" placeholder="姓名 / Name" class="form-input" />
                <input v-model="newContact.relation" type="text" placeholder="关系 / Relation" class="form-input" />
                <input v-model="newContact.phone" type="tel" placeholder="电话 / Phone" class="form-input" />
             </div>
             <button type="button" @click="addContact" class="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition-colors flex items-center justify-center sm:w-auto w-full" :class="{'bg-yellow-100 text-yellow-700 hover:bg-yellow-200': editingContactIndex > -1}">
                <span class="material-icons-outlined">{{ editingContactIndex > -1 ? 'save' : 'add' }}</span>
             </button>
        </div>

        <draggable v-model="form.emergencyContacts" item-key="phone" class="space-y-2" handle=".drag-handle" :animation="200">
            <template #item="{ element: contact, index: idx }">
                <li class="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30" :class="{'border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/30': editingContactIndex === idx}">
                    <div class="drag-handle cursor-move mr-2 text-gray-400 hover:text-gray-600 flex items-center">
                        <span class="material-icons-outlined">drag_indicator</span>
                    </div>
                    <div class="flex flex-col gap-0.5 mr-3">
                        <button type="button" @click="moveContactUp(idx)" class="w-6 h-6 flex items-center justify-center rounded hover:bg-green-200 text-green-400 hover:text-green-700 transition" :disabled="idx === 0" :class="{'opacity-25 cursor-not-allowed': idx === 0}"><span class="material-icons-outlined text-base">expand_less</span></button>
                        <button type="button" @click="moveContactDown(idx)" class="w-6 h-6 flex items-center justify-center rounded hover:bg-green-200 text-green-400 hover:text-green-700 transition" :disabled="idx === form.emergencyContacts.length - 1" :class="{'opacity-25 cursor-not-allowed': idx === form.emergencyContacts.length - 1}"><span class="material-icons-outlined text-base">expand_more</span></button>
                    </div>
                    <div class="flex-1">
                        <div class="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                             {{ contact.name }}
                             <span class="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">{{ contact.relation }}</span>
                        </div>
                        <div class="text-sm text-gray-500 mt-1 font-mono flex items-center">
                            <span class="material-icons-outlined text-xs mr-1">phone</span>
                            {{ contact.phone }}
                        </div>
                    </div>
                    <div class="flex items-center">
                        <button type="button" @click="editContact(idx)" class="p-2 text-gray-400 hover:text-yellow-600 transition-colors" title="编辑">
                            <span class="material-icons-outlined">edit</span>
                        </button>
                        <button type="button" @click="removeContact(idx)" class="p-2 text-gray-400 hover:text-red-500 transition-colors" title="删除">
                            <span class="material-icons-outlined">delete</span>
                        </button>
                    </div>
                </li>
            </template>
        </draggable>
      </section>

      <!-- Allergies -->
      <section class="card p-6 border-t-4 border-t-red-400">
        <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center justify-between">
            <div class="flex items-center">
                <span class="material-icons-outlined mr-2 text-red-500">warning</span>
                过敏史 / Allergies
            </div>
            <div class="flex items-center">
                 <input v-model="form.hasAllergies" type="checkbox" class="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300" />
                 <label class="ml-2 font-medium text-gray-700 dark:text-gray-300 text-sm">有 / Yes</label>
            </div>
        </h2>
        
        <div v-if="form.hasAllergies">
            <div class="flex gap-2 mb-4">
                <input v-model="newAllergy" type="text" placeholder="输入药物或食物过敏..." class="form-input flex-1" @keydown.enter.prevent="addAllergy" />
                <button type="button" @click="addAllergy" class="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors">添加</button>
            </div>
            <draggable v-model="form.allergies" item-key="" class="flex flex-wrap gap-2" :animation="200">
                <template #item="{ element, index }">
                    <span class="px-3 py-1.5 bg-red-50 text-red-800 border border-red-200 rounded-full flex items-center gap-2 text-sm font-medium cursor-move hover:bg-red-100 transition-colors">
                        {{ element }}
                        <button type="button" @click="removeAllergy(index)" class="text-red-600 hover:text-red-900 flex items-center"><span class="material-icons-outlined text-sm">close</span></button>
                    </span>
                </template>
            </draggable>
        </div>
        <div v-else class="text-gray-500 italic text-sm">无已知过敏史 / No Known Allergies</div>
      </section>

      <!-- Medical Conditions -->
      <section class="card p-6 border-t-4 border-t-orange-400">
        <h2 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100 flex items-center justify-between">
            <div class="flex items-center">
                <span class="material-icons-outlined mr-2 text-red-500">history</span>
                既往病史 / Medical History (ICD-11)
            </div>
            <div class="flex items-center">
                 <input v-model="form.hasMedicalConditions" type="checkbox" class="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 border-gray-300" />
                 <label class="ml-2 font-medium text-gray-700 dark:text-gray-300 text-sm">有 / Yes</label>
            </div>
        </h2>
        
        <div v-if="form.hasMedicalConditions">
            <p class="text-sm text-gray-500 mb-6 ml-8">从中搜索添加，或直接输入自定义病史</p>
            
            <div class="mb-4">
                <label class="form-label mb-2 block">添加新病史</label>
                <ICDSearch @select="addCondition" />
            </div>

            <draggable v-model="form.medicalConditions" item-key="title" class="space-y-2" handle=".drag-handle" :animation="200">
              <template #item="{ element: cond, index: idx }">
                <div class="flex items-center bg-orange-50 dark:bg-orange-900/10 p-2 rounded border border-orange-100 dark:border-orange-900/30 group">
                    <div class="drag-handle cursor-move mr-2 text-gray-400 hover:text-gray-600 flex items-center">
                        <span class="material-icons-outlined">drag_indicator</span>
                    </div>
                    <div class="flex flex-col gap-0.5 mr-3">
                        <button type="button" @click="moveConditionUp(idx)" class="w-6 h-6 flex items-center justify-center rounded hover:bg-orange-200 text-orange-400 hover:text-orange-700 transition" :disabled="idx === 0" :class="{'opacity-25 cursor-not-allowed': idx === 0}"><span class="material-icons-outlined text-base">expand_less</span></button>
                        <button type="button" @click="moveConditionDown(idx)" class="w-6 h-6 flex items-center justify-center rounded hover:bg-orange-200 text-orange-400 hover:text-orange-700 transition" :disabled="idx === form.medicalConditions.length - 1" :class="{'opacity-25 cursor-not-allowed': idx === form.medicalConditions.length - 1}"><span class="material-icons-outlined text-base">expand_more</span></button>
                    </div>
                    
                    <div class="flex-1">
                        <div class="font-medium text-gray-800 dark:text-gray-200 flex items-center">
                            {{ cond.title }}
                            <span v-if="cond.code !== 'CUSTOM'" class="text-xs text-gray-500 ml-2 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">ICD-11: {{ cond.code }}</span>
                        </div>
                    </div>

                    <button type="button" @click="removeCondition(idx)" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                        <span class="material-icons-outlined">delete</span>
                    </button>
                </div>
              </template>
            </draggable>
            <p v-if="form.medicalConditions.length === 0" class="text-gray-400 italic text-sm text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded dashed-border">暂无记录</p>
        </div>
        <div v-else class="text-gray-500 italic text-sm">无 / No</div>
      </section>

      <!-- Surgical History -->
      <section class="card p-6 border-t-4 border-t-purple-400">
        <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center justify-between">
            <div class="flex items-center">
                <span class="material-icons-outlined mr-2 text-purple-500">content_cut</span>
                既往手术史 / Surgical History
            </div>
            <div class="flex items-center">
                 <input v-model="form.hasSurgicalHistory" type="checkbox" class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300" />
                 <label class="ml-2 font-medium text-gray-700 dark:text-gray-300 text-sm">有 / Yes</label>
            </div>
        </h2>
        
        <div v-if="form.hasSurgicalHistory">
            <div class="flex gap-2 mb-4">
                <div class="flex-1 space-y-2">
                     <input v-model="newSurgical.title" type="text" placeholder="手术名称 / Name" class="form-input w-full" @keydown.enter.prevent="addSurgical" />
                     <div class="flex gap-2">
                        <input v-model="newSurgical.date" type="date" class="form-input w-40" />
                        <input v-model="newSurgical.notes" type="text" placeholder="备注 / Notes (Optional)" class="form-input flex-1" @keydown.enter.prevent="addSurgical" />
                     </div>
                </div>
                <button type="button" @click="addSurgical" class="px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-medium transition-colors flex items-center justify-center" :class="{'bg-yellow-100 text-yellow-700 hover:bg-yellow-200': editingSurgicalIndex > -1}">
                    <span class="material-icons-outlined">{{ editingSurgicalIndex > -1 ? 'save' : 'add' }}</span>
                </button>
            </div>
            <draggable v-model="form.surgicalHistory" item-key="title" class="space-y-2" handle=".drag-handle" :animation="200">
                <template #item="{ element: item, index: idx }">
                    <li class="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/30" :class="{'border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/30': editingSurgicalIndex === idx}">
                        <div class="drag-handle cursor-move mr-2 text-gray-400 hover:text-gray-600 flex items-center">
                            <span class="material-icons-outlined">drag_indicator</span>
                        </div>
                        <div class="flex flex-col gap-0.5 mr-3">
                            <button type="button" @click="moveSurgicalUp(idx)" class="w-6 h-6 flex items-center justify-center rounded hover:bg-purple-200 text-purple-400 hover:text-purple-700 transition" :disabled="idx === 0" :class="{'opacity-25 cursor-not-allowed': idx === 0}"><span class="material-icons-outlined text-base">expand_less</span></button>
                            <button type="button" @click="moveSurgicalDown(idx)" class="w-6 h-6 flex items-center justify-center rounded hover:bg-purple-200 text-purple-400 hover:text-purple-700 transition" :disabled="idx === form.surgicalHistory.length - 1" :class="{'opacity-25 cursor-not-allowed': idx === form.surgicalHistory.length - 1}"><span class="material-icons-outlined text-base">expand_more</span></button>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <span class="text-gray-800 dark:text-gray-200 font-medium">{{ item.title }}</span>
                                <span v-if="item.date" class="text-sm text-gray-500 bg-white dark:bg-gray-800 px-2 rounded border border-gray-200 dark:border-gray-700">{{ item.date }}</span>
                            </div>
                            <div v-if="item.notes" class="text-xs text-gray-500 mt-1">{{ item.notes }}</div>
                        </div>
                        <div class="flex items-center">
                            <button type="button" @click="editSurgical(idx)" class="p-2 text-gray-400 hover:text-yellow-600 transition-colors" title="编辑">
                                <span class="material-icons-outlined">edit</span>
                            </button>
                            <button type="button" @click="removeSurgical(idx)" class="p-2 text-gray-400 hover:text-red-500 transition-colors" title="删除">
                                <span class="material-icons-outlined">delete</span>
                            </button>
                        </div>
                    </li>
                </template>
            </draggable>
        </div>
        <div v-else class="text-gray-500 italic text-sm">无 / No</div>
      </section>

       <!-- Medications -->
      <section class="card p-6 border-t-4 border-t-blue-400">
        <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center justify-between">
            <div class="flex items-center">
                <span class="material-icons-outlined mr-2 text-blue-500">medication</span>
                当前用药 / Current Medications
            </div>
             <div class="flex items-center">
                 <input v-model="form.hasMedications" type="checkbox" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                 <label class="ml-2 font-medium text-gray-700 dark:text-gray-300 text-sm">有 / Yes</label>
            </div>
        </h2>
        
        <div v-if="form.hasMedications">
             <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 mb-4">
                <div class="sm:col-span-1 lg:col-span-5">
                    <input v-model="newMed.name" type="text" placeholder="药品名称 / Name" class="form-input" @keydown.enter.prevent="addMed" />
                </div>
                <div class="sm:col-span-1 lg:col-span-3">
                    <input v-model="newMed.dosage" type="text" placeholder="服用剂量 / Dosage" class="form-input" @keydown.enter.prevent="addMed" />
                </div>
                <div class="sm:col-span-2 lg:col-span-3">
                    <input v-model="newMed.notes" type="text" placeholder="备注 / Notes (Optional)" class="form-input" @keydown.enter.prevent="addMed" />
                </div>
                <div class="sm:col-span-2 lg:col-span-1">
                    <button type="button" @click="addMed" class="w-full px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium transition-colors flex items-center justify-center" :class="{'bg-yellow-100 text-yellow-700 hover:bg-yellow-200': editingMedIndex > -1}">
                        <span class="material-icons-outlined">{{ editingMedIndex > -1 ? 'save' : 'add' }}</span>
                    </button>
                </div>
            </div>
            <draggable v-model="form.medications" item-key="name" class="space-y-2" handle=".drag-handle" :animation="200">
                <template #item="{ element: med, index: idx }">
                    <li class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30" :class="{'border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/30': editingMedIndex === idx}">
                        <div class="drag-handle cursor-move mr-2 text-gray-400 hover:text-gray-600 flex items-center">
                            <span class="material-icons-outlined">drag_indicator</span>
                        </div>
                        <div class="flex flex-col gap-0.5 mr-3">
                            <button type="button" @click="moveMedUp(idx)" class="w-6 h-6 flex items-center justify-center rounded hover:bg-blue-200 text-blue-400 hover:text-blue-700 transition" :disabled="idx === 0" :class="{'opacity-25 cursor-not-allowed': idx === 0}"><span class="material-icons-outlined text-base">expand_less</span></button>
                            <button type="button" @click="moveMedDown(idx)" class="w-6 h-6 flex items-center justify-center rounded hover:bg-blue-200 text-blue-400 hover:text-blue-700 transition" :disabled="idx === form.medications.length - 1" :class="{'opacity-25 cursor-not-allowed': idx === form.medications.length - 1}"><span class="material-icons-outlined text-base">expand_more</span></button>
                        </div>
                        <div class="flex-1">
                            <div class="text-gray-900 dark:text-white font-medium">
                                {{ typeof med === 'string' ? med : med.name }}
                                <span v-if="typeof med !== 'string' && med.dosage" class="ml-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-0.5 rounded border">{{ med.dosage }}</span>
                            </div>
                            <div v-if="typeof med !== 'string' && med.notes" class="text-xs text-gray-500 mt-1">{{ med.notes }}</div>
                        </div>
                        <div class="flex items-center">
                            <button type="button" @click="editMed(idx)" class="p-2 text-gray-400 hover:text-yellow-600 transition-colors" title="编辑">
                                <span class="material-icons-outlined">edit</span>
                            </button>
                            <button type="button" @click="removeMed(idx)" class="p-2 text-gray-400 hover:text-red-500 transition-colors" title="删除">
                                <span class="material-icons-outlined">delete</span>
                            </button>
                        </div>
                    </li>
                </template>
            </draggable>
        </div>
        <div v-else class="text-gray-500 italic text-sm">无 / No</div>
      </section>

      <!-- Insurance Info -->
      <section class="card p-6 border-t-4 border-t-teal-400">
        <h2 class="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center justify-between">
            <div class="flex items-center">
                <span class="material-icons-outlined mr-2 text-teal-500">policy</span>
                商业保险信息 / Insurance Info
            </div>
             <div class="flex items-center">
                 <input v-model="form.hasInsurance" type="checkbox" class="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 border-gray-300" />
                 <label class="ml-2 font-medium text-gray-700 dark:text-gray-300 text-sm">有 / Yes</label>
            </div>
        </h2>
        
        <div v-if="form.hasInsurance">
            <div class="mb-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                 <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                     <!-- Row 1: Type -->
                     <div class="sm:col-span-2 form-group">
                        <label class="form-label text-xs font-semibold text-gray-500 mb-1 block">保险类型 / Type</label>
                        <select v-model="newInsurance.type" class="form-input w-full">
                            <option value="Medical">医疗 / Medical</option>
                            <option value="Accident">意外 / Accident</option>
                            <option value="Life">寿险 / Life</option>
                            <option value="Travel">旅行 / Travel</option>
                            <option value="Dental">牙科 / Dental</option>
                            <option value="Vision">眼科 / Vision</option>
                            <option value="Other">其他 / Other</option>
                        </select>
                     </div>
                     
                     <!-- Row 2: Provider & Policy No -->
                     <div class="form-group">
                        <label class="form-label text-xs font-semibold text-gray-500 mb-1 block">保险公司 / Provider</label>
                        <input v-model="newInsurance.provider" type="text" class="form-input w-full" />
                     </div>
                     <div class="form-group">
                        <label class="form-label text-xs font-semibold text-gray-500 mb-1 block">保单号码 / Policy No.</label>
                        <input v-model="newInsurance.policyNumber" type="text" class="form-input w-full" />
                     </div>

                     <!-- Row 3: Phone & Notes -->
                     <div class="form-group">
                        <label class="form-label text-xs font-semibold text-gray-500 mb-1 block">联系电话 / Contact No.</label>
                        <input v-model="newInsurance.phone" type="text" class="form-input w-full" />
                     </div>
                     <div class="form-group">
                        <label class="form-label text-xs font-semibold text-gray-500 mb-1 block">保险备注 / Notes</label>
                        <input v-model="newInsurance.notes" type="text" class="form-input w-full" @keydown.enter.prevent="addInsurance" />
                     </div>
                 </div>
                 
                 <div class="flex justify-end">
                     <button type="button" @click="addInsurance" class="px-5 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center shadow-sm" :class="{'bg-yellow-500 hover:bg-yellow-600 text-white': editingInsuranceIndex > -1}">
                        <span class="material-icons-outlined mr-1 text-base">{{ editingInsuranceIndex > -1 ? 'save' : 'add_circle' }}</span> 
                        {{ editingInsuranceIndex > -1 ? '保存 / Save' : '添加 / Add' }}
                     </button>
                 </div>
            </div>

            <draggable v-model="form.insurancePolicies" item-key="policyNumber" class="space-y-2" handle=".drag-handle" :animation="200">
                <template #item="{ element: item, index: idx }">
                    <li class="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/10 rounded-lg border border-teal-100 dark:border-teal-900/30" :class="{'border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/30': editingInsuranceIndex === idx}">
                        <div class="drag-handle cursor-move mr-2 text-gray-400 hover:text-gray-600 flex items-center">
                            <span class="material-icons-outlined">drag_indicator</span>
                        </div>
                        <div class="flex flex-col gap-0.5 mr-3">
                            <button type="button" @click="moveInsuranceUp(idx)" class="w-6 h-6 flex items-center justify-center rounded hover:bg-teal-200 text-teal-400 hover:text-teal-700 transition" :disabled="idx === 0" :class="{'opacity-25 cursor-not-allowed': idx === 0}"><span class="material-icons-outlined text-base">expand_less</span></button>
                            <button type="button" @click="moveInsuranceDown(idx)" class="w-6 h-6 flex items-center justify-center rounded hover:bg-teal-200 text-teal-400 hover:text-teal-700 transition" :disabled="idx === form.insurancePolicies.length - 1" :class="{'opacity-25 cursor-not-allowed': idx === form.insurancePolicies.length - 1}"><span class="material-icons-outlined text-base">expand_more</span></button>
                        </div>
                        <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                            <div class="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                <span class="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded">{{ item.type || 'Medical' }}</span>
                                {{ item.provider }}
                            </div>
                            <div class="text-sm font-mono text-gray-600 dark:text-gray-300">
                                <span class="text-gray-400 mr-1">Policy No.:</span> {{ item.policyNumber }}
                            </div>
                             <div class="text-sm text-gray-500 flex items-center">
                                 <span class="material-icons-outlined text-xs mr-1">phone</span> {{ item.phone || '-' }}
                             </div>
                             <div class="text-sm text-gray-500 italic truncate">
                                 <span class="not-italic text-gray-400 mr-1">Notes:</span>{{ item.notes || '-' }}
                             </div>
                        </div>
                        <div class="flex items-center ml-2">
                            <button type="button" @click="editInsurance(idx)" class="p-2 text-gray-400 hover:text-yellow-600 transition-colors" title="编辑">
                                <span class="material-icons-outlined">edit</span>
                            </button>
                            <button type="button" @click="removeInsurance(idx)" class="p-2 text-gray-400 hover:text-red-500 transition-colors" title="删除">
                                <span class="material-icons-outlined">delete</span>
                            </button>
                        </div>
                    </li>
                </template>
            </draggable>
        </div>
        <div v-else class="text-gray-500 italic text-sm">无 / No</div>
      </section>

      <!-- Notes -->
      <section class="card p-6 border-t-4 border-t-gray-400">
          <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
              <span class="material-icons-outlined mr-2 text-gray-500">edit_note</span>
              备注 / Notes
          </h2>
          <textarea v-model="form.notes" rows="3" class="form-input" placeholder="输入其他需要注意的医疗事项..."></textarea>
      </section>

      <div class="flex justify-end gap-4 pb-8 sticky bottom-0 bg-gray-50 dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800 -mx-4 md:mx-0 z-10">
        <NuxtLink to="/emergency-card" class="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors">取消 / Cancel</NuxtLink>
        <button type="submit" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md transition-colors flex items-center" :disabled="saving">
            <span v-if="saving" class="material-icons-outlined animate-spin mr-2">refresh</span>
            保存急救卡 / Save
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { COUNTRIES, LANGUAGES, BLOOD_TYPES } from '~/utils/cardOptions'
import draggable from 'vuedraggable'

useHead({
  title: '编辑急救卡'
})

const { success, error } = useNotification()
const toast = {
    success,
    error
}

const form = reactive({
  fullName: '',
  birthDate: '',
  gender: '',
  nationality: '',
  primaryLanguage: '',
  height: null as number | null,
  weight: null as number | null,
  bloodType: '',
  organDonor: false,
  insuranceProvider: '',
  insurancePolicyNumber: '',
  insurancePhone: '',
  insuranceNotes: '',
  insurancePolicies: [] as any[],
  medicalConditions: [] as any[],
  surgicalHistory: [] as any[],
  allergies: [] as string[],
  medications: [] as any[],
  emergencyContacts: [] as any[],
  notes: '',
  hasAllergies: true,
  hasMedicalConditions: true,
  hasSurgicalHistory: true,
  hasMedications: true,
  hasInsurance: true
})

const editingSurgicalIndex = ref(-1)
const editingMedIndex = ref(-1)
const editingContactIndex = ref(-1)
const editingInsuranceIndex = ref(-1)

const newAllergy = ref('')
const newMed = reactive({ name: '', dosage: '', notes: '' })
const newSurgical = reactive({ title: '', date: '', notes: '' })
const newContact = reactive({ name: '', relation: '', phone: '' })
const newInsurance = reactive({ provider: '', policyNumber: '', phone: '', notes: '', type: 'Medical' })
const saving = ref(false)

// Fetch existing data
const { data: existingCard } = await useFetch('/api/emergency-card')
if (existingCard.value && existingCard.value.fullName) {
    const d = existingCard.value as any
    form.fullName = d.fullName || ''
    form.birthDate = d.birthDate ? new Date(d.birthDate).toISOString().split('T')[0] : ''
    form.gender = d.gender || ''
    form.nationality = d.nationality || ''
    form.primaryLanguage = d.primaryLanguage || ''
    form.height = d.height || null
    form.weight = d.weight || null
    form.bloodType = d.bloodType || ''
    form.organDonor = d.organDonor || false
    form.insuranceProvider = d.insuranceProvider || ''
    form.insurancePolicyNumber = d.insurancePolicyNumber || ''
    form.insurancePhone = d.insurancePhone || ''
    form.insuranceNotes = d.insuranceNotes || ''
    form.insurancePolicies = d.insurancePolicies || []

    // Backwards compatibility: if no policies but old fields exist, create one
    if (form.insurancePolicies.length === 0 && (form.insuranceProvider || form.insurancePolicyNumber)) {
        form.insurancePolicies.push({
            provider: form.insuranceProvider,
            policyNumber: form.insurancePolicyNumber,
            phone: form.insurancePhone,
            notes: form.insuranceNotes,
            type: 'Medical' // Default
        })
    }
    
    form.medicalConditions = d.medicalConditions || []
    form.surgicalHistory = d.surgicalHistory || []
    form.allergies = d.allergies || []
    form.medications = d.medications || []
    form.emergencyContacts = d.emergencyContacts || []
    form.notes = d.notes || ''
    
    // Initialize "None" checkboxes
    form.hasAllergies = d.hasAllergies !== undefined ? d.hasAllergies : true
    form.hasMedicalConditions = d.hasMedicalConditions !== undefined ? d.hasMedicalConditions : true
    form.hasSurgicalHistory = d.hasSurgicalHistory !== undefined ? d.hasSurgicalHistory : true
    form.hasMedications = d.hasMedications !== undefined ? d.hasMedications : true
    form.hasInsurance = d.hasInsurance !== undefined ? d.hasInsurance : true
}

// Methods
const addCondition = (item: any) => {
    // Avoid duplicates
    if (!form.medicalConditions.some(c => c.title === item.title)) {
        form.medicalConditions.push(item)
    }
}
const removeCondition = (idx: number) => form.medicalConditions.splice(idx, 1)

// Sorting methods for medical conditions
const moveConditionUp = (idx: number) => {
  if (idx > 0) {
    const temp = form.medicalConditions[idx];
    form.medicalConditions[idx] = form.medicalConditions[idx - 1];
    form.medicalConditions[idx - 1] = temp;
  }
}

const moveConditionDown = (idx: number) => {
  if (idx < form.medicalConditions.length - 1) {
    const temp = form.medicalConditions[idx];
    form.medicalConditions[idx] = form.medicalConditions[idx + 1];
    form.medicalConditions[idx + 1] = temp;
  }
}

// Sorting methods for surgical history
const moveSurgicalUp = (idx: number) => {
  if (idx > 0) {
    const temp = form.surgicalHistory[idx];
    form.surgicalHistory[idx] = form.surgicalHistory[idx - 1];
    form.surgicalHistory[idx - 1] = temp;
  }
}

const moveSurgicalDown = (idx: number) => {
  if (idx < form.surgicalHistory.length - 1) {
    const temp = form.surgicalHistory[idx];
    form.surgicalHistory[idx] = form.surgicalHistory[idx + 1];
    form.surgicalHistory[idx + 1] = temp;
  }
}

// Sorting methods for medications
const moveMedUp = (idx: number) => {
  if (idx > 0) {
    const temp = form.medications[idx];
    form.medications[idx] = form.medications[idx - 1];
    form.medications[idx - 1] = temp;
  }
}

const moveMedDown = (idx: number) => {
  if (idx < form.medications.length - 1) {
    const temp = form.medications[idx];
    form.medications[idx] = form.medications[idx + 1];
    form.medications[idx + 1] = temp;
  }
}

// Sorting methods for emergency contacts
const moveContactUp = (idx: number) => {
  if (idx > 0) {
    const temp = form.emergencyContacts[idx];
    form.emergencyContacts[idx] = form.emergencyContacts[idx - 1];
    form.emergencyContacts[idx - 1] = temp;
  }
}

const moveContactDown = (idx: number) => {
  if (idx < form.emergencyContacts.length - 1) {
    const temp = form.emergencyContacts[idx];
    form.emergencyContacts[idx] = form.emergencyContacts[idx + 1];
    form.emergencyContacts[idx + 1] = temp;
  }
}

// Sorting methods for insurance
const moveInsuranceUp = (idx: number) => {
  if (idx > 0) {
    const temp = form.insurancePolicies[idx];
    form.insurancePolicies[idx] = form.insurancePolicies[idx - 1];
    form.insurancePolicies[idx - 1] = temp;
  }
}

const moveInsuranceDown = (idx: number) => {
  if (idx < form.insurancePolicies.length - 1) {
    const temp = form.insurancePolicies[idx];
    form.insurancePolicies[idx] = form.insurancePolicies[idx + 1];
    form.insurancePolicies[idx + 1] = temp;
  }
}

// Surgical History
const addSurgical = () => {
    if(newSurgical.title.trim()) {
        const item = { 
            title: newSurgical.title.trim(), 
            date: newSurgical.date.trim(),
            notes: newSurgical.notes.trim()
        }
        
        if (editingSurgicalIndex.value > -1) {
            form.surgicalHistory[editingSurgicalIndex.value] = item
            editingSurgicalIndex.value = -1
        } else {
            form.surgicalHistory.push(item)
        }
        
        newSurgical.title = ''
        newSurgical.date = ''
        newSurgical.notes = ''
    }
}

const editSurgical = (idx: number) => {
    const item = form.surgicalHistory[idx]
    newSurgical.title = item.title
    newSurgical.date = item.date
    newSurgical.notes = item.notes
    editingSurgicalIndex.value = idx
}

const removeSurgical = (idx: number) => {
    form.surgicalHistory.splice(idx, 1)
    if (editingSurgicalIndex.value === idx) {
        editingSurgicalIndex.value = -1
        newSurgical.title = ''
        newSurgical.date = ''
        newSurgical.notes = ''
    }
}

const addAllergy = () => {
    if(newAllergy.value.trim()) {
        form.allergies.push(newAllergy.value.trim())
        newAllergy.value = ''
    }
}
const removeAllergy = (idx: number) => form.allergies.splice(idx, 1)

const addMed = () => {
     if(newMed.name.trim()) {
        const item = {
            name: newMed.name.trim(),
            dosage: newMed.dosage.trim(),
            notes: newMed.notes.trim()
        }

        if (editingMedIndex.value > -1) {
            form.medications[editingMedIndex.value] = item
            editingMedIndex.value = -1
        } else {
            form.medications.push(item)
        }

        newMed.name = ''
        newMed.dosage = ''
        newMed.notes = ''
    }
}

const editMed = (idx: number) => {
    const item = form.medications[idx]
    newMed.name = typeof item === 'string' ? item : item.name
    newMed.dosage = typeof item === 'string' ? '' : item.dosage
    newMed.notes = typeof item === 'string' ? '' : item.notes
    editingMedIndex.value = idx
}

const removeMed = (idx: number) => {
    form.medications.splice(idx, 1)
    if (editingMedIndex.value === idx) {
        editingMedIndex.value = -1
        newMed.name = ''
        newMed.dosage = ''
        newMed.notes = ''
    }
}

const addContact = () => {
    if(newContact.name && newContact.phone) {
        const item = { ...newContact }
        
        if (editingContactIndex.value > -1) {
            form.emergencyContacts[editingContactIndex.value] = item
            editingContactIndex.value = -1
        } else {
            form.emergencyContacts.push(item)
        }

        newContact.name = ''
        newContact.relation = ''
        newContact.phone = ''
    } else {
        toast.error('请至少填写姓名和电话')
    }
}

const editContact = (idx: number) => {
    const item = form.emergencyContacts[idx]
    newContact.name = item.name
    newContact.relation = item.relation
    newContact.phone = item.phone
    editingContactIndex.value = idx
}

const removeContact = (idx: number) => {
    form.emergencyContacts.splice(idx, 1)
     if (editingContactIndex.value === idx) {
        editingContactIndex.value = -1
        newContact.name = ''
        newContact.relation = ''
        newContact.phone = ''
    }
}

const addInsurance = () => {
    if(newInsurance.provider || newInsurance.policyNumber) {
        const item = { ...newInsurance }
        
        if (editingInsuranceIndex.value > -1) {
            form.insurancePolicies[editingInsuranceIndex.value] = item
            editingInsuranceIndex.value = -1
        } else {
            form.insurancePolicies.push(item)
        }

        newInsurance.provider = ''
        newInsurance.policyNumber = ''
        newInsurance.phone = ''
        newInsurance.notes = ''
        newInsurance.type = 'Medical'
    } else {
        toast.error('请至少填写保险公司或保单号')
    }
}

const editInsurance = (idx: number) => {
    const item = form.insurancePolicies[idx]
    newInsurance.provider = item.provider
    newInsurance.policyNumber = item.policyNumber
    newInsurance.phone = item.phone
    newInsurance.notes = item.notes
    newInsurance.type = item.type || 'Medical'
    editingInsuranceIndex.value = idx
}

const removeInsurance = (idx: number) => {
    form.insurancePolicies.splice(idx, 1)
     if (editingInsuranceIndex.value === idx) {
        editingInsuranceIndex.value = -1
        newInsurance.provider = ''
        newInsurance.policyNumber = ''
        newInsurance.phone = ''
        newInsurance.notes = ''
        newInsurance.type = 'Medical'
    }
}

const saveCard = async () => {
    // Basic validation
    if (!form.fullName.trim()) {
        toast.error('请填写姓名 / Name is required')
        return
    }
    if (!form.gender) {
        toast.error('请选择性别 / Gender is required')
        return
    }
    if (!form.birthDate) {
        toast.error('请选择出生日期 / Date of Birth is required')
        return
    }
    if (!form.bloodType) {
         toast.error('请选择血型 / Blood Type is required')
         return
    }
    if (!form.nationality) {
         toast.error('请选择国籍 / Nationality is required')
         return
    }
    if (!form.primaryLanguage) {
         toast.error('请选择常用语言 / Primary Language is required')
         return
    }
    if (!form.height) {
         toast.error('请填写身高 / Height is required')
         return
    }
    if (!form.weight) {
        toast.error('请填写体重 / Weight is required')
        return
    }

    if (form.emergencyContacts.length === 0) {
        toast.error('请至少添加一个紧急联系人 / At least one emergency contact is required')
        return
    }

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
