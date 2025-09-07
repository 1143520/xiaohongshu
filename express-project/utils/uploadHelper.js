const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * 上传文件到图床
 * @param {Buffer} fileBuffer - 文件缓冲区
 * @param {string} filename - 文件名
 * @param {string} mimetype - 文件MIME类型
 * @returns {Promise<{success: boolean, url?: string, message?: string}>}
 */
async function uploadToImageHost(fileBuffer, filename, mimetype) {
  try {
    // 直接查询数据库获取图床配置，避免循环依赖
    const { pool } = require('../config/database');
    
    let imageHostType = 'xinyew'; // 默认值
    let nodeimageApiKey = '';
    
    try {
      const [settings] = await pool.execute(
        'SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?, ?)',
        ['image_host_type', 'nodeimage_api_key']
      );
      
      settings.forEach(setting => {
        if (setting.setting_key === 'image_host_type') {
          imageHostType = setting.setting_value || 'xinyew';
        } else if (setting.setting_key === 'nodeimage_api_key') {
          nodeimageApiKey = setting.setting_value || '';
        }
      });
    } catch (dbError) {
      console.warn('获取图床配置失败，使用默认配置:', dbError.message);
    }
    
    switch (imageHostType) {
      case 'xinyew':
        return await uploadToXinyew(fileBuffer, filename, mimetype);
      case '4399':
        return await uploadTo4399(fileBuffer, filename, mimetype);
      case 'nodeimage':
        return await uploadToNodeImage(fileBuffer, filename, mimetype, nodeimageApiKey);
      default:
        return await uploadToXinyew(fileBuffer, filename, mimetype);
    }
  } catch (error) {
    console.error('❌ 图床上传失败:', error.message);
    return {
      success: false,
      message: error.message || '图床上传失败'
    };
  }
}

/**
 * 上传到新叶图床
 */
async function uploadToXinyew(fileBuffer, filename, mimetype) {
  try {
    // 构建multipart/form-data请求体
    const boundary = `----formdata-${Date.now()}`;

    const formDataBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(`Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`),
      Buffer.from(`Content-Type: ${mimetype}\r\n\r\n`),
      fileBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    // 上传到图床
    const response = await axios.post('https://api.xinyew.cn/api/jdtc', formDataBody, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': formDataBody.length
      },
      timeout: 60000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });

    if (response.data && response.data.errno === 0 && response.data.data && response.data.data.url) {
      const imageUrl = response.data.data.url.trim().replace(/\`/g, '').replace(/\s+/g, '');
      return {
        success: true,
        url: imageUrl
      };
    } else {
      console.log('❌ 新叶图床返回错误:', response.data);
      return {
        success: false,
        message: '新叶图床上传失败'
      };
    }
  } catch (error) {
    console.error('❌ 新叶图床上传失败:', error.message);
    return {
      success: false,
      message: error.message || '新叶图床上传失败'
    };
  }
}

/**
 * 上传到4399图床
 */
async function uploadTo4399(fileBuffer, filename, mimetype) {
  try {
    // 构建multipart/form-data请求体
    const boundary = `----formdata-${Date.now()}`;

    const formDataBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(`Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`),
      Buffer.from(`Content-Type: ${mimetype}\r\n\r\n`),
      fileBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    // 上传到4399图床
    const response = await axios.post('https://api.h5wan.4399sj.com/html5/report/upload', formDataBody, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': formDataBody.length,
        'device': 'main_pc'
      },
      timeout: 60000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });

    if (response.data && response.data.code === 1000 && response.data.data && response.data.data.file) {
      // 去除URL中的查询参数
      const imageUrl = response.data.data.file.split('?')[0];
      return {
        success: true,
        url: imageUrl
      };
    } else {
      console.log('❌ 4399图床返回错误:', response.data);
      return {
        success: false,
        message: '4399图床上传失败'
      };
    }
  } catch (error) {
    console.error('❌ 4399图床上传失败:', error.message);
    return {
      success: false,
      message: error.message || '4399图床上传失败'
    };
  }
}

/**
 * 上传到NodeImage图床
 */
async function uploadToNodeImage(fileBuffer, filename, mimetype, apiKey) {
  try {
    if (!apiKey) {
      return {
        success: false,
        message: 'NodeImage API Key未配置'
      };
    }

    // 构建multipart/form-data请求体
    const boundary = `----formdata-${Date.now()}`;

    const formDataBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(`Content-Disposition: form-data; name="image"; filename="${filename}"\r\n`),
      Buffer.from(`Content-Type: ${mimetype}\r\n\r\n`),
      fileBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    // 上传到NodeImage图床
    const response = await axios.post('https://api.nodeimage.com/api/upload', formDataBody, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': formDataBody.length,
        'X-API-Key': apiKey
      },
      timeout: 60000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });

    if (response.data && response.data.success && response.data.url) {
      return {
        success: true,
        url: response.data.url
      };
    } else {
      console.log('❌ NodeImage图床返回错误:', response.data);
      return {
        success: false,
        message: response.data?.message || 'NodeImage图床上传失败'
      };
    }
  } catch (error) {
    console.error('❌ NodeImage图床上传失败:', error.message);
    return {
      success: false,
      message: error.message || 'NodeImage图床上传失败'
    };
  }
}

/**
 * 从base64数据上传到图床
 * @param {string} base64Data - base64格式的图片数据
 * @returns {Promise<{success: boolean, url?: string, message?: string}>}
 */
async function uploadBase64ToImageHost(base64Data) {
  try {
    // 验证base64格式
    if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:image/')) {
      return {
        success: false,
        message: '无效的base64数据'
      };
    }

    // 解析base64数据
    const matches = base64Data.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) {
      return {
        success: false,
        message: 'base64格式不正确'
      };
    }

    const imageType = matches[1];
    const imageBuffer = Buffer.from(matches[2], 'base64');

    // 检查文件大小（50MB限制）
    if (imageBuffer.length > 50 * 1024 * 1024) {
      return {
        success: false,
        message: '图片大小超过50MB限制'
      };
    }

    const filename = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${imageType}`;
    const mimetype = `image/${imageType}`;

    return await uploadToImageHost(imageBuffer, filename, mimetype);
  } catch (error) {
    console.error('❌ Base64图片上传失败:', error.message);
    return {
      success: false,
      message: error.message || 'Base64图片上传失败'
    };
  }
}

/**
 * 从文件路径上传到图床
 * @param {string} filePath - 文件路径
 * @param {string} originalname - 原始文件名
 * @param {string} mimetype - 文件MIME类型
 * @param {boolean} deleteAfterUpload - 上传后是否删除本地文件
 * @returns {Promise<{success: boolean, url?: string, message?: string}>}
 */
async function uploadFileToImageHost(filePath, originalname, mimetype, deleteAfterUpload = true) {
  try {
    // 读取文件
    const fileBuffer = fs.readFileSync(filePath);
    const filename = originalname || path.basename(filePath);

    const result = await uploadToImageHost(fileBuffer, filename, mimetype);

    // 上传成功后删除本地文件
    if (result.success && deleteAfterUpload && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result;
  } catch (error) {
    console.error('❌ 文件上传失败:', error.message);
    // 确保删除临时文件
    if (deleteAfterUpload && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return {
      success: false,
      message: error.message || '文件上传失败'
    };
  }
}

/**
 * 管理员权限验证中间件
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
async function adminAuth(req, res, next) {
  try {
    const { authenticateToken } = require('../middleware/auth');

    // 先进行token验证
    authenticateToken(req, res, (err) => {
      if (err) {
        return res.status(401).json({
          code: 401,
          message: '认证失败'
        });
      }

      // 检查是否为管理员
      if (!req.user || !req.user.type || req.user.type !== 'admin') {
        return res.status(403).json({
          code: 403,
          message: '权限不足，需要管理员权限'
        });
      }

      next();
    });
  } catch (error) {
    console.error('管理员权限验证失败:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
}

module.exports = {
  uploadToImageHost,
  uploadBase64ToImageHost,
  uploadFileToImageHost,
  adminAuth
};