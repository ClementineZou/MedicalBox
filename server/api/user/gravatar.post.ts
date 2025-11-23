import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, size = 200, defaultImage = 'identicon' } = body

    if (!email) {
      return {
        success: false,
        url: `https://www.gravatar.com/avatar/?s=${size}&d=${defaultImage}`
      }
    }

    // Generate MD5 hash of email (Gravatar requires lowercase and trimmed email)
    const normalizedEmail = email.trim().toLowerCase()
    const hash = crypto
      .createHash('md5')
      .update(normalizedEmail)
      .digest('hex')

    const url = `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`

    return {
      success: true,
      url,
      hash,
      normalizedEmail
    }
  } catch (error: any) {
    console.error('Error generating Gravatar URL:', error)
    return {
      success: false,
      url: `https://www.gravatar.com/avatar/?s=200&d=identicon`
    }
  }
})
