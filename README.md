# 小红书图文社区

<p align="center">
  <img alt="logo" src="./doc/imgs/小石榴.png" width="100"/>
</p>
<h1 align="center" style="margin: 20px 0 30px; font-weight: bold;">小红书</h1>
<p align="center">
  <b>基于 Express + Vue 前后端分离仿小红书项目</b>
</p>
<p align="center">
  <i>一个高仿小红书的图文社区项目，支持图文发布、社交互动等核心功能，旨在提供从前端到后端的完整实践范本</i>
</p>

## 🚀 快速部署

### 方式一：GitHub 自动构建部署（推荐）

1. **Fork 本项目到你的 GitHub 账号**

2. **启用 GitHub Container Registry**

   - 进入仓库 Settings > Actions > General
   - 确保 Actions 权限设置为 "Allow all actions and reusable workflows"

3. **推送代码触发自动构建**

   ```bash
   git push origin main
   ```

4. **在服务器上部署**

   ```bash
   # 克隆仓库
   git clone https://github.com/your-username/your-repo.git
   cd your-repo

   # 配置环境变量
   cp env.production.example .env
   # 编辑 .env 文件，设置你的GitHub仓库信息

   # 一键部署
   chmod +x deploy.sh
   ./deploy.sh
   ```

### 方式二：本地构建部署

```bash
# 使用原有的docker-compose
docker-compose up -d
```

## 📦 Docker 镜像

项目会自动构建并推送 Docker 镜像到 GitHub Container Registry：

- 前端镜像: `ghcr.io/your-username/your-repo-frontend:main`
- 后端镜像: `ghcr.io/your-username/your-repo-backend:main`

## 🔧 环境配置

### 必需的环境变量

```bash
# GitHub仓库信息
GITHUB_REPOSITORY=your-username/your-repo
IMAGE_TAG=main

# 数据库配置
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key

# API域名（生产环境）
API_BASE_URL=https://your-domain.com
```

## 🔄 CI/CD 流程

### GitHub Actions 工作流

- **触发条件**: 推送到 `main` 或 `master` 分支
- **构建步骤**:
  1. 构建前端和后端 Docker 镜像
  2. 推送镜像到 GitHub Container Registry
  3. 提供部署提示信息

### 服务器部署

GitHub Actions 构建完成后，在服务器上执行：

```bash
# 克隆项目
git clone https://github.com/your-username/your-repo.git
cd your-repo

# 配置环境变量
cp env.production.example .env
# 编辑 .env 文件

# 一键部署
./deploy.sh
```

详细步骤请查看 [服务器部署指南](./SERVER_DEPLOY.md)

## 📋 部署检查清单

- [ ] Fork 项目到你的 GitHub 账号
- [ ] 启用 GitHub Actions 和 Container Registry
- [ ] 推送代码触发构建
- [ ] 在服务器上安装 Docker 和 Docker Compose
- [ ] 克隆项目到服务器并配置 `.env` 文件
- [ ] 执行部署脚本

## 🛠️ 开发环境

本地开发仍然使用原有方式：

```bash
# 前端开发
cd vue3-project
npm install
npm run dev

# 后端开发
cd express-project
npm install
npm run dev
```

## 📚 更多文档

| 文档                                   | 说明                    |
| -------------------------------------- | ----------------------- |
| [服务器部署指南](./SERVER_DEPLOY.md)   | 服务器部署详细步骤      |
| [完整部署指南](./DEPLOY.md)            | Docker 部署完整说明     |
| [项目结构](./doc/PROJECT_STRUCTURE.md) | 项目目录结构架构说明    |
| [数据库设计](./doc/DATABASE_DESIGN.md) | 数据库表结构设计文档    |
| [API 接口文档](./doc/API_DOCS.md)      | 后端 API 接口说明和示例 |

## 🎯 项目特色

- **完整的社交功能**: 发帖、评论、点赞、关注、通知
- **现代化 CI/CD**: GitHub Actions 自动构建和部署
- **容器化部署**: Docker + Docker Compose 一键部署
- **生产就绪**: 健康检查、日志管理、资源优化
- **高可用架构**: 负载均衡、数据持久化、故障恢复

## 📄 开源协议

本项目基于 MIT 协议开源，详见 [LICENSE](./LICENSE) 文件。

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
