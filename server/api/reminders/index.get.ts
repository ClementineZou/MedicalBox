import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { medicineId, isActive } = query

    const where: any = {}

    if (medicineId) {
      where.medicineId = medicineId as string
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const reminders = await prisma.reminder.findMany({
      where,
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
    console.error('Error fetching reminders:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch reminders'
    }
  }
})
