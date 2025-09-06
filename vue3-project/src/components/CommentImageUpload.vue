<template>
  <div class="comment-image-upload">
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileSelect"
    />
    <button 
      class="upload-btn" 
      @click="triggerFileSelect"
      :disabled="uploading"
      title="上传图片"
    >
      <SvgIcon name="imgNote" width="20" height="20" />
      <span v-if="uploading" class="uploading-text">上传中...</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SvgIcon from './SvgIcon.vue'

const emit = defineEmits(['uploaded'])

const fileInput = ref(null)
const uploading = ref(false)

const triggerFileSelect = () => {
  if (uploading.value) return
  fileInput.value?.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    emit('error', '请选择图片文件')
    return
  }

  // 验证文件大小 (最大5MB)
  if (file.size > 5 * 1024 * 1024) {
    emit('error', '图片大小不能超过5MB')
    return
  }

  try {
    uploading.value = true
    const imageUrl = await uploadTo4399(file)
    
    if (imageUrl) {
      // 生成markdown格式
      const markdown = `![${file.name}](${imageUrl})`
      emit('uploaded', markdown)
      emit('success', '图片上传成功')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    emit('error', '图片上传失败，请重试')
  } finally {
    uploading.value = false
    // 清空input值，允许重复选择同一文件
    event.target.value = ''
  }
}

const uploadTo4399 = async (file) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)

    // 使用后端代理接口上传到4399图床
    fetch('/api/upload/4399', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('上传请求失败')
      }
      return response.json()
    })
    .then(data => {
      if (data.success && data.data && data.data.imageUrl) {
        resolve(data.data.imageUrl)
      } else {
        reject(new Error(data.message || '上传响应格式错误'))
      }
    })
    .catch(error => {
      reject(error)
    })
  })
}
</script>

<style scoped>
.comment-image-upload {
  display: inline-block;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--text-color-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 12px;
}

.upload-btn:hover {
  color: var(--text-color-primary);
  background: var(--bg-color-secondary);
}

.upload-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.uploading-text {
  font-size: 12px;
  color: var(--text-color-secondary);
}
</style> 