<script setup>
import router from '@/router'
import TabContainer from '@/components/TabContainer.vue'
import { onMounted, watch, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useScroll } from '@vueuse/core'
import { useChannelStore } from '@/stores/channel'
import { useNavigationStore } from '@/stores/navigation'

// 获取当前路由
const route = useRoute()

// 获取滚动信息
const { y: scrollY } = useScroll(window)

// 固定容器引用
// 移除了固定容器的引用，现在只使用单一容器

// 使用频道 store 和导航 store
const channelStore = useChannelStore()
const navigationStore = useNavigationStore()

// 定义emit事件，用于触发父组件的刷新
const emit = defineEmits(['channel-reload'])

// 防抖相关状态
const isAnimating = ref(false) // 是否正在播放动画
const pendingChannelId = ref(null) // 等待切换的频道ID
const currentRequestChannelId = ref(null) // 当前正在请求的频道ID
const animationTimer = ref(null) // 动画计时器

// 监听路由变化，更新活跃频道
watch(() => route.path, (newPath) => {
    // 如果当前路由是 /explore，重定向到当前选中的频道
    if (newPath === '/explore') {
        const currentChannelPath = channelStore.getChannelPath(channelStore.activeChannelId)
        router.replace(`/explore${currentChannelPath}`)
        return
    }

    // 否则根据路由更新活跃频道
    const channelId = channelStore.getChannelIdByPath(newPath)
    channelStore.setActiveChannel(channelId)
}, { immediate: true })

function handleTabChange(item) {
    // 如果切换到相同频道，不执行任何操作
    if (channelStore.activeChannelId === item.id) return

    // 更新 store 中的活跃频道（UI立即响应）
    channelStore.setActiveChannel(item.id)

    // 立即返回顶部
    navigationStore.scrollToTop('instant')

    // 如果当前正在播放动画
    if (isAnimating.value) {
        // 进入防抖模式：只记录最后一次点击的频道，不发起新请求
        pendingChannelId.value = item.id
        return
    }

    // 立即开始新的切换流程
    startChannelSwitch(item)
}

function startChannelSwitch(item) {
    // 设置动画状态
    isAnimating.value = true
    currentRequestChannelId.value = item.id
    pendingChannelId.value = null

    // 触发父组件的刷新动画
    emit('channel-reload')

    // 立即执行路由跳转（发送请求）
    router.push(`/explore${item.path}`).then(() => {

        // 设置动画计时器（1200ms）
        animationTimer.value = setTimeout(() => {
            // 动画结束
            isAnimating.value = false

            // 检查是否有等待中的频道切换
            if (pendingChannelId.value && pendingChannelId.value !== currentRequestChannelId.value) {
                // 有等待中的频道，开始第二次切换
                const targetChannel = channelStore.channels.find(channel => channel.id === pendingChannelId.value)
                if (targetChannel) {
                    startChannelSwitch(targetChannel)
                    return
                }
            }

            // 没有等待中的频道，重置状态
            currentRequestChannelId.value = null
            pendingChannelId.value = null
        }, 1200)
    })
}


// 组件挂载时检查当前路由
// 不再需要监听滚动状态来切换容器，只是简单的显示/隐藏

onMounted(() => {
    // 如果当前路由是 /explore，重定向到当前选中的频道
    if (route.path === '/explore') {
        const currentChannelPath = channelStore.getChannelPath(channelStore.activeChannelId)
        router.replace(`/explore${currentChannelPath}`)
        return
    }

    // 否则根据路由设置活跃频道
    const channelId = channelStore.getChannelIdByPath(route.path)
    channelStore.setActiveChannel(channelId)
    currentRequestChannelId.value = channelId
})

// 组件卸载时清理计时器
import { onUnmounted } from 'vue'
onUnmounted(() => {
    if (animationTimer.value) {
        clearTimeout(animationTimer.value)
    }
})
</script>

<template>
    <div class="channel-container" :class="{ hidden: scrollY >= 100 }">
        <TabContainer :tabs="channelStore.channels" :activeTab="channelStore.activeChannelId" :enableDrag="true"
            @tab-change="handleTabChange" />
    </div>
</template>

<style scoped>
* {
    transition: border-color 0.2s ease, background-color 0.2s ease;
}

/* 频道容器 */
.channel-container {
    width: 100%;
    background: var(--bg-color-primary);
    transition: opacity 0.3s ease, transform 0.3s ease;
}

/* 隐藏状态 */
.channel-container.hidden {
    opacity: 0;
    transform: translateY(-10px);
    pointer-events: none;
}
</style>