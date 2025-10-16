import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!id) {
      return {
        success: false,
        error: '缺少ID参数'
      }
    }
    
    // 更新记录
    const vitalSign = await prisma.vitalSign.update({
      where: { id },
      data: {
        type: body.type,
        value: body.value,
        unit: body.unit,
        measureTime: new Date(body.measureTime),
        isNormal: body.isNormal,
        referenceRange: body.referenceRange,
        notes: body.notes
      }
    })
    
    return {
      success: true,
      data: vitalSign,
      message: '生命体征记录已更新'
    }
  } catch (error: any) {
    console.error('Error updating vital sign:', error)
    return {
      success: false,
      error: error.message || '更新生命体征记录失败'
    }
  }
})