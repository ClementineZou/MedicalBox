import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding reference ranges...')

  const referenceRanges = [
    {
      type: 'bloodPressure',
      minValue: 90,
      maxValue: 120,
      unit: 'mmHg',
      description: '收缩压正常范围',
      isSystem: true,
    },
    {
      type: 'bloodPressure',
      minValue: 60,
      maxValue: 80,
      unit: 'mmHg',
      description: '舒张压正常范围',
      isSystem: true,
    },
    {
      type: 'heartRate',
      minValue: 60,
      maxValue: 100,
      unit: 'bpm',
      description: '静息心率正常范围',
      isSystem: true,
    },
    {
      type: 'temperature',
      minValue: 36.1,
      maxValue: 37.2,
      unit: '°C',
      description: '腋下体温正常范围',
      isSystem: true,
    },
    {
      type: 'bloodOxygen',
      minValue: 95,
      maxValue: 100,
      unit: '%',
      description: '血氧饱和度正常范围',
      isSystem: true,
    },
    {
      type: 'bloodGlucose',
      minValue: 3.9,
      maxValue: 6.1,
      unit: 'mmol/L',
      description: '空腹血糖正常范围',
      isSystem: true,
    },
    {
      type: 'bloodGlucose',
      minValue: 3.9,
      maxValue: 7.8,
      unit: 'mmol/L',
      description: '餐后2小时血糖正常范围',
      isSystem: true,
    },
    {
      type: 'bmi',
      minValue: 18.5,
      maxValue: 23.9,
      unit: '',
      description: 'BMI正常范围（中国成人标准）',
      isSystem: true,
    }
  ]

  for (const range of referenceRanges) {
    // Check if exists to avoid duplicates on re-seed
    const existing = await prisma.vitalSignReferenceRange.findFirst({
      where: {
        type: range.type,
        isSystem: true,
        description: range.description
      }
    })

    if (!existing) {
      await prisma.vitalSignReferenceRange.create({
        data: range
      })
      console.log(`Created reference range for ${range.type}`)
    } else {
      console.log(`Reference range for ${range.type} already exists`)
    }
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
