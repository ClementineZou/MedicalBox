import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      return {
        success: false,
        error: 'Reminder ID is required'
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
