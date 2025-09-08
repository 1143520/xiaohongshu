<template>
  <div class="system-settings">
    <div class="header">
      <h2>系统设置</h2>
      <p class="description">管理系统全局配置和功能开关</p>
    </div>

    <div class="settings-container" v-if="!loading">
      <!-- 用户功能设置 -->
      <div class="settings-section">
        <h3>用户功能管理</h3>
        <div class="setting-item">
          <div class="setting-info">
            <label>用户注册功能</label>
            <span class="setting-desc">控制新用户是否可以注册账号</span>
          </div>
          <div class="setting-control">
            <button
              :class="[
                'toggle-btn',
                { active: settings.user_registration_enabled?.value },
              ]"
              @click="toggleSetting('user_registration_enabled')"
            >
              <span class="toggle-slider"></span>
            </button>
            <span class="status-text">
              {{ settings.user_registration_enabled?.value ? "开启" : "关闭" }}
            </span>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label>评论审核</label>
            <span class="setting-desc">新发布的评论是否需要管理员审核</span>
          </div>
          <div class="setting-control">
            <button
              :class="[
                'toggle-btn',
                { active: settings.comment_approval_required?.value },
              ]"
              @click="toggleSetting('comment_approval_required')"
            >
              <span class="toggle-slider"></span>
            </button>
            <span class="status-text">
              {{
                settings.comment_approval_required?.value
                  ? "需要审核"
                  : "无需审核"
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- 系统功能设置 -->
      <div class="settings-section">
        <h3>系统功能管理</h3>
        <div class="setting-item">
          <div class="setting-info">
            <label>维护模式</label>
            <span class="setting-desc">开启后，普通用户将无法访问网站</span>
          </div>
          <div class="setting-control">
            <button
              :class="[
                'toggle-btn',
                'maintenance',
                { active: settings.maintenance_mode?.value },
              ]"
              @click="toggleSetting('maintenance_mode')"
            >
              <span class="toggle-slider"></span>
            </button>
            <span class="status-text">
              {{ settings.maintenance_mode?.value ? "维护中" : "正常运行" }}
            </span>
          </div>
        </div>
      </div>

      <!-- 数值设置 -->
      <div class="settings-section">
        <h3>限制设置</h3>
        <div class="setting-item">
          <div class="setting-info">
            <label>每日发帖限制</label>
            <span class="setting-desc">单个用户每天最大发帖数量</span>
          </div>
          <div class="setting-control">
            <input
              type="number"
              v-model="settings.max_posts_per_day.value"
              @change="updateNumberSetting('max_posts_per_day')"
              min="1"
              max="100"
              class="number-input"
            />
            <span class="unit">篇/天</span>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label>文件上传限制</label>
            <span class="setting-desc">单个文件最大上传大小</span>
          </div>
          <div class="setting-control">
            <input
              type="number"
              v-model="settings.max_upload_size.value"
              @change="updateNumberSetting('max_upload_size')"
              min="1"
              max="200"
              class="number-input"
            />
            <span class="unit">MB</span>
          </div>
        </div>
      </div>

      <!-- 站点公告 -->
      <div class="settings-section">
        <h3>站点公告</h3>
        <div class="setting-item full-width">
          <div class="setting-info">
            <label>站点公告内容</label>
            <span class="setting-desc">在网站顶部显示的公告信息</span>
          </div>
          <div class="setting-control">
            <textarea
              v-model="settings.site_notice.value"
              @blur="updateTextSetting('site_notice')"
              placeholder="请输入站点公告内容，留空则不显示公告"
              class="text-input"
              rows="3"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <button @click="saveAllSettings" :disabled="saving" class="save-btn">
          <span v-if="saving">保存中...</span>
          <span v-else">保存全部设置</span>
        </button>
        <button @click="resetSettings" class="reset-btn">重置为默认值</button>
      </div>
    </div>

    <div v-else class="loading">
      <div class="loading-spinner"></div>
      <p>加载系统设置中...</p>
    </div>

    <!-- 消息提示 -->
    <div v-if="message.show" :class="['message', message.type]">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "@/api";

// 数据状态
const loading = ref(true);
const saving = ref(false);
const settings = ref({});

// 消息提示
const message = reactive({
  show: false,
  text: "",
  type: "success",
});

// 显示消息
const showMessage = (text, type = "success") => {
  message.text = text;
  message.type = type;
  message.show = true;
  setTimeout(() => {
    message.show = false;
  }, 3000);
};

// 获取系统设置
const fetchSettings = async () => {
  try {
    loading.value = true;
    const response = await api.getSystemSettings();
    if (response.success) {
      settings.value = response.data;
    } else {
      showMessage("获取系统设置失败", "error");
    }
  } catch (error) {
    console.error("获取系统设置失败:", error);
    showMessage("获取系统设置失败", "error");
  } finally {
    loading.value = false;
  }
};

// 切换布尔设置
const toggleSetting = async (key) => {
  try {
    const newValue = !settings.value[key].value;
    settings.value[key].value = newValue;

    const updateData = {
      [key]: {
        value: newValue,
        description: settings.value[key].description,
      },
    };

    const response = await api.updateSystemSettings(updateData);
    if (response.success) {
      showMessage(
        `${
          key === "user_registration_enabled"
            ? "用户注册功能"
            : key === "maintenance_mode"
            ? "维护模式"
            : key === "comment_approval_required"
            ? "评论审核"
            : "设置"
        }已${newValue ? "开启" : "关闭"}`
      );
    } else {
      // 回滚
      settings.value[key].value = !newValue;
      showMessage("设置更新失败", "error");
    }
  } catch (error) {
    console.error("切换设置失败:", error);
    settings.value[key].value = !settings.value[key].value;
    showMessage("设置更新失败", "error");
  }
};

// 更新数字设置
const updateNumberSetting = async (key) => {
  try {
    const updateData = {
      [key]: {
        value: settings.value[key].value,
        description: settings.value[key].description,
      },
    };

    const response = await api.updateSystemSettings(updateData);
    if (response.success) {
      showMessage("设置已更新");
    } else {
      showMessage("设置更新失败", "error");
    }
  } catch (error) {
    console.error("更新数字设置失败:", error);
    showMessage("设置更新失败", "error");
  }
};

// 更新文本设置
const updateTextSetting = async (key) => {
  try {
    const updateData = {
      [key]: {
        value: settings.value[key].value,
        description: settings.value[key].description,
      },
    };

    const response = await api.updateSystemSettings(updateData);
    if (response.success) {
      showMessage("公告内容已更新");
    } else {
      showMessage("设置更新失败", "error");
    }
  } catch (error) {
    console.error("更新文本设置失败:", error);
    showMessage("设置更新失败", "error");
  }
};

// 保存全部设置
const saveAllSettings = async () => {
  try {
    saving.value = true;
    const response = await api.updateSystemSettings(settings.value);
    if (response.success) {
      showMessage("所有设置已保存");
    } else {
      showMessage("保存失败", "error");
    }
  } catch (error) {
    console.error("保存设置失败:", error);
    showMessage("保存失败", "error");
  } finally {
    saving.value = false;
  }
};

// 重置设置
const resetSettings = async () => {
  if (!confirm("确定要重置所有设置为默认值吗？此操作不可撤销。")) {
    return;
  }

  try {
    // 重置为默认值
    const defaultSettings = {
      user_registration_enabled: {
        value: true,
        description: "是否开启用户注册",
      },
      maintenance_mode: { value: false, description: "维护模式开关" },
      max_posts_per_day: { value: 20, description: "用户每日最大发帖数量" },
      max_upload_size: { value: 50, description: "最大上传文件大小(MB)" },
      site_notice: { value: "", description: "站点公告" },
      comment_approval_required: {
        value: false,
        description: "评论是否需要审核",
      },
    };

    const response = await api.updateSystemSettings(defaultSettings);
    if (response.success) {
      settings.value = defaultSettings;
      showMessage("设置已重置为默认值");
    } else {
      showMessage("重置失败", "error");
    }
  } catch (error) {
    console.error("重置设置失败:", error);
    showMessage("重置失败", "error");
  }
};

// 页面加载
onMounted(() => {
  fetchSettings();
});
</script>

<style scoped>
.system-settings {
  padding: 24px;
  background: var(--bg-color-primary);
  border-radius: 8px;
  position: relative;
}

.header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color-primary);
}

.header h2 {
  margin: 0 0 8px 0;
  color: var(--text-color-primary);
  font-size: 24px;
  font-weight: 600;
}

.description {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 14px;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.settings-section {
  background: var(--bg-color-secondary);
  border-radius: 8px;
  padding: 24px;
  border: 1px solid var(--border-color-primary);
}

.settings-section h3 {
  margin: 0 0 20px 0;
  color: var(--text-color-primary);
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color-secondary);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.full-width {
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.setting-info {
  flex: 1;
}

.setting-info label {
  display: block;
  color: var(--text-color-primary);
  font-weight: 500;
  margin-bottom: 4px;
}

.setting-desc {
  color: var(--text-color-secondary);
  font-size: 13px;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 开关按钮 */
.toggle-btn {
  position: relative;
  width: 48px;
  height: 24px;
  background: var(--border-color-primary);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-btn.active {
  background: var(--primary-color);
}

.toggle-btn.maintenance.active {
  background: #f56565;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-btn.active .toggle-slider {
  transform: translateX(24px);
}

.status-text {
  color: var(--text-color-secondary);
  font-size: 13px;
  min-width: 60px;
}

/* 输入框 */
.number-input {
  width: 80px;
  padding: 6px 8px;
  border: 1px solid var(--border-color-primary);
  border-radius: 4px;
  background: var(--bg-color-primary);
  color: var(--text-color-primary);
  text-align: center;
}

.text-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color-primary);
  border-radius: 4px;
  background: var(--bg-color-primary);
  color: var(--text-color-primary);
  resize: vertical;
  font-family: inherit;
}

.unit {
  color: var(--text-color-secondary);
  font-size: 13px;
}

/* 操作按钮 */
.actions {
  display: flex;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color-primary);
}

.save-btn,
.reset-btn {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.save-btn {
  background: var(--primary-color);
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: var(--primary-color-hover);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-btn {
  background: var(--bg-color-secondary);
  color: var(--text-color-secondary);
  border: 1px solid var(--border-color-primary);
}

.reset-btn:hover {
  background: var(--bg-color-tertiary);
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-color-secondary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color-primary);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 消息提示 */
.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.message.success {
  background: #48bb78;
}

.message.error {
  background: #f56565;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .system-settings {
    padding: 16px;
  }

  .setting-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .setting-control {
    justify-content: space-between;
  }

  .actions {
    flex-direction: column;
  }
}

.message.info {
  background: #4299e1;
}
</style>
