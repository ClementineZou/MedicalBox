import prisma from '~/server/utils/prisma'
import { auth } from '~/lib/auth'

// Simple bcrypt comparison using the built-in crypto module
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Better-auth uses bcrypt internally, we can use the same verification
    // For now, we'll use a simple approach - try to sign in with the credentials
    return true // This will be verified by attempting the sign-in
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    
    // Get the request body (password for confirmation)
    const body = await readBody(event)
    const { password } = body

    if (!password) {
      throw createError({
        statusCode: 400,
        statusMessage: '请提供密码进行确认'
      })
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          where: {
            providerId: 'credential'
          }
        }
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: '用户不存在'
      })
    }

    // Check if user has a password-based account
    const credentialAccount = user.accounts.find(acc => acc.providerId === 'credential')
    
    if (!credentialAccount || !credentialAccount.password) {
      throw createError({
        statusCode: 400,
        statusMessage: '无法验证密码，该账户可能使用第三方登录'
      })
    }

    // Verify password by attempting to sign in
    // This uses better-auth's internal password verification
    try {
      const signInResult = await auth.api.signInEmail({
        body: {
          email: user.email,
          password: password
        }
      })
      
      // If sign-in fails, password is incorrect
      if (!signInResult) {
        throw createError({
          statusCode: 401,
          statusMessage: '密码错误'
        })
      }
    } catch (signInError) {
      throw createError({
        statusCode: 401,
        statusMessage: '密码错误'
      })
    }

    // Delete user data in order (respecting foreign key constraints)
    // The schema has onDelete: Cascade for most relations, but we'll be explicit

    // 1. Delete all user's data
    await prisma.$transaction([
      // Delete medicine usage records
      prisma.medicineUsageRecord.deleteMany({
        where: { userId }
      }),
      // Delete reminders
      prisma.reminder.deleteMany({
        where: { userId }
      }),
      // Delete medicines
      prisma.medicine.deleteMany({
        where: { userId }
      }),
      // Delete vital signs
      prisma.vitalSign.deleteMany({
        where: { userId }
      }),
      // Delete vital sign reminders
      prisma.vitalSignReminder.deleteMany({
        where: { userId }
      }),
      // Delete vital sign reference ranges
      prisma.vitalSignReferenceRange.deleteMany({
        where: { userId }
      }),
      // Delete sessions
      prisma.session.deleteMany({
        where: { userId }
      }),
      // Delete accounts
      prisma.account.deleteMany({
        where: { userId }
      }),
      // Finally, delete the user
      prisma.user.delete({
        where: { id: userId }
      })
    ])

    return {
      success: true,
      message: '账户已成功删除'
    }
  } catch (error: any) {
    console.error('Error deleting account:', error)
    
    // Pass through created errors
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '删除账户失败'
    })
  }
})
