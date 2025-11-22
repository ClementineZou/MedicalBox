import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    const id = getRouterParam(event, 'id')

    if (!id) {
      return {
        success: false,
        error: '缺少ID参数'
      }
    }

    // 查找并验证所有权
    const vitalSign = await prisma.vitalSign.findFirst({
      where: { id, userId }
    })

    if (!vitalSign) {
      return {
        success: false,
        error: '未找到生命体征记录'
      }
    }

    return {
      success: true,
      data: vitalSign
    }
  } catch (error: any) {
    console.error('Error fetching vital sign:', error)
    return {
      success: false,
      error: error.message || '获取生命体征记录失败'
    }
  }
})