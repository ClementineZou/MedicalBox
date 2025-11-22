import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const userId = await requireUserId(event)

    const body = await readBody(event)

    // 校验必填项
    if (!body.name || !body.brand || !body.dosage || !body.dosageUnit || !body.quantityUnit || !body.approvalNo) {
      return { success: false, error: '请填写所有必填项' }
    }
    const medicine = await prisma.medicine.create({
      data: {
        userId, // Associate with authenticated user
        name: body.name,
        brand: body.brand,
        category: body.category,
        controlTypes: body.controlTypes || '',
        dosage: body.dosage,
        dosageUnit: body.dosageUnit,
        quantity: body.quantity || 0,
        quantityUnit: body.quantityUnit,
        indications: body.indications,
        usage: body.usage,
        approvalNo: body.approvalNo,
        expiryDate: new Date(body.expiryDate),
        location: body.location,
        imageUrl: body.imageUrl,
        notes: body.notes
      }
    })

    return {
      success: true,
      data: medicine
    }
  } catch (error: any) {
    console.error('Error creating medicine:', error)
    return {
      success: false,
      error: error.message || 'Failed to create medicine'
    }
  }
})
