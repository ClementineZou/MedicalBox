import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    const id = getRouterParam(event, 'id')

    if (!id) {
      return {
        success: false,
        error: 'Medicine ID is required'
      }
    }

    // First check if medicine exists and belongs to user
    const existing = await prisma.medicine.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return {
        success: false,
        error: 'Medicine not found'
      }
    }

    await prisma.medicine.delete({
      where: { id }
    })

    return {
      success: true,
      message: 'Medicine deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting medicine:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete medicine'
    }
  }
})
