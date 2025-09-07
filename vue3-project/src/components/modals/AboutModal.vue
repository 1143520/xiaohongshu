<template>
  <div
    class="about-modal-overlay"
    v-click-outside.mousedown="closeModal"
    v-escape-key="closeModal"
    :class="{ animating: isAnimating }"
  >
    <div class="about-modal" @click.stop :class="{ 'scale-in': isAnimating }">
      <div class="about-header">
        <div class="header-content">
          <div class="logo-section">
            <img :src="logoUrl" alt="大红薯" class="about-logo" />
            <h2 class="about-title">关于大红薯</h2>
          </div>
          <p class="version">v1.2.0</p>
        </div>
        <button class="close-btn" @click="closeModal">
          <SvgIcon name="close" />
        </button>
      </div>

      <div class="about-content">
        <div class="about-main">
          <div class="intro-section">
            <h3>项目简介</h3>
            <p>
              大红薯是一个基于 Vue 3 + Express.js
              的现代化图文社区项目，高度还原小红书的UI设计和交互体验。
              项目支持用户注册登录、图文发布、社交互动、实时通知等完整功能，采用前后端分离架构，
              提供 Docker 容器化部署和 GitHub Actions
              自动化构建。集成系统设置管理，支持注册开关、 维护模式等高级功能。
            </p>
            <p style="margin-top: 12px">
              <strong>🚀 一键部署：</strong>支持 GitHub Actions 自动构建和
              Docker 一键部署<br />
              <strong>📱 响应式设计：</strong>完美适配桌面端和移动端设备<br />
              <strong>🎨 现代化UI：</strong
              >支持深色/浅色主题切换，精美的用户界面<br />
              <strong>⚙️ 系统管理：</strong
              >完整的管理后台，支持用户管理和系统设置
            </p>
          </div>
          <div class="author-section">
            <h3>开发者</h3>
            <a
              href="https://github.com/1143520/xiaohongshu"
              target="_blank"
              class="author-link"
            >
              <div class="author-info">
                <img class="author-avatar" :src="ztmyoUrl" alt="1143520" />
                <div class="author-details">
                  <p class="author-name">@1143520</p>
                  <p class="author-desc">全栈开发者</p>
                </div>
              </div>
            </a>

            <!-- GitHub 徽章 -->
            <div class="badges-section">
              <a
                href="https://github.com/1143520/xiaohongshu"
                target="_blank"
                class="badge-link"
              >
                <img
                  src="https://img.shields.io/github/stars/1143520/xiaohongshu?style=social"
                  alt="GitHub Stars"
                  class="badge-img"
                />
              </a>
              <a
                href="https://github.com/1143520/xiaohongshu/releases"
                target="_blank"
                class="badge-link"
              >
                <img
                  src="https://img.shields.io/github/v/release/1143520/xiaohongshu?style=flat-square&color=green"
                  alt="Version"
                  class="badge-img"
                />
              </a>
              <a
                href="https://github.com/1143520/xiaohongshu/forks"
                target="_blank"
                class="badge-link"
              >
                <img
                  src="https://img.shields.io/github/forks/1143520/xiaohongshu?style=social"
                  alt="GitHub Forks"
                  class="badge-img"
                />
              </a>
              <a
                href="https://github.com/1143520/xiaohongshu/issues"
                target="_blank"
                class="badge-link"
              >
                <img
                  src="https://img.shields.io/github/issues/1143520/xiaohongshu?style=flat-square"
                  alt="GitHub Issues"
                  class="badge-img"
                />
              </a>
              <a
                href="https://github.com/1143520/xiaohongshu/blob/main/LICENSE"
                target="_blank"
                class="badge-link"
              >
                <img
                  src="https://img.shields.io/github/license/1143520/xiaohongshu?style=flat-square"
                  alt="License"
                  class="badge-img"
                />
              </a>
            </div>
          </div>
          <div class="features-section">
            <h3>核心功能</h3>
            <ul class="features-list">
              <li>
                <strong>用户系统：</strong
                >注册登录、个人资料、头像上传、密码修改
              </li>
              <li>
                <strong>内容发布：</strong
                >图文发布、草稿保存、标签分类、多图上传
              </li>
              <li>
                <strong>社交互动：</strong>点赞、评论、关注、收藏、互相关注列表
              </li>
              <li>
                <strong>实时通知：</strong
                >点赞通知、评论通知、关注通知、未读消息提醒
              </li>
              <li>
                <strong>搜索功能：</strong
                >用户搜索、内容搜索、标签搜索、综合搜索
              </li>
              <li>
                <strong>管理后台：</strong
                >用户管理、内容管理、数据统计、系统设置
              </li>
              <li>
                <strong>系统设置：</strong
                >注册开关、维护模式、评论审核、站点公告
              </li>
              <li>
                <strong>智能解析：</strong>URL链接识别、@用户提及、IP属地显示
              </li>
              <li>
                <strong>格式保持：</strong>支持换行符、连续空格、文本格式保持
              </li>
              <li>
                <strong>时区统一：</strong>全站时间统一为中国时区(UTC+8)显示
              </li>
              <li>
                <strong>快捷入口：</strong
                >Pinterest、NodeImage图床、博客、音乐快速访问
              </li>
              <li>
                <strong>Pinterest集成：</strong
                >直链转换功能，一键将Pinterest图片转为永久可用链接
              </li>
            </ul>
          </div>

          <div class="tech-section">
            <h3>技术架构</h3>
            <ul class="features-list">
              <li>
                <strong>前端：</strong>Vue 3 + Vite + Pinia + Vue Router 4
              </li>
              <li><strong>后端：</strong>Node.js + Express.js + MySQL 8.0</li>
              <li>
                <strong>部署：</strong>Docker + Docker Compose + GitHub Actions
              </li>
              <li><strong>认证：</strong>JWT Token + SHA256 密码加密</li>
              <li><strong>文件上传：</strong>Multer + 第三方图床API</li>
              <li><strong>UI组件：</strong>自研组件库 + 响应式设计</li>
              <li><strong>性能优化：</strong>懒加载、虚拟滚动、代码分割</li>
              <li><strong>开发工具：</strong>ESLint + Prettier + Git Hooks</li>
            </ul>
          </div>

          <div class="deployment-section">
            <h3>部署指南</h3>
            <div class="deployment-content">
              <h4>🚀 一键部署（推荐）</h4>
              <div class="code-block">
                <pre>
# 1. Fork 项目到你的 GitHub 账号
# 2. 启用 GitHub Actions 权限
# 3. 在服务器执行：
git clone https://github.com/your-username/xiaohongshu.git
cd xiaohongshu
cp env.production.example .env
vim .env  # 配置环境变量
./deploy.sh</pre
                >
              </div>

              <h4>🔄 更新部署</h4>
              <div class="code-block">
                <pre>
# 在服务器项目目录执行：
./deploy.sh  # 自动拉取最新代码和镜像</pre
                >
              </div>

              <h4>🔧 环境要求</h4>
              <ul class="requirement-list">
                <li>
                  <strong>操作系统：</strong>Linux (Ubuntu 18.04+ / CentOS 7+)
                </li>
                <li><strong>内存：</strong>2GB+ RAM</li>
                <li><strong>存储：</strong>10GB+ 可用空间</li>
                <li>
                  <strong>软件：</strong>Docker 20.10+ 和 Docker Compose 1.29+
                </li>
              </ul>
            </div>
          </div>

          <div class="api-section">
            <h3>第三方服务</h3>
            <div class="api-content">
              <p>
                <strong>图片存储：</strong>示例图片来自
                <a
                  href="https://www.pinterest.com/"
                  target="_blank"
                  class="api-link"
                  ><img
                    :src="liciUrl"
                    alt="Pinterest"
                    class="api-icon"
                  />Pinterest</a
                >，提供丰富的图片素材和灵感。集成Pinterest直链转换功能，
                可将Pinterest图片链接转换为永久可用的直链地址。
              </p>
              <p>
                <strong>图片上传：</strong>用户上传图片使用
                <a
                  href="https://api.aa1.cn/doc/xinyew_jdtc.html"
                  target="_blank"
                  class="api-link"
                  ><img
                    :src="xiaRouUrl"
                    alt="夏柔"
                    class="api-icon"
                  />夏柔API</a
                >，确保图片上传的稳定性和速度。
              </p>
              <p>
                <strong>属地查询：</strong>IP属地查询服务使用
                <a
                  href="https://app.ipdatacloud.com/"
                  target="_blank"
                  class="api-link"
                  ><img
                    :src="baoLuoUrl"
                    alt="IPDataCloud"
                    class="api-icon"
                  />IPDataCloud</a
                >，实现精准的IP属地定位功能。
              </p>
              <p>
                <strong>图床服务：</strong>集成
                <a
                  href="https://www.nodeimage.com/"
                  target="_blank"
                  class="api-link"
                  ><img
                    :src="xiaRouUrl"
                    alt="NodeImage"
                    class="api-icon"
                  />NodeImage图床</a
                >快捷入口，方便用户进行图片管理和外链生成。
              </p>
              <p>
                <strong>博客链接：</strong>提供
                <a
                  href="https://r.1143520.xyz/"
                  target="_blank"
                  class="api-link"
                  ><img
                    :src="ztmyoUrl"
                    alt="博客"
                    class="api-icon"
                  />开发者博客</a
                >快捷入口，分享技术文章和项目开发心得。
              </p>
              <p>
                <strong>音乐服务：</strong>集成
                <a
                  href="https://kugou.1143520.xyz/#/"
                  target="_blank"
                  class="api-link"
                  ><img
                    :src="xiaRouUrl"
                    alt="音乐"
                    class="api-icon"
                  />在线音乐</a
                >快捷入口，提供便捷的音乐播放和收听体验。
              </p>
            </div>
          </div>

          <div class="privacy-section">
            <h3>隐私声明</h3>
            <div class="privacy-content">
              <p>
                <strong>数据保护：</strong
                >我们承诺不收集或存储用户的IP地址信息，保护用户的隐私和匿名性。
              </p>
              <p>
                <strong>密码安全：</strong
                >用户密码采用SHA256加密算法进行哈希处理，确保密码信息的安全性，系统无法获取用户的明文密码。
              </p>
              <p>
                <strong>数据最小化：</strong
                >我们仅收集必要的用户信息用于基本功能实现，不会收集与服务无关的个人数据。
              </p>
              <p>
                <strong>本地存储：</strong
                >所有用户数据均存储在本地数据库中，不会上传至第三方服务器或云端。
              </p>
            </div>
          </div>

          <div class="usage-section">
            <h3>使用指南</h3>
            <div class="usage-content">
              <h4>👨‍💼 管理员功能</h4>
              <ul class="usage-list">
                <li><strong>默认账号：</strong>admin / admin123</li>
                <li><strong>管理后台：</strong>http://your-domain.com/admin</li>
                <li><strong>用户管理：</strong>查看、编辑、禁用用户账户</li>
                <li><strong>内容管理：</strong>帖子审核、删除、标签管理</li>
                <li><strong>系统设置：</strong>注册开关、维护模式、评论审核</li>
                <li><strong>数据统计：</strong>用户增长、内容统计分析</li>
              </ul>

              <h4>📝 文本格式支持</h4>
              <ul class="usage-list">
                <li><strong>换行符：</strong>编辑时的换行会完整保留</li>
                <li><strong>连续空格：</strong>多个空格不会被合并</li>
                <li><strong>URL链接：</strong>自动识别并转为可点击链接</li>
                <li><strong>@用户：</strong>支持 @用户名 提及功能</li>
                <li><strong>表情符号：</strong>支持emoji表情输入</li>
                <li><strong>时间显示：</strong>统一使用中国时区(UTC+8)</li>
                <li><strong>IP属地：</strong>自动显示用户发帖属地信息</li>
              </ul>

              <h4>🚀 快捷功能</h4>
              <ul class="usage-list">
                <li><strong>Pinterest：</strong>侧边栏快捷访问获取图片灵感</li>
                <li>
                  <strong>Pinterest转换：</strong
                  >一键将Pinterest图片转为永久可用直链
                </li>
                <li><strong>NodeImage图床：</strong>快速访问图片上传和管理</li>
                <li><strong>博客：</strong>快速访问开发者博客和技术文章</li>
                <li><strong>音乐：</strong>快速访问在线音乐播放服务</li>
                <li><strong>实时通知：</strong>点赞、评论、关注即时提醒</li>
                <li><strong>搜索发现：</strong>智能搜索用户和内容</li>
                <li><strong>主题切换：</strong>支持深色和浅色主题</li>
              </ul>

              <h4>🔧 常见问题</h4>
              <ul class="usage-list">
                <li><strong>端口被占用：</strong>修改 .env 文件中的端口配置</li>
                <li>
                  <strong>数据库连接失败：</strong>检查数据库密码和容器状态
                </li>
                <li><strong>图片上传失败：</strong>检查上传目录权限</li>
                <li>
                  <strong>更新后功能异常：</strong>清理Docker缓存后重新部署
                </li>
              </ul>
            </div>
          </div>

          <div class="copyright-section">
            <h3>版权声明</h3>
            <div class="copyright-content">
              <p>
                <strong>设计灵感：</strong
                >本项目的UI设计和交互体验参考了小红书平台，旨在为开发者提供一个熟悉的学习和实践环境。
              </p>
              <p>
                <strong>开源项目：</strong>本项目基于 MIT
                协议开源，仅供学习交流使用，不用于商业用途。欢迎提交 Issue 和
                Pull Request。
              </p>
              <p>
                <strong>免责声明：</strong
                >本项目与小红书官方无任何关联，所有商标、品牌名称归其各自所有者所有。
              </p>
            </div>
          </div>

          <div class="about-footer">
            <p>&copy; 2025 大红薯校园图文社区. Made with ❤️ by @1143520</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import SvgIcon from "@/components/SvgIcon.vue";
import { useScrollLock } from "@/composables/useScrollLock";

const emit = defineEmits(["close"]);

const { lock, unlock } = useScrollLock();

// 静态资源URL
const logoUrl = new URL("@/assets/imgs/logo.ico", import.meta.url).href;
const ztmyoUrl = new URL("@/assets/imgs/ztmyo.png", import.meta.url).href;
const liciUrl = new URL("@/assets/imgs/栗次元.ico", import.meta.url).href;
const xiaRouUrl = new URL("@/assets/imgs/夏柔.ico", import.meta.url).href;
const baoLuoUrl = new URL("@/assets/imgs/保罗.ico", import.meta.url).href;

const isAnimating = ref(false);

const closeModal = () => {
  isAnimating.value = false;
  unlock();
  setTimeout(() => {
    emit("close");
  }, 200);
};

onMounted(() => {
  lock();

  setTimeout(() => {
    isAnimating.value = true;
  }, 10);
});
</script>

<style scoped>
.about-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  opacity: 0;
  transition: opacity 0.2s ease;
  backdrop-filter: blur(4px);
}

.about-modal-overlay.animating {
  opacity: 1;
}

.about-modal {
  background: var(--bg-color-primary);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  position: relative;
  transform: scale(0.9);
  transition: transform 0.2s ease;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.about-modal.scale-in {
  transform: scale(1);
}

.about-header {
  position: relative;
  background: var(--bg-color-primary);
  padding: 24px 32px;
  border-radius: 16px 16px 0 0;
  flex-shrink: 0;
}

.header-content {
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-color-secondary);
  color: var(--text-color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  transition: all 0.2s ease;
}

.close-btn:hover {
  opacity: 0.8;
  transform: scale(1.1);
}

.about-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.about-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

.about-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color-primary);
  margin: 0;
}

.version {
  font-size: 14px;
  color: var(--text-color-secondary);
  background: var(--bg-color-secondary);
  padding: 4px 12px;
  border-radius: 12px;
  display: inline-block;
  margin: 0;
}

.about-main {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.intro-section h3,
.features-section h3,
.tech-section h3,
.deployment-section h3,
.usage-section h3,
.author-section h3,
.api-section h3,
.privacy-section h3,
.copyright-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color-primary);
  margin: 0 0 12px 0;
}

.intro-section p {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-color-secondary);
  margin: 0;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.features-list li {
  font-size: 14px;
  color: var(--text-color-primary);
  padding: 8px 0;
}

.author-link {
  text-decoration: none;
  color: inherit;
  display: block;
  border-radius: 12px;
  padding: 12px;
  transition: all 0.3s ease;
}

.author-link:hover {
  background-color: rgba(255, 95, 95, 0.05);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color-primary);
}

.author-details {
  flex: 1;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color-primary);
  margin: 0 0 4px 0;
}

.author-desc {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin: 0;
}

/* GitHub 徽章样式 */
.badges-section {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.badge-link {
  text-decoration: none;
  display: inline-block;
  transition: transform 0.2s ease;
}

.badge-link:hover {
  transform: scale(1.05);
}

.badge-img {
  height: 20px;
  border-radius: 3px;
  vertical-align: middle;
}

.privacy-content p,
.copyright-content p {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-color-secondary);
  margin: 0 0 12px 0;
}

.privacy-content p:last-child,
.copyright-content p:last-child {
  margin-bottom: 0;
}

.privacy-content strong,
.copyright-content strong {
  color: var(--text-color-primary);
}

.about-footer {
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
}

.about-footer p {
  font-size: 13px;
  color: var(--text-color-tertiary);
  margin: 0;
}

.api-content p {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-color-secondary);
  margin: 0 0 12px 0;
}

.api-content p:last-child {
  margin-bottom: 0;
}

.api-content strong {
  color: var(--text-color-primary);
}

.api-link {
  color: var(--text-color-primary);
  font-weight: 450;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.api-link:hover {
  opacity: 0.8;
}

.api-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
  vertical-align: middle;
  border-radius: 2px;
}

/* 部署指南样式 */
.deployment-content h4,
.usage-content h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color-primary);
  margin: 16px 0 8px 0;
}

.deployment-content h4:first-child,
.usage-content h4:first-child {
  margin-top: 0;
}

.code-block {
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color-primary);
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 13px;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: var(--text-color-primary);
  line-height: 1.5;
}

.requirement-list,
.usage-list {
  list-style: none;
  padding: 0;
  margin: 8px 0;
}

.requirement-list li,
.usage-list li {
  font-size: 14px;
  color: var(--text-color-secondary);
  padding: 4px 0;
  border-left: 3px solid var(--bg-color-tertiary);
  padding-left: 12px;
  margin-bottom: 6px;
}

.requirement-list li strong,
.usage-list li strong {
  color: var(--text-color-primary);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .about-modal {
    width: 95%;
    max-height: 95vh;
  }

  .about-header {
    padding: 20px 24px;
  }

  .about-content {
    padding: 24px 20px;
  }

  .logo-section {
    flex-direction: column;
    gap: 12px;
  }

  .about-title {
    font-size: 24px;
  }

  .features-list {
    grid-template-columns: 1fr;
  }

  .author-info {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .contact-links {
    justify-content: center;
  }
}
</style>
