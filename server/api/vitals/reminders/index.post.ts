import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const reminder = await prisma.vitalSignReminder.create({
      data: {
        title: body.title,
        vitalSignType: body.vitalSignType,
        reminderTime: new Date(body.reminderTime),
        frequency: body.frequency,
        description: body.description,
        isActive: true,
        isCompleted: false
      }
    })
    
    return {
      success: true,
      data: reminder,
      message: '生命体征提醒已创建'
    }
  } catch (error: any) {
    console.error('Error creating vital sign reminder:', error)
    return {
      success: false,
      error: error.message || '创建生命体征提醒失败'
    }
  }
})