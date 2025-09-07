/**
 * IP属地获取功能测试脚本
 * 用于测试和调试IP地址获取和属地解析功能
 */

const { getIPLocation, getRealIP } = require('../utils/ipLocation');

async function testIPLocation() {
  console.log('=== IP属地获取功能测试 ===\n');

  // 测试不同类型的IP地址
  const testIPs = [
    '8.8.8.8',        // Google DNS
    '114.114.114.114', // 国内DNS
    '1.1.1.1',        // Cloudflare DNS
    '223.5.5.5',      // 阿里DNS
    '127.0.0.1',      // 本地IP
    '192.168.1.1',    // 内网IP
    '::1',            // IPv6本地
  ];

  for (const ip of testIPs) {
    console.log(`\n--- 测试IP: ${ip} ---`);
    try {
      const location = await getIPLocation(ip);
      console.log(`结果: ${location}\n`);
    } catch (error) {
      console.error(`错误: ${error.message}\n`);
    }
    
    // 添加延迟避免API限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// 测试Express请求IP获取（模拟）
function testGetRealIP() {
  console.log('\n=== IP获取功能测试 ===\n');

  const mockRequests = [
    {
      name: '正常请求',
      req: {
        headers: {},
        connection: { remoteAddress: '192.168.1.100' },
        ip: '192.168.1.100'
      }
    },
    {
      name: '通过代理的请求',
      req: {
        headers: { 'x-forwarded-for': '8.8.8.8' },
        connection: { remoteAddress: '192.168.1.1' },
        ip: '192.168.1.1'
      }
    },
    {
      name: '多IP代理请求',
      req: {
        headers: { 'x-forwarded-for': '8.8.8.8, 192.168.1.1' },
        connection: { remoteAddress: '10.0.0.1' },
        ip: '10.0.0.1'
      }
    },
    {
      name: 'IPv6映射请求',
      req: {
        headers: {},
        connection: { remoteAddress: '::ffff:192.168.1.100' },
        ip: '::ffff:192.168.1.100'
      }
    },
    {
      name: 'Nginx代理请求',
      req: {
        headers: { 
          'x-real-ip': '8.8.8.8',
          'x-forwarded-for': '8.8.8.8'
        },
        connection: { remoteAddress: '127.0.0.1' },
        ip: '127.0.0.1'
      }
    }
  ];

  mockRequests.forEach(({ name, req }) => {
    console.log(`\n--- ${name} ---`);
    const ip = getRealIP(req);
    console.log(`获取到的IP: ${ip}\n`);
  });
}

// 执行测试
async function runTests() {
  try {
    // 先测试IP获取
    testGetRealIP();
    
    // 再测试IP属地解析
    await testIPLocation();
    
    console.log('=== 测试完成 ===');
  } catch (error) {
    console.error('测试执行失败:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests()
    .then(() => {
      console.log('\n所有测试已完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('测试失败:', error);
      process.exit(1);
    });
}

module.exports = { testIPLocation, testGetRealIP, runTests };
