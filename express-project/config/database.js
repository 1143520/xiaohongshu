// 数据库配置
const mysql = require('mysql2/promise');
const config = require('./config');

// 数据库连接配置 - 统一使用中国时区 UTC+8
const dbConfig = {
  ...config.database,
  timezone: '+08:00',  // 强制使用中国时区
  dateStrings: false,  // 返回Date对象而不是字符串
  charset: 'utf8mb4',
  // 确保连接时就设置时区
  typeCast: function (field, next) {
    if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
      return new Date(field.string() + '+08:00');
    }
    return next();
  }
};

// 创建连接池
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 连接初始化时设置时区
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// 连接池初始化时设置时区
pool.on('connection', function (connection) {
  // 设置连接的时区为中国时区
  connection.query('SET time_zone = "+08:00"');
  console.log('数据库连接已建立，时区设置为 UTC+8');
});

module.exports = {
  pool
};