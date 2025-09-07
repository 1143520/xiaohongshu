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
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 更新系统设置
router.put('/settings', adminAuth, async (req, res) => {
  try {
    const settings = req.body;

    // 开始事务
    await pool.execute('START TRANSACTION');

    try {
      for (const [key, data] of Object.entries(settings)) {
        const value = typeof data.value === 'boolean' ? data.value.toString() : data.value.toString();
        
        // 使用 INSERT ... ON DUPLICATE KEY UPDATE
        await pool.execute(
          `INSERT INTO system_settings (setting_key, setting_value, description) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           setting_value = VALUES(setting_value), 
           description = VALUES(description)`,
          [key, value, data.description || '']
        );
      }

      await pool.execute('COMMIT');

      console.log(`管理员 ${req.user.id} 更新了系统设置:`, Object.keys(settings));

      res.json({
        code: 200,
        message: '系统设置更新成功'
      });
    } catch (error) {
      await pool.execute('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('更新系统设置失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
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
