#!/bin/bash

# 生产环境诊断脚本 - 排查常见部署问题
# Production Environment Diagnostic Script

echo "🔍 大红薯社区 - 生产环境诊断脚本"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 环境
check_docker() {
    log_info "检查 Docker 环境..."
    
    if command -v docker &> /dev/null; then
        log_success "Docker 已安装: $(docker --version)"
    else
        log_error "Docker 未安装"
        return 1
    fi
    
    if command -v docker-compose &> /dev/null; then
        log_success "Docker Compose 已安装: $(docker-compose --version)"
    else
        log_error "Docker Compose 未安装"
        return 1
    fi
    
    echo ""
}

# 检查容器状态
check_containers() {
    log_info "检查容器状态..."
    
    # 检查项目容器
    containers=("xiaoshiliu-frontend" "xiaoshiliu-backend" "xiaoshiliu-mysql")
    
    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "^${container}$"; then
            log_success "容器 ${container} 正在运行"
            
            # 显示容器详细信息
            uptime=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep "^${container}" | cut -f2)
            log_info "  状态: ${uptime}"
            
            # 检查端口映射
            ports=$(docker port "${container}" 2>/dev/null || echo "无端口映射")
            log_info "  端口: ${ports}"
            
        else
            if docker ps -a --format "table {{.Names}}" | grep -q "^${container}$"; then
                status=$(docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep "^${container}" | cut -f2)
                log_warning "容器 ${container} 已停止: ${status}"
            else
                log_error "容器 ${container} 不存在"
            fi
        fi
    done
    
    echo ""
}

# 检查网络连接
check_network_connectivity() {
    log_info "检查网络连接..."
    
    # 检查端口是否开放
    ports=(80 3001 3306)
    
    for port in "${ports[@]}"; do
        if netstat -tuln 2>/dev/null | grep -q ":${port} "; then
            log_success "端口 ${port} 已开放"
        elif ss -tuln 2>/dev/null | grep -q ":${port} "; then
            log_success "端口 ${port} 已开放"
        else
            log_warning "端口 ${port} 未开放或未监听"
        fi
    done
    
    echo ""
}

# 检查 API 接口
check_api_endpoints() {
    log_info "检查 API 接口..."
    
    # 默认后端地址
    backend_url="http://localhost:3001"
    
    # 如果有自定义地址，使用自定义地址
    if [ -n "$1" ]; then
        backend_url="$1"
    fi
    
    log_info "测试后端地址: ${backend_url}"
    
    # 测试健康检查接口
    if curl -s -o /dev/null -w "%{http_code}" "${backend_url}/api/health" | grep -q "200"; then
        log_success "健康检查接口正常"
    else
        log_error "健康检查接口异常"
    fi
    
    # 测试图床接口（无Token，预期401）
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "${backend_url}/api/upload/hosts")
    if [ "$status_code" = "401" ]; then
        log_success "图床接口存在且需要认证"
    elif [ "$status_code" = "404" ]; then
        log_error "图床接口不存在 (404)"
    else
        log_warning "图床接口返回异常状态码: ${status_code}"
    fi
    
    echo ""
}

# 检查容器日志
check_container_logs() {
    log_info "检查容器日志（最近20行）..."
    
    containers=("xiaoshiliu-frontend" "xiaoshiliu-backend" "xiaoshiliu-mysql")
    
    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "^${container}$"; then
            log_info "=== ${container} 日志 ==="
            docker logs --tail 20 "${container}" 2>&1 | head -20
            echo ""
        fi
    done
}

# 检查文件系统
check_filesystem() {
    log_info "检查文件系统..."
    
    # 检查必要文件是否存在
    files=("docker-compose.yml" "express-project/app.js" "vue3-project/index.html")
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            log_success "文件存在: ${file}"
        else
            log_error "文件缺失: ${file}"
        fi
    done
    
    # 检查目录权限
    if [ -w "." ]; then
        log_success "当前目录可写"
    else
        log_warning "当前目录不可写"
    fi
    
    echo ""
}

# 检查环境变量
check_environment() {
    log_info "检查环境变量..."
    
    # 检查是否存在 .env 文件
    if [ -f ".env" ]; then
        log_success ".env 文件存在"
        log_info "环境变量内容（隐藏敏感信息）:"
        while IFS= read -r line; do
            if [[ $line =~ ^[A-Z_]+ ]]; then
                key=$(echo "$line" | cut -d'=' -f1)
                if [[ $key =~ (PASSWORD|SECRET|KEY) ]]; then
                    echo "  ${key}=***"
                else
                    echo "  $line"
                fi
            fi
        done < .env
    else
        log_warning ".env 文件不存在，使用默认配置"
    fi
    
    echo ""
}

# 生成修复建议
generate_fix_suggestions() {
    log_info "生成修复建议..."
    
    echo "🔧 常见问题修复建议:"
    echo ""
    echo "1. 如果容器未运行:"
    echo "   docker-compose up -d"
    echo ""
    echo "2. 如果图床接口404:"
    echo "   - 检查后端路由注册: express-project/app.js"
    echo "   - 重启后端容器: docker-compose restart backend"
    echo ""
    echo "3. 如果前端无法访问API:"
    echo "   - 检查Nginx配置: vue3-project/nginx.conf"
    echo "   - 确认后端容器名称: docker-compose.yml"
    echo ""
    echo "4. 如果Service Worker报错:"
    echo "   - 清理浏览器缓存"
    echo "   - 检查sw.js是否过滤浏览器扩展请求"
    echo ""
    echo "5. 如果数据库连接失败:"
    echo "   - 检查MySQL容器: docker logs xiaoshiliu-mysql"
    echo "   - 验证数据库配置: express-project/config/database.js"
    echo ""
    echo "6. 重新构建所有服务:"
    echo "   docker-compose down"
    echo "   docker-compose build --no-cache"
    echo "   docker-compose up -d"
    echo ""
}

# 主函数
main() {
    echo "开始诊断..."
    echo ""
    
    check_docker
    check_filesystem
    check_environment
    check_containers
    check_network_connectivity
    check_api_endpoints "$1"
    
    echo ""
    read -p "是否查看容器日志？[y/N]: " show_logs
    if [[ $show_logs =~ ^[Yy]$ ]]; then
        check_container_logs
    fi
    
    echo ""
    generate_fix_suggestions
    
    echo ""
    log_info "诊断完成！"
    echo ""
    echo "💡 提示:"
    echo "• 运行 'node test-upload-hosts-api.js [URL]' 来专门测试图床API"
    echo "• 使用 'docker-compose logs [service]' 查看特定服务日志"
    echo "• 检查浏览器开发者工具的Network选项卡获取更多信息"
}

# 执行主函数
main "$@"
