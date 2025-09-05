# 🚀 服务器部署指南

## 📋 部署流程

### 1. GitHub 自动构建镜像

推送代码到 GitHub 后，Actions 会自动构建 Docker 镜像并推送到 GitHub Container Registry。

### 2. 服务器环境准备

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 重新登录使用户组生效
newgrp docker
```

### 3. 部署应用

```bash
# 克隆项目到服务器
git clone https://github.com/your-username/your-repo.git
cd your-repo

# 配置环境变量
cp env.production.example .env

# 编辑配置文件
nano .env
```

**重要：修改 .env 文件中的关键配置**

```bash
# 必须修改的配置
GITHUB_REPOSITORY=your-username/your-repo  # 改为你的 GitHub 仓库名
DB_PASSWORD=your_secure_password_here      # 设置安全的数据库密码
JWT_SECRET=your_jwt_secret_key_here        # 设置 JWT 密钥

# 可选配置
API_BASE_URL=https://your-domain.com       # 你的域名
FRONTEND_PORT=80                           # 前端端口
```

### 4. 一键部署

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

### 5. 验证部署

```bash
# 检查服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 测试访问
curl http://localhost                    # 前端
curl http://localhost:3001/api/health    # 后端健康检查
```

## 🔄 更新部署

当你推送新代码到 GitHub 后：

```bash
# 在服务器上拉取最新配置
git pull

# 重新部署（会自动拉取最新镜像）
./deploy.sh
```

## 📊 常用管理命令

```bash
# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs [service-name]

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 停止服务
docker-compose -f docker-compose.prod.yml down

# 备份数据库
docker exec xiaoshiliu-mysql mysqldump -u root -p xiaoshiliu > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🐛 故障排除

### 镜像拉取失败

```bash
# 手动登录 GitHub Container Registry
docker login ghcr.io -u your-username

# 手动拉取镜像测试
docker pull ghcr.io/your-username/your-repo-frontend:main
docker pull ghcr.io/your-username/your-repo-backend:main
```

### 数据库连接失败

```bash
# 检查数据库服务
docker-compose -f docker-compose.prod.yml logs mysql

# 重启数据库
docker-compose -f docker-compose.prod.yml restart mysql
```

### 端口被占用

```bash
# 查看端口占用
netstat -tlnp | grep :80
netstat -tlnp | grep :3001

# 修改 .env 文件中的端口配置
FRONTEND_PORT=8080  # 改为其他端口
```

---

🎉 **部署完成后，你的应用就可以通过服务器 IP 访问了！**
