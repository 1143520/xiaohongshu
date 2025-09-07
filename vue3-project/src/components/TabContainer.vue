<script setup>
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    tabs: {
        type: Array,
        required: true,
        default: () => []
    },
    activeTab: {
        type: String,
        default: ''
    },
    enableDrag: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['tab-change'])

const containerRef = ref(null)
const tabItems = ref([])
const activeId = ref(props.activeTab || (props.tabs.length > 0 ? props.tabs[0].id : ''))
const sliderLeft = ref(0)
const sliderWidth = ref(0)

function tabSelected(item) {
    activeId.value = item.id
    emit('tab-change', item)
    updateSlider()
}

// 更新滑块位置和宽度
const updateSlider = () => {
    nextTick(() => {
        const activeIndex = props.tabs.findIndex(tab => tab.id === activeId.value)
        if (activeIndex === -1) return

        // 检查tab元素是否存在
        if (!tabItems.value[activeIndex]) {
            // 如果元素不存在，延迟重试
            setTimeout(() => updateSlider(), 50)
            return
        }

        // 检查容器是否隐藏
        if (!containerRef.value || containerRef.value.offsetParent === null) {
            // 容器隐藏时，延迟重试
            setTimeout(() => updateSlider(), 100)
            return
        }

        const tabRect = tabItems.value[activeIndex].getBoundingClientRect()
        const containerRect = containerRef.value.getBoundingClientRect()

        // 计算滑块相对于容器的位置
        const calculatedLeft = tabRect.left - containerRect.left + containerRef.value.scrollLeft
        const calculatedWidth = tabRect.width

        // 确保计算结果有效（宽度大于0且容器可见）
        if (calculatedWidth > 0 && containerRect.width > 0) {
            sliderLeft.value = calculatedLeft
            sliderWidth.value = calculatedWidth
        } else {
            // 如果计算结果无效，延迟重试
            setTimeout(() => updateSlider(), 100)
        }
    })
}

// 拖拽滑动逻辑（仅在enableDrag为true时启用）
let isDown = false
let startX = 0
let scrollLeft = 0

function onMouseDown(e) {
    if (!props.enableDrag) return
    isDown = true
    startX = e.pageX - containerRef.value.offsetLeft
    scrollLeft = containerRef.value.scrollLeft
    containerRef.value.classList.add('dragging')
}

function onMouseLeave() {
    if (!props.enableDrag) return
    isDown = false
    containerRef.value.classList.remove('dragging')
}

function onMouseUp() {
    if (!props.enableDrag) return
    isDown = false
    containerRef.value.classList.remove('dragging')
}

function onMouseMove(e) {
    if (!props.enableDrag || !isDown) return
    e.preventDefault()
    const x = e.pageX - containerRef.value.offsetLeft
    const walk = x - startX
    containerRef.value.scrollLeft = scrollLeft - walk
}

// 监听activeTab prop变化
watch(() => props.activeTab, (newVal) => {
    // 移除条件判断，允许空字符串也能更新activeId
    activeId.value = newVal
    updateSlider()
})

// 组件挂载和卸载
onMounted(() => {
    // 初始化滑块位置
    nextTick(updateSlider)
    // 监听窗口大小变化，重新计算滑块位置
    window.addEventListener('resize', updateSlider)
    // 监听容器滚动事件，实时更新滑块位置
    if (containerRef.value) {
        containerRef.value.addEventListener('scroll', updateSlider)
    }
    
    // 使用 MutationObserver 监听容器可见性变化
    if (containerRef.value) {
        const observer = new MutationObserver(() => {
            // 当DOM发生变化时，延迟更新滑块位置
            setTimeout(updateSlider, 50)
        })
        observer.observe(containerRef.value.parentElement || document.body, {
            attributes: true,
            attributeFilter: ['class', 'style']
        })
        
        // 保存observer引用以便清理
        containerRef.value._observer = observer
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', updateSlider)
    if (containerRef.value) {
        containerRef.value.removeEventListener('scroll', updateSlider)
        // 清理 MutationObserver
        if (containerRef.value._observer) {
            containerRef.value._observer.disconnect()
        }
    }
})
</script>

<template>
    <div class="tab-container" ref="containerRef" @mousedown="onMouseDown" @mouseleave="onMouseLeave"
        @mouseup="onMouseUp" @mousemove="onMouseMove">
        <div v-for="(item, index) in tabs" :key="item.id" :id="item.id" :class="{ active: activeId === item.id }"
            class="tab-item" @click="tabSelected(item)" ref="tabItems">
            {{ item.label }}
        </div>
        <div class="tab-slider" :style="{
            left: sliderLeft + 'px',
            width: sliderWidth + 'px'
        }"></div>
    </div>
</template>

<style scoped>
.tab-container {
    position: relative;
    height: 85px;
    background: var(--bg-color-primary);
    display: flex;
    align-items: center;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    padding: 0px 12px;
    box-sizing: border-box;
    width: 100%;
    max-width: 100vw;
    margin-left: 12px;
    transition: background-color 0.2s ease;

}

.tab-container::-webkit-scrollbar {
    display: none;
}

.tab-container.dragging {
    cursor: grabbing;
}

.tab-item {
    height: 40px;
    font-size: 16px;
    color: var(--text-color-secondary);
    cursor: pointer;
    background: transparent;
    border-radius: 999px;
    text-align: center;
    line-height: 40px;
    display: inline-block;
    flex-shrink: 0;
    user-select: none;
    padding: 0 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
    position: relative;
    z-index: 2;
}

.tab-item:hover {
    background: var(--bg-color-secondary);
    color: var(--text-color-primary);
}

.tab-item.active {
    color: var(--text-color-primary);
    font-weight: bold;
    background: transparent;
    transition: color 0.2s ease;
}

/* 滑块指示器 */
.tab-slider {
    position: absolute;
    height: 40px;
    border-radius: 20px;
    background: var(--bg-color-secondary);
    transition: left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
        width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
        background-color 0.2s ease;
    z-index: 1;
    bottom: 22.5px;
}
</style>