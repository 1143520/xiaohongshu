const express = require('express');
const router = express.Router();
const multer = require('multer');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { authenticateToken } = require('../middleware/auth');
const { uploadToImageHost: uploadToImageHostOld, uploadBase64ToImageHost: uploadBase64ToImageHostOld } = require('../utils/uploadHelper');
const { uploadToImageHost, uploadBase64ToImageHost, getAvailableImageHosts } = require('../utils/imageHosts');

// 配置 multer 内存存储（用于云端图床）
const storage = multer.memoryStorage();

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 检查文件类型
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'), false);
  }
};

// 配置 multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB 限制
  }
});

// 获取可用图床列表
router.get('/hosts', authenticateToken, (req, res) => {
  try {
    const hosts = getAvailableImageHosts();
    res.json({
      code: 200,
      message: '获取成功',
      data: hosts
    });
  } catch (error) {
    console.error('获取图床列表失败:', error);
    res.status(500).json({ code: 500, message: '获取图床列表失败' });
  }
});

// 单文件上传到图床
router.post('/single', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 400, message: '没有上传文件' });
    }

    // 获取图床类型和API密钥（可选）
    const hostType = req.body.hostType || 'default';
    const apiKey = req.body.apiKey || null;

    console.log(`上传图片 - 图床类型: ${hostType}, 文件名: ${req.file.originalname}`);

    // 使用新的图床上传函数
    const result = await uploadToImageHost(
      hostType,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      apiKey
    );

    if (result.success) {
      // 记录用户上传操作日志
      console.log(`单文件上传成功 - 用户ID: ${req.user.id}, 文件名: ${req.file.originalname}, 图床: ${hostType}`);

      res.json({
        code: 200,
        message: '上传成功',
        data: {
          originalname: req.file.originalname,
          size: req.file.size,
          url: result.url,
          hostType: hostType
        }
      });
    } else {
      res.status(400).json({ code: 400, message: result.message || '图床上传失败' });
    }
  } catch (error) {
    console.error('单文件上传失败:', error);
    res.status(500).json({ code: 500, message: '上传失败' });
  }
});

// 多文件上传到图床
router.post('/multiple', authenticateToken, upload.array('files', 9), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ code: 400, message: '没有上传文件' });
    }

    // 获取图床类型和API密钥（可选）
    const hostType = req.body.hostType || 'default';
    const apiKey = req.body.apiKey || null;

    const uploadResults = [];
    
    for (const file of req.files) {
      const result = await uploadToImageHost(
        hostType,
        file.buffer,
        file.originalname,
        file.mimetype,
        apiKey
      );
      
      if (result.success) {
        uploadResults.push({
          originalname: file.originalname,
          size: file.size,
          url: result.url,
          hostType: hostType
        });
      }
    }

    if (uploadResults.length === 0) {
      return res.status(400).json({ code: 400, message: '所有文件上传失败' });
    }

    // 记录用户上传操作日志
    console.log(`多文件上传成功 - 用户ID: ${req.user.id}, 文件数量: ${uploadResults.length}, 图床: ${hostType}`);

    res.json({
      code: 200,
      message: '上传成功',
      data: uploadResults
    });
  } catch (error) {
    console.error('多文件上传失败:', error);
    res.status(500).json({ code: 500, message: '上传失败' });
  }
});

// Base64图片上传到图床
router.post('/base64', authenticateToken, async (req, res) => {
  try {
    const { images, hostType = 'default', apiKey = null } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ code: 400, message: '没有提供图片数据' });
    }

    const uploadResults = [];
    let processedCount = 0;

    for (const base64Data of images) {
      processedCount++;

      // 使用新的图床上传函数
      const result = await uploadBase64ToImageHost(hostType, base64Data, apiKey);

      if (result.success) {
        uploadResults.push(result.url);
      }
    }

    if (uploadResults.length === 0) {
      return res.status(400).json({ code: 400, message: '所有图片上传失败' });
    }

    // 记录用户上传操作日志
    console.log(`Base64图片上传成功 - 用户ID: ${req.user.id}, 上传数量: ${uploadResults.length}, 图床: ${hostType}`);

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        urls: uploadResults,
        count: uploadResults.length,
        hostType: hostType
      }
    });
  } catch (error) {
    console.error('Base64图片上传失败:', error);
    res.status(500).json({ code: 500, message: '上传失败' });
  }
});

// 注意：使用云端图床后，文件删除由图床服务商管理

// 错误处理中间件
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ code: 400, message: '文件大小超过限制（50MB）' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ code: 400, message: '文件数量超过限制（9个）' });
    }
  }

  if (error.message === '只允许上传图片文件') {
    return res.status(400).json({ code: 400, message: error.message });
  }

  console.error('文件上传错误:', error);
  res.status(500).json({ code: 500, message: '文件上传失败' });
});

// 图片链接转换接口
router.post('/convert-link', authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少图片链接' 
      });
    }
    
    // 验证URL格式
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        message: '无效的图片链接格式' 
      });
    }
    
    console.log(`开始转换图片链接 - 用户ID: ${req.user.id}, URL: ${url}`);
    
    // 下载图片
    const imageBuffer = await downloadImage(url);
    
    // 获取文件扩展名
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const ext = pathname.split('.').pop() || 'jpg';
    const fileName = `converted_${Date.now()}.${ext}`;
    
    // 确定MIME类型
    const mimeType = getMimeType(ext);
    
    // 上传到图床
    const result = await uploadToImageHost(imageBuffer, fileName, mimeType);
    
    if (result.success) {
      console.log(`图片链接转换成功 - 用户ID: ${req.user.id}, 原URL: ${url}, 新URL: ${result.url}`);
      
      res.json({
        success: true,
        message: '图片链接转换成功',
        url: result.url
      });
    } else {
      throw new Error(result.message || '图片上传失败');
    }
    
  } catch (error) {
    console.error('图片链接转换失败:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || '图片链接转换失败' 
    });
  }
});

// 下载图片的辅助函数
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.pinterest.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      },
      timeout: 30000
    };
    
    const req = client.request(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`图片下载失败: HTTP ${res.statusCode}`));
        return;
      }
      
      const chunks = [];
      
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`网络请求失败: ${error.message}`));
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('图片下载超时'));
    });
    
    req.end();
  });
}

// 根据文件扩展名获取MIME类型
function getMimeType(ext) {
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml'
  };
  
  return mimeTypes[ext.toLowerCase()] || 'image/jpeg';
}

module.exports = router;