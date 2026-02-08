import type { PrismaClient } from '@prisma/client'
import { randomInt } from 'node:crypto'

const isUniqueConstraintError = (error: unknown) => {
  // Prisma known error
  if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2002') {
    return true
  }

  // SQLite unique constraint
  const message = (error as any)?.message as string | undefined
  return typeof message === 'string' && message.includes('UNIQUE constraint failed: Medicine.barcode')
}

/**
 * 生成 EAN-13（以 200 开头，内部使用）
 */
export const generateEan13 = () => {
  const prefix = '200'
  let body = prefix
  for (let i = 0; i < 9; i++) {
    body += String(randomInt(0, 10))
  }
  const checkDigit = calcEan13CheckDigit(body)
  return body + String(checkDigit)
}

const calcEan13CheckDigit = (twelveDigits: string) => {
  if (!/^\d{12}$/.test(twelveDigits)) {
    throw new Error('EAN-13 需要 12 位数字主体')
  }
  let sumOdd = 0
  let sumEven = 0
  for (let i = 0; i < 12; i++) {
    const digit = twelveDigits.charCodeAt(i) - 48
    const position = i + 1 // 1-based
    if (position % 2 === 1) sumOdd += digit
    else sumEven += digit
  }
  const total = sumOdd + sumEven * 3
  return (10 - (total % 10)) % 10
}

export const createUniqueMedicineBarcode = async (prisma: PrismaClient, maxAttempts = 10) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const barcode = generateEan13()
    const exists = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "Medicine" WHERE "barcode" = ${barcode} LIMIT 1
    `
    if (exists.length === 0) return barcode
  }
  // 极端情况下 fallback 到 cuid（仍可用 CODE128 打印）
  return `MB-${Date.now()}-${randomInt(100000, 999999)}`
}

export const ensureMedicineBarcode = async (
  prisma: PrismaClient,
  medicineId: string,
  userId: string,
  maxAttempts = 10
) => {
  const rows = await prisma.$queryRaw<Array<{ id: string; barcode: string | null }>>`
    SELECT id, barcode FROM "Medicine" WHERE id = ${medicineId} AND "userId" = ${userId} LIMIT 1
  `
  const existing = rows[0]
  if (!existing) return null
  if (existing.barcode) return existing.barcode

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const barcode = await createUniqueMedicineBarcode(prisma)
    try {
      await prisma.$executeRaw`
        UPDATE "Medicine" SET "barcode" = ${barcode} WHERE id = ${medicineId} AND "userId" = ${userId}
      `
      return barcode
    } catch (error) {
      if (isUniqueConstraintError(error)) continue
      throw error
    }
  }

  // 最后一次强制写入 fallback
  const fallback = `MB-${medicineId}`
  try {
    await prisma.$executeRaw`
      UPDATE "Medicine" SET "barcode" = ${fallback} WHERE id = ${medicineId} AND "userId" = ${userId}
    `
    return fallback
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      // 仍冲突则返回 null（不阻塞主流程）
      return null
    }
    throw error
  }
}

export const ensureMedicinesBarcodes = async (prisma: PrismaClient, userId: string, medicineIds: string[]) => {
  const results: Record<string, string> = {}

  for (const id of medicineIds) {
    const updated = await ensureMedicineBarcode(prisma, id, userId)
    if (updated) results[id] = updated
  }

  return results
}
