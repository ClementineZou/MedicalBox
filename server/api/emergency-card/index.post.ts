import { defineEventHandler, readBody } from 'h3'
import { PrismaClient } from '@prisma/client'
import { requireUser } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  
  const body = await readBody(event)
  
  // Basic validation
  if (!body.fullName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Full name is required'
    })
  }

  const data = {
    userId: user.id,
    fullName: body.fullName,
    birthDate: body.birthDate ? new Date(body.birthDate) : null,
    bloodType: body.bloodType,
    height: body.height ? parseFloat(body.height) : null,
    weight: body.weight ? parseFloat(body.weight) : null,
    organDonor: body.organDonor || false,
    notes: body.notes,
    
    // Store arrays/objects as JSON strings
    medicalConditions: JSON.stringify(body.medicalConditions || []),
    allergies: JSON.stringify(body.allergies || []),
    medications: JSON.stringify(body.medications || []),
    emergencyContacts: JSON.stringify(body.emergencyContacts || []),
  }

  const card = await prisma.emergencyCard.upsert({
    where: {
      userId: user.id
    },
    update: {
        ...data,
        userId: undefined // Don't update userId
    },
    create: data
  })

  return { success: true }
})
