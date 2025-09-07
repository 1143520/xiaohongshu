/**
 * 时区测试脚本
 * 验证后端时间处理是否正确使用中国UTC+8时区
 */

const { pool } = require('./config/database');
const { 
  getChinaCurrentTime, 
  getChinaCurrentTimeISO, 
  getChinaCurrentTimeMySQL,
  getChinaFutureTime 
} = require('./utils/timeHelper');

async function testTimezone() {
  try {
    console.log('=== 时区测试开始 ===');
    
    // 1. 测试时间工具函数
    console.log('\n1. 时间工具函数测试:');
    console.log('中国当前时间:', getChinaCurrentTime());
    console.log('中国当前时间ISO:', getChinaCurrentTimeISO());
    console.log('中国当前时间MySQL:', getChinaCurrentTimeMySQL());
    console.log('中国未来7天时间:', getChinaFutureTime(7));
    
    // 2. 测试数据库时区
    console.log('\n2. 数据库时区测试:');
    const [timezoneResult] = await pool.execute('SELECT @@time_zone as current_timezone');
    console.log('数据库当前时区:', timezoneResult[0].current_timezone);
    
    const [nowResult] = await pool.execute('SELECT NOW() as db_now');
    console.log('数据库NOW()时间:', nowResult[0].db_now);
    
    // 3. 测试时间插入和查询
    console.log('\n3. 时间插入查询测试:');
    const testTime = getChinaCurrentTimeMySQL();
    console.log('准备插入的时间:', testTime);
    
    // 创建测试表（如果不存在）
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS timezone_test (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_time DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 插入测试数据
    const [insertResult] = await pool.execute(
      'INSERT INTO timezone_test (test_time) VALUES (?)',
      [testTime]
    );
    
    // 查询刚插入的数据
    const [selectResult] = await pool.execute(
      'SELECT * FROM timezone_test WHERE id = ?',
      [insertResult.insertId]
    );
    
    console.log('查询到的数据:', selectResult[0]);
    
    // 清理测试数据
    await pool.execute('DELETE FROM timezone_test WHERE id = ?', [insertResult.insertId]);
    
    console.log('\n=== 时区测试完成 ===');
    
  } catch (error) {
    console.error('时区测试失败:', error);
  } finally {
    await pool.end();
  }
}

// 运行测试
testTimezone();
