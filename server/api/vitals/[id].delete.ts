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

    // 检查记录是否存在且属于当前用户
    const existing = await prisma.vitalSign.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return {
        success: false,
        error: '未找到生命体征记录'
      }
    }

    // 删除记录
    await prisma.vitalSign.delete({
      where: { id }
    })

    return {
      success: true,
      message: '生命体征记录已删除'
    }
  } catch (error: any) {
    console.error('Error deleting vital sign:', error)
    return {
      success: false,
      error: error.message || '删除生命体征记录失败'
    }
  }
})