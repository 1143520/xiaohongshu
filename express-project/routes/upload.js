const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const { uploadToImageHost, uploadBase64ToImageHost } = require('../utils/uploadHelper');
const fetch = require('node-fetch'); // 需要安装: npm install node-fetch@2
const FormData = require('form-data');
const { responseHelper } = require('../utils/responseHelper');

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

    // 直接使用图床上传函数（传入buffer数据）
    const result = await uploadToImageHost(
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
      const result = await uploadToImageHost(
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

// 4399图床代理上传接口
router.post('/4399', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return responseHelper.error(res, '请选择要上传的文件');
    }

    // 创建FormData用于转发请求
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // 转发到4399图床API
    const response = await fetch('https://api.h5wan.4399sj.com/html5/report/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'device': 'main_pc',
        ...formData.getHeaders()
      }
    });

    const data = await response.json();

    if (response.ok && data.code === 1000 && data.data && data.data.file) {
      const imageUrl = data.data.file.split('?')[0];
      return responseHelper.success(res, {
        imageUrl,
        originalName: req.file.originalname
      }, '上传成功');
    } else {
      return responseHelper.error(res, '图床服务返回错误');
    }

  } catch (error) {
    console.error('4399图床上传失败:', error);
    return responseHelper.error(res, '上传失败，请重试');
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

module.exports = router;