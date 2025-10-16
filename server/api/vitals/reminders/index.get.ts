import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const type = query.vitalSignType as string
    const isActive = query.isActive !== undefined ? query.isActive === 'true' : undefined
    
    // 构建查询条件
    const where: any = {}
    
    // 类型过滤
    if (type) {
      where.vitalSignType = type
    }
    
    // 激活状态过滤
    if (isActive !== undefined) {
      where.isActive = isActive
    }
    
    // 查询数据
    const reminders = await prisma.vitalSignReminder.findMany({
      where,
      orderBy: {
        reminderTime: 'asc'
      }
    })
    
    return {
      success: true,
      data: reminders
    }
  } catch (error: any) {
    console.error('Error fetching vital sign reminders:', error)
    return {
      success: false,
      error: error.message || '获取生命体征提醒失败'
    }
  }
})