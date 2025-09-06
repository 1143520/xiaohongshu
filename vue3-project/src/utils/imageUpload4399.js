/**
 * 4399图床上传工具
 */

/**
 * 上传图片到4399图床
 * @param {File} file - 图片文件
 * @returns {Promise<string>} - 返回图片URL
 */
export async function uploadTo4399(file) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    
    // 使用原生fetch而不是GM_xmlhttpRequest
    fetch('https://api.h5wan.4399sj.com/html5/report/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'device': 'main_pc'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.code === 1000 && data.data && data.data.file) {
        const imageUrl = data.data.file.split('?')[0]
        resolve(imageUrl)
      } else {
        reject(new Error('图片上传失败，请重试'))
      }
    })
    .catch(error => {
      console.error('4399图床上传失败:', error)
      reject(new Error('图片上传失败，请重试'))
    })
  })
}

/**
 * 验证图片文件
 * @param {File} file - 文件对象
 * @returns {boolean} - 是否有效
 */
export function validateImageFile(file) {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('只支持 JPG、PNG、GIF、WebP 格式的图片')
  }
  
  // 检查文件大小 (10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('图片大小不能超过 10MB')
  }
  
  return true
}

/**
 * 生成Markdown格式的图片标签
 * @param {string} url - 图片URL
 * @param {string} alt - alt文本
 * @returns {string} - Markdown格式
 */
export function generateMarkdownImage(url, alt = '图片') {
  return `![${alt}](${url})`
} 