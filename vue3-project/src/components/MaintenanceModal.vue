<template>
  <div class="maintenance-overlay" v-if="isMaintenanceMode">
    <div class="maintenance-modal">
      <div class="maintenance-icon">
        <SvgIcon name="alert" width="64" height="64" />
      </div>

      <h2 class="maintenance-title">
        {{ maintenanceData.title || "系统维护中" }}
      </h2>

      <p class="maintenance-description">
        {{
          maintenanceData.description ||
          "我们正在对系统进行维护升级，为您提供更好的服务体验。请稍后再试。"
        }}
      </p>

      <div class="maintenance-actions">
        <button class="retry-btn" @click="retryAccess" :disabled="isRetrying">
          <span v-if="isRetrying" class="loading-spinner"></span>
          {{ isRetrying ? "检查中..." : "重新尝试" }}
        </button>

        <button
          class="admin-login-btn"
          @click="goToAdminLogin"
          v-if="!isAdminPage"
        >
          管理员登录
        </button>
      </div>

      <div class="maintenance-footer">
        <p class="last-update">最后更新时间: {{ formatTime(new Date()) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import SvgIcon from "@/components/SvgIcon.vue";
import { formatTimeWithTimezone } from "@/utils/timeFormat";

const isMaintenanceMode = ref(false);
const maintenanceData = ref({});
const isRetrying = ref(false);

const isAdminPage = computed(() => {
  return window.location.pathname.startsWith("/admin");
});

const formatTime = (date) => {
  return formatTimeWithTimezone(date);
};

const handleMaintenanceMode = (event) => {
  isMaintenanceMode.value = true;
  maintenanceData.value = event.detail || {};
};

const retryAccess = async () => {
  isRetrying.value = true;

  try {
    // 重新尝试访问健康检查接口
    const response = await fetch("/api/health");
    if (response.ok) {
      // 维护模式结束，刷新页面
      window.location.reload();
    } else if (response.status !== 503) {
      // 如果不是503错误，说明维护模式可能已结束
      window.location.reload();
    }
  } catch (error) {
    console.log("仍在维护中");
  } finally {
    isRetrying.value = false;
  }
};

const goToAdminLogin = () => {
  window.location.href = "/admin/login";
};

onMounted(() => {
  window.addEventListener("maintenance-mode", handleMaintenanceMode);
});

onUnmounted(() => {
  window.removeEventListener("maintenance-mode", handleMaintenanceMode);
});
</script>

<style scoped>
.maintenance-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.maintenance-modal {
  background: var(--bg-color);
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
}

.maintenance-icon {
  margin-bottom: 24px;
  color: var(--warning-color);
}

.maintenance-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 16px;
}

.maintenance-description {
  font-size: 16px;
  color: var(--text-color-secondary);
  line-height: 1.6;
  margin-bottom: 32px;
}

.maintenance-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 24px;
}

.retry-btn,
.admin-login-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.retry-btn {
  background: var(--primary-color);
  color: white;
  border: none;
}

.retry-btn:hover:not(:disabled) {
  background: var(--primary-color-dark);
  transform: translateY(-2px);
}

.retry-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.admin-login-btn {
  background: transparent;
  color: var(--text-color-secondary);
  border: 1px solid var(--border-color);
}

.admin-login-btn:hover {
  color: var(--text-color);
  border-color: var(--text-color-secondary);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.maintenance-footer {
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.last-update {
  font-size: 12px;
  color: var(--text-color-muted);
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .maintenance-modal {
    padding: 24px;
  }

  .maintenance-actions {
    flex-direction: column;
  }

  .maintenance-title {
    font-size: 20px;
  }
}
</style>
