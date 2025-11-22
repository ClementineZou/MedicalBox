import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    const id = getRouterParam(event, 'id')
    if (!id) {
      return {
        success: false,
        error: 'Record ID is required'
      }
    }

    const body = await readBody(event)

    // 检查记录是否存在且属于当前用户
    const existingRecord = await prisma.medicineUsageRecord.findFirst({
      where: { id, userId },
      include: { medicine: true }
    })

    if (!existingRecord) {
      return {
        success: false,
        error: 'Record not found'
      }
    }

    // 从原剂量字符串中提取数值
    let oldUsageAmount = 0
    if (existingRecord.dosage) {
      const match = existingRecord.dosage.match(/^([\d.]+)/)
      if (match && match[1]) {
        oldUsageAmount = parseFloat(match[1])
      }
    }

    // 从新剂量字符串中提取数值
    let newUsageAmount = 0
    if (body.dosage) {
      const match = body.dosage.match(/^([\d.]+)/)
      if (match && match[1]) {
        newUsageAmount = parseFloat(match[1])
      }
    }

    // 如果药品ID改变或剂量改变，需要调整库存
    if (body.medicineId !== existingRecord.medicineId || newUsageAmount !== oldUsageAmount) {
      // 如果药品ID改变
      if (body.medicineId !== existingRecord.medicineId) {
        // 还原原药品的库存
        await prisma.medicine.update({
          where: { id: existingRecord.medicineId },
          data: { quantity: { increment: oldUsageAmount } }
        })

        // 减少新药品的库存 (确保属于当前用户)
        const newMedicine = await prisma.medicine.findFirst({
          where: { id: body.medicineId, userId }
        })

        if (newMedicine) {
          let newQuantity = newMedicine.quantity - newUsageAmount
          if (newQuantity < 0) newQuantity = 0

          await prisma.medicine.update({
            where: { id: body.medicineId },
            data: { quantity: newQuantity }
          })
        }
      }
      // 如果只是剂量改变但药品相同
      else {
        // 调整库存差值
        const medicine = await prisma.medicine.findFirst({
          where: { id: body.medicineId, userId }
        })

        if (medicine) {
          // 计算差值，正值表示减少的用量，负值表示增加的用量
          const diff = oldUsageAmount - newUsageAmount
          let newQuantity = medicine.quantity + diff
          if (newQuantity < 0) newQuantity = 0

          await prisma.medicine.update({
            where: { id: body.medicineId },
            data: { quantity: newQuantity }
          })
        }
      }
    }

    // 更新记录
    const updatedRecord = await prisma.medicineUsageRecord.update({
      where: { id },
      data: {
        medicineId: body.medicineId,
        dosage: body.dosage,
        usageTime: new Date(body.usageTime),
        notes: body.notes,
        sideEffectNotes: body.sideEffectNotes
      }
    })

    return {
      success: true,
      data: updatedRecord
    }
  } catch (error: any) {
    console.error('Error updating record:', error)
    return {
      success: false,
      error: error.message || 'Failed to update record'
    }
  }
})