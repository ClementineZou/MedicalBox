import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!id) {
      return {
        success: false,
        error: 'Medicine ID is required'
      }
    }

    if (!body.name || !body.brand || !body.dosage || !body.dosageUnit || !body.quantityUnit || !body.approvalNo) {
      return { success: false, error: '请填写所有必填项' }
    }
    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        name: body.name,
        brand: body.brand,
        category: body.category,
        controlTypes: body.controlTypes || '',
        dosage: body.dosage,
        dosageUnit: body.dosageUnit,
        quantity: body.quantity,
        quantityUnit: body.quantityUnit,
        indications: body.indications,
        usage: body.usage,
        approvalNo: body.approvalNo,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
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
    console.error('Error updating medicine:', error)
    return {
      success: false,
      error: error.message || 'Failed to update medicine'
    }
  }
})
