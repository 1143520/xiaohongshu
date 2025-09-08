/**
 * 简单的IP测试脚本 - 直接测试API调用
 */

const axios = require('axios');

async function testAPI() {
  console.log('=== 直接测试IP查询API ===\n');
  
  const testIP = '8.8.8.8';
  
  try {
    console.log(`测试IP: ${testIP}`);
    console.log('正在调用主API...\n');
    
    const response = await axios.get('https://app.ipdatacloud.com/v2/free_query', {
      params: { ip: testIP },
      timeout: 10000
    });
    
    console.log('HTTP状态码:', response.status);
    console.log('完整响应数据:', JSON.stringify(response.data, null, 2));
    
    // 分析响应结构
    if (response.data) {
      console.log('\n=== 响应分析 ===');
      console.log('response.data 存在:', !!response.data);
      console.log('response.data.code:', response.data.code);
      console.log('response.data.data 存在:', !!response.data.data);
      
      if (response.data.data) {
        console.log('province 字段:', response.data.data.province);
        console.log('region_name 字段:', response.data.data.region_name);
        console.log('city 字段:', response.data.data.city);
        console.log('country 字段:', response.data.data.country);
      }
    }
    
  } catch (error) {
    console.error('主API调用失败:', error.message);
    console.log('错误详情:', error.response?.data || error);
  }
  
  // 测试备用API
  try {
    console.log('\n=== 测试备用API ===');
    const backupResponse = await axios.get('https://api.pearktrue.cn/api/ip/high', {
      params: { ip: testIP },
      timeout: 5000
    });
    
    console.log('备用API HTTP状态码:', backupResponse.status);
    console.log('备用API完整响应:', JSON.stringify(backupResponse.data, null, 2));
    
  } catch (backupError) {
    console.error('备用API调用失败:', backupError.message);
  }
}

// 测试本地IP判断
function testLocalIP() {
  console.log('\n=== 测试本地IP判断 ===');
  
  const testIPs = [
    '127.0.0.1',
    '192.168.1.1', 
    '10.0.0.1',
    '172.16.0.1',
    '8.8.8.8'
  ];
  
  testIPs.forEach(ip => {
    const isLocal = !ip || ip === '127.0.0.1' || ip === '::1' || 
                   ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.');
    console.log(`${ip} -> ${isLocal ? '本地IP' : '公网IP'}`);
  });
}

async function main() {
  testLocalIP();
  await testAPI();
}

if (require.main === module) {
  main().catch(console.error);
}
