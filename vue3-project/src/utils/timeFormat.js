/**
 * 统一的时间格式化工具函数
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
 * 格式化时间显示 (统一使用中国时区 UTC+8)
 * @param {string|Date} timeStr - 时间字符串或Date对象
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(timeStr) {
  if (!timeStr) return '刚刚'

  // 将输入时间转换为中国时区
  const time = convertToChinaTime(timeStr)
  
  // 检查转换后的日期是否有效
  if (isNaN(time.getTime())) {
    return '无效日期'
  }

  // 获取中国当前时间
  const now = getChinaCurrentTime()
  const diff = now - time

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  // 调试信息（开发环境下可以启用）
  if (process.env.NODE_ENV === 'development' && Math.abs(hours) > 24) {
    console.warn('时间差异较大:', {
      input: timeStr,
      parsed: time.toISOString(),
      now: now.toISOString(),
      diffHours: hours
    })
  }

  // 1分钟内显示"刚刚"
  if (minutes < 1) return '刚刚'
  
  // 1小时内显示"X分钟前"
  if (minutes < 60) return `${minutes}分钟前`
  
  // 24小时内显示"X小时前"
  if (hours < 24) return `${hours}小时前`
  
  // 7天内显示"X天前"
  if (days < 7) return `${days}天前`

  // 判断是否跨年（基于中国时区）
  const currentYear = now.getFullYear()
  const timeYear = time.getFullYear()
  
  if (currentYear === timeYear) {
    // 同年显示 "mm-dd" 格式
    const month = String(time.getMonth() + 1).padStart(2, '0')
    const day = String(time.getDate()).padStart(2, '0')
    return `${month}-${day}`
  } else {
    // 跨年显示 "yyyy-mm-dd" 格式
    const year = time.getFullYear()
    const month = String(time.getMonth() + 1).padStart(2, '0')
    const day = String(time.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}

/**
 * 格式化时间显示（兼容旧版本函数名）
 * @param {string|Date} timeStr - 时间字符串或Date对象
 * @returns {string} 格式化后的时间字符串
 */
export const timeFormat = formatTime

/**
 * 格式化日期显示（兼容旧版本函数名）
 * @param {string|Date} timeStr - 时间字符串或Date对象
 * @returns {string} 格式化后的时间字符串
 */
export const dateFormat = formatTime

/**
 * 格式化为完整的中国时间字符串
 * @param {string|Date} timeStr - 时间字符串或Date对象
 * @returns {string} 完整的时间字符串 (YYYY-MM-DD HH:mm:ss)
 */
export function formatFullTime(timeStr) {
  if (!timeStr) return ''
  
  const time = convertToChinaTime(timeStr)
  
  if (isNaN(time.getTime())) {
    return '无效日期'
  }
  
  const year = time.getFullYear()
  const month = String(time.getMonth() + 1).padStart(2, '0')
  const day = String(time.getDate()).padStart(2, '0')
  const hours = String(time.getHours()).padStart(2, '0')
  const minutes = String(time.getMinutes()).padStart(2, '0')
  const seconds = String(time.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 格式化为中国时间的ISO字符串 (UTC+8)
 * @param {string|Date} timeStr - 时间字符串或Date对象
 * @returns {string} ISO格式的中国时间字符串
 */
export function formatChinaISO(timeStr) {
  if (!timeStr) return ''
  
  const time = convertToChinaTime(timeStr)
  
  if (isNaN(time.getTime())) {
    return ''
  }
  
  // 转换为UTC+8的ISO字符串
  const offset = 8 * 60 // UTC+8 偏移分钟数
  const localTime = new Date(time.getTime() - (time.getTimezoneOffset() * 60000) + (offset * 60000))
  return localTime.toISOString().replace('Z', '+08:00')
}

export default formatTime