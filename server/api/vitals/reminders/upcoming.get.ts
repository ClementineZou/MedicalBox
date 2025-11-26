import prisma from '~/server/utils/prisma'

/**
 * 获取即将到来的体征监测提醒
 * 返回未来30分钟内的提醒
 */
export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    
    const now = new Date()
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000)

    const reminders = await prisma.vitalSignReminder.findMany({
      where: {
        userId,
        isActive: true,
        isCompleted: false,
        reminderTime: {
          gte: now,
          lte: thirtyMinutesLater
        }
      },
      orderBy: {
        reminderTime: 'asc'
      }
    })

    return {
      success: true,
      data: reminders
    }
  } catch (error: any) {
    console.error('Error fetching upcoming vital sign reminders:', error)
    return {
      success: false,
      error: error.message || '获取即将到来的提醒失败'
    }
  }
})
