<script setup>
import { RouterView } from "vue-router";
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { useAuthStore } from "@/stores/auth";
import { useAboutStore } from "@/stores/about";
import { useChangePasswordStore } from "@/stores/changePassword";
import AuthModal from "@/components/modals/AuthModal.vue";
import AboutModal from "@/components/modals/AboutModal.vue";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal.vue";
import PWAInstallBanner from "@/components/PWAInstallBanner.vue";
import MaintenanceModal from "@/components/MaintenanceModal.vue";

const userStore = useUserStore();
const authStore = useAuthStore();
const aboutStore = useAboutStore();
const changePasswordStore = useChangePasswordStore();

// 应用启动时初始化用户信息
onMounted(() => {
  userStore.initUserInfo();
});
</script>

<template>
  <div class="app-container">
    <RouterView />
    <AuthModal
      v-if="authStore.showAuthModal"
      :initial-mode="authStore.initialMode"
      @close="authStore.closeAuthModal"
      @success="authStore.closeAuthModal"
    />
    <AboutModal
      v-if="aboutStore.showAboutModal"
      @close="aboutStore.closeAboutModal"
    />
    <ChangePasswordModal
      v-if="changePasswordStore.showChangePasswordModal"
      :userInfo="userStore.userInfo"
      @close="changePasswordStore.closeChangePasswordModal"
    />
    <PWAInstallBanner />
    <MaintenanceModal />
  </div>
</template>

<style>
.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  min-width: 100%;
  background-color: var(--bg-color-primary);
  box-sizing: border-box;
  position: relative;
  overflow-x: hidden;
  transition: background 0.2s ease;

  /* 支持安全区域（刘海屏、状态栏等） */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

body {
  margin: 0;
  padding: 0;
}

/* PWA 沉浸式状态栏支持 */
@supports (padding: max(0px)) {
  .app-container {
    padding-top: max(env(safe-area-inset-top), 0px);
    padding-bottom: max(env(safe-area-inset-bottom), 0px);
    padding-left: max(env(safe-area-inset-left), 0px);
    padding-right: max(env(safe-area-inset-right), 0px);
  }
}

/* Android PWA 状态栏样式 */
@media (display-mode: standalone) {
  .app-container {
    /* 确保在独立模式下正确处理状态栏 */
    min-height: 100vh;
    min-height: calc(
      100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom)
    );
  }
}
</style>
