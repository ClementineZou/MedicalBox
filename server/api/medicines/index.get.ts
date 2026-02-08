import prisma from '~/server/utils/prisma'
import { ensureMedicinesBarcodes } from '~/server/utils/barcode'

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const userId = await requireUserId(event)

    const query = getQuery(event)
    const search = query.search as string || ''
    const category = query.category as string || ''

    // 构建查询条件
    const where: any = {
      userId, // Only get medicines for this user
    }

    // 如果有搜索关键词，添加名称搜索条件
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } }
      ]
    }

    // 如果有分类筛选，添加分类条件
    if (category) {
      where.category = category
    }

    const medicines = await prisma.medicine.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 自动回填缺失条形码（对旧数据无感升级）
    const missing = medicines.filter(m => !m.barcode).map(m => m.id)
    if (missing.length > 0) {
      const filled = await ensureMedicinesBarcodes(prisma, userId, missing)
      for (const m of medicines) {
        const bc = filled[m.id]
        if (bc) (m as any).barcode = bc
      }
    }

    return {
      success: true,
      data: medicines
    }
  } catch (error) {
    console.error('Error fetching medicines:', error)
    return {
      success: false,
      error: 'Failed to fetch medicines'
    }
  }
})
