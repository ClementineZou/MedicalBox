import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    const body = await readBody(event)

    const reminder = await prisma.reminder.create({
      data: {
        userId, // Associate with authenticated user
        medicineId: body.medicineId,
        title: body.title,
        description: body.description,
        reminderTime: new Date(body.reminderTime),
        frequency: body.frequency,
        isActive: body.isActive !== undefined ? body.isActive : true,
        isCompleted: false
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
    console.error('Error creating reminder:', error)
    return {
      success: false,
      error: error.message || 'Failed to create reminder'
    }
  }
})
