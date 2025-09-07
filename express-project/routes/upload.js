const express = require('express');
const router = express.Router();
const multer = require('multer');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { authenticateToken } = require('../middleware/auth');
const { uploadToImageHost, uploadBase64ToImageHost } = require('../utils/uploadHelper');
const { uploadToMultipleHosts, getEnabledImageHosts, updateImageHostConfig, addImageHostConfig, deleteImageHostConfig } = require('../utils/multiImageHostUploader');

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

// 单文件上传到图床
router.post('/single', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 400, message: '没有上传文件' });
    }

    // 使用多图床上传（按优先级依次尝试）
    const result = await uploadToMultipleHosts(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    if (result.success) {
      // 记录用户上传操作日志
      console.log(`单文件上传成功 - 用户ID: ${req.user.id}, 文件名: ${req.file.originalname}`);

      res.json({
        code: 200,
        message: '上传成功',
        data: {
          originalname: req.file.originalname,
          size: req.file.size,
          url: result.url
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

    const uploadResults = [];
    
    for (const file of req.files) {
      const result = await uploadToMultipleHosts(
        file.buffer,
        file.originalname,
        file.mimetype
      );
      
      if (result.success) {
        uploadResults.push({
          originalname: file.originalname,
          size: file.size,
          url: result.url
        });
      }
    }

    if (uploadResults.length === 0) {
      return res.status(400).json({ code: 400, message: '所有文件上传失败' });
    }

    // 记录用户上传操作日志
    console.log(`多文件上传成功 - 用户ID: ${req.user.id}, 文件数量: ${uploadResults.length}`);

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
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ code: 400, message: '没有提供图片数据' });
    }

    const uploadResults = [];
    let processedCount = 0;

    for (const base64Data of images) {
      processedCount++;

      // 使用通用上传函数
      const result = await uploadBase64ToImageHost(base64Data);

      if (result.success) {
        uploadResults.push(result.url);
      }
    }

    if (uploadResults.length === 0) {
      return res.status(400).json({ code: 400, message: '所有图片上传失败' });
    }

    // 记录用户上传操作日志
    console.log(`Base64图片上传成功 - 用户ID: ${req.user.id}, 上传数量: ${uploadResults.length}`);

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        urls: uploadResults,
        count: uploadResults.length
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
    
    // 使用多图床上传
    const result = await uploadToMultipleHosts(imageBuffer, fileName, mimeType);
    
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

// 图床管理接口

// 获取所有图床配置
router.get('/image-hosts', authenticateToken, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '需要管理员权限'
      });
    }
    
    const imageHosts = await getEnabledImageHosts();
    // 获取所有图床（包括禁用的）
    const { pool } = require('../config/database');
    const [allHosts] = await pool.execute(
      'SELECT * FROM image_hosts ORDER BY priority DESC, id ASC'
    );
    
    res.json({
      success: true,
      data: allHosts
    });
    
  } catch (error) {
    console.error('获取图床配置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取图床配置失败'
    });
  }
});

// 更新图床配置
router.put('/image-hosts/:id', authenticateToken, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '需要管理员权限'
      });
    }
    
    const hostId = req.params.id;
    const config = req.body;
    
    const success = await updateImageHostConfig(hostId, config);
    
    if (success) {
      res.json({
        success: true,
        message: '图床配置更新成功'
      });
    } else {
      res.status(400).json({
        success: false,
        message: '图床配置更新失败'
      });
    }
    
  } catch (error) {
    console.error('更新图床配置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新图床配置失败'
    });
  }
});

// 添加新图床配置
router.post('/image-hosts', authenticateToken, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '需要管理员权限'
      });
    }
    
    const config = req.body;
    const hostId = await addImageHostConfig(config);
    
    if (hostId) {
      res.json({
        success: true,
        message: '图床配置添加成功',
        id: hostId
      });
    } else {
      res.status(400).json({
        success: false,
        message: '图床配置添加失败'
      });
    }
    
  } catch (error) {
    console.error('添加图床配置失败:', error);
    res.status(500).json({
      success: false,
      message: '添加图床配置失败'
    });
  }
});

// 删除图床配置
router.delete('/image-hosts/:id', authenticateToken, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '需要管理员权限'
      });
    }
    
    const hostId = req.params.id;
    const success = await deleteImageHostConfig(hostId);
    
    if (success) {
      res.json({
        success: true,
        message: '图床配置删除成功'
      });
    } else {
      res.status(400).json({
        success: false,
        message: '图床配置删除失败'
      });
    }
    
  } catch (error) {
    console.error('删除图床配置失败:', error);
    res.status(500).json({
      success: false,
      message: '删除图床配置失败'
    });
  }
});

// 测试图床配置
router.post('/image-hosts/:id/test', authenticateToken, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '需要管理员权限'
      });
    }
    
    const hostId = req.params.id;
    const { pool } = require('../config/database');
    const [hosts] = await pool.execute('SELECT * FROM image_hosts WHERE id = ?', [hostId]);
    
    if (hosts.length === 0) {
      return res.status(404).json({
        success: false,
        message: '图床配置不存在'
      });
    }
    
    const hostConfig = hosts[0];
    
    // 创建一个测试用的1x1像素透明PNG
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77ygAAAABJRU5ErkJggg==', 'base64');
    
    const { uploadToHost } = require('../utils/multiImageHostUploader');
    const result = await uploadToHost(testImageBuffer, 'test.png', 'image/png', hostConfig);
    
    res.json({
      success: result.success,
      message: result.success ? '图床测试成功' : '图床测试失败',
      url: result.url,
      error: result.error
    });
    
  } catch (error) {
    console.error('测试图床配置失败:', error);
    res.status(500).json({
      success: false,
      message: '测试图床配置失败',
      error: error.message
    });
  }
});

module.exports = router;