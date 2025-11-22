import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    try {
        const userId = await requireUserId(event)
        const query = getQuery(event)
        const type = query.type as string

        const where: any = {
            userId // Filter by authenticated user
        }

        if (type) {
            where.type = type
        }

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
