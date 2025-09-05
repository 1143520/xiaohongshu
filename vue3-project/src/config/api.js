// API配置文件
export const apiConfig = {
  // 后端API基础URL
  baseURL: '/api',

  // 请求超时时间（毫秒）
  timeout: 60000, // 增加到60秒，适应多图片上传场景

  // 默认请求头
  defaultHeaders: {
    'Content-Type': 'application/json'
  },

  // 分页配置
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100
  },

  // 文件上传配置
upload: {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxImageCount: 9, // 最多上传9张图片
  // 上传方式配置
  uploadMethods: {
    server: {
      name: '服务器上传',
      url: '/api/upload/images',
      description: '上传到本地服务器'
    },
    external: {
      name: '4399图床',
      url: 'https://api.h5wan.4399sj.com/html5/report/upload',
      description: '上传到4399图床'
    }
  },
  defaultMethod: 'server' // 默认使用服务器上传
}
}

// 本地开发环境配置
// 所有环境都使用 localhost:3001/api

export default apiConfig