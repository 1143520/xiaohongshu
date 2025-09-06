# 大红薯图文社区

<p align="center">
  <img alt="logo" src="./doc/imgs/小石榴.png" width="100"/>
</p>
<h1 align="center" style="margin: 20px 0 30px; font-weight: bold;">大红薯</h1>
<p align="center">
  <b>基于 Express + Vue 前后端分离的现代化图文社区</b>
</p>
<p align="center">
  <i>一个高仿小红书的图文社区项目，支持图文发布、社交互动、实时通知等核心功能</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/Vue-3.0+-blue.svg" alt="Vue">
  <img src="https://img.shields.io/badge/MySQL-8.0+-orange.svg" alt="MySQL">
  <img src="https://img.shields.io/badge/Docker-20.10+-blue.svg" alt="Docker">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
</p>

## 🌟 项目亮点

- 🚀 **现代化技术栈**: Vue 3 + Express.js + MySQL + Docker
- 🎨 **精美 UI 设计**: 高度还原小红书界面，支持深色/浅色主题
- 📱 **响应式布局**: 完美适配桌面端和移动端
- 🔄 **自动化部署**: GitHub Actions CI/CD，一键部署上线
- 🛡️ **安全可靠**: JWT 认证、SQL 注入防护、XSS 防护
- ⚡ **高性能**: 图片懒加载、虚拟滚动、CDN 加速
- 🔗 **智能解析**: 自动识别 URL 链接、@用户提及
- 📝 **富文本编辑**: 支持换行、空格、表情、图片上传

## 🚀 一键部署

### 方式一：自动化部署（推荐）

**1. Fork 项目**

```bash
# 访问 https://github.com/1143520/xiaohongshu
# 点击 Fork 按钮，Fork 到你的账号
```

**2. 启用 GitHub Actions**

```bash
# 进入你的仓库 Settings > Actions > General
# 选择 "Allow all actions and reusable workflows"
# 进入 Settings > Actions > General > Workflow permissions
# 选择 "Read and write permissions"
```

**3. 服务器部署**

```bash
# 在你的服务器上执行
git clone https://github.com/your-username/xiaohongshu.git
cd xiaohongshu

# 配置环境变量
cp env.production.example .env
vim .env  # 编辑配置文件

# 一键部署
chmod +x deploy.sh
./deploy.sh
```

### 方式二：本地构建部署

```bash
# 克隆项目
git clone https://github.com/1143520/xiaohongshu.git
cd xiaohongshu

# 本地构建部署
docker-compose up -d
```

## 📋 环境配置

### 必需的环境变量

创建 `.env` 文件：

```bash
# GitHub仓库信息（自动化部署必需）
GITHUB_REPOSITORY=your-username/xiaohongshu
IMAGE_TAG=main

# 数据库配置
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_key_here

# 端口配置
FRONTEND_PORT=5080
BACKEND_PORT=3001
MYSQL_PORT=3307

# API域名（生产环境，可选）
API_BASE_URL=https://your-domain.com
```

### 服务器要求

- **操作系统**: Linux (Ubuntu 18.04+ / CentOS 7+)
- **内存**: 2GB+ RAM
- **存储**: 10GB+ 可用空间
- **软件**: Docker 20.10+ 和 Docker Compose 1.29+

## 🔄 更新部署

### 自动更新（推荐）

```bash
# 在服务器项目目录执行
cd xiaohongshu

# 一键更新部署
./deploy.sh
```

这个命令会自动执行：

1. 停止现有容器
2. 拉取最新代码
3. 拉取最新 Docker 镜像
4. 重新启动服务

### 手动更新

```bash
# 停止服务
docker-compose -f docker-compose.prod.yml down

# 更新代码
git pull origin main

# 拉取最新镜像
docker-compose -f docker-compose.prod.yml pull

# 重启服务
docker-compose -f docker-compose.prod.yml up -d
```

## 🛠️ 开发环境搭建

### 前端开发

```bash
cd vue3-project
npm install
npm run dev
```

访问: http://localhost:5173

### 后端开发

```bash
cd express-project
npm install
npm run dev
```

API 地址: http://localhost:3001

### 数据库初始化

```bash
# 进入后端目录
cd express-project

# 初始化数据库
npm run init-db

# 生成测试数据（可选）
npm run generate-data
```

## 🔧 功能特性

### 核心功能

- ✅ **用户系统**: 注册/登录、个人资料、头像上传
- ✅ **内容发布**: 图文发布、草稿保存、标签分类
- ✅ **社交互动**: 点赞、评论、关注、收藏
- ✅ **实时通知**: 点赞通知、评论通知、关注通知
- ✅ **搜索功能**: 用户搜索、内容搜索、标签搜索
- ✅ **管理后台**: 用户管理、内容管理、数据统计

### 技术特性

- ✅ **智能文本解析**: 自动识别 URL 链接、@用户提及
- ✅ **格式保持**: 支持换行符、连续空格、文本格式
- ✅ **图片处理**: 多图上传、图片压缩、懒加载
- ✅ **主题切换**: 深色/浅色主题自动切换
- ✅ **响应式设计**: 完美适配各种设备尺寸
- ✅ **性能优化**: 虚拟滚动、代码分割、CDN 加速

## 📊 项目架构

```
大红薯图文社区
├── 前端 (Vue 3 + Vite)
│   ├── 用户界面 (Responsive UI)
│   ├── 状态管理 (Pinia)
│   ├── 路由管理 (Vue Router)
│   └── 组件库 (自研组件)
├── 后端 (Express.js)
│   ├── RESTful API
│   ├── JWT 认证
│   ├── 文件上传
│   └── 数据验证
├── 数据库 (MySQL 8.0)
│   ├── 用户数据
│   ├── 内容数据
│   └── 关系数据
└── 部署 (Docker + CI/CD)
    ├── 容器化部署
    ├── 自动构建
    └── 一键更新
```

## 🔍 目录结构

```
xiaohongshu/
├── vue3-project/          # 前端项目
│   ├── src/
│   │   ├── components/    # 通用组件
│   │   ├── views/        # 页面组件
│   │   ├── stores/       # 状态管理
│   │   ├── utils/        # 工具函数
│   │   └── api/          # API接口
│   └── public/           # 静态资源
├── express-project/       # 后端项目
│   ├── routes/           # 路由文件
│   ├── middleware/       # 中间件
│   ├── utils/           # 工具函数
│   └── scripts/         # 数据库脚本
├── doc/                  # 项目文档
├── .github/workflows/    # CI/CD配置
├── docker-compose.yml    # 开发环境
├── docker-compose.prod.yml # 生产环境
└── deploy.sh            # 部署脚本
```

## 🎯 使用指南

### 管理员账号

默认管理员账号：

- 用户名: `admin`
- 密码: `admin123`
- 管理后台: `http://your-domain.com/admin`

### 用户功能

1. **注册登录**: 支持用户名/邮箱注册
2. **发布内容**: 支持图文发布，最多 9 张图片
3. **社交互动**: 点赞、评论、关注其他用户
4. **个人中心**: 查看个人资料、发布内容、收藏夹
5. **搜索发现**: 搜索用户和内容，发现感兴趣的内容

### 文本格式支持

- **换行符**: 编辑时的换行会完整保留
- **连续空格**: 多个空格不会被合并
- **URL 链接**: 自动识别并转为可点击链接
- **@用户**: 支持 @用户名 提及功能
- **表情符号**: 支持 emoji 表情输入

## 🚨 常见问题

### 部署问题

**Q: 端口被占用怎么办？**

```bash
# 修改 .env 文件中的端口配置
FRONTEND_PORT=8080  # 改为其他端口
MYSQL_PORT=3308     # 改为其他端口
```

**Q: 数据库连接失败？**

```bash
# 检查数据库密码是否正确
# 确保MySQL容器正常启动
docker-compose -f docker-compose.prod.yml logs mysql
```

**Q: 图片上传失败？**

```bash
# 检查上传目录权限
sudo chmod -R 755 express-project/uploads/
```

### 更新问题

**Q: 更新后功能异常？**

```bash
# 清理Docker缓存
docker system prune -a

# 重新部署
./deploy.sh
```

## 📚 相关文档

| 文档                                       | 说明                 |
| ------------------------------------------ | -------------------- |
| [服务器部署指南](./SERVER_DEPLOY.md)       | 详细的服务器部署步骤 |
| [完整部署指南](./DEPLOY.md)                | Docker 部署完整说明  |
| [项目结构说明](./doc/PROJECT_STRUCTURE.md) | 项目目录结构详解     |
| [数据库设计](./doc/DATABASE_DESIGN.md)     | 数据库表结构设计     |
| [API 接口文档](./doc/API_DOCS.md)          | 后端 API 接口说明    |

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支: `git checkout -b feature/your-feature`
3. 提交更改: `git commit -am 'Add some feature'`
4. 推送分支: `git push origin feature/your-feature`
5. 提交 Pull Request

## 📄 开源协议

本项目基于 MIT 协议开源，详见 [LICENSE](./LICENSE) 文件。

## 🙏 致谢

- 感谢所有贡献者的支持
- 感谢开源社区提供的优秀工具和框架
- 特别感谢小红书团队的产品设计灵感

---

<p align="center">
  ⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！<br>
  🔔 Watch 本项目以获取最新更新通知
</p>

<p align="center">
  <a href="https://github.com/1143520/xiaohongshu">
    <img src="https://img.shields.io/github/stars/1143520/xiaohongshu?style=social" alt="GitHub stars">
  </a>
  <a href="https://github.com/1143520/xiaohongshu">
    <img src="https://img.shields.io/github/forks/1143520/xiaohongshu?style=social" alt="GitHub forks">
  </a>
</p>
