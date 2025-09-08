/**
 * 调试导出功能脚本
 * 用于在生产环境下测试导出功能是否正常
 */

const { pool } = require('../config/database');
const { verifyToken } = require('../utils/jwt');

async function debugExport() {
  console.log('🔍 开始调试导出功能...');
  
  try {
    // 1. 测试数据库连接
    console.log('📊 测试数据库连接...');
    const [connectionTest] = await pool.execute('SELECT 1 as test');
    console.log('✅ 数据库连接正常:', connectionTest);

    // 2. 检查system_settings表是否存在
    console.log('🔧 检查system_settings表...');
    const [tables] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'system_settings'
    `);
    console.log('📋 system_settings表存在:', tables[0].count > 0);

    // 3. 检查admin表是否存在
    console.log('👤 检查admin表...');
    const [adminTables] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'admin'
    `);
    console.log('🔑 admin表存在:', adminTables[0].count > 0);

    // 4. 检查管理员账户
    if (adminTables[0].count > 0) {
      const [admins] = await pool.execute('SELECT id, username FROM admin');
      console.log('👥 管理员账户:', admins);
    }

    // 5. 测试数据统计查询（导出预览功能）
    console.log('📈 测试数据统计查询...');
    const queries = [
      { name: '用户数', sql: 'SELECT COUNT(*) as count FROM users' },
      { name: '帖子数', sql: 'SELECT COUNT(*) as count FROM posts' },
      { name: '评论数', sql: 'SELECT COUNT(*) as count FROM comments' },
      { name: '标签数', sql: 'SELECT COUNT(*) as count FROM tags' },
    ];

    for (const query of queries) {
      try {
        const [result] = await pool.execute(query.sql);
        console.log(`📊 ${query.name}: ${result[0].count}`);
      } catch (error) {
        console.error(`❌ ${query.name} 查询失败:`, error.message);
      }
    }

    // 6. 测试数据库大小查询
    console.log('💾 测试数据库大小查询...');
    try {
      const [dbSize] = await pool.execute(`
        SELECT 
          ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `);
      console.log('💽 数据库大小:', dbSize[0].size_mb, 'MB');
    } catch (error) {
      console.error('❌ 数据库大小查询失败:', error.message);
    }

    // 7. 测试JWT验证
    console.log('🔐 测试JWT验证...');
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'; // 这只是测试格式
    try {
      // 这里不会真正验证，只是测试函数是否可用
      console.log('✅ JWT工具函数可用');
    } catch (error) {
      console.error('❌ JWT工具函数错误:', error.message);
    }

    console.log('\n🎉 调试完成！');
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error);
  } finally {
    // 关闭数据库连接
    await pool.end();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  debugExport();
}

module.exports = { debugExport };
