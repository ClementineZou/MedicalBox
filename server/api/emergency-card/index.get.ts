import { defineEventHandler } from 'h3'
import { PrismaClient } from '@prisma/client'
import { requireUser } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const card = await prisma.emergencyCard.findUnique({
    where: {
      userId: user.id
    }
  })

  // Parse JSON fields if they exist, otherwise return default empty structures
  return {
    ...card,
    medicalConditions: card?.medicalConditions ? JSON.parse(card.medicalConditions) : [],
    surgicalHistory: card?.surgicalHistory ? JSON.parse(card.surgicalHistory) : [],
    allergies: card?.allergies ? JSON.parse(card.allergies) : [],
    medications: card?.medications ? JSON.parse(card.medications) : [],
    emergencyContacts: card?.emergencyContacts ? JSON.parse(card.emergencyContacts) : [],
    insurancePolicies: card?.insurancePolicies ? JSON.parse(card.insurancePolicies) : []
  }
})
