import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Get current logged in user
    const userId = await requireUserId(event)
    
    const body = await readBody(event)
    const { code, state } = body
    
    if (!code) {
      return {
        success: false,
        error: 'No authorization code provided'
      }
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()
    
    if (!tokenData.access_token) {
      return {
        success: false,
        error: 'Failed to get access token from GitHub'
      }
    }

    // Get GitHub user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      },
    })

    const githubUser = await userResponse.json()

    if (!githubUser.id) {
      return {
        success: false,
        error: 'Failed to get GitHub user info'
      }
    }

    // Check if this GitHub account is already linked to another user
    const existingAccount = await prisma.account.findFirst({
      where: {
        providerId: 'github',
        accountId: String(githubUser.id),
      },
    })

    if (existingAccount) {
      if (existingAccount.userId === userId) {
        return {
          success: true,
          message: 'GitHub account already linked to your account'
        }
      } else {
        return {
          success: false,
          error: 'This GitHub account is already linked to another user'
        }
      }
    }

    // Link GitHub account to current user
    await prisma.account.create({
      data: {
        userId,
        providerId: 'github',
        accountId: String(githubUser.id),
        accessToken: tokenData.access_token,
        ...(tokenData.scope && { scope: tokenData.scope }),
      },
    })

    return {
      success: true,
      message: 'GitHub account successfully linked'
    }
  } catch (error: any) {
    console.error('Error linking GitHub account:', error)
    return {
      success: false,
      error: error.message || 'Failed to link GitHub account'
    }
  }
})
