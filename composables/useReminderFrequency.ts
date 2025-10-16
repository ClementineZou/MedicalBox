// useReminderFrequency.ts
// 统一处理提醒频率的composable

import type { Ref } from 'vue'
import { toLocalISOString, createTodayWithTime } from '~/utils/localTime'

export interface ReminderFrequencyData {
  frequency: string            // 频率类型: once, daily, weekly, monthly, custom
  reminderTime?: string        // 单次提醒时间 (once/custom)
  dailyTimes?: string          // 每日几次 (daily)
  reminderTimeSlots?: string[] // 每日提醒时间槽 (daily)
  weeklyDays?: number[]        // 每周几 (weekly)
  weeklyTime?: string          // 每周提醒时间 (weekly)
  monthlyDay?: number          // 每月几号 (monthly)
  monthlyTime?: string         // 每月提醒时间 (monthly)
  dosageAmount?: number        // 服用剂量
  userDescription?: string     // 用户备注
}

export interface ValidationResult {
  valid: boolean
  message?: string
}

export default function useReminderFrequency() {
  // 获取周几标签
  const getWeekDayLabel = (day: number): string => {
    const labels = ['一','二','三','四','五','六','日']
    return labels[day - 1]
  }
  
  // 创建提醒数据
  const createReminderData = (
    medicineId: string,
    medicineName: string, 
    reminderData: ReminderFrequencyData
  ) => {
    const data: any[] = []
    const { 
      frequency, 
      reminderTime, 
      dailyTimes, 
      reminderTimeSlots, 
      weeklyDays, 
      weeklyTime, 
      monthlyDay, 
      monthlyTime, 
      dosageAmount, 
      userDescription 
    } = reminderData
    
    if (frequency === 'once' || frequency === 'custom') {
      // 单次提醒
      const metadata: any = {
        userDescription,
        autoCreateRecord: true,
        dosageAmount
      }
      
      data.push({
        medicineId,
        title: `服用${medicineName}`,
        description: JSON.stringify(metadata),
        reminderTime,
        frequency
      })
    } 
    else if (frequency === 'daily') {
      // 每日多次提醒
      if (!reminderTimeSlots || reminderTimeSlots.length === 0) return data
      
      for (const timeSlot of reminderTimeSlots) {
        // 构造日期时间
        const now = new Date()
        const [hours, minutes] = timeSlot.split(':').map(Number)
        now.setHours(hours, minutes, 0, 0)
        
        const metadata: any = {
          userDescription,
          autoCreateRecord: true,
          dosageAmount,
          times: reminderTimeSlots
        }

        data.push({
          medicineId,
          title: `服用${medicineName}`,
          description: JSON.stringify(metadata),
          reminderTime: toLocalISOString(now),
          frequency: 'daily'
        })
      }
    }
    else if (frequency === 'weekly') {
      // 每周提醒：按所选周几和时间生成
      if (!weeklyDays || weeklyDays.length === 0 || !weeklyTime) return data
      
      for (const day of weeklyDays) {
        // 计算下一个该周日子的日期
        const now = new Date()
        const dayOfWeek = now.getDay() || 7
        let target = day
        let daysToAdd = (target - dayOfWeek + 7) % 7
        if (daysToAdd === 0) daysToAdd = 0
        const reminderDate = new Date()
        reminderDate.setDate(now.getDate() + daysToAdd)
        const [hours, minutes] = weeklyTime.split(':').map(Number)
        reminderDate.setHours(hours, minutes, 0, 0)

        const metadata: any = {
          userDescription,
          autoCreateRecord: true,
          dosageAmount,
          days: weeklyDays,
          time: weeklyTime
        }

        data.push({
          medicineId,
          title: `服用${medicineName}`,
          description: JSON.stringify(metadata),
          reminderTime: toLocalISOString(reminderDate),
          frequency: 'weekly'
        })
      }
    } 
    else if (frequency === 'monthly') {
      // 每月提醒：按所选日和时间生成
      if (!monthlyDay || !monthlyTime) return data
      
      const now = new Date()
      let nextDate = new Date(now.getFullYear(), now.getMonth(), monthlyDay)
      if (monthlyDay < now.getDate()) {
        nextDate = new Date(now.getFullYear(), now.getMonth() + 1, monthlyDay)
      }
      const [hours, minutes] = monthlyTime.split(':').map(Number)
      nextDate.setHours(hours, minutes, 0, 0)

      const metadata: any = {
        userDescription,
        autoCreateRecord: true,
        dosageAmount,
        day: monthlyDay,
        time: monthlyTime
      }

      data.push({
        medicineId,
        title: `服用${medicineName}`,
        description: JSON.stringify(metadata),
        reminderTime: toLocalISOString(nextDate),
        frequency: 'monthly'
      })
    }
    
    return data
  }
  
  // 验证提醒数据
  const validateReminderData = (data: ReminderFrequencyData): ValidationResult => {
    // 验证服用剂量
    if (!data.dosageAmount || data.dosageAmount <= 0) {
      return { valid: false, message: '请填写有效的服用剂量' }
    }
    
    // 根据不同提醒频率进行验证
    if (data.frequency === 'weekly') {
      // 验证是否选择了周几
      if (!data.weeklyDays || data.weeklyDays.length === 0) {
        return { valid: false, message: '请至少选择一个星期几' }
      }
      
      // 验证是否填写了提醒时间
      if (!data.weeklyTime) {
        return { valid: false, message: '请设置提醒时间' }
      }
    } 
    else if (data.frequency === 'monthly') {
      // 验证是否选择了日期
      if (!data.monthlyDay || data.monthlyDay < 1 || data.monthlyDay > 31) {
        return { valid: false, message: '请选择有效的月份日期（1-31）' }
      }
      
      // 验证是否填写了提醒时间
      if (!data.monthlyTime) {
        return { valid: false, message: '请设置提醒时间' }
      }
    }
    else if (data.frequency === 'daily') {
      // 验证是否有时间槽
      if (!data.reminderTimeSlots || data.reminderTimeSlots.length === 0 || 
          !data.reminderTimeSlots.every(slot => slot)) {
        return { valid: false, message: '请设置所有提醒时间' }
      }
    }
    else if (data.frequency === 'once' || data.frequency === 'custom') {
      // 验证是否有提醒时间
      if (!data.reminderTime) {
        return { valid: false, message: '请设置提醒时间' }
      }
      
      // 验证提醒时间是否合法（不能选择过去的时间）
      const selectedTime = new Date(data.reminderTime)
      const now = new Date()
      if (selectedTime < now) {
        return { valid: false, message: '提醒时间不能是过去的时间' }
      }
    }
    
    return { valid: true }
  }
  
  // 监听每日次数变化，自动调整时间槽数量
  const handleDailyTimesChange = (
    newVal: string, 
    reminderTimeSlots: Ref<string[]>
  ) => {
    const count = parseInt(newVal)
    const currentLength = reminderTimeSlots.value.length
    
    if (count > currentLength) {
      // 添加新的时间槽
      for (let i = currentLength; i < count; i++) {
        let defaultTime = ''
        switch (i) {
          case 0: defaultTime = '08:00'; break;
          case 1: defaultTime = '12:00'; break;
          case 2: defaultTime = '18:00'; break;
          case 3: defaultTime = '21:00'; break;
          default: defaultTime = '08:00';
        }
        reminderTimeSlots.value.push(defaultTime)
      }
    } else if (count < currentLength) {
      // 删除多余的时间槽
      reminderTimeSlots.value = reminderTimeSlots.value.slice(0, count)
    }
  }
  
  // 切换星期几选择
  const toggleWeekDay = (day: number, weeklyDays: Ref<number[]>) => {
    const idx = weeklyDays.value.indexOf(day)
    if (idx > -1) {
      weeklyDays.value.splice(idx, 1)
    } else {
      weeklyDays.value.push(day)
    }
    if (weeklyDays.value.length === 0) {
      weeklyDays.value.push(day)
    }
  }
  
  return {
    createReminderData,
    validateReminderData,
    getWeekDayLabel,
    handleDailyTimesChange,
    toggleWeekDay
  }
}