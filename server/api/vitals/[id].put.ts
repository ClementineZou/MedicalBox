import prisma from '~/server/utils/prisma'

// 自动计算 BMI
async function calculateAndCreateBMI(userId: string, measureTime: Date) {
  try {
    // 获取最新的身高和体重记录
    const latestHeight = await prisma.vitalSign.findFirst({
      where: { userId, type: 'height' },
      orderBy: { measureTime: 'desc' }
    })
    
    const latestWeight = await prisma.vitalSign.findFirst({
      where: { userId, type: 'weight' },
      orderBy: { measureTime: 'desc' }
    })
    
    if (!latestHeight || !latestWeight) {
      return null // 需要同时有身高和体重才能计算 BMI
    }
    
    // 转换单位到标准单位（身高米，体重千克）
    let heightInMeters = latestHeight.value
    if (latestHeight.unit === 'cm') {
      heightInMeters = latestHeight.value / 100
    }
    
    let weightInKg = latestWeight.value
    if (latestWeight.unit === 'g') {
      weightInKg = latestWeight.value / 1000
    } else if (latestWeight.unit === 'lb') {
      weightInKg = latestWeight.value * 0.453592
    }
    
    // 计算 BMI = 体重(kg) / 身高²(m²)
    const bmi = weightInKg / (heightInMeters * heightInMeters)
    
    // 获取 BMI 参考范围
    const bmiRange = await prisma.vitalSignReferenceRange.findFirst({
      where: { type: 'bmi', isSystem: true }
    })
    
    const isNormal = bmiRange 
      ? bmi >= bmiRange.minValue && bmi <= bmiRange.maxValue
      : true
    
    const referenceRange = bmiRange 
      ? `${bmiRange.minValue} - ${bmiRange.maxValue}`
      : ''
    
    // 删除同一时间点的旧 BMI 记录（如果存在）
    await prisma.vitalSign.deleteMany({
      where: {
        userId,
        type: 'bmi',
        measureTime
      }
    })
    
    // 创建 BMI 记录
    const bmiRecord = await prisma.vitalSign.create({
      data: {
        userId,
        type: 'bmi',
        value: Math.round(bmi * 100) / 100, // 保留两位小数
        unit: '',
        measureTime,
        isNormal,
        referenceRange,
        notes: `基于身高 ${latestHeight.value}${latestHeight.unit} 和体重 ${latestWeight.value}${latestWeight.unit} 自动计算`
      }
    })
    
    return bmiRecord
  } catch (error) {
    console.error('Error calculating BMI:', error)
    return null
  }
}

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

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
        notes: body.notes,
        systolic: body.systolic,
        diastolic: body.diastolic
      }
    })
    
    // 如果更新的是身高或体重，重新计算并创建 BMI 记录
    if (body.type === 'height' || body.type === 'weight') {
      await calculateAndCreateBMI(userId, new Date(body.measureTime))
    }

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