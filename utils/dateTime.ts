/**
 * 时间和日期处理工具函数
 */

// 获取当前日期时间，确保时区正确
export const getCurrentDateTime = (): Date => {
  const now = new Date();
  // 获取当前系统时区偏移量
  const offset = now.getTimezoneOffset() * 60000;
  // 北京时间 (UTC+8) 和 UTC 的时差为 8 小时
  const beijingOffset = 8 * 60 * 60000;
  // 如果系统时区不是 UTC+8，需要调整时间
  if (offset !== -beijingOffset) {
    return new Date(now.getTime() + offset + beijingOffset);
  }
  return now;
}

// 格式化日期为本地日期格式 (YYYY-MM-DD)
export const formatDate = (date: string | Date): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai'
  });
}

// 格式化日期时间为本地日期时间格式
export const formatDateTime = (date: string | Date): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Shanghai'
  });
}

// 格式化日期时间为完整显示格式
export const formatFullDateTime = (date: string | Date): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Shanghai'
  });
}

// 格式化时间（只显示小时和分钟）
export const formatTime = (date: string | Date): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Shanghai'
  });
}

// 检查日期是否即将到期（30天内）
export const isExpiringSoon = (expiryDate: string | Date): boolean => {
  const expiry = expiryDate instanceof Date ? expiryDate : new Date(expiryDate);
  const today = getCurrentDateTime();
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);
  return expiry <= thirtyDaysLater && expiry >= today;
}

// 获取当前ISO格式的日期时间字符串（用于表单输入）
export const getCurrentISOString = (): string => {
  const now = getCurrentDateTime();
  // 转换为ISO格式的日期时间字符串
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  // 返回 YYYY-MM-DDTHH:MM 格式
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// 将日期转换为ISO格式的日期字符串（用于表单输入）
export const dateToISOString = (date: string | Date): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  // 转换为ISO格式的日期时间字符串
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  // 返回 YYYY-MM-DDTHH:MM 格式
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}