<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ExplorePageTemplate from './components/ExplorePageTemplate.vue'

const route = useRoute()
// 根据路由参数或路由名称获取频道类型
const channelType = computed(() => {
    if (route.params.channel) {
        return route.params.channel
    }
    return route.name || 'recommend'
})

// 频道配置映射
const channelConfig = {
    'all': { category: 'all', title: '全部' },
    'recommend': { category: 'recommend', title: '推荐' },
    'opensource': { category: 'opensource', title: '开源项目' },
    'knowledge': { category: 'knowledge', title: '知识碎片' },
    'tinkering': { category: 'tinkering', title: '折腾日常' },
    'wallpaper': { category: 'wallpaper', title: '壁纸收集' },
    'weblinks': { category: 'weblinks', title: '网页收集' },
    'repost': { category: 'repost', title: '转载' },
    'aitools': { category: 'aitools', title: 'AI工具' },
    'selfbuilt': { category: 'selfbuilt', title: '自建项目' },
    'upfollow': { category: 'upfollow', title: 'up关注' },
    'todo': { category: 'todo', title: '待办项目' }
}

// 获取当前频道配置
const currentChannel = computed(() => {
    return channelConfig[channelType.value] || channelConfig['all']
})
</script>

<template>
    <ExplorePageTemplate :category="currentChannel.category" />
</template>
