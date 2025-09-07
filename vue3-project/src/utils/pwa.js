/**
 * PWA 工具函数
 * 处理 Service Worker 注册、离线检测、应用安装等功能
 */

export class PWAManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.installPrompt = null;
    this.swRegistration = null;
    
    this.init();
  }

  // 初始化PWA功能
  async init() {
    this.setupOnlineOfflineListeners();
    await this.registerServiceWorker();
    this.setupInstallPrompt();
  }

  // 注册Service Worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.swRegistration = registration;
        
        console.log('Service Worker 注册成功:', registration.scope);

        // 监听更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 有新版本可用
              this.showUpdateAvailable();
            }
          });
        });

        // 监听控制器变化
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

      } catch (error) {
        console.error('Service Worker 注册失败:', error);
      }
    }
  }

  // 设置在线/离线状态监听
  setupOnlineOfflineListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showOnlineStatus();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showOfflineStatus();
    });
  }

  // 设置应用安装提示
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA 安装成功');
      this.hideInstallButton();
      this.installPrompt = null;
    });
  }

  // 触发应用安装
  async installApp() {
    if (!this.installPrompt) {
      return false;
    }

    try {
      this.installPrompt.prompt();
      const result = await this.installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('用户接受安装PWA');
      } else {
        console.log('用户拒绝安装PWA');
      }
      
      this.installPrompt = null;
      return result.outcome === 'accepted';
    } catch (error) {
      console.error('PWA安装失败:', error);
      return false;
    }
  }

  // 检查是否可以安装
  canInstall() {
    return !!this.installPrompt;
  }

  // 检查是否已安装
  isInstalled() {
    return window.matchMedia && 
           window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  // 手动更新Service Worker
  async updateServiceWorker() {
    if (this.swRegistration) {
      try {
        await this.swRegistration.update();
        console.log('Service Worker 更新检查完成');
      } catch (error) {
        console.error('Service Worker 更新失败:', error);
      }
    }
  }

  // 显示更新可用提示
  showUpdateAvailable() {
    // 创建更新提示
    const updateBanner = document.createElement('div');
    updateBanner.id = 'pwa-update-banner';
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff5f5f;
        color: white;
        padding: 12px 16px;
        text-align: center;
        z-index: 9999;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      ">
        <span>发现新版本，点击更新获得更好体验</span>
        <button onclick="pwaManager.reloadForUpdate()" style="
          background: white;
          color: #ff5f5f;
          border: none;
          padding: 4px 12px;
          margin-left: 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">立即更新</button>
        <button onclick="document.getElementById('pwa-update-banner').remove()" style="
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 4px 12px;
          margin-left: 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">稍后</button>
      </div>
    `;
    document.body.appendChild(updateBanner);
  }

  // 重新加载以应用更新
  reloadForUpdate() {
    if (this.swRegistration && this.swRegistration.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // 显示安装按钮
  showInstallButton() {
    // 发送事件，让Vue组件处理UI
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  // 隐藏安装按钮
  hideInstallButton() {
    window.dispatchEvent(new CustomEvent('pwa-install-completed'));
  }

  // 显示在线状态
  showOnlineStatus() {
    this.showNetworkStatus('已连接到网络', '#4CAF50');
  }

  // 显示离线状态
  showOfflineStatus() {
    this.showNetworkStatus('网络连接已断开，正在使用离线模式', '#FF9800');
  }

  // 显示网络状态
  showNetworkStatus(message, color) {
    // 移除现有的状态提示
    const existing = document.getElementById('network-status');
    if (existing) {
      existing.remove();
    }

    // 创建新的状态提示
    const statusDiv = document.createElement('div');
    statusDiv.id = 'network-status';
    statusDiv.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${color};
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        animation: slideUp 0.3s ease-out;
      ">
        ${message}
      </div>
      <style>
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      </style>
    `;
    
    document.body.appendChild(statusDiv);

    // 3秒后自动移除
    setTimeout(() => {
      if (statusDiv.parentNode) {
        statusDiv.remove();
      }
    }, 3000);
  }

  // 获取缓存大小
  async getCacheSize() {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              totalSize += blob.size;
            }
          }
        }
        
        return this.formatBytes(totalSize);
      } catch (error) {
        console.error('获取缓存大小失败:', error);
        return '未知';
      }
    }
    return '不支持';
  }

  // 清理缓存
  async clearCache() {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('缓存清理完成');
        return true;
      } catch (error) {
        console.error('缓存清理失败:', error);
        return false;
      }
    }
    return false;
  }

  // 格式化字节大小
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

// 创建全局实例
export const pwaManager = new PWAManager();

// 挂载到全局，方便在HTML中使用
window.pwaManager = pwaManager;
