import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    const body = await readBody(event)

    // 获取药品信息并验证所有权
    const medicine = await prisma.medicine.findFirst({
      where: {
        id: body.medicineId,
        userId // Ensure user owns the medicine
      }
    })

    if (!medicine) {
      throw new Error('药品不存在')
    }

    // 从剂量字符串中提取数值
    let usageAmount = 0
    if (body.dosage) {
      const match = body.dosage.match(/^([\d.]+)/)
      if (match && match[1]) {
        usageAmount = parseFloat(match[1])
      }
    }

    // 减少药品库存
    let newQuantity = medicine.quantity - usageAmount
    if (newQuantity < 0) newQuantity = 0

    // 更新药品库存
    await prisma.medicine.update({
      where: { id: body.medicineId },
      data: { quantity: newQuantity }
    })

    // 创建用药记录
    const record = await prisma.medicineUsageRecord.create({
      data: {
        userId, // Associate with authenticated user
        medicineId: body.medicineId,
        dosage: body.dosage,
        usageTime: new Date(body.usageTime),
        notes: body.notes,
        sideEffectNotes: body.sideEffectNotes
      },
      include: {
        medicine: true
      }
    })

    // 如果是从提醒创建的记录，更新提醒状态
    if (body.reminderId) {
      try {
        await prisma.reminder.update({
          where: { id: body.reminderId },
          data: {
            isCompleted: true
          }
        })
      } catch (reminderError) {
        console.error('Error updating reminder status:', reminderError)
        // 不影响主要流程，只记录错误
      }
    }

    return {
      success: true,
      data: record
    }
  } catch (error: any) {
    console.error('Error creating usage record:', error)
    return {
      success: false,
      error: error.message || 'Failed to create usage record'
    }
  }
})
