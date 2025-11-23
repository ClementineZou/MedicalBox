import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    
    // Get user's credential account
    const credentialAccount = await prisma.account.findFirst({
      where: {
        userId,
        providerId: 'credential'
      }
    })

    return {
      success: true,
      hasPassword: !!(credentialAccount && credentialAccount.password)
    }
  } catch (error: any) {
    console.error('Error checking password:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '检查密码状态失败'
    })
  }
})
