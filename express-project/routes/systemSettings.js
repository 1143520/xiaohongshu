/**
 * 系统设置管理
 * 包括用户注册开关、系统维护模式等
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { adminAuth } = require('../utils/uploadHelper');

// 获取系统设置
router.get('/settings', adminAuth, async (req, res) => {
  try {
    // 检查表是否存在
    const [tableExists] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'system_settings'
    `);

    if (tableExists[0].count === 0) {
      // 表不存在，创建表和默认数据
      console.log('system_settings表不存在，正在创建...');
      
      // 创建表
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS \`system_settings\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT COMMENT '设置ID',
          \`setting_key\` varchar(100) NOT NULL COMMENT '设置键名',
          \`setting_value\` text NOT NULL COMMENT '设置值',
          \`description\` varchar(255) DEFAULT NULL COMMENT '设置描述',
          \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
          \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`uk_setting_key\` (\`setting_key\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统设置表'
      `);

      // 插入默认设置
      const defaultSettings = [
        ['user_registration_enabled', 'true', '是否开启用户注册'],
        ['maintenance_mode', 'false', '维护模式开关'],
        ['max_posts_per_day', '20', '用户每日最大发帖数量'],
        ['max_upload_size', '50', '最大上传文件大小(MB)'],
        ['site_notice', '', '站点公告'],
        ['comment_approval_required', 'false', '评论是否需要审核']
      ];

      for (const [key, value, description] of defaultSettings) {
        await pool.execute(
          'INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES (?, ?, ?)',
          [key, value, description]
        );
      }
      
      console.log('system_settings表创建并初始化完成');
    }

    // 查询所有系统设置
    const [settings] = await pool.execute(
      'SELECT setting_key, setting_value, description FROM system_settings ORDER BY setting_key'
    );

    // 转换为对象格式
    const settingsObj = {};
    settings.forEach(setting => {
      // 自动转换布尔值和数字
      let value = setting.setting_value;
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(value) && value !== '') value = Number(value);

      settingsObj[setting.setting_key] = {
        value: value,
        description: setting.description
      };
    });

    res.json({
      code: 200,
      message: 'success',
      data: settingsObj
    });
  } catch (error) {
    console.error('获取系统设置失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '服务器内部错误',
      error: error.message 
    });
  }
});

// 更新系统设置
router.put('/settings', adminAuth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const settings = req.body;

    // 开始事务
    await connection.beginTransaction();

    try {
      for (const [key, data] of Object.entries(settings)) {
        const value = typeof data.value === 'boolean' ? data.value.toString() : data.value.toString();
        const description = data.description || '';
        
        // 先检查记录是否存在
        const [existing] = await connection.execute(
          'SELECT id FROM system_settings WHERE setting_key = ?',
          [key]
        );

        if (existing.length > 0) {
          // 记录存在，更新
          await connection.execute(
            'UPDATE system_settings SET setting_value = ?, description = ? WHERE setting_key = ?',
            [value, description, key]
          );
        } else {
          // 记录不存在，插入
          await connection.execute(
            'INSERT INTO system_settings (setting_key, setting_value, description) VALUES (?, ?, ?)',
            [key, value, description]
          );
        }
      }

      await connection.commit();

      console.log(`管理员 ${req.user.adminId || req.user.id} 更新了系统设置:`, Object.keys(settings));

      res.json({
        code: 200,
        message: '系统设置更新成功'
      });
    } catch (error) {
      await connection.rollback();
      console.error('更新系统设置事务失败:', error);
      throw error;
    }
  } catch (error) {
    console.error('更新系统设置失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '服务器内部错误',
      error: error.message 
    });
  } finally {
    connection.release();
  }
});

// 获取单个设置值（供系统内部调用）
async function getSystemSetting(key, defaultValue = null) {
  try {
    const [rows] = await pool.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      [key]
    );

    if (rows.length === 0) {
      return defaultValue;
    }

    let value = rows[0].setting_value;
    
    // 自动转换数据类型
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(value) && value !== '') return Number(value);
    
    return value;
  } catch (error) {
    console.error(`获取系统设置 ${key} 失败:`, error);
    return defaultValue;
  }
}

// 检查用户注册是否开启
async function isRegistrationEnabled() {
  return await getSystemSetting('user_registration_enabled', true);
}

// 检查系统是否处于维护模式
async function isMaintenanceMode() {
  return await getSystemSetting('maintenance_mode', false);
}

module.exports = {
  router,
  getSystemSetting,
  isRegistrationEnabled,
  isMaintenanceMode
};
