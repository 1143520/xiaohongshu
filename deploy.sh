#!/bin/bash

# 小红书图文社区 - 生产环境部署脚本
# 使用GitHub Container Registry镜像

set -e

echo "🚀 开始部署大红薯图文社区..."

# 检查Docker和Docker Compose是否已安装
    if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件，正在创建示例文件..."
    cp env.production.example .env
    echo "✅ 已创建 .env 文件，请修改其中的配置后重新运行部署脚本"
    exit 1
fi

# 加载环境变量
source .env

# 检查必要的环境变量
if [ -z "$GITHUB_REPOSITORY" ]; then
    echo "❌ 请在 .env 文件中设置 GITHUB_REPOSITORY"
    exit 1
fi

echo "📦 拉取最新镜像..."

# 拉取最新镜像
docker pull ghcr.io/${GITHUB_REPOSITORY}-frontend:${IMAGE_TAG:-main}
docker pull ghcr.io/${GITHUB_REPOSITORY}-backend:${IMAGE_TAG:-main}

echo "🛑 停止现有服务..."

# 停止现有服务
docker-compose -f docker-compose.prod.yml down

echo "🗑️  清理旧镜像..."

# 清理旧镜像
docker image prune -f

echo "🚀 启动新服务..."

# 启动服务
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ 等待服务启动..."

# 等待服务健康检查
sleep 30

# 检查服务状态
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ 部署成功！"
    echo "🌐 前端地址: http://localhost:${FRONTEND_PORT:-80}"
    echo "🔗 后端API: http://localhost:3001"
    echo "📊 服务状态:"
    docker-compose -f docker-compose.prod.yml ps
    else
    echo "❌ 部署失败，请检查日志:"
    docker-compose -f docker-compose.prod.yml logs
        exit 1
    fi

echo "🎉 部署完成！"