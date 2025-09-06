/**
 * Mention文本解析工具
 * 将[@nickname:user_id]格式的文本转换为可点击的超链接
 */

/**
 * 解析文本中的mention标记和URL链接，转换为HTML超链接
 * @param {string} text - 包含mention标记和URL的文本
 * @returns {string} - 转换后的HTML字符串
 */
export function parseMentions(text) {
  if (!text) return ''

  // 先处理换行符，转换为<br>标签
  let processedText = text.replace(/\n/g, '<br>')
  
  // 处理多个空格，防止被浏览器合并（保留连续空格）
  processedText = processedText.replace(/  +/g, (match) => {
    // 将连续的空格转换为 空格+&nbsp; 的组合，确保显示
    return ' ' + '&nbsp;'.repeat(match.length - 1)
  })

  // 处理[@nickname:user_id]格式的mention
  const mentionRegex = /\[@([^:]+):([^\]]+)\]/g
  processedText = processedText.replace(mentionRegex, (match, nickname, userId) => {
    // 生成用户主页链接，使用大红薯号作为路由参数
    return `<a href="/user/${userId}" class="mention-link" data-user-id="${userId}" contenteditable="false">@${nickname}</a>`
  })

  // 处理URL链接（http://、https://、www.开头的链接）
  const urlRegex = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi
  processedText = processedText.replace(urlRegex, (match) => {
    let url = match
    // 如果是www.开头，添加https://前缀
    if (url.startsWith('www.')) {
      url = 'https://' + url
    }
    return `<a href="${url}" class="url-link" target="_blank" rel="noopener noreferrer">${match}</a>`
  })

  return processedText
}

/**
 * 从文本中提取所有被@的用户ID
 * @param {string} text - 包含mention标记的文本
 * @returns {Array} - 用户ID数组
 */
export function extractMentionedUsers(text) {
  if (!text) return []

  const mentionRegex = /\[@([^:]+):([^\]]+)\]/g
  const mentionedUsers = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    const [, nickname, userId] = match
    mentionedUsers.push({
      nickname,
      userId
    })
  }

  return mentionedUsers
}

/**
 * 检查文本是否包含mention标记或URL链接
 * @param {string} text - 要检查的文本
 * @returns {boolean} - 是否包含mention或URL
 */
export function hasMentions(text) {
  if (!text) return false
  // 检查[@nickname:user_id]格式
  const mentionRegex = /\[@([^:]+):([^\]]+)\]/
  // 检查HTML格式的mention链接（匹配mention-link或mention class）
  const htmlMentionRegex = /<a[^>]*class="mention[^"]*"[^>]*data-user-id[^>]*>[^<]*@[^<]*<\/a>/
  // 检查URL链接
  const urlRegex = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/i
  const htmlUrlRegex = /<a[^>]*class="url-link"[^>]*>/
  return mentionRegex.test(text) || htmlMentionRegex.test(text) || urlRegex.test(text) || htmlUrlRegex.test(text)
}

/**
 * 清理文本中的mention标记和URL链接，只保留昵称和链接文本，保留换行符
 * @param {string} text - 包含mention标记和URL的文本
 * @returns {string} - 清理后的文本
 */
export function cleanMentions(text) {
  if (!text) return ''

  // 清理[@nickname:user_id]格式
  const mentionRegex = /\[@([^:]+):([^\]]+)\]/g
  let cleanedText = text.replace(mentionRegex, '@$1')

  // 清理HTML格式的mention链接，提取@昵称部分（匹配mention-link或mention class）
  const htmlMentionRegex = /<a[^>]*class="mention[^"]*"[^>]*data-user-id[^>]*>([^<]*@[^<]*)<\/a>/g
  cleanedText = cleanedText.replace(htmlMentionRegex, '$1')

  // 清理HTML格式的URL链接，提取链接文本部分
  const htmlUrlRegex = /<a[^>]*class="url-link"[^>]*>([^<]*)<\/a>/g
  cleanedText = cleanedText.replace(htmlUrlRegex, '$1')

  // 先将<br>标签转换为换行符
  cleanedText = cleanedText.replace(/<br\s*\/?>/gi, '\n')

  // 移除所有其他HTML标签，只保留文本内容
  cleanedText = cleanedText.replace(/<[^>]*>/g, '')

  // 移除&nbsp;等HTML实体
  cleanedText = cleanedText.replace(/&nbsp;/g, ' ')

  return cleanedText
}