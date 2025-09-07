const axios = require('axios');
const FormData = require('form-data');
const { pool } = require('../config/database');

/**
 * 获取启用的图床配置列表（按优先级排序）
 */
async function getEnabledImageHosts() {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM image_hosts WHERE is_enabled = 1 ORDER BY priority DESC, id ASC'
    );
    return rows;
  } catch (error) {
    console.error('获取图床配置失败:', error);
    return [];
  }
}

/**
 * 根据字段路径从对象中获取值
 * @param {Object} obj - 目标对象
 * @param {string} path - 字段路径，如 'data.url' 或 'result.file'
 */
function getValueByPath(obj, path) {
  if (!path) return obj;
  
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

/**
 * 检查响应是否成功
 * @param {Object} response - HTTP响应对象
 * @param {Object} data - 响应数据
 * @param {Object} config - 图床配置
 */
function isUploadSuccess(response, data, config) {
  // 检查HTTP状态码
  if (response.status.toString() !== config.success_code) {
    return false;
  }
  
  // 如果有成功字段配置，检查该字段的值
  if (config.success_field && config.success_value) {
    const fieldValue = getValueByPath(data, config.success_field);
    return fieldValue && fieldValue.toString() === config.success_value;
  }
  
  return true;
}

/**
 * 使用指定图床上传文件
 * @param {Buffer} fileBuffer - 文件缓冲区
 * @param {string} filename - 文件名
 * @param {string} mimetype - 文件MIME类型
 * @param {Object} hostConfig - 图床配置
 */
async function uploadToHost(fileBuffer, filename, mimetype, hostConfig) {
  try {
    console.log(`尝试使用 ${hostConfig.name} 上传图片: ${filename}`);
    
    // 创建FormData
    const formData = new FormData();
    formData.append(hostConfig.form_field, fileBuffer, {
      filename: filename,
      contentType: mimetype
    });
    
    // 准备请求头
    const headers = {
      ...formData.getHeaders()
    };
    
    // 添加自定义请求头
    if (hostConfig.headers) {
      const customHeaders = typeof hostConfig.headers === 'string' 
        ? JSON.parse(hostConfig.headers) 
        : hostConfig.headers;
      Object.assign(headers, customHeaders);
    }
    
    // 如果有API Key，添加到请求头
    if (hostConfig.api_key) {
      headers['X-API-Key'] = hostConfig.api_key;
    }
    
    // 发送请求
    const response = await axios({
      method: hostConfig.method || 'POST',
      url: hostConfig.url,
      data: formData,
      headers: headers,
      timeout: hostConfig.timeout || 30000,
      maxContentLength: hostConfig.max_file_size || 52428800,
      maxBodyLength: hostConfig.max_file_size || 52428800
    });
    
    // 检查响应是否成功
    if (!isUploadSuccess(response, response.data, hostConfig)) {
      throw new Error(`上传失败: HTTP ${response.status}, 响应: ${JSON.stringify(response.data)}`);
    }
    
    // 提取图片URL
    let imageUrl = getValueByPath(response.data, hostConfig.response_url_path);
    
    if (!imageUrl) {
      throw new Error(`无法从响应中提取图片URL: ${JSON.stringify(response.data)}`);
    }
    
    // 如果URL不包含协议，添加https
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = 'https:' + imageUrl;
    }
    
    // 移除URL中的查询参数（如果有的话）
    imageUrl = imageUrl.split('?')[0];
    
    console.log(`${hostConfig.name} 上传成功: ${imageUrl}`);
    
    return {
      success: true,
      url: imageUrl,
      hostName: hostConfig.name
    };
    
  } catch (error) {
    console.error(`${hostConfig.name} 上传失败:`, error.message);
    return {
      success: false,
      error: error.message,
      hostName: hostConfig.name
    };
  }
}

/**
 * 多图床上传（按优先级依次尝试）
 * @param {Buffer} fileBuffer - 文件缓冲区
 * @param {string} filename - 文件名
 * @param {string} mimetype - 文件MIME类型
 */
async function uploadToMultipleHosts(fileBuffer, filename, mimetype) {
  const imageHosts = await getEnabledImageHosts();
  
  if (imageHosts.length === 0) {
    return {
      success: false,
      message: '没有可用的图床配置'
    };
  }
  
  const errors = [];
  
  // 按优先级依次尝试每个图床
  for (const host of imageHosts) {
    try {
      const result = await uploadToHost(fileBuffer, filename, mimetype, host);
      
      if (result.success) {
        return {
          success: true,
          url: result.url,
          hostName: result.hostName,
          message: `上传成功 (${result.hostName})`
        };
      } else {
        errors.push(`${host.name}: ${result.error}`);
      }
    } catch (error) {
      errors.push(`${host.name}: ${error.message}`);
    }
  }
  
  // 所有图床都失败了
  return {
    success: false,
    message: '所有图床上传失败',
    errors: errors
  };
}

/**
 * 更新图床配置
 * @param {number} hostId - 图床ID
 * @param {Object} config - 配置数据
 */
async function updateImageHostConfig(hostId, config) {
  try {
    const [result] = await pool.execute(
      `UPDATE image_hosts SET 
        name = ?, url = ?, method = ?, headers = ?, form_field = ?, 
        api_key = ?, response_url_path = ?, success_code = ?, 
        success_field = ?, success_value = ?, is_enabled = ?, 
        priority = ?, timeout = ?, max_file_size = ?, description = ?
      WHERE id = ?`,
      [
        config.name, config.url, config.method, 
        typeof config.headers === 'object' ? JSON.stringify(config.headers) : config.headers,
        config.form_field, config.api_key, config.response_url_path,
        config.success_code, config.success_field, config.success_value,
        config.is_enabled, config.priority, config.timeout,
        config.max_file_size, config.description, hostId
      ]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('更新图床配置失败:', error);
    return false;
  }
}

/**
 * 添加新图床配置
 * @param {Object} config - 配置数据
 */
async function addImageHostConfig(config) {
  try {
    const [result] = await pool.execute(
      `INSERT INTO image_hosts 
        (name, url, method, headers, form_field, api_key, response_url_path, 
         success_code, success_field, success_value, is_enabled, priority, 
         timeout, max_file_size, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        config.name, config.url, config.method,
        typeof config.headers === 'object' ? JSON.stringify(config.headers) : config.headers,
        config.form_field, config.api_key, config.response_url_path,
        config.success_code, config.success_field, config.success_value,
        config.is_enabled, config.priority, config.timeout,
        config.max_file_size, config.description
      ]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('添加图床配置失败:', error);
    return false;
  }
}

/**
 * 删除图床配置
 * @param {number} hostId - 图床ID
 */
async function deleteImageHostConfig(hostId) {
  try {
    const [result] = await pool.execute('DELETE FROM image_hosts WHERE id = ?', [hostId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('删除图床配置失败:', error);
    return false;
  }
}

module.exports = {
  uploadToMultipleHosts,
  getEnabledImageHosts,
  updateImageHostConfig,
  addImageHostConfig,
  deleteImageHostConfig,
  uploadToHost
}; 