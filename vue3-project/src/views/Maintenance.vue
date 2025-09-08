<template>
  <div class="maintenance-container">
    <div class="maintenance-content">
      <!-- 维护图标 -->
      <div class="maintenance-icon">
        <SvgIcon name="maintenance" width="120" height="120" />
      </div>

      <!-- 主要信息 -->
      <div class="maintenance-info">
        <h1 class="maintenance-title">系统维护中</h1>
        <p class="maintenance-message">
          {{ maintenanceMessage }}
        </p>
        <p class="maintenance-time">预计恢复时间：{{ estimatedTime }}</p>
      </div>

      <!-- 动态状态 -->
      <div class="maintenance-status">
        <div class="status-indicator">
          <div class="pulse-dot"></div>
          <span>维护进行中...</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="maintenance-actions">
        <button
          class="retry-btn"
          @click="checkMaintenanceStatus"
          :disabled="isChecking"
        >
          <SvgIcon
            v-if="isChecking"
            name="loading"
            class="loading-icon"
            width="16"
            height="16"
          />
          {{ isChecking ? "检查中..." : "重新检查" }}
        </button>

        <button class="home-btn" @click="goHome">返回首页</button>
      </div>

      <!-- 联系信息 -->
      <div class="maintenance-contact">
        <p>如有紧急问题，请联系：</p>
        <div class="contact-links">
          <a href="mailto:admin@example.com" class="contact-link">
            <SvgIcon name="email" width="16" height="16" />
            技术支持
          </a>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="maintenance-footer">
        <p>感谢您的耐心等待</p>
        <div class="last-update">最后更新：{{ lastUpdateTime }}</div>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div
        class="floating-element"
        v-for="i in 6"
        :key="i"
        :style="getFloatingStyle(i)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import SvgIcon from "@/components/SvgIcon.vue";

const router = useRouter();

// 响应式数据
const maintenanceMessage = ref(
  "我们正在进行系统升级和维护，以提供更好的服务体验"
);
const estimatedTime = ref("1小时后");
const lastUpdateTime = ref("");
const isChecking = ref(false);

// 定时器
let statusCheckTimer = null;
let timeUpdateTimer = null;

// 页面加载时初始化
onMounted(() => {
  updateTime();
  // 每30秒更新一次时间
  timeUpdateTimer = setInterval(updateTime, 30000);
  // 每2分钟自动检查一次维护状态
  statusCheckTimer = setInterval(checkMaintenanceStatus, 120000);
});

// 页面卸载时清理定时器
onUnmounted(() => {
  if (statusCheckTimer) {
    clearInterval(statusCheckTimer);
  }
  if (timeUpdateTimer) {
    clearInterval(timeUpdateTimer);
  }
});

// 更新时间
const updateTime = () => {
  const now = new Date();
  lastUpdateTime.value = now.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 检查维护状态
const checkMaintenanceStatus = async () => {
  isChecking.value = true;

  try {
    // 尝试访问健康检查接口
    const response = await fetch("/api/health", {
      method: "GET",
      cache: "no-cache",
    });

    if (response.ok) {
      // 如果健康检查通过，尝试访问主页面
      window.location.href = "/";
    } else {
      console.log("系统仍在维护中");
    }
  } catch (error) {
    console.log("维护状态检查失败:", error);
  } finally {
    isChecking.value = false;
  }
};

// 返回首页
const goHome = () => {
  window.location.href = "/";
};

// 获取浮动元素样式
const getFloatingStyle = (index) => {
  const animations = [
    { left: "10%", animationDelay: "0s", animationDuration: "15s" },
    { left: "20%", animationDelay: "2s", animationDuration: "12s" },
    { left: "35%", animationDelay: "4s", animationDuration: "18s" },
    { left: "60%", animationDelay: "1s", animationDuration: "14s" },
    { left: "75%", animationDelay: "3s", animationDuration: "16s" },
    { left: "85%", animationDelay: "5s", animationDuration: "20s" },
  ];

  return animations[index - 1] || {};
};
</script>

<style scoped>
.maintenance-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  position: relative;
  overflow: hidden;
}

.maintenance-content {
  text-align: center;
  max-width: 600px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 2;
}

.maintenance-icon {
  margin-bottom: 2rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.maintenance-info {
  margin-bottom: 3rem;
}

.maintenance-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.maintenance-message {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.maintenance-time {
  font-size: 1rem;
  color: #ffeb3b;
  font-weight: 600;
  margin-bottom: 0;
}

.maintenance-status {
  margin-bottom: 3rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  opacity: 0.8;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

.maintenance-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.retry-btn,
.home-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
}

.retry-btn {
  background: linear-gradient(45deg, #4caf50, #45a049);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
}

.retry-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
}

.retry-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.home-btn {
  background: linear-gradient(45deg, #2196f3, #1976d2);
  color: white;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.6);
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.maintenance-contact {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.maintenance-contact p {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.contact-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffeb3b;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.contact-link:hover {
  color: #fff;
  transform: translateY(-1px);
}

.maintenance-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.maintenance-footer p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.7;
}

.last-update {
  font-size: 0.8rem;
  color: #ffeb3b;
  opacity: 0.8;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-element {
  position: absolute;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 15s ease-in-out infinite;
  opacity: 0.6;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10%,
  90% {
    opacity: 0.6;
  }
  50% {
    transform: translateY(-100px) rotate(180deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .maintenance-content {
    margin: 1rem;
    padding: 1.5rem;
    border-radius: 15px;
  }

  .maintenance-title {
    font-size: 2rem;
  }

  .maintenance-actions {
    flex-direction: column;
    align-items: center;
  }

  .retry-btn,
  .home-btn {
    width: 100%;
    max-width: 200px;
  }

  .contact-links {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .maintenance-content {
    margin: 0.5rem;
    padding: 1rem;
  }

  .maintenance-title {
    font-size: 1.75rem;
  }

  .maintenance-message {
    font-size: 1rem;
  }
}
</style>
