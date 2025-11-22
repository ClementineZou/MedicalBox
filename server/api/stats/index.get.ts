import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)

    // 获取药品总数
    const totalMedicines = await prisma.medicine.count({
      where: { userId }
    })

    // 获取即将过期的药品数（30天内）
    const thirtyDaysLater = new Date()
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

    const expiringMedicines = await prisma.medicine.count({
      where: {
        userId,
        expiryDate: {
          lte: thirtyDaysLater,
          gte: new Date()
        }
      }
    })

    // 获取今日待服用提醒数
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayReminders = await prisma.reminder.count({
      where: {
        userId,
        isActive: true,
        isCompleted: false,
        reminderTime: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // 获取本月用药记录数
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const monthlyRecords = await prisma.medicineUsageRecord.count({
      where: {
        userId,
        usageTime: {
          gte: firstDayOfMonth
        }
      }
    })

    // 获取健康监测记录数
    let vitalSignsCount = 0
    let vitalSignRemindersCount = 0

    try {
      // 如果新模型已经存在，则获取统计数据
      vitalSignsCount = await prisma.vitalSign.count({
        where: { userId }
      })

      // 获取今日健康监测提醒数
      vitalSignRemindersCount = await prisma.vitalSignReminder.count({
        where: {
          userId,
          isActive: true,
          isCompleted: false,
          reminderTime: {
            gte: today,
            lt: tomorrow
          }
        }
      })
    } catch (e) {
      // 如果模型尚未创建（迁移尚未应用），则保持为0
      console.log('健康监测模型可能尚未创建，统计数据为0')
    }

    return {
      success: true,
      data: {
        totalMedicines,
        expiringMedicines,
        todayReminders,
        monthlyRecords,
        vitalSignsCount,
        todayVitalSignReminders: vitalSignRemindersCount
      }
    }
  } catch (error: any) {
    console.error('Error fetching stats:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch statistics'
    }
  }
})
