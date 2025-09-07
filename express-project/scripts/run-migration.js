const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'xiaoshiliu',
  charset: 'utf8mb4'
};

async function runMigration() {
  let connection;
  
  try {
    console.log('开始数据库迁移：为posts和comments表添加ip_location字段...');
    
    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 读取迁移SQL文件
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrate-ip-location.sql'), 
      'utf8'
    );
    
    // 执行迁移SQL（分割多个语句）
    const sqlStatements = migrationSQL
      .split(';')
      .map(sql => sql.trim())
      .filter(sql => sql.length > 0 && !sql.startsWith('--'));
    
    for (const sql of sqlStatements) {
      if (sql.trim()) {
        console.log(`执行SQL: ${sql.substring(0, 50)}...`);
        await connection.execute(sql);
      }
    }
    
    console.log('数据库迁移完成！');
    console.log('修改内容：');
    console.log('1. posts表添加了ip_location字段，用于记录发布时的IP属地');
    console.log('2. comments表添加了ip_location字段，用于记录评论时的IP属地');
    console.log('3. 已有数据的ip_location字段已从用户表的location字段复制');
    console.log('4. 添加了相关索引以提升查询性能');
    
  } catch (error) {
    console.error('数据库迁移失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 运行迁移
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('迁移脚本执行成功');
      process.exit(0);
    })
    .catch(error => {
      console.error('迁移脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
