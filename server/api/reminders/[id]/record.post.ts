import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    const id = getRouterParam(event, 'id')

    if (!id) {
      return {
        success: false,
        error: 'Reminder ID is required'
      }
    }

    // 获取请求体，包含用户选择的服用时间
    const body = await readBody(event)
    const usageTime = body.usageTime ? new Date(body.usageTime) : new Date()

    // 1. 查找提醒信息并验证所有权
    const reminder = await prisma.reminder.findFirst({
      where: { id, userId },
      include: { medicine: true }
    })

    if (!reminder) {
      return {
        success: false,
        error: 'Reminder not found'
      }
    }

    // 解析提醒描述，获取剂量信息
    let userDescription = ''
    let dosageAmount = 1
    try {
      if (reminder.description) {
        const descData = JSON.parse(reminder.description)
        userDescription = descData.userDescription || ''
        // 直接从 dosageAmount 字段获取剂量值
        if (descData.dosageAmount !== undefined) {
          dosageAmount = parseFloat(descData.dosageAmount)
        }
      }
    } catch (e) {
      console.warn('Failed to parse reminder description:', e)
    }

    // 构建剂量字符串，包含剂量值和单位
    let dosage = `${dosageAmount}单位`

    // 查询完整的药品信息，以获取 quantityUnit
    if (reminder.medicineId) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: reminder.medicineId }
      })
      if (medicine) {
        // 使用类型断言访问 quantityUnit
        const unit = (medicine as any).quantityUnit || '单位'
        // 更新剂量字符串
        dosage = `${dosageAmount}${unit}`
      }
    }

    // 2. 创建用药记录
    const record = await prisma.medicineUsageRecord.create({
      data: {
        userId, // Associate with authenticated user
        medicineId: reminder.medicineId,
        dosage: dosage,
        usageTime: usageTime,
        // 只记录用户提供的描述，不记录自动创建信息
        notes: userDescription
      },
      include: {
        medicine: true
      }
    })

    // 3. 更新提醒为已完成
    await prisma.reminder.update({
      where: { id },
      data: {
        isCompleted: true
      }
    })

    // 4. 减少药品库存
    if (reminder.medicine && reminder.medicine.quantity > 0) {
      // 确保库存不会减为负数
      const newQuantity = Math.max(0, reminder.medicine.quantity - dosageAmount)
      await prisma.medicine.update({
        where: { id: reminder.medicineId },
        data: {
          quantity: newQuantity
        }
      })
    }

    return {
      success: true,
      data: record
    }
  } catch (error: any) {
    console.error('Error creating record from reminder:', error)
    return {
      success: false,
      error: error.message || 'Failed to create record from reminder'
    }
  }
})