// 药品信息类型
export interface Medicine {
  id: string
  name: string
  brand: string
  category?: string
  quantity: number
  controlTypes: string
  dosage?: string
  dosageUnit: string
  quantityUnit: string
  expiryDate: Date | string
  indications?: string
  usage?: string
  approvalNo: string
  location?: string
  imageUrl?: string
  notes?: string
  createdAt: Date | string
  updatedAt: Date | string
}

// 用药提醒类型
export interface Reminder {
  id: string
  medicineId: string
  medicine?: Medicine
  title: string
  description?: string
  reminderTime: Date | string
  frequency: string
  isActive: boolean
  isCompleted: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

// 用药记录类型
export interface MedicineUsageRecord {
  id: string
  medicineId: string
  medicine?: Medicine
  dosage: string
  usageTime: Date | string
  notes?: string
  sideEffectNotes?: string
  createdAt: Date | string
  updatedAt: Date | string
}

// 用户类型
export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date | string
  updatedAt: Date | string
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 分页参数
export interface PaginationParams {
  page: number
  limit: number
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 生命体征类型
export interface VitalSign {
  id: string
  type: string               // 体征类型：身高/体重/体温/血压/血氧/血糖等
  value: number              // 数值
  unit: string               // 单位
  measureTime: Date | string // 测量时间
  notes?: string             // 备注说明
  isNormal: boolean          // 是否正常范围内
  referenceRange?: string    // 参考范围
  createdAt: Date | string
  updatedAt: Date | string
}

// 生命体征提醒类型
export interface VitalSignReminder {
  id: string
  title: string             // 提醒标题
  description?: string      // 提醒描述
  vitalSignType: string     // 体征类型：身高/体重/体温/血压/血氧/血糖等
  reminderTime: Date | string // 提醒时间
  frequency: string         // 频率：once(一次性), daily(每天), weekly(每周), monthly(每月)
  isActive: boolean         // 是否激活
  isCompleted: boolean      // 是否已完成
  createdAt: Date | string
  updatedAt: Date | string
}
