import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!id) {
      return {
        success: false,
        error: 'Reminder ID is required'
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
