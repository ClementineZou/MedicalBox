import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)
    const body = await readBody(event)
    const { accountId } = body

    if (!accountId) {
      return {
        success: false,
        error: '缺少账户ID'
      }
    }

    // Get the account to be unlinked
    const accountToUnlink = await prisma.account.findUnique({
      where: { id: accountId }
    })

    if (!accountToUnlink) {
      return {
        success: false,
        error: '账户不存在'
      }
    }

    // Verify the account belongs to the current user
    if (accountToUnlink.userId !== userId) {
      return {
        success: false,
        error: '无权操作此账户'
      }
    }

    // Cannot unlink credential accounts
    if (accountToUnlink.providerId === 'credential') {
      return {
        success: false,
        error: '不能解绑邮箱密码登录方式'
      }
    }

    // Check if user has a password (credential account)
    const hasPassword = await prisma.account.findFirst({
      where: {
        userId,
        providerId: 'credential'
      }
    })

    // Get all user's accounts
    const allAccounts = await prisma.account.findMany({
      where: { userId }
    })

    // User must have either:
    // 1. A password (credential account), OR
    // 2. At least one other OAuth account after unlinking
    const oauthAccountsCount = allAccounts.filter(acc => acc.providerId !== 'credential').length
    
    if (!hasPassword && oauthAccountsCount <= 1) {
      return {
        success: false,
        error: '无法解绑：您必须至少保留一种登录方式。请先设置密码或关联其他第三方账户。'
      }
    }

    // Delete the account
    await prisma.account.delete({
      where: { id: accountId }
    })

    return {
      success: true,
      message: '账户已成功解绑'
    }
  } catch (error: any) {
    console.error('Error unlinking account:', error)
    return {
      success: false,
      error: error.message || '解绑账户失败'
    }
  }
})
