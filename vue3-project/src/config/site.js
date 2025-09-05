/**
 * 站点配置文件
 * 统一管理站点名称、描述等信息
 */

export const SITE_CONFIG = {
  // 站点名称
  name: '大红薯',
  
  // 站点完整标题
  fullTitle: '大红薯 - 校园图文社区',
  
  // 站点描述
  description: '你的校园图文部落',
  
  // 用户ID显示名称（如：大红薯号 -> 新站点号）
  userIdLabel: '大红薯号',
  
  // 搜索框占位符
  searchPlaceholder: '搜索大红薯',
  
  // 登录/注册相关文案
  auth: {
    loginTitle: '登录大红薯',
    registerTitle: '注册大红薯',
    userIdPlaceholder: '请输入大红薯号',
    userIdRegisterPlaceholder: '请输入大红薯号（3-15位字母数字下划线）'
  },
  
  // 管理后台相关
  admin: {
    title: '大红薯管理后台',
    loginTitle: '登录大红薯'
  },
  
  // 关于页面
  about: {
    title: '关于大红薯',
    description: '大红薯校园图文社区是一个面向开发者与学习者的开源示例项目，旨在提供从前端到后端的完整实践范本，帮助大家学习现代 Web 应用的架构设计、工程化与业务实现。'
  },
  
  // 分享文案模板
  shareTemplate: (title, author) => `【${title}-${author}| ${SITE_CONFIG.name} - ${SITE_CONFIG.description}】`
} 