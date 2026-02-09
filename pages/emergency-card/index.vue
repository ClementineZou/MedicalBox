<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="flex justify-between items-center mb-8 no-print">
      <h1 class="text-3xl font-bold flex items-center">
        <span class="material-icons-outlined text-red-600 mr-2 text-4xl">emergency</span>
        医疗急救卡
      </h1>
      <div class="flex gap-4">
         <NuxtLink to="/emergency-card/edit" class="btn-secondary flex items-center">
          <span class="material-icons-outlined mr-2">edit</span>
          编辑
        </NuxtLink>
        <button @click="printCard" class="btn-primary flex items-center">
          <span class="material-icons-outlined mr-2">print</span>
          打印
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center py-12">
      <div class="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!card || !card.fullName" class="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow">
       <span class="material-icons-outlined text-gray-300 text-6xl mb-4">medical_information</span>
       <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">您还没有创建急救卡</h2>
       <p class="text-gray-500 mb-6">创建急救卡可以在紧急情况下帮助医护人员快速了解您的医疗状况。</p>
       <NuxtLink to="/emergency-card/edit" class="btn-primary inline-flex items-center">
          <span class="material-icons-outlined mr-2">add</span>
          立即创建
       </NuxtLink>
    </div>

    <!-- Card Display -->
    <div v-else class="print:m-0 print:p-0">
        <div class="mb-4 no-print text-sm text-gray-500 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg flex items-start">
            <span class="material-icons-outlined mr-2 text-blue-500">info</span>
            建议将此卡打印并随身携带，或保存为 PDF 存放在手机中。在紧急情况下，此卡片可能挽救您的生命。
        </div>

        <EmergencyCard :card="card" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: card, pending } = await useFetch('/api/emergency-card')

const printCard = () => {
  window.print()
}

// Add page meta for transitions etc
definePageMeta({
  title: '医疗急救卡'
})
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  .emergency-card, .emergency-card * {
    visibility: visible;
  }
  .emergency-card {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    box-shadow: none;
    border: 2px solid #000; /* High contrast border for print */
  }
  .no-print {
    display: none !important;
  }
}
</style>
