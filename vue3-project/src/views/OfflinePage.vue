<template>
  <div class="offline-page">
    <div class="offline-content">
      <div class="offline-icon">
        <SvgIcon name="home" />
      </div>
      <h2>网络连接已断开</h2>
      <p>您当前处于离线状态，部分功能可能无法使用</p>
      <div class="offline-features">
        <h3>离线可用功能：</h3>
        <ul>
          <li>浏览已缓存的内容</li>
          <li>查看个人资料</li>
          <li>使用基本导航功能</li>
        </ul>
      </div>
      <div class="offline-actions">
        <button @click="retry" class="retry-btn">
          <SvgIcon name="reload" />
          重新连接
        </button>
        <button @click="goHome" class="home-btn">
          <SvgIcon name="home" />
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import SvgIcon from "@/components/SvgIcon.vue";

const router = useRouter();

// 重试连接
const retry = () => {
  window.location.reload();
};

// 返回首页
const goHome = () => {
  router.push("/explore");
};
</script>

<style scoped>
.offline-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg-color-primary);
  padding: 20px;
}

.offline-content {
  text-align: center;
  max-width: 400px;
  background: var(--bg-color-secondary);
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.offline-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: var(--bg-color-tertiary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary);
}

.offline-content h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color-primary);
}

.offline-content > p {
  margin: 0 0 32px 0;
  font-size: 16px;
  color: var(--text-color-secondary);
  line-height: 1.5;
}

.offline-features {
  margin-bottom: 32px;
  text-align: left;
}

.offline-features h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color-primary);
}

.offline-features ul {
  margin: 0;
  padding-left: 20px;
  color: var(--text-color-secondary);
}

.offline-features li {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.4;
}

.offline-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.retry-btn,
.home-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn {
  background: var(--primary-color);
  color: white;
}

.retry-btn:hover {
  background: var(--primary-color-hover);
  transform: translateY(-1px);
}

.home-btn {
  background: var(--bg-color-tertiary);
  color: var(--text-color-primary);
}

.home-btn:hover {
  background: var(--bg-color-primary);
  transform: translateY(-1px);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .offline-content {
    padding: 32px 24px;
  }

  .offline-actions {
    flex-direction: column;
  }

  .retry-btn,
  .home-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
