// 导入时区处理的日期时间工具函数
import { 
  formatDate,
  formatDateTime,
  formatFullDateTime,
  formatTime,
  isExpiringSoon,
  getCurrentDateTime,
  getCurrentISOString,
  dateToISOString
} from '~/utils/dateTime'

// 配置全局日期时间格式化
export default defineNuxtPlugin(() => {
  return {
    provide: {
      formatDate,
      formatDateTime,
      formatFullDateTime,
      formatTime,
      isExpiringSoon,
      getCurrentDateTime,
      getCurrentISOString,
      dateToISOString
    }
  }
})