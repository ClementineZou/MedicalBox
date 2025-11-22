<template>
  <div class="w-full h-64">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { computed } from 'vue'
import type { VitalSign, VitalSignReferenceRange } from '~/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps<{
  data: VitalSign[]
  referenceRange?: VitalSignReferenceRange
  type: string
}>()

const chartData = computed(() => {
  // Sort data by date ascending
  const sortedData = [...props.data].sort((a, b) => 
    new Date(a.measureTime).getTime() - new Date(b.measureTime).getTime()
  )

  const labels = sortedData.map(d => {
    const date = new Date(d.measureTime)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  })

  const values = sortedData.map(d => d.value)
  
  const datasets: any[] = []

  if (props.type === 'bloodPressure') {
    // Blood Pressure: Systolic and Diastolic
    datasets.push({
      label: '收缩压',
      backgroundColor: '#ef4444', // red-500
      borderColor: '#ef4444',
      data: sortedData.map(d => d.systolic || d.value), // Fallback to value if systolic missing
      fill: false,
      tension: 0.1
    })
    datasets.push({
      label: '舒张压',
      backgroundColor: '#3b82f6', // blue-500
      borderColor: '#3b82f6',
      data: sortedData.map(d => d.diastolic),
      fill: false,
      tension: 0.1
    })
  } else {
    // Other vital signs
    const labelMap: Record<string, string> = {
      height: '身高',
      weight: '体重',
      temperature: '体温',
      heartRate: '心率',
      bloodOxygen: '血氧',
      bloodGlucose: '血糖'
    }

    datasets.push({
      label: labelMap[props.type] || props.referenceRange?.description || '数值',
      backgroundColor: '#0ea5e9',
      borderColor: '#0ea5e9',
      data: values,
      fill: false,
      tension: 0.1
    })
  }

  // Add reference range bands if available
  if (props.type === 'bloodPressure') {
    // Blood Pressure specific ranges
    // Systolic Range (Greenish)
    const sysMin = props.referenceRange?.minValue || 90
    const sysMax = props.referenceRange?.maxValue || 120 // Default systolic max if not provided
    
    datasets.push({
      label: '收缩压正常上限',
      data: labels.map(() => sysMax),
      borderColor: 'rgba(239, 68, 68, 0.3)', // red-500 low opacity
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false,
      order: 2
    })
    datasets.push({
      label: '收缩压正常下限',
      data: labels.map(() => sysMin),
      borderColor: 'rgba(239, 68, 68, 0.3)',
      borderDash: [5, 5],
      pointRadius: 0,
      fill: '-1',
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      order: 2
    })

    // Diastolic Range (Blueish)
    // Hardcoded standard diastolic range as it's not in the single-range model
    const diaMin = 60
    const diaMax = 80
    
    datasets.push({
      label: '舒张压正常上限',
      data: labels.map(() => diaMax),
      borderColor: 'rgba(59, 130, 246, 0.3)', // blue-500 low opacity
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false,
      order: 2
    })
    datasets.push({
      label: '舒张压正常下限',
      data: labels.map(() => diaMin),
      borderColor: 'rgba(59, 130, 246, 0.3)',
      borderDash: [5, 5],
      pointRadius: 0,
      fill: '-1',
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
      order: 2
    })

  } else if (props.referenceRange) {
    // Standard single range for other types
    // Max line
    datasets.push({
      label: '正常上限',
      data: labels.map(() => props.referenceRange?.maxValue),
      borderColor: 'rgba(74, 222, 128, 0.5)', // green-400
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false,
      order: 1
    })

    // Min line
    datasets.push({
      label: '正常下限',
      data: labels.map(() => props.referenceRange?.minValue),
      borderColor: 'rgba(74, 222, 128, 0.5)', // green-400
      borderDash: [5, 5],
      pointRadius: 0,
      fill: '-1', // Fill to the previous dataset (Max line)
      backgroundColor: 'rgba(74, 222, 128, 0.1)',
      order: 1
    })
  }

  return {
    labels,
    datasets
  }
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: true
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + (props.data[0]?.unit || '');
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: props.data[0]?.unit || ''
        }
      }
    }
  } as any
})
</script>
