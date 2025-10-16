import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!id) {
      return {
        success: false,
        error: '缺少ID参数'
      }
    }
    
    // 更新提醒
    const reminder = await prisma.vitalSignReminder.update({
      where: { id },
      data: {
        title: body.title,
        vitalSignType: body.vitalSignType,
        reminderTime: new Date(body.reminderTime),
        frequency: body.frequency,
        description: body.description,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        isCompleted: body.isCompleted !== undefined ? body.isCompleted : undefined
      }
    })
    
    return {
      success: true,
      data: reminder,
      message: '生命体征提醒已更新'
    }
  } catch (error: any) {
    console.error('Error updating vital sign reminder:', error)
    return {
      success: false,
      error: error.message || '更新生命体征提醒失败'
    }
  }
})