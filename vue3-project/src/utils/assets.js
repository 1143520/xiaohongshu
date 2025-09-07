/**
 * 资源路径工具
 * 解决构建环境中动态导入资源的问题
 */

// 默认头像路径
export const DEFAULT_AVATAR = '/src/assets/imgs/avatar.png';

// 默认logo路径
export const DEFAULT_LOGO = '/src/assets/imgs/logo.ico';

// 小石榴logo路径
export const XIAOSHILIU_LOGO = '/src/assets/imgs/小石榴.png';

// 默认占位图片
export const PLACEHOLDER_IMAGE = '/src/assets/imgs/未加载.png';

// 团队成员头像
export const TEAM_AVATARS = {
  ztmyo: '/src/assets/imgs/ztmyo.png',
  lici: '/src/assets/imgs/栗次元.ico',
  xiarou: '/src/assets/imgs/夏柔.ico',
  baoluo: '/src/assets/imgs/保罗.ico'
};

/**
 * 获取资源URL
 * 在开发环境和生产环境中都能正确获取资源路径
 * @param {string} path - 相对路径
 * @returns {string} 完整的资源URL
 */
export function getAssetUrl(path) {
  // 在生产环境中，Vite会处理这些路径
  if (import.meta.env.MODE === 'production') {
    return path;
  }
  
  // 在开发环境中使用动态导入
  try {
    return new URL(path, import.meta.url).href;
  } catch (error) {
    console.warn('获取资源URL失败，使用原始路径:', path);
    return path;
  }
}

/**
 * 获取用户头像URL，如果没有则返回默认头像
 * @param {string} avatarUrl - 用户头像URL
 * @returns {string} 头像URL
 */
export function getUserAvatarUrl(avatarUrl) {
  return avatarUrl || DEFAULT_AVATAR;
}
