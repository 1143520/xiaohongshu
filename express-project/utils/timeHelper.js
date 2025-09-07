/**
 * 中国时区时间处理工具
 * 统一处理所有后端时间，确保使用UTC+8时区
 */

/**
 * 获取中国当前时间
 * @returns {Date} 中国时区的当前时间
 */
function getChinaCurrentTime() {
  // 创建UTC时间，然后转换为中国时区
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const chinaTime = new Date(utc + (8 * 3600000)); // UTC+8
  return chinaTime;
}

/**
 * 获取中国当前时间的ISO字符串
 * @returns {string} 中国时区的ISO字符串
 */
function getChinaCurrentTimeISO() {
  const chinaTime = getChinaCurrentTime();
  // 手动构建ISO字符串，确保显示+08:00时区
  const year = chinaTime.getFullYear();
  const month = String(chinaTime.getMonth() + 1).padStart(2, '0');
  const day = String(chinaTime.getDate()).padStart(2, '0');
  const hours = String(chinaTime.getHours()).padStart(2, '0');
  const minutes = String(chinaTime.getMinutes()).padStart(2, '0');
  const seconds = String(chinaTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;
}

/**
 * 获取中国当前时间的MySQL DATETIME格式
 * @returns {string} MySQL DATETIME格式的字符串
 */
function getChinaCurrentTimeMySQL() {
  const chinaTime = getChinaCurrentTime();
  const year = chinaTime.getFullYear();
  const month = String(chinaTime.getMonth() + 1).padStart(2, '0');
  const day = String(chinaTime.getDate()).padStart(2, '0');
  const hours = String(chinaTime.getHours()).padStart(2, '0');
  const minutes = String(chinaTime.getMinutes()).padStart(2, '0');
  const seconds = String(chinaTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 将任意时间转换为中国时区时间
 * @param {Date|string|number} time 输入时间
 * @returns {Date} 中国时区的时间
 */
function convertToChinaTime(time) {
  let date;
  if (time instanceof Date) {
    date = time;
  } else if (typeof time === 'string') {
    date = new Date(time);
  } else if (typeof time === 'number') {
    date = new Date(time);
  } else {
    throw new Error('Invalid time input');
  }
  
  // 如果输入已经是中国时区，直接返回
  if (date.getTimezoneOffset() === -480) { // UTC+8 = -480分钟
    return date;
  }
  
  // 转换为中国时区
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const chinaTime = new Date(utc + (8 * 3600000));
  return chinaTime;
}

/**
 * 获取相对于指定时间的中国时间（用于expires_at等）
 * @param {number} days 天数
 * @param {number} hours 小时数（可选）
 * @returns {Date} 中国时区的未来时间
 */
function getChinaFutureTime(days = 0, hours = 0) {
  const chinaTime = getChinaCurrentTime();
  chinaTime.setDate(chinaTime.getDate() + days);
  chinaTime.setHours(chinaTime.getHours() + hours);
  return chinaTime;
}

/**
 * 格式化中国时间为数据库插入格式
 * @param {Date} date 中国时区的Date对象
 * @returns {string} 适合数据库的格式
 */
function formatChinaTimeForDB(date = null) {
  const chinaTime = date || getChinaCurrentTime();
  return getChinaCurrentTimeMySQL();
}

module.exports = {
  getChinaCurrentTime,
  getChinaCurrentTimeISO,
  getChinaCurrentTimeMySQL,
  convertToChinaTime,
  getChinaFutureTime,
  formatChinaTimeForDB
};
