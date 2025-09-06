// 频道配置
export const CHANNELS = [
  { id: 'all', label: '全部', path: '/all' },
  { id: 'recommend', label: '推荐', path: '/recommend' },
  { id: 'opensource', label: '开源项目', path: '/opensource' },
  { id: 'knowledge', label: '知识碎片', path: '/knowledge' },
  { id: 'tinkering', label: '折腾日常', path: '/tinkering' },
  { id: 'wallpaper', label: '壁纸收集', path: '/wallpaper' },
  { id: 'weblinks', label: '网页收集', path: '/weblinks' },
  { id: 'aitools', label: 'AI工具', path: '/aitools' },
  { id: 'selfbuilt', label: '自建项目', path: '/selfbuilt' },
  { id: 'upfollow', label:'up关注', path: '/upfollow' },
  { id: 'todo', label: '待办项目', path: '/todo' }
]

// 获取有效的频道路径（用于路由验证）
export const getValidChannelPaths = () => {
  return CHANNELS.map(ch => ch.path.substring(1)) // 去掉开头的 '/'
}

// 根据路径获取频道ID
export const getChannelIdByPath = (path) => {
  // 处理 /explore/xxx 格式的路径
  let channelPath = path
  if (path.startsWith('/explore/')) {
    channelPath = path.replace('/explore', '')
  } else if (path === '/explore') {
    return 'all' // 默认返回全部频道
  }

  const channel = CHANNELS.find(ch => ch.path === channelPath)
  return channel ? channel.id : 'all'
}

// 根据频道ID获取路径
export const getChannelPath = (channelId) => {
  const channel = CHANNELS.find(ch => ch.id === channelId)
  return channel ? channel.path : '/all'
}