/**
 * 中国时区 (UTC+8) 时间处理工具函数
 * 统一处理应用中的所有时间显示和计算
 */

/**
 * 将时间转换为中国时区 (UTC+8)
 * @param {string|Date} timeStr - 时间字符串或Date对象
 * @returns {Date} 转换为中国时区的Date对象
 */
function convertToChinaTime(timeStr) {
  if (!timeStr) return new Date()
  
  let time = new Date(timeStr)
  
  // 检查日期是否有效
  if (isNaN(time.getTime())) {
    return new Date()
  }

  // 如果时间字符串没有时区信息，假设它是UTC+8时间
  if (typeof timeStr === 'string' && !timeStr.includes('Z') && !timeStr.includes('+') && !timeStr.includes('-', 10)) {
    // 将时间字符串解析为UTC+8时间
    time = new Date(timeStr + '+08:00')
  }
  
  return time
}

/**
 * 获取中国当前时间 (UTC+8)
 * @returns {Date} 中国当前时间
 */
function getChinaCurrentTime() {
  const now = new Date()
  // 转换为中国时间 (UTC+8)
  const chinaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }))
  return chinaTime
}

/**
 * 格式化相对时间显示 (基于中国时区)
 * @param {string|Date} dateString - 时间字符串或Date对象
 * @returns {string} 相对时间字符串
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '刚刚'

  // 将输入时间转换为中国时区
  const date = convertToChinaTime(dateString)
  
  // 检查转换后的日期是否有效
  if (isNaN(date.getTime())) {
    return '无效日期'
  }

  // 获取中国当前时间
  const now = getChinaCurrentTime()
  const diffInSeconds = Math.floor((now - date) / 1000)

  // 调试信息（开发环境下）
  if (process.env.NODE_ENV === 'development' && Math.abs(diffInSeconds) > 86400) {
    console.warn('时间差异较大:', {
      input: dateString,
      parsed: date.toISOString(),
      now: now.toISOString(),
      diffHours: Math.floor(diffInSeconds / 3600)
    })
  }
  
  // 小于1分钟
  if (diffInSeconds < 60) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}分钟前`
  }
  
  // 小于24小时
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}小时前`
  }
  
  // 小于7天
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}天前`
  }
  
  // 大于7天显示具体日期
  return formatDate(date)
}

/**
 * 格式化具体日期 (基于中国时区)
 * @param {Date} date - Date对象
 * @returns {string} 格式化的日期字符串
 */
export function formatDate(date) {
  if (!date || isNaN(date.getTime())) {
    return '无效日期'
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  // 获取中国当前时间进行年份比较
  const currentYear = getChinaCurrentTime().getFullYear()
  
  // 如果是今年，不显示年份
  if (year === currentYear) {
    return `${month}-${day}`
  }
  
  return `${year}-${month}-${day}`
}

/**
 * 格式化完整时间 (基于中国时区)
 * @param {string|Date} dateString - 时间字符串或Date对象
 * @returns {string} 完整时间字符串 (YYYY-MM-DD HH:mm:ss)
 */
export function formatFullDateTime(dateString) {
  if (!dateString) return ''
  
  const date = convertToChinaTime(dateString)
  
  if (isNaN(date.getTime())) {
    return '无效日期'
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 获取中国时区的当前时间戳
 * @returns {number} 中国时区的时间戳
 */
export function getChinaTimestamp() {
  return getChinaCurrentTime().getTime()
}

/**
 * 将时间转换为中国时区ISO字符串
 * @param {string|Date} dateString - 时间字符串或Date对象
 * @returns {string} 中国时区的ISO字符串
 */
export function toChinaISOString(dateString) {
  if (!dateString) return ''
  
  const date = convertToChinaTime(dateString)
  
  if (isNaN(date.getTime())) {
    return ''
  }
  
  // 转换为UTC+8的ISO字符串
  const offset = 8 * 60 // UTC+8 偏移分钟数
  const localTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000) + (offset * 60000))
  return localTime.toISOString().replace('Z', '+08:00')
}

// 导出工具函数供内部使用
export { convertToChinaTime, getChinaCurrentTime }