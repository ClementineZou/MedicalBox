import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Connecting to database...')
        const userCount = await prisma.user.count()
        console.log(`Current user count: ${userCount}`)

        console.log('Attempting to create a test user...')
        const user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                name: 'Test User',
                emailVerified: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        })
        console.log('User created successfully:', user)

        // Clean up
        await prisma.user.delete({
            where: { id: user.id }
        })
        console.log('Test user deleted.')

    } catch (e) {
        console.error('Error:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
