import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    const query = getQuery(event)
    const type = query.type as string
    const dateFrom = query.dateFrom as string
    const dateTo = query.dateTo as string

    // 构建查询条件
    const where: any = {
      userId // Filter by authenticated user
    }

    // 类型过滤
    if (type) {
      where.type = type
    }

    // 日期范围过滤
    if (dateFrom || dateTo) {
      where.measureTime = {}
      if (dateFrom) {
        where.measureTime.gte = new Date(dateFrom)
      }
      if (dateTo) {
        // 设置日期为当天的23:59:59以包含整天
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        where.measureTime.lte = endDate
      }
    }

    // 查询数据
    const vitals = await prisma.vitalSign.findMany({
      where,
      orderBy: {
        measureTime: 'desc'
      }
    })

    return {
      success: true,
      data: vitals
    }
  } catch (error: any) {
    console.error('Error fetching vital signs:', error)
    return {
      success: false,
      error: error.message || '获取生命体征数据失败'
    }
  }
})