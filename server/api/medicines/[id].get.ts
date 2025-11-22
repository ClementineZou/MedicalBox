import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    const id = getRouterParam(event, 'id')

    if (!id) {
      return {
        success: false,
        error: 'Medicine ID is required'
      }
    }

    const medicine = await prisma.medicine.findFirst({
      where: {
        id,
        userId // Ensure user owns this medicine
      },
      include: {
        usageRecords: {
          orderBy: { usageTime: 'desc' },
          take: 10
        },
        reminders: {
          where: { isActive: true },
          orderBy: { reminderTime: 'asc' }
        }
      }
    })

    if (!medicine) {
      return {
        success: false,
        error: 'Medicine not found'
      }
    }

    return {
      success: true,
      data: medicine
    }
  } catch (error: any) {
    console.error('Error fetching medicine:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch medicine'
    }
  }
})
