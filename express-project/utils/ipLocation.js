const axios = require('axios');

/**
 * 获取IP属地信息
 * @param {string} ip - IP地址
 * @returns {Promise<string>} 返回省份信息
 */
async function getIPLocation(ip) {
  try {
    // 如果是本地IP，返回默认值
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      console.log(`IP属地查询: ${ip} -> 本地IP，返回"本地"`);
      return '本地';
    }

    console.log(`IP属地查询开始: ${ip}`);

    // 调用IP属地API
    const response = await axios.get(`https://app.ipdatacloud.com/v2/free_query`, {
      params: {
        ip: ip
      },
      timeout: 10000 // 10秒超时
    });

    console.log(`主API响应:`, {
      status: response.status,
      code: response.data?.code,
      data: response.data?.data
    });

    if (response.data && response.data.code === 200 && response.data.data) {
      const locationData = response.data.data;
      // 根据API返回的数据结构提取省份信息
      if (locationData.province) {
        const result = locationData.province.replace('省', '').replace('壮族自治区', '').replace('回族自治区', '').replace('特别行政区', '').replace('市', '').replace('维吾尔自治区', '').replace('自治区', '');
        console.log(`IP属地查询成功: ${ip} -> ${result} (来源: province字段)`);
        return result;
      } else if (locationData.region_name) {
        const result = locationData.region_name.replace('省', '').replace('壮族自治区', '').replace('回族自治区', '').replace('特别行政区', '').replace('市', '').replace('维吾尔自治区', '').replace('自治区', '');
        console.log(`IP属地查询成功: ${ip} -> ${result} (来源: region_name字段)`);
        return result;
      } else {
        console.log(`主API返回数据中没有找到省份信息:`, locationData);
      }
    } else {
      console.log(`主API响应格式不符合预期:`, {
        hasData: !!response.data,
        code: response.data?.code,
        hasDataField: !!response.data?.data
      });
    }

    // 如果主接口返回未知，尝试备用接口（保留原备用接口作为备份）
    console.log(`主API未返回有效数据，尝试备用API`);
    try {
      const backupResponse = await axios.get(`https://api.pearktrue.cn/api/ip/high`, {
        params: {
          ip: ip
        },
        timeout: 5000 // 5秒超时
      });

      console.log(`备用API响应:`, {
        status: backupResponse.status,
        code: backupResponse.data?.code,
        data: backupResponse.data?.data
      });

      if (backupResponse.data && backupResponse.data.code === 200 && backupResponse.data.data && backupResponse.data.data.province) {
        const result = backupResponse.data.data.province.replace('省', '').replace('壮族自治区', '').replace('回族自治区', '').replace('特别行政区', '').replace('市', '').replace('维吾尔自治区', '').replace('自治区', '');
        console.log(`IP属地查询成功: ${ip} -> ${result} (来源: 备用API)`);
        return result;
      } else {
        console.log(`备用API也未返回有效数据`);
      }
    } catch (backupError) {
      console.error('备用IP属地接口调用失败:', backupError.message);
    }

    console.log(`IP属地查询失败: ${ip} -> 未知 (所有API都未返回有效数据)`);
    return '未知';
  } catch (error) {
    console.error('获取IP属地失败:', error.message);
    console.log(`IP属地查询异常: ${ip} -> 未知 (异常: ${error.message})`);
    return '未知';
  }
}

/**
 * 从请求中获取真实IP地址
 * @param {Object} req - Express请求对象
 * @returns {string} IP地址
 */
function getRealIP(req) {
  let ip = req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    req.ip;

  console.log('IP获取详情:', {
    'x-forwarded-for': req.headers['x-forwarded-for'],
    'x-real-ip': req.headers['x-real-ip'],
    'connection.remoteAddress': req.connection?.remoteAddress,
    'socket.remoteAddress': req.socket?.remoteAddress,
    'req.ip': req.ip,
    '原始获取的IP': ip
  });

  // 处理IPv4映射的IPv6地址格式，去掉::ffff:前缀
  if (ip && typeof ip === 'string' && ip.startsWith('::ffff:')) {
    const originalIp = ip;
    ip = ip.substring(7); // 去掉'::ffff:'前缀
    console.log(`IPv6格式处理: ${originalIp} -> ${ip}`);
  }

  // 如果是x-forwarded-for头，可能包含多个IP，取第一个
  if (ip && typeof ip === 'string' && ip.includes(',')) {
    const originalIp = ip;
    ip = ip.split(',')[0].trim();
    console.log(`多IP处理: ${originalIp} -> ${ip}`);
  }

  console.log(`最终获取的IP: ${ip}`);
  return ip;
}

module.exports = {
  getIPLocation,
  getRealIP
};