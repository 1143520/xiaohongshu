# 生产环境问题排查和修复指南

## 🚨 当前问题

- **域名**: https://redbook.1143520.xyz/
- **错误**: `/api/upload/hosts` 返回 404
- **Service Worker**: chrome-extension 报错（已修复）

## 🔍 立即诊断（在生产服务器执行）

### 1. 检查服务状态

```bash
# 检查容器运行状态
docker ps | grep xiaoshiliu

# 检查后端日志
docker logs xiaoshiliu-backend --tail 50

# 检查前端/Nginx日志
docker logs xiaoshiliu-frontend --tail 50
```

### 2. 测试 API 接口

```bash
# 测试健康检查
curl -v https://redbook.1143520.xyz/api/health

# 测试图床接口（预期401，实际404说明路由问题）
curl -v https://redbook.1143520.xyz/api/upload/hosts

# 测试其他上传接口
curl -v https://redbook.1143520.xyz/api/upload/single
```

### 3. 检查配置文件

```bash
# 检查后端路由配置
docker exec xiaoshiliu-backend cat app.js | grep "upload"

# 检查Nginx配置
docker exec xiaoshiliu-frontend cat /etc/nginx/conf.d/default.conf
```

## 🔧 修复方案

### 方案 1: 重启服务（最简单）

```bash
cd /path/to/project
docker-compose restart backend
# 等待30秒后测试
curl https://redbook.1143520.xyz/api/health
```

### 方案 2: 完全重建（推荐）

```bash
cd /path/to/project
docker-compose down
docker-compose up -d --build
# 等待服务启动完成
docker-compose logs -f
```

### 方案 3: 检查路由配置

确认 `express-project/app.js` 中包含：

```javascript
app.use("/api/upload", uploadRoutes);
```

### 方案 4: 更新代码（如果代码未同步）

```bash
cd /path/to/project
git pull origin main
docker-compose up -d --build
```

## 🚀 验证修复

修复后使用以下命令验证：

```bash
# 1. 健康检查应该返回200
curl https://redbook.1143520.xyz/api/health

# 2. 图床接口应该返回401（需要认证）而不是404
curl https://redbook.1143520.xyz/api/upload/hosts

# 3. 检查前端页面是否正常加载图床选项
```

## 📋 预防措施

1. **监控检查**：设置 API 监控，及时发现 404 错误
2. **日志管理**：定期查看容器日志
3. **备份策略**：使用项目提供的 backup.sh 脚本
4. **版本控制**：确保生产环境代码与仓库同步

## 🔍 常见原因分析

### `/api/upload/hosts` 404 的可能原因：

1. **后端容器未启动** - 检查 `docker ps`
2. **路由未注册** - 检查 `app.js` 中的路由配置
3. **Nginx 代理问题** - 检查 `nginx.conf` 中的 `/api/` 代理配置
4. **代码未同步** - 后端代码可能不是最新版本
5. **端口冲突** - 后端端口 3001 被占用

### Service Worker 错误（已修复）：

- chrome-extension 请求被过滤，更新后的 `sw.js` 已解决

## 📞 如果问题持续

请提供以下信息：

1. `docker ps` 的完整输出
2. `docker logs xiaoshiliu-backend` 的最新日志
3. `docker logs xiaoshiliu-frontend` 的最新日志
4. 服务器的项目目录结构 `ls -la`
