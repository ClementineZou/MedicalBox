import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      return {
        success: false,
        error: '缺少ID参数'
      }
    }
    
    // 删除提醒
    await prisma.vitalSignReminder.delete({
      where: { id }
    })
    
    return {
      success: true,
      message: '生命体征提醒已删除'
    }
  } catch (error: any) {
    console.error('Error deleting vital sign reminder:', error)
    return {
      success: false,
      error: error.message || '删除生命体征提醒失败'
    }
  }
})