import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = query.search as string || ''
    const category = query.category as string || ''
    
    // 构建查询条件
    const where: any = {}
    
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
