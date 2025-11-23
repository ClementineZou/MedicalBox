import prisma from '~/server/utils/prisma'
import { auth } from '~/lib/auth'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    
    const body = await readBody(event)
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: '请提供当前密码和新密码'
      })
    }

    if (newPassword.length < 8) {
      throw createError({
        statusCode: 400,
        statusMessage: '新密码长度至少为8个字符'
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

    const credentialAccount = user.accounts.find(acc => acc.providerId === 'credential')
    
    if (!credentialAccount || !credentialAccount.password) {
      throw createError({
        statusCode: 400,
        statusMessage: '该账户使用第三方登录，无法修改密码'
      })
    }

    // Verify current password by attempting to sign in
    try {
      const signInResult = await auth.api.signInEmail({
        body: {
          email: user.email,
          password: currentPassword
        }
      })
      
      if (!signInResult) {
        throw new Error('Password verification failed')
      }
    } catch {
      throw createError({
        statusCode: 401,
        statusMessage: '当前密码错误'
      })
    }

    // Hash the new password using bcrypt (same as better-auth)
    const bcrypt = await import('bcryptjs')
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update the password
    await prisma.account.update({
      where: {
        id: credentialAccount.id
      },
      data: {
        password: hashedPassword
      }
    })

    return {
      success: true,
      message: '密码已成功更新'
    }
  } catch (error: any) {
    console.error('Error changing password:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '修改密码失败'
    })
  }
})
