// 处理日期时间的本地时区转换工具

/**
 * 将日期对象转换为ISO字符串，但确保使用当地时区(北京时间UTC+8)而不是UTC
 * 解决日期在前端与后端之间传递时的时区问题
 * @param date 要转换的日期对象
 * @returns ISO格式的日期字符串，使用本地时区
 */
export function toLocalISOString(date: Date): string {
  const tzOffset = date.getTimezoneOffset() * 60000 // 本地时区偏移量(毫秒)
  const localISOTime = new Date(date.getTime() - tzOffset).toISOString()
  return localISOTime
}

/**
 * 将日期转换为YYYY-MM-DD格式的日期字符串，使用本地时区
 * @param date 要转换的日期
 * @returns YYYY-MM-DD格式的日期字符串
 */
export function toLocalDateString(date: Date): string {
  return toLocalISOString(date).split('T')[0]
}

/**
 * 将日期时间转换为本地时区的ISO字符串，只保留到分钟(用于datetime-local输入)
 * @param date 要转换的日期
 * @returns 格式为YYYY-MM-DDTHH:MM的字符串
 */
export function toLocalISOStringForInput(date: Date): string {
  return toLocalISOString(date).slice(0, 16)
}

/**
 * 创建带有指定小时和分钟的今日日期，使用本地时区
 * @param hours 小时(24小时制)
 * @param minutes 分钟
 * @returns 设置了指定时间的日期对象
 */
export function createTodayWithTime(hours: number, minutes: number): Date {
  const today = new Date()
  today.setHours(hours, minutes, 0, 0)
  return today
}

export default {
  toLocalISOString,
  toLocalDateString,
  toLocalISOStringForInput,
  createTodayWithTime
}