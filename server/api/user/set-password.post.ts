import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    
    const body = await readBody(event)
    const { newPassword } = body

    if (!newPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: '请提供新密码'
      })
    }

    if (newPassword.length < 8) {
      throw createError({
        statusCode: 400,
        statusMessage: '密码长度至少为8个字符'
      })
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: '用户不存在'
      })
    }

    // Check if user already has a credential account with password
    const credentialAccount = user.accounts.find(acc => acc.providerId === 'credential')
    
    if (credentialAccount && credentialAccount.password) {
      throw createError({
        statusCode: 400,
        statusMessage: '该账户已设置密码，请使用修改密码功能'
      })
    }

    // Hash the new password using bcrypt (same as better-auth)
    const bcrypt = await import('bcryptjs')
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Create or update credential account
    if (credentialAccount) {
      // Update existing credential account
      await prisma.account.update({
        where: {
          id: credentialAccount.id
        },
        data: {
          password: hashedPassword
        }
      })
    } else {
      // Create new credential account
      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.email, // Use email as accountId for credential provider
          providerId: 'credential',
          password: hashedPassword
        }
      })
    }

    return {
      success: true,
      message: '密码已成功设置，您现在可以使用邮箱和密码登录'
    }
  } catch (error: any) {
    console.error('Error setting password:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '设置密码失败'
    })
  }
})
