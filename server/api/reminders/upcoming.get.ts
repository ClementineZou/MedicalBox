import prisma from '~/server/utils/prisma'

/**
 * 获取即将到期的提醒（未来指定时间范围内）
 */
export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    const query = getQuery(event)
    
    // 获取时间范围（默认30分钟）
    const minutesAhead = parseInt(query.minutes as string) || 30
    
    const now = new Date()
    const futureTime = new Date(now.getTime() + minutesAhead * 60 * 1000)

    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        isActive: true,
        isCompleted: false,
        reminderTime: {
          gte: now,
          lte: futureTime
        }
      },
      include: {
        medicine: true
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
    console.error('Error fetching upcoming reminders:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch upcoming reminders'
    }
  }
})
