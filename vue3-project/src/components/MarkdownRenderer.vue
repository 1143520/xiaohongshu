<template>
  <div class="markdown-renderer" v-html="renderedContent" @click="handleImageClick"></div>
  
  <!-- 图片预览模态框 -->
  <div v-if="showImageModal" class="image-modal-overlay" @click="closeImageModal">
    <div class="image-modal" @click.stop>
      <button class="close-btn" @click="closeImageModal">
        <SvgIcon name="close" width="24" height="24" />
      </button>
      <img :src="modalImageSrc" :alt="modalImageAlt" class="modal-image" />
      <div class="image-info">
        <span class="image-name">{{ modalImageAlt }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { parseMentions } from '@/utils/mentionParser'
import SvgIcon from './SvgIcon.vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  maxImageWidth: {
    type: String,
    default: '200px'
  },
  maxImageHeight: {
    type: String,
    default: '150px'
  }
})

const showImageModal = ref(false)
const modalImageSrc = ref('')
const modalImageAlt = ref('')

// 渲染Markdown内容
const renderedContent = computed(() => {
  if (!props.content) return ''

  let content = props.content
  
  // 先处理mention和URL链接
  content = parseMentions(content)
  
  // 处理Markdown图片语法 ![alt](url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  content = content.replace(imageRegex, (match, alt, url) => {
    return `<img src="${url}" alt="${alt}" class="markdown-image" data-original-src="${url}" data-alt="${alt}" style="max-width: ${props.maxImageWidth}; max-height: ${props.maxImageHeight}; cursor: pointer; border-radius: 8px; margin: 4px 0;" />`
  })
  
  // 处理换行
  content = content.replace(/\n/g, '<br>')
  
  return content
})

// 处理图片点击事件
const handleImageClick = (event) => {
  const target = event.target
  
  // 检查是否点击的是图片
  if (target.tagName === 'IMG' && target.classList.contains('markdown-image')) {
    event.preventDefault()
    modalImageSrc.value = target.getAttribute('data-original-src') || target.src
    modalImageAlt.value = target.getAttribute('data-alt') || target.alt
    showImageModal.value = true
  }
  // 检查是否点击的是mention链接
  else if (target.classList.contains('mention-link')) {
    event.preventDefault()
    const userId = target.getAttribute('data-user-id')
    if (userId) {
      const userUrl = `${window.location.origin}/user/${userId}`
      window.open(userUrl, '_blank')
    }
  }
  // URL链接已经有target="_blank"，不需要额外处理
}

const closeImageModal = () => {
  showImageModal.value = false
  modalImageSrc.value = ''
  modalImageAlt.value = ''
}
</script>

<style scoped>
.markdown-renderer {
  word-wrap: break-word;
  line-height: 1.5;
}

:deep(.markdown-image) {
  display: block;
  border-radius: 8px;
  margin: 8px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

:deep(.markdown-image:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

/* 图片预览模态框 */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.image-modal {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: var(--bg-color-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  z-index: 1;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.modal-image {
  max-width: 100%;
  max-height: calc(90vh - 60px);
  object-fit: contain;
  display: block;
}

.image-info {
  padding: 12px 16px;
  background: var(--bg-color-secondary);
  border-top: 1px solid var(--border-color);
}

.image-name {
  font-size: 14px;
  color: var(--text-color-primary);
  font-weight: 500;
}

/* mention和URL链接样式 */
:deep(.mention-link) {
  color: var(--text-color-tag);
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

:deep(.mention-link:hover) {
  color: var(--text-color-tag);
  opacity: 0.8;
}

:deep(.url-link) {
  color: var(--text-color-primary);
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s ease;
}

:deep(.url-link:hover) {
  color: var(--text-color-tag);
  opacity: 0.8;
}
</style> 