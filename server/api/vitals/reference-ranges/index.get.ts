import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const type = query.type as string

        const where: any = {}

        if (type) {
            where.type = type
        }

        // Fetch system defaults and user-specific ranges (if we had user context, but for now just all relevant ones)
        // In a real app, we might filter by userId or isSystem: true
        const ranges = await prisma.vitalSignReferenceRange.findMany({
            where,
            orderBy: {
                type: 'asc'
            }
        })

        return {
            success: true,
            data: ranges
        }
    } catch (error: any) {
        console.error('Error fetching reference ranges:', error)
        return {
            success: false,
            error: error.message || '获取参考范围失败'
        }
    }
})
