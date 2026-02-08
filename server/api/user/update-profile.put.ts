
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readBody(event)
  const { name, email } = body

  if (!name && !email) {
    throw createError({
      statusCode: 400,
      statusMessage: '请提供要更新的信息'
    })
  }

  const updateData: any = {}
  
  // Update name if provided
  if (name !== undefined) {
    updateData.name = name
  }
  
  // Check if email is being updated
  if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
          throw createError({
              statusCode: 400,
              statusMessage: '邮箱格式不正确'
          })
      }

      // Check if email is already taken by another user
      const existingUser = await prisma.user.findUnique({
          where: { email }
      })
      if (existingUser && existingUser.id !== userId) {
          throw createError({
              statusCode: 400,
              statusMessage: '该邮箱已被注册'
          })
      }
      
      const currentUser = await prisma.user.findUnique({
          where: { id: userId }
      })

      if (currentUser && currentUser.email !== email) {
          updateData.email = email
          updateData.emailVerified = false // Reset verification status
      }
  }

  if (Object.keys(updateData).length === 0) {
      return { success: true, message: '没有变更' }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    return {
      success: true,
      user: updatedUser,
      message: '信息更新成功'
    }
  } catch (error: any) {
    console.error('Update profile error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '更新用户信息失败，请重试'
    })
  }
})
