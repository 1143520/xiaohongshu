#!/bin/bash

# 生产环境 API 问题修复指南
# Production Environment API Fix Guide

echo "🔧 生产环境 API 修复指南"
echo "域名: https://redbook.1143520.xyz/"
echo "问题: /api/upload/hosts 返回 404"
echo "======================================"
echo ""

echo "📋 诊断步骤："
echo ""

echo "1️⃣  测试生产环境后端健康状态："
echo "curl -v https://redbook.1143520.xyz/api/health"
echo ""

echo "2️⃣  测试图床接口是否存在："
echo "curl -v https://redbook.1143520.xyz/api/upload/hosts"
echo ""

echo "3️⃣  检查 Docker 容器状态（在服务器上执行）："
echo "docker ps | grep xiaoshiliu"
echo "docker logs xiaoshiliu-backend"
echo ""

echo "4️⃣  检查 Nginx 配置（在服务器上执行）："
echo "docker exec xiaoshiliu-frontend cat /etc/nginx/conf.d/default.conf"
echo ""

echo "🔧 可能的修复方案："
echo ""

echo "方案1: 重启后端服务"
echo "docker-compose restart backend"
echo ""

echo "方案2: 重新构建并启动服务"
echo "docker-compose down"
echo "docker-compose up -d --build"
echo ""

echo "方案3: 检查路由注册（确认 app.js 中有）"
echo "app.use('/api/upload', uploadRoutes);"
echo ""

echo "方案4: 检查 Nginx 代理配置"
echo "location /api/ {"
echo "    proxy_pass http://backend:3001;"
echo "    proxy_set_header Host \$host;"
echo "    proxy_set_header X-Real-IP \$remote_addr;"
echo "}"
echo ""

echo "⚠️  注意事项："
echo "• 所有命令需要在生产服务器上执行"
echo "• 重启服务可能导致短暂的服务中断"
echo "• 建议先备份数据再进行修复操作"
echo ""

echo "📞 紧急联系方式："
echo "如果问题持续，请提供："
echo "1. 服务器 docker ps 输出"
echo "2. 后端容器日志: docker logs xiaoshiliu-backend"
echo "3. Nginx 容器日志: docker logs xiaoshiliu-frontend"
