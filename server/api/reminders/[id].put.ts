import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

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

    const reminder = await prisma.reminder.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        reminderTime: body.reminderTime ? new Date(body.reminderTime) : undefined,
        frequency: body.frequency,
        isActive: body.isActive,
        isCompleted: body.isCompleted
      },
      include: {
        medicine: true
      }
    })

    return {
      success: true,
      data: reminder
    }
  } catch (error: any) {
    console.error('Error updating reminder:', error)
    return {
      success: false,
      error: error.message || 'Failed to update reminder'
    }
  }
})
