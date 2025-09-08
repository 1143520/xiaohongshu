/**
 * 图床配置文件
 * 支持多种图床服务
 */

const axios = require('axios');
const FormData = require('form-data');

// 图床配置
const imageHosts = {
  // 默认图床（原来的）
  default: {
    name: '新叶图床',
    url: 'https://api.xinyew.cn/api/jdtc',
    async upload(fileBuffer, filename, mimetype) {
      try {
        const boundary = `----formdata-${Date.now()}`;
        const formDataBody = Buffer.concat([
          Buffer.from(`--${boundary}\r\n`),
          Buffer.from(`Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`),
          Buffer.from(`Content-Type: ${mimetype}\r\n\r\n`),
          fileBuffer,
          Buffer.from(`\r\n--${boundary}--\r\n`)
        ]);

        const response = await axios.post(this.url, formDataBody, {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': formDataBody.length
          },
          timeout: 60000
        });

        if (response.data && response.data.errno === 0 && response.data.data && response.data.data.url) {
          const imageUrl = response.data.data.url.trim().replace(/\`/g, '').replace(/\s+/g, '');
          return {
            success: true,
            url: imageUrl
          };
        } else {
          return {
            success: false,
            message: '图床返回错误'
          };
        }
      } catch (error) {
        return {
          success: false,
          message: error.message || '上传失败'
        };
      }
    }
  },

  // 4399图床
  game4399: {
    name: '4399图床',
    url: 'https://api.h5wan.4399sj.com/html5/report/upload',
    async upload(fileBuffer, filename, mimetype) {
      try {
        const formData = new FormData();
        formData.append('file', fileBuffer, {
          filename: filename,
          contentType: mimetype
        });

        const response = await axios.post(this.url, formData, {
          headers: {
            ...formData.getHeaders(),
            'device': 'main_pc'
          },
          timeout: 60000
        });

        if (response.status === 200 && response.data.code === 1000) {
          if (response.data && response.data.data && response.data.data.file) {
            let imageUrl = response.data.data.file.split('?')[0];
            return {
              success: true,
              url: imageUrl
            };
          }
        }

        return {
          success: false,
          message: '4399图床上传失败'
        };
      } catch (error) {
        return {
          success: false,
          message: error.message || '4399图床上传失败'
        };
      }
    }
  },

  // NodeImage图床
  nodeimage: {
    name: 'NodeImage',
    url: 'https://api.nodeimage.com/api/upload',
    requiresApiKey: true,
    async upload(fileBuffer, filename, mimetype, apiKey) {
      try {
        if (!apiKey) {
          return {
            success: false,
            message: 'NodeImage需要API密钥'
          };
        }

        const formData = new FormData();
        formData.append('image', fileBuffer, {
          filename: filename,
          contentType: mimetype
        });

        const response = await axios.post(this.url, formData, {
          headers: {
            ...formData.getHeaders(),
            'X-API-Key': apiKey
          },
          timeout: 60000
        });

        if (response.status === 200 && response.data.success) {
          return {
            success: true,
            url: response.data.url || response.data.data?.url
          };
        }

        return {
          success: false,
          message: 'NodeImage上传失败'
        };
      } catch (error) {
        return {
          success: false,
          message: error.message || 'NodeImage上传失败'
        };
      }
    }
  }
};

/**
 * 根据图床类型上传图片
 * @param {string} hostType - 图床类型
 * @param {Buffer} fileBuffer - 文件缓冲区
 * @param {string} filename - 文件名
 * @param {string} mimetype - 文件类型
 * @param {string} apiKey - API密钥（可选）
 * @returns {Promise<{success: boolean, url?: string, message?: string}>}
 */
async function uploadToImageHost(hostType = 'default', fileBuffer, filename, mimetype, apiKey = null) {
  const host = imageHosts[hostType];
  
  if (!host) {
    return {
      success: false,
      message: `不支持的图床类型: ${hostType}`
    };
  }

  if (host.requiresApiKey && !apiKey) {
    return {
      success: false,
      message: `${host.name}需要API密钥`
    };
  }

  console.log(`使用 ${host.name} 上传图片: ${filename}`);
  
  try {
    return await host.upload(fileBuffer, filename, mimetype, apiKey);
  } catch (error) {
    console.error(`${host.name} 上传失败:`, error);
    return {
      success: false,
      message: `${host.name} 上传失败: ${error.message}`
    };
  }
}

/**
 * 从base64数据上传到指定图床
 * @param {string} hostType - 图床类型
 * @param {string} base64Data - base64格式的图片数据
 * @param {string} apiKey - API密钥（可选）
 * @returns {Promise<{success: boolean, url?: string, message?: string}>}
 */
async function uploadBase64ToImageHost(hostType = 'default', base64Data, apiKey = null) {
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

    return await uploadToImageHost(hostType, imageBuffer, filename, mimetype, apiKey);
  } catch (error) {
    console.error('Base64图片上传失败:', error);
    return {
      success: false,
      message: error.message || 'Base64图片上传失败'
    };
  }
}

/**
 * 获取所有可用的图床配置
 * @returns {Object} 图床配置信息
 */
function getAvailableImageHosts() {
  const hosts = {};
  Object.keys(imageHosts).forEach(key => {
    hosts[key] = {
      name: imageHosts[key].name,
      requiresApiKey: imageHosts[key].requiresApiKey || false
    };
  });
  return hosts;
}

module.exports = {
  uploadToImageHost,
  uploadBase64ToImageHost,
  getAvailableImageHosts,
  imageHosts
};
