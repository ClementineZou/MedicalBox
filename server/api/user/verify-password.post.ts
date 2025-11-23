import prisma from '~/server/utils/prisma'
import { auth } from '~/lib/auth'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    
    const body = await readBody(event)
    const { password } = body

    if (!password) {
      throw createError({
        statusCode: 400,
        statusMessage: '请提供密码'
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
      return {
        success: false,
        valid: false,
        message: '用户不存在'
      }
    }

    const credentialAccount = user.accounts.find(acc => acc.providerId === 'credential')
    
    if (!credentialAccount || !credentialAccount.password) {
      return {
        success: false,
        valid: false,
        message: '该账户使用第三方登录，无法验证密码'
      }
    }

    // Verify password by attempting to sign in
    try {
      const signInResult = await auth.api.signInEmail({
        body: {
          email: user.email,
          password: password
        }
      })
      
      const isValid = !!signInResult
      
      return {
        success: true,
        valid: isValid,
        message: isValid ? '密码正确' : '密码错误'
      }
    } catch {
      return {
        success: true,
        valid: false,
        message: '密码错误'
      }
    }
  } catch (error: any) {
    console.error('Error verifying password:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    return {
      success: false,
      error: error.message || '验证密码失败'
    }
  }
})
