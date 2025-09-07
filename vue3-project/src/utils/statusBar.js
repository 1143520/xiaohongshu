/**
 * 状态栏工具函数
 * 用于处理PWA应用中状态栏的颜色和样式
 */

/**
 * 更新状态栏主题色
 * @param {string} color - 要设置的颜色值
 * @param {boolean} darkMode - 是否为暗色模式
 */
export function updateStatusBarTheme(color = '#ff5f5f', darkMode = false) {
  // 更新theme-color meta标签
  let themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    document.head.appendChild(themeColorMeta);
  }
  
  // 根据深色/浅色模式设置不同的颜色
  const finalColor = darkMode ? '#1a1a1a' : color;
  themeColorMeta.content = finalColor;
  
  // 更新苹果设备的状态栏样式
  let appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (!appleStatusBarMeta) {
    appleStatusBarMeta = document.createElement('meta');
    appleStatusBarMeta.name = 'apple-mobile-web-app-status-bar-style';
    document.head.appendChild(appleStatusBarMeta);
  }
  
  // 设置为半透明黑色以获得沉浸式效果
  appleStatusBarMeta.content = 'black-translucent';
  
  // 为Android设备设置mobile-web-app-status-bar-style
  let mobileStatusBarMeta = document.querySelector('meta[name="mobile-web-app-status-bar-style"]');
  if (!mobileStatusBarMeta) {
    mobileStatusBarMeta = document.createElement('meta');
    mobileStatusBarMeta.name = 'mobile-web-app-status-bar-style';
    document.head.appendChild(mobileStatusBarMeta);
  }
  mobileStatusBarMeta.content = 'black-translucent';
}

/**
 * 检测设备是否支持沉浸式状态栏
 * @returns {boolean}
 */
export function supportsImmersiveStatusBar() {
  // 检查是否为PWA模式
  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone === true ||
                document.referrer.includes('android-app://');
  
  // 检查是否支持safe-area-inset
  const supportsSafeArea = CSS.supports('padding-top', 'env(safe-area-inset-top)');
  
  return isPWA && supportsSafeArea;
}

/**
 * 获取状态栏高度
 * @returns {number} 状态栏高度（像素）
 */
export function getStatusBarHeight() {
  // 尝试从CSS环境变量获取
  const computedStyle = getComputedStyle(document.documentElement);
  const safeAreaTop = computedStyle.getPropertyValue('--safe-area-inset-top') ||
                      computedStyle.getPropertyValue('env(safe-area-inset-top)');
  
  if (safeAreaTop) {
    return parseInt(safeAreaTop, 10) || 0;
  }
  
  // 回退到默认值
  return 0;
}

/**
 * 初始化状态栏配置
 */
export function initStatusBar() {
  // 设置CSS自定义属性用于状态栏高度
  const updateSafeAreaVars = () => {
    const root = document.documentElement;
    
    // 设置安全区域变量
    root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
    root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
    root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
  };
  
  // 立即执行一次
  updateSafeAreaVars();
  
  // 监听orientation变化
  window.addEventListener('orientationchange', () => {
    setTimeout(updateSafeAreaVars, 100);
  });
  
  // 监听resize事件
  window.addEventListener('resize', updateSafeAreaVars);
  
  // 监听主题变化
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const updateThemeColor = (e) => {
    updateStatusBarTheme('#ff5f5f', e.matches);
  };
  
  darkModeQuery.addListener(updateThemeColor);
  updateThemeColor(darkModeQuery);
}

/**
 * 为特定页面设置状态栏颜色
 * @param {string} route - 路由路径
 * @param {string} color - 颜色值
 */
export function setStatusBarColorForRoute(route, color) {
  const routeColors = {
    '/explore': '#ff5f5f',
    '/publish': '#52c41a',
    '/notification': '#1890ff',
    '/user': '#722ed1'
  };
  
  const finalColor = routeColors[route] || color || '#ff5f5f';
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  updateStatusBarTheme(finalColor, isDarkMode);
}
