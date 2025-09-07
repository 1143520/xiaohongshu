<template>
  <Transition name="fade">
    <div v-if="showInstallBanner" class="pwa-install-banner">
      <div class="banner-content">
        <div class="banner-icon">
          <SvgIcon name="home" />
        </div>
        <div class="banner-text">
          <h4>安装大红薯到主屏幕</h4>
          <p>获得更好的使用体验，支持离线访问</p>
        </div>
        <div class="banner-actions">
          <button @click="installApp" class="install-btn">安装</button>
          <button @click="dismissBanner" class="dismiss-btn">稍后</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import SvgIcon from "@/components/SvgIcon.vue";
import { pwaManager } from "@/utils/pwa";

const showInstallBanner = ref(false);

// 显示安装横幅
const showBanner = () => {
  // 检查是否已安装或已经显示过
  if (
    pwaManager.isInstalled() ||
    localStorage.getItem("pwa-install-dismissed")
  ) {
    return;
  }
  showInstallBanner.value = true;
};

// 隐藏安装横幅
const hideBanner = () => {
  showInstallBanner.value = false;
};

// 安装应用
const installApp = async () => {
  const success = await pwaManager.installApp();
  if (success) {
    hideBanner();
  }
};

// 推迟安装
const dismissBanner = () => {
  hideBanner();
  // 记录用户已经拒绝过，7天内不再显示
  const dismissTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7天
  localStorage.setItem("pwa-install-dismissed", dismissTime.toString());
};

// 检查是否应该显示安装提示
const checkDismissStatus = () => {
  const dismissedTime = localStorage.getItem("pwa-install-dismissed");
  if (dismissedTime && Date.now() < parseInt(dismissedTime)) {
    return false;
  }
  // 清除过期的拒绝记录
  if (dismissedTime) {
    localStorage.removeItem("pwa-install-dismissed");
  }
  return true;
};

// 事件监听器
const handleInstallAvailable = () => {
  if (checkDismissStatus()) {
    setTimeout(showBanner, 2000); // 延迟2秒显示，避免干扰用户
  }
};

const handleInstallCompleted = () => {
  hideBanner();
};

onMounted(() => {
  // 监听PWA安装事件
  window.addEventListener("pwa-install-available", handleInstallAvailable);
  window.addEventListener("pwa-install-completed", handleInstallCompleted);

  // 如果已经可以安装，显示提示
  if (pwaManager.canInstall() && checkDismissStatus()) {
    setTimeout(showBanner, 3000);
  }
});

onUnmounted(() => {
  window.removeEventListener("pwa-install-available", handleInstallAvailable);
  window.removeEventListener("pwa-install-completed", handleInstallCompleted);
});
</script>

<style scoped>
.pwa-install-banner {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  max-width: 400px;
  margin: 0 auto;
  background: var(--bg-color-primary);
  border: 1px solid var(--border-color-primary);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.banner-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.banner-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.banner-text {
  flex: 1;
  min-width: 0;
}

.banner-text h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color-primary);
}

.banner-text p {
  margin: 0;
  font-size: 12px;
  color: var(--text-color-secondary);
  line-height: 1.4;
}

.banner-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.install-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.install-btn:hover {
  background: var(--primary-color-hover);
  transform: translateY(-1px);
}

.dismiss-btn {
  background: transparent;
  color: var(--text-color-secondary);
  border: 1px solid var(--border-color-primary);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dismiss-btn:hover {
  background: var(--bg-color-secondary);
  color: var(--text-color-primary);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .pwa-install-banner {
    left: 16px;
    right: 16px;
    bottom: 16px;
  }

  .banner-content {
    padding: 12px;
  }

  .banner-actions {
    flex-direction: row;
  }
}
</style>
