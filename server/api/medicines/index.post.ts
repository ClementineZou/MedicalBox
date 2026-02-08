import prisma from '~/server/utils/prisma'
import { createUniqueMedicineBarcode } from '~/server/utils/barcode'

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const userId = await requireUserId(event)

    const body = await readBody(event)

    // 校验必填项
    if (!body.name || !body.brand || !body.dosage || !body.dosageUnit || !body.quantityUnit) {
      return { success: false, error: '请填写所有必填项' }
    }
    // 自动生成唯一条形码（并发下若冲突则重试）
    let lastError: unknown
    for (let attempt = 0; attempt < 10; attempt++) {
      const barcode = await createUniqueMedicineBarcode(prisma)
      try {
        const medicine = await prisma.medicine.create({
          data: {
            userId, // Associate with authenticated user
            barcode,
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
        lastError = error
        // Prisma unique constraint
        if (error?.code === 'P2002') continue
        throw error
      }
    }

    throw lastError || new Error('Failed to generate unique barcode')
  } catch (error: any) {
    console.error('Error creating medicine:', error)
    return {
      success: false,
      error: error.message || 'Failed to create medicine'
    }
  }
})
