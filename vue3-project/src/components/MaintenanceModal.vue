<template>
  <div v-if="isVisible" class="maintenance-overlay">
    <div class="maintenance-modal">
      <div class="maintenance-icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L13.09 8.26L16 7L14.74 9.91L21 12L14.74 14.09L16 17L13.09 15.74L12 22L10.91 15.74L8 17L9.26 14.09L3 12L9.26 9.91L8 7L10.91 8.26L12 2Z"
            fill="#f59e0b"
          />
        </svg>
      </div>

      <h2 class="maintenance-title">系统维护中</h2>

      <p class="maintenance-message">{{ message }}</p>

      <div class="maintenance-info">
        <p>为了给您提供更好的服务体验，我们正在进行系统升级维护。</p>
        <p v-if="retryAfter">
          预计 <strong>{{ retryAfter }}</strong> 恢复正常访问。
        </p>
      </div>

      <div class="maintenance-actions">
        <button @click="refreshPage" class="btn-refresh">刷新页面</button>
        <button @click="hideModal" class="btn-close">暂时关闭</button>
      </div>

      <div class="maintenance-footer">
        <p>感谢您的理解与支持！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const isVisible = ref(false);
const message = ref("系统正在维护中，请稍后再试");
const retryAfter = ref("");

const showMaintenanceModal = (event) => {
  const detail = event.detail;
  message.value = detail.message || "系统正在维护中，请稍后再试";
  retryAfter.value = detail.retryAfter || "";
  isVisible.value = true;
};

const hideModal = () => {
  isVisible.value = false;
};

const refreshPage = () => {
  window.location.reload();
};

onMounted(() => {
  window.addEventListener("system-maintenance", showMaintenanceModal);
});

onUnmounted(() => {
  window.removeEventListener("system-maintenance", showMaintenanceModal);
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
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

.maintenance-modal {
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 480px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
}

.maintenance-icon {
  margin-bottom: 24px;
}

.maintenance-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.maintenance-message {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 24px;
  line-height: 1.5;
}

.maintenance-info {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  text-align: left;
}

.maintenance-info p {
  margin: 0 0 8px 0;
  color: #4b5563;
  line-height: 1.5;
}

.maintenance-info p:last-child {
  margin-bottom: 0;
}

.maintenance-info strong {
  color: #f59e0b;
  font-weight: 600;
}

.maintenance-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.btn-refresh,
.btn-close {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-refresh {
  background: #3b82f6;
  color: white;
}

.btn-refresh:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-close {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #4b5563;
}

.maintenance-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
  color: #9ca3af;
  font-size: 14px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .maintenance-modal {
    padding: 24px;
    margin: 20px;
  }

  .maintenance-title {
    font-size: 20px;
  }

  .maintenance-actions {
    flex-direction: column;
  }

  .btn-refresh,
  .btn-close {
    width: 100%;
  }
}
</style>
