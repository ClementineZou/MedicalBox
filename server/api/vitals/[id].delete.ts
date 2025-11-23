import prisma from '~/server/utils/prisma'

// 当删除身高或体重记录后，删除对应时间点的 BMI 记录
async function deleteBMIForMeasureTime(userId: string, measureTime: Date) {
  try {
    await prisma.vitalSign.deleteMany({
      where: {
        userId,
        type: 'bmi',
        measureTime
      }
    })
  } catch (error) {
    console.error('Error deleting BMI records:', error)
  }
}

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
    
    // 如果删除的是身高或体重，删除对应时间点的 BMI 记录
    if (existing.type === 'height' || existing.type === 'weight') {
      await deleteBMIForMeasureTime(userId, existing.measureTime)
    }

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