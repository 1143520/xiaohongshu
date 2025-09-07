/**
 * 标签表字段长度升级迁移脚本
 * 将标签名称字段从 varchar(50) 升级到 varchar(300)
 */

const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs');

async function migrateTagsVarchar300() {
  let connection = null;
  
  try {
    console.log('🚀 开始执行标签表字段长度升级迁移...');
    
    connection = await pool.getConnection();
    
    // 检查当前字段长度
    console.log('📋 检查当前标签表结构...');
    const [currentStructure] = await connection.execute(
      "SHOW COLUMNS FROM `tags` LIKE 'name'"
    );
    
    if (currentStructure.length > 0) {
      console.log('当前name字段类型:', currentStructure[0].Type);
      
      // 如果已经是varchar(300)，则跳过迁移
      if (currentStructure[0].Type.includes('varchar(300)')) {
        console.log('✅ 标签表字段长度已经是300字符，无需迁移');
        return;
      }
    }
    
    // 执行迁移
    console.log('🔄 正在修改标签表字段长度...');
    await connection.execute(
      "ALTER TABLE `tags` MODIFY COLUMN `name` varchar(300) NOT NULL COMMENT '标签名'"
    );
    
    // 验证修改结果
    const [newStructure] = await connection.execute(
      "SHOW COLUMNS FROM `tags` LIKE 'name'"
    );
    
    console.log('修改后name字段类型:', newStructure[0].Type);
    
    console.log('✅ 标签表字段长度升级完成！');
    console.log('📊 迁移摘要:');
    console.log('   - 标签名称字段: varchar(50) → varchar(300)');
    console.log('   - 支持更长的标签名称');
    console.log('   - 现有数据保持不变');
    
  } catch (error) {
    console.error('❌ 迁移执行失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  migrateTagsVarchar300()
    .then(() => {
      console.log('🎉 迁移脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 迁移脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { migrateTagsVarchar300 };
