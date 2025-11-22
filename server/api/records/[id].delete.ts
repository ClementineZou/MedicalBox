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

    // 获取要删除的记录并验证所有权
    const record = await prisma.medicineUsageRecord.findFirst({
      where: { id, userId }
    })

    if (!record) {
      return {
        success: false,
        error: 'Record not found'
      }
    }

    // 从剂量字符串中提取数值
    let usageAmount = 0
    if (record.dosage) {
      const match = record.dosage.match(/^([\d.]+)/)
      if (match && match[1]) {
        usageAmount = parseFloat(match[1])
      }
    }

    // 恢复药品库存
    await prisma.medicine.update({
      where: { id: record.medicineId },
      data: { quantity: { increment: usageAmount } }
    })

    // 删除记录
    await prisma.medicineUsageRecord.delete({
      where: { id }
    })

    return {
      success: true,
      message: 'Usage record deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting usage record:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete usage record'
    }
  }
})
