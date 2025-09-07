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

      <!-- 图床设置 -->
      <div class="settings-section">
        <h3>图床设置</h3>
        <div class="setting-item">
          <div class="setting-info">
            <label>图床类型</label>
            <span class="setting-desc">选择图片上传使用的图床服务</span>
          </div>
          <div class="setting-control">
            <select
              v-model="settings.image_host_type.value"
              @change="updateImageHostType"
              class="select-input"
            >
              <option value="xinyew">新叶图床 (默认)</option>
              <option value="4399">4399图床 (免费)</option>
              <option value="nodeimage">NodeImage (需要API密钥)</option>
            </select>
          </div>
        </div>

        <!-- NodeImage API Key 配置 -->
        <div
          v-if="settings.image_host_type?.value === 'nodeimage'"
          class="setting-item"
        >
          <div class="setting-info">
            <label>NodeImage API密钥</label>
            <span class="setting-desc">请输入您的NodeImage API密钥</span>
          </div>
          <div class="setting-control">
            <input
              type="password"
              v-model="settings.nodeimage_api_key.value"
              @blur="updateTextSetting('nodeimage_api_key')"
              placeholder="请输入NodeImage API密钥"
              class="text-input"
            />
          </div>
        </div>

        <!-- 图床状态显示 -->
        <div class="setting-item">
          <div class="setting-info">
            <label>当前图床状态</label>
            <span class="setting-desc">显示当前选择图床的配置状态</span>
          </div>
          <div class="setting-control">
            <span class="status-badge" :class="getImageHostStatus().class">
              {{ getImageHostStatus().text }}
            </span>
            <button @click="testImageHost" class="test-btn" :disabled="testing">
              <span v-if="testing">测试中...</span>
              <span v-else>测试图床</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <button @click="saveAllSettings" :disabled="saving" class="save-btn">
          <span v-if="saving">保存中...</span>
          <span v-else>保存全部设置</span>
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
const testing = ref(false);
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
      if (key === "nodeimage_api_key") {
        showMessage("API密钥已更新");
      } else {
        showMessage("设置已更新");
      }
    } else {
      showMessage("设置更新失败", "error");
    }
  } catch (error) {
    console.error("更新文本设置失败:", error);
    showMessage("设置更新失败", "error");
  }
};

// 更新图床类型
const updateImageHostType = async () => {
  try {
    const updateData = {
      image_host_type: {
        value: settings.value.image_host_type.value,
        description: settings.value.image_host_type.description,
      },
    };

    const response = await api.updateSystemSettings(updateData);
    if (response.success) {
      showMessage("图床类型已更新");
    } else {
      showMessage("图床类型更新失败", "error");
    }
  } catch (error) {
    console.error("更新图床类型失败:", error);
    showMessage("图床类型更新失败", "error");
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
      image_host_type: {
        value: "xinyew",
        description: "图床类型",
      },
      nodeimage_api_key: {
        value: "",
        description: "NodeImage API密钥",
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

// 获取图床状态
const getImageHostStatus = () => {
  if (!settings.value.image_host_type) {
    return { text: "未配置", class: "warning" };
  }

  const hostType = settings.value.image_host_type.value;

  switch (hostType) {
    case "xinyew":
      return { text: "新叶图床 - 正常可用", class: "success" };
    case "4399":
      return { text: "4399图床 - 正常可用", class: "success" };
    case "nodeimage":
      const hasApiKey = settings.value.nodeimage_api_key?.value?.trim();
      if (hasApiKey) {
        return { text: "NodeImage - 已配置API密钥", class: "success" };
      } else {
        return { text: "NodeImage - 需要配置API密钥", class: "warning" };
      }
    default:
      return { text: "未知图床类型", class: "error" };
  }
};

// 测试图床配置
const testImageHost = async () => {
  try {
    testing.value = true;
    const response = await api.testImageHost();

    if (response.success) {
      const { configured, message, type } = response.data;
      if (configured) {
        showMessage(`${type}图床配置正常，可以正常使用`);
      } else {
        showMessage(message, "warning");
      }
    } else {
      showMessage("图床测试失败", "error");
    }
  } catch (error) {
    console.error("测试图床失败:", error);
    showMessage("图床测试失败", "error");
  } finally {
    testing.value = false;
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

/* 输入控件样式 */
.number-input,
.text-input,
.select-input {
  padding: 8px 12px;
  border: 1px solid var(--border-color-primary);
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  background: var(--background-color-primary);
  color: var(--text-color-primary);
}

.number-input:focus,
.text-input:focus,
.select-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.number-input {
  width: 80px;
  text-align: center;
}

.text-input {
  width: 100%;
  min-width: 300px;
  resize: vertical;
}

.select-input {
  min-width: 200px;
  cursor: pointer;
}

.unit {
  margin-left: 8px;
  color: var(--text-color-secondary);
  font-size: 13px;
}

/* 状态徽章 */
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-right: 12px;
}

.status-badge.success {
  background: rgba(72, 187, 120, 0.1);
  color: #38a169;
  border: 1px solid rgba(72, 187, 120, 0.2);
}

.status-badge.warning {
  background: rgba(237, 137, 54, 0.1);
  color: #dd6b20;
  border: 1px solid rgba(237, 137, 54, 0.2);
}

.status-badge.error {
  background: rgba(245, 101, 101, 0.1);
  color: #e53e3e;
  border: 1px solid rgba(245, 101, 101, 0.2);
}

/* 测试按钮 */
.test-btn {
  padding: 6px 16px;
  border: 1px solid var(--primary-color);
  border-radius: 6px;
  background: transparent;
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.test-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
</style>
