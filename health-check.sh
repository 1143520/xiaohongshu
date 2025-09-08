#!/bin/bash

# 生产环境健康检查脚本
# 用于验证部署后所有关键功能是否正常

echo "🚀 开始生产环境健康检查..."

# 基础URL（需要根据实际域名修改）
BASE_URL="https://redbook.1143520.xyz"
API_URL="$BASE_URL/api"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -n "检查 $description ... "
    
    response=$(curl -s -w "%{http_code}" -o /dev/null "$API_URL$endpoint")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ 正常${NC} ($response)"
        return 0
    else
        echo -e "${RED}✗ 失败${NC} ($response)"
        return 1
    fi
}

# 需要管理员token的检查
check_admin_endpoint() {
    local endpoint=$1
    local description=$2
    local token=$3
    
    echo -n "检查 $description ... "
    
    if [ -z "$token" ]; then
        echo -e "${YELLOW}⚠ 跳过 (需要管理员token)${NC}"
        return 0
    fi
    
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "Authorization: Bearer $token" \
        "$API_URL$endpoint")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ 正常${NC} ($response)"
        return 0
    elif [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo -e "${YELLOW}⚠ 权限问题${NC} ($response)"
        return 0
    else
        echo -e "${RED}✗ 失败${NC} ($response)"
        return 1
    fi
}

echo "📊 基础服务检查"
echo "=================="

# 1. 健康检查
check_endpoint "/health" "后端服务健康状态"

# 2. 基础API检查
check_endpoint "/posts?page=1&limit=10" "帖子列表API"
check_endpoint "/tags" "标签列表API"

echo ""
echo "🔐 认证相关检查"
echo "=================="

# 3. 认证接口检查（这些返回400是正常的，因为没有提供参数）
check_endpoint "/auth/register" "用户注册接口" "400"
check_endpoint "/auth/login" "用户登录接口" "400"
check_endpoint "/auth/admin/login" "管理员登录接口" "400"

echo ""
echo "🖼️ 上传服务检查"
echo "=================="

# 4. 上传接口检查（这些返回401是正常的，因为需要登录）
check_endpoint "/upload/single" "文件上传接口" "401"

echo ""
echo "⚙️ 系统功能检查"
echo "=================="

# 5. 系统设置检查（需要管理员权限）
# 注意：这里需要实际的管理员token，暂时检查是否返回预期的状态码
check_admin_endpoint "/system/settings" "系统设置API" "$ADMIN_TOKEN"
check_admin_endpoint "/export/preview" "导出预览API" "$ADMIN_TOKEN"

echo ""
echo "📱 前端服务检查"
echo "=================="

# 6. 前端页面检查
echo -n "检查前端首页 ... "
response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓ 正常${NC} ($response)"
else
    echo -e "${RED}✗ 失败${NC} ($response)"
fi

echo -n "检查前端静态资源 ... "
response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/logo.ico")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓ 正常${NC} ($response)"
else
    echo -e "${RED}✗ 失败${NC} ($response)"
fi

echo ""
echo "🔍 详细诊断"
echo "=============="

# 7. 详细的导出API诊断
echo "导出API详细检查:"
echo -n "  - 无认证访问: "
response=$(curl -s -w "%{http_code}" -o /dev/null "$API_URL/export/preview")
echo "HTTP $response"

echo -n "  - 错误token访问: "
response=$(curl -s -w "%{http_code}" -o /dev/null \
    -H "Authorization: Bearer invalid_token" \
    "$API_URL/export/preview")
echo "HTTP $response"

echo ""
echo "💡 使用说明"
echo "=============="
echo "1. 如果看到很多401/403错误，这是正常的，表示权限验证工作正常"
echo "2. 如果导出功能返回404，请检查:"
echo "   - 后端服务是否正常启动"
echo "   - export.js路由是否正确加载"
echo "   - 数据库连接是否正常"
echo "3. 要完整测试导出功能，需要:"
echo "   - 获取管理员token: 登录管理后台获取"
echo "   - 设置环境变量: export ADMIN_TOKEN='your_token_here'"
echo "   - 重新运行此脚本"

echo ""
echo "🏁 健康检查完成"

# 如果提供了管理员token，给出更详细的说明
if [ -n "$ADMIN_TOKEN" ]; then
    echo -e "${GREEN}✓ 使用了管理员token进行检查${NC}"
else
    echo -e "${YELLOW}⚠ 未提供管理员token，部分检查被跳过${NC}"
    echo "要进行完整检查，请运行:"
    echo "  export ADMIN_TOKEN='your_admin_token'"
    echo "  ./health-check.sh"
fi
