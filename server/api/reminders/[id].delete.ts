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

    // Check if reminder exists and belongs to user
    const existing = await prisma.reminder.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return {
        success: false,
        error: 'Reminder not found'
      }
    }

    await prisma.reminder.delete({
      where: { id }
    })

    return {
      success: true,
      message: 'Reminder deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting reminder:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete reminder'
    }
  }
})
