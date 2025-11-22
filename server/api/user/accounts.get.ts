import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireUserId(event)

    const accounts = await prisma.account.findMany({
      where: { 
        userId,
        providerId: {
          not: 'credential' // Exclude password-based accounts
        }
      },
      select: {
        id: true,
        providerId: true,
        accountId: true,
        createdAt: true,
      }
    })

    return {
      success: true,
      data: accounts
    }
  } catch (error: any) {
    console.error('Error fetching user accounts:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch accounts'
    }
  }
})
