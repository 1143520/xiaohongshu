#!/usr/bin/env node
/**
 * 测试上传图床接口 - 验证 /api/upload/hosts 接口
 * 
 * 使用方法：
 * node test-upload-hosts-api.js [后端地址]
 * 
 * 示例：
 * node test-upload-hosts-api.js http://localhost:3001
 * node test-upload-hosts-api.js https://your-domain.com
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// 获取命令行参数中的后端地址，默认为生产环境地址
const backendUrl = process.argv[2] || 'https://redbook.1143520.xyz';

console.log('🔍 测试图床接口:', `${backendUrl}/api/upload/hosts`);
console.log('=' .repeat(60));

/**
 * 发送HTTP请求
 */
function makeRequest(url, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Upload-Hosts-Tester/1.0'
      }
    };

    // 如果提供了token，添加Authorization头
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    
    req.end();
  });
}

/**
 * 测试无Token访问
 */
async function testWithoutToken() {
  console.log('📝 测试1: 无Token访问（应该返回401）');
  try {
    const response = await makeRequest(`${backendUrl}/api/upload/hosts`);
    console.log(`   状态码: ${response.statusCode}`);
    console.log(`   响应: ${response.body}`);
    
    if (response.statusCode === 401) {
      console.log('   ✅ 正确: 需要身份验证');
    } else {
      console.log('   ⚠️  意外: 应该需要身份验证');
    }
  } catch (error) {
    console.log(`   ❌ 错误: ${error.message}`);
  }
  console.log('');
}

/**
 * 测试伪Token访问
 */
async function testWithFakeToken() {
  console.log('📝 测试2: 伪Token访问（应该返回401或403）');
  try {
    const fakeToken = 'fake-token-for-testing';
    const response = await makeRequest(`${backendUrl}/api/upload/hosts`, fakeToken);
    console.log(`   状态码: ${response.statusCode}`);
    console.log(`   响应: ${response.body}`);
    
    if (response.statusCode === 401 || response.statusCode === 403) {
      console.log('   ✅ 正确: Token验证失败');
    } else {
      console.log('   ⚠️  意外: Token验证应该失败');
    }
  } catch (error) {
    console.log(`   ❌ 错误: ${error.message}`);
  }
  console.log('');
}

/**
 * 测试健康检查接口
 */
async function testHealthCheck() {
  console.log('📝 测试3: 健康检查接口');
  try {
    const response = await makeRequest(`${backendUrl}/api/health`);
    console.log(`   状态码: ${response.statusCode}`);
    console.log(`   响应: ${response.body}`);
    
    if (response.statusCode === 200) {
      console.log('   ✅ 正确: 后端服务正常运行');
    } else {
      console.log('   ❌ 错误: 后端服务可能有问题');
    }
  } catch (error) {
    console.log(`   ❌ 错误: ${error.message}`);
  }
  console.log('');
}

/**
 * 测试路由存在性
 */
async function testRouteExists() {
  console.log('📝 测试4: 路由存在性检查');
  try {
    const response = await makeRequest(`${backendUrl}/api/upload/nonexistent`);
    console.log(`   状态码: ${response.statusCode}`);
    console.log(`   响应: ${response.body}`);
    
    if (response.statusCode === 404) {
      console.log('   ✅ 正确: 不存在的路由返回404');
    } else if (response.statusCode === 401) {
      console.log('   ✅ 正确: 需要身份验证（说明upload路由存在）');
    } else {
      console.log('   ⚠️  意外状态码');
    }
  } catch (error) {
    console.log(`   ❌ 错误: ${error.message}`);
  }
  console.log('');
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始测试图床接口...\n');
  
  await testHealthCheck();
  await testWithoutToken();
  await testWithFakeToken();
  await testRouteExists();
  
  console.log('=' .repeat(60));
  console.log('📋 测试总结:');
  console.log('• 如果健康检查失败，检查后端服务是否启动');
  console.log('• 如果upload路由404，检查路由是否正确注册');
  console.log('• 如果需要真实Token测试，请先登录获取Token');
  console.log('');
  console.log('💡 获取真实Token的方法:');
  console.log('1. 在浏览器中登录应用');
  console.log('2. 打开开发者工具 > Application > Local Storage');
  console.log('3. 找到 "token" 字段并复制其值');
  console.log('4. 运行: node test-upload-hosts-api.js [URL] [TOKEN]');
}

// 如果提供了第三个参数作为真实token，进行完整测试
if (process.argv[3]) {
  const realToken = process.argv[3];
  
  async function testWithRealToken() {
    console.log('📝 测试5: 真实Token访问');
    try {
      const response = await makeRequest(`${backendUrl}/api/upload/hosts`, realToken);
      console.log(`   状态码: ${response.statusCode}`);
      console.log(`   响应: ${response.body}`);
      
      if (response.statusCode === 200) {
        console.log('   ✅ 成功: 图床接口工作正常');
        try {
          const data = JSON.parse(response.body);
          if (data.data && Array.isArray(data.data)) {
            console.log(`   📊 图床数量: ${data.data.length}`);
            data.data.forEach((host, index) => {
              console.log(`      ${index + 1}. ${host.name} (${host.id})`);
            });
          }
        } catch (e) {
          console.log('   ⚠️  响应不是有效JSON');
        }
      } else {
        console.log('   ❌ 错误: 图床接口异常');
      }
    } catch (error) {
      console.log(`   ❌ 错误: ${error.message}`);
    }
    console.log('');
  }
  
  // 扩展测试
  runTests().then(() => testWithRealToken());
} else {
  runTests();
}
