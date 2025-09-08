#!/bin/bash

# 大红薯图文社区 - 数据恢复脚本
# 用于从备份文件恢复数据库和配置

set -e

echo "🔄 大红薯图文社区数据恢复脚本"

# 检查参数
if [ $# -eq 0 ]; then
    echo "❌ 请提供备份文件路径"
    echo "用法: $0 <备份文件路径>"
    echo "示例: $0 ./backups/xiaoshiliu_backup_20241201_143022.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"

# 检查备份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ 备份文件不存在: $BACKUP_FILE"
    exit 1
fi

echo "📁 备份文件: $BACKUP_FILE"

# 创建临时目录
TEMP_DIR=$(mktemp -d)
echo "📂 临时目录: $TEMP_DIR"

# 解压备份文件
echo "📦 解压备份文件..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# 查找解压后的目录
BACKUP_DIR=$(find "$TEMP_DIR" -name "xiaoshiliu_backup_*" -type d | head -1)

if [ -z "$BACKUP_DIR" ]; then
    echo "❌ 无法找到备份目录"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "📂 备份目录: $BACKUP_DIR"

# 加载环境变量
if [ -f .env ]; then
    source .env
else
    echo "⚠️  未找到 .env 文件，使用默认配置"
    DB_HOST=${DB_HOST:-localhost}
    DB_USER=${DB_USER:-root}
    DB_PASSWORD=${DB_PASSWORD:-123456}
    DB_NAME=${DB_NAME:-xiaoshiliu}
    DB_PORT=${DB_PORT:-3306}
fi

# 确认恢复操作
echo ""
echo "⚠️  警告: 此操作将覆盖现有数据！"
echo "📊 目标数据库: $DB_NAME"
echo "🖥️  数据库主机: $DB_HOST:$DB_PORT"
echo ""
read -p "确定要继续恢复吗？(输入 yes 确认): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ 恢复操作已取消"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# 检查数据库连接
echo "🔌 检查数据库连接..."

if command -v mysql &> /dev/null; then
    # 测试数据库连接
    if ! mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" &>/dev/null; then
        echo "❌ 无法连接到数据库，请检查配置"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    DB_CLIENT="mysql"
elif docker ps | grep -q xiaoshiliu-mysql; then
    # 测试 Docker 数据库连接
    if ! docker exec xiaoshiliu-mysql mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" &>/dev/null; then
        echo "❌ 无法连接到 Docker 数据库，请检查配置"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    DB_CLIENT="docker"
else
    echo "❌ 无法找到数据库客户端"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "✅ 数据库连接正常"

# 备份当前数据库（可选）
echo "💾 是否要在恢复前备份当前数据库？"
read -p "输入 yes 进行备份，其他任意键跳过: " backup_current

if [ "$backup_current" = "yes" ]; then
    echo "📦 备份当前数据库..."
    CURRENT_BACKUP="./backups/before_restore_$(date +%Y%m%d_%H%M%S).sql"
    mkdir -p ./backups
    
    if [ "$DB_CLIENT" = "mysql" ]; then
        mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" \
            --single-transaction \
            --routines \
            --triggers \
            --events \
            "$DB_NAME" > "$CURRENT_BACKUP"
    else
        docker exec xiaoshiliu-mysql mysqldump \
            -u"$DB_USER" -p"$DB_PASSWORD" \
            --single-transaction \
            --routines \
            --triggers \
            --events \
            "$DB_NAME" > "$CURRENT_BACKUP"
    fi
    
    echo "✅ 当前数据库已备份到: $CURRENT_BACKUP"
fi

# 恢复数据库
echo "🗄️  恢复数据库..."

if [ -f "$BACKUP_DIR/database.sql" ]; then
    if [ "$DB_CLIENT" = "mysql" ]; then
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$BACKUP_DIR/database.sql"
    else
        docker exec -i xiaoshiliu-mysql mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$BACKUP_DIR/database.sql"
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ 数据库恢复完成"
    else
        echo "❌ 数据库恢复失败"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
else
    echo "❌ 未找到数据库备份文件: $BACKUP_DIR/database.sql"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# 恢复配置文件
echo "📁 恢复配置文件..."

if [ -f "$BACKUP_DIR/env.backup" ]; then
    echo "发现环境配置备份文件"
    read -p "是否要恢复 .env 文件？(yes/no): " restore_env
    if [ "$restore_env" = "yes" ]; then
        cp "$BACKUP_DIR/env.backup" .env
        echo "✅ .env 文件已恢复"
    fi
fi

if [ -f "$BACKUP_DIR/docker-compose.yml" ]; then
    echo "发现 Docker Compose 配置备份"
    read -p "是否要恢复 docker-compose.yml？(yes/no): " restore_compose
    if [ "$restore_compose" = "yes" ]; then
        cp "$BACKUP_DIR/docker-compose.yml" ./
        echo "✅ docker-compose.yml 已恢复"
    fi
fi

if [ -f "$BACKUP_DIR/docker-compose.prod.yml" ]; then
    echo "发现生产环境配置备份"
    read -p "是否要恢复 docker-compose.prod.yml？(yes/no): " restore_prod
    if [ "$restore_prod" = "yes" ]; then
        cp "$BACKUP_DIR/docker-compose.prod.yml" ./
        echo "✅ docker-compose.prod.yml 已恢复"
    fi
fi

# 显示备份信息
if [ -f "$BACKUP_DIR/backup_info.txt" ]; then
    echo ""
    echo "📋 备份信息:"
    cat "$BACKUP_DIR/backup_info.txt"
fi

# 清理临时文件
rm -rf "$TEMP_DIR"

echo ""
echo "🎉 数据恢复完成！"
echo ""
echo "📋 恢复内容:"
echo "  ✅ 数据库数据"
echo "  📁 配置文件 (根据选择)"
echo ""
echo "💡 建议操作:"
echo "  1. 检查应用程序配置"
echo "  2. 重启相关服务"
echo "  3. 验证数据完整性"
echo ""

# 询问是否重启服务
if [ -f docker-compose.yml ] || [ -f docker-compose.prod.yml ]; then
    echo "🔄 是否要重启 Docker 服务？"
    read -p "输入 yes 重启服务: " restart_services
    
    if [ "$restart_services" = "yes" ]; then
        echo "🛑 停止现有服务..."
        if [ -f docker-compose.prod.yml ]; then
            docker-compose -f docker-compose.prod.yml down
            echo "🚀 启动生产服务..."
            docker-compose -f docker-compose.prod.yml up -d
        else
            docker-compose down
            echo "🚀 启动开发服务..."
            docker-compose up -d
        fi
        echo "✅ 服务重启完成"
    fi
fi

echo "✨ 恢复流程全部完成！"
