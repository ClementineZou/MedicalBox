import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const vitalSign = await prisma.vitalSign.create({
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
      message: '生命体征记录已添加'
    }
  } catch (error: any) {
    console.error('Error creating vital sign:', error)
    return {
      success: false,
      error: error.message || '创建生命体征记录失败'
    }
  }
})