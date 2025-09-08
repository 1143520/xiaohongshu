/**
 * 维护模式测试脚本
 * 用于验证维护模式前后端联动功能
 */

const axios = require('axios');
const config = require('../config/config');

// 测试配置
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? config.api.baseUrl 
  : `http://localhost:${config.server.port}`;

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

let adminToken = '';

/**
 * 管理员登录获取token
 */
async function adminLogin() {
  try {
    console.log('🔑 正在进行管理员登录...');
    const response = await axios.post(`${BASE_URL}/api/auth/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (response.data.code === 200) {
      adminToken = response.data.data.token;
      console.log('✅ 管理员登录成功');
      return true;
    } else {
      console.log('❌ 管理员登录失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 管理员登录错误:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * 获取当前系统设置
 */
async function getSystemSettings() {
  try {
    console.log('📋 获取当前系统设置...');
    const response = await axios.get(`${BASE_URL}/api/system/settings`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.code === 200) {
      const settings = response.data.data;
      console.log('✅ 系统设置获取成功');
      console.log('维护模式状态:', settings.maintenance_mode?.value ? '开启' : '关闭');
      return settings;
    } else {
      console.log('❌ 获取系统设置失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ 获取系统设置错误:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * 设置维护模式状态
 */
async function setMaintenanceMode(enabled) {
  try {
    console.log(`🔧 ${enabled ? '开启' : '关闭'}维护模式...`);
    const response = await axios.put(`${BASE_URL}/api/system/settings`, {
      key: 'maintenance_mode',
      value: enabled
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.code === 200) {
      console.log(`✅ 维护模式已${enabled ? '开启' : '关闭'}`);
      return true;
    } else {
      console.log(`❌ 设置维护模式失败:`, response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 设置维护模式错误:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * 测试普通用户API访问
 */
async function testUserApiAccess() {
  try {
    console.log('👤 测试普通用户API访问...');
    const response = await axios.get(`${BASE_URL}/api/posts?page=1&pageSize=10`);
    
    if (response.data.code === 200) {
      console.log('✅ 普通用户API访问成功');
      return true;
    } else {
      console.log('❌ 普通用户API访问失败:', response.data.message);
      return false;
    }
  } catch (error) {
    if (error.response?.status === 503) {
      console.log('🚧 普通用户API访问被维护模式拦截 (503)');
      console.log('响应数据:', error.response.data);
      return 'maintenance';
    } else {
      console.error('❌ 普通用户API访问错误:', error.response?.data?.message || error.message);
      return false;
    }
  }
}

/**
 * 测试管理员API访问
 */
async function testAdminApiAccess() {
  try {
    console.log('👑 测试管理员API访问...');
    const response = await axios.get(`${BASE_URL}/api/system/settings`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.code === 200) {
      console.log('✅ 管理员API访问成功');
      return true;
    } else {
      console.log('❌ 管理员API访问失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 管理员API访问错误:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * 主测试流程
 */
async function runMaintenanceTest() {
  console.log('🧪 开始维护模式测试\n');

  // 1. 管理员登录
  if (!(await adminLogin())) {
    console.log('❌ 测试失败：无法获取管理员权限');
    return;
  }

  // 2. 获取当前设置
  const initialSettings = await getSystemSettings();
  if (!initialSettings) {
    console.log('❌ 测试失败：无法获取系统设置');
    return;
  }

  const wasMaintenanceEnabled = initialSettings.maintenance_mode?.value || false;
  console.log('\n--- 测试开始时维护模式状态 ---');
  console.log('维护模式:', wasMaintenanceEnabled ? '已开启' : '已关闭');

  try {
    // 3. 测试正常模式下的API访问
    console.log('\n--- 测试正常模式下的API访问 ---');
    if (!wasMaintenanceEnabled) {
      await testUserApiAccess();
      await testAdminApiAccess();
    }

    // 4. 开启维护模式
    console.log('\n--- 开启维护模式测试 ---');
    if (await setMaintenanceMode(true)) {
      // 等待1秒让设置生效
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 测试维护模式下的访问
      const userResult = await testUserApiAccess();
      const adminResult = await testAdminApiAccess();
      
      if (userResult === 'maintenance' && adminResult === true) {
        console.log('✅ 维护模式测试通过：普通用户被拦截，管理员可正常访问');
      } else {
        console.log('❌ 维护模式测试失败：拦截逻辑有问题');
      }
    }

    // 5. 关闭维护模式
    console.log('\n--- 关闭维护模式测试 ---');
    if (await setMaintenanceMode(false)) {
      // 等待1秒让设置生效
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 测试关闭后的访问
      const userResult = await testUserApiAccess();
      const adminResult = await testAdminApiAccess();
      
      if (userResult === true && adminResult === true) {
        console.log('✅ 恢复正常模式测试通过：所有用户都可正常访问');
      } else {
        console.log('❌ 恢复正常模式测试失败');
      }
    }

    // 6. 恢复初始状态
    console.log('\n--- 恢复初始状态 ---');
    await setMaintenanceMode(wasMaintenanceEnabled);

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    // 确保恢复初始状态
    await setMaintenanceMode(wasMaintenanceEnabled);
  }

  console.log('\n🏁 维护模式测试完成');
}

// 执行测试
if (require.main === module) {
  runMaintenanceTest().catch(console.error);
}

module.exports = {
  runMaintenanceTest,
  setMaintenanceMode,
  testUserApiAccess,
  testAdminApiAccess
};
