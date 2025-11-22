import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    const query = getQuery(event)
    const { medicineId, startDate, endDate } = query

    const where: any = {
      userId // Filter by authenticated user
    }

    if (medicineId) {
      where.medicineId = medicineId as string
    }

    if (startDate || endDate) {
      where.usageTime = {}
      if (startDate) {
        where.usageTime.gte = new Date(startDate as string)
      }
      if (endDate) {
        where.usageTime.lte = new Date(endDate as string)
      }
    }

    const records = await prisma.medicineUsageRecord.findMany({
      where,
      include: {
        medicine: true
      },
      orderBy: {
        usageTime: 'desc'
      }
    })

    return {
      success: true,
      data: records
    }
  } catch (error: any) {
    console.error('Error fetching usage records:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch usage records'
    }
  }
})
