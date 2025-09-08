#!/bin/bash

# 大红薯图文社区 - 数据备份脚本
# 用于备份数据库和重要文件

set -e

echo "📦 开始备份大红薯图文社区数据..."

# 创建备份目录
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="$BACKUP_DIR/xiaoshiliu_backup_$TIMESTAMP"

mkdir -p "$BACKUP_PATH"

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

echo "🗄️  备份数据库..."

# 备份数据库
if command -v mysqldump &> /dev/null; then
    # 使用本地 mysqldump
    mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --hex-blob \
        --default-character-set=utf8mb4 \
        "$DB_NAME" > "$BACKUP_PATH/database.sql"
    
    if [ $? -eq 0 ]; then
        echo "✅ 数据库备份完成: $BACKUP_PATH/database.sql"
    else
        echo "❌ 数据库备份失败"
        exit 1
    fi
elif docker ps | grep -q xiaoshiliu-mysql; then
    # 使用 Docker 容器中的 mysqldump
    docker exec xiaoshiliu-mysql mysqldump \
        -u"$DB_USER" -p"$DB_PASSWORD" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --hex-blob \
        --default-character-set=utf8mb4 \
        "$DB_NAME" > "$BACKUP_PATH/database.sql"
    
    if [ $? -eq 0 ]; then
        echo "✅ 数据库备份完成: $BACKUP_PATH/database.sql"
    else
        echo "❌ 数据库备份失败"
        exit 1
    fi
else
    echo "❌ 无法找到数据库连接方式，请确保 MySQL 可访问或 Docker 容器运行中"
    exit 1
fi

echo "📁 备份配置文件..."

# 备份重要配置文件
if [ -f .env ]; then
    cp .env "$BACKUP_PATH/env.backup"
    echo "✅ 环境配置文件已备份"
fi

if [ -f docker-compose.yml ]; then
    cp docker-compose.yml "$BACKUP_PATH/"
    echo "✅ Docker Compose 配置已备份"
fi

if [ -f docker-compose.prod.yml ]; then
    cp docker-compose.prod.yml "$BACKUP_PATH/"
    echo "✅ 生产环境配置已备份"
fi

if [ -f nginx.conf ]; then
    cp nginx.conf "$BACKUP_PATH/"
    echo "✅ Nginx 配置已备份"
fi

echo "📊 生成备份信息..."

# 生成备份信息文件
cat > "$BACKUP_PATH/backup_info.txt" << EOF
备份信息
========

备份时间: $(date)
数据库名: $DB_NAME
数据库主机: $DB_HOST:$DB_PORT
备份文件: database.sql

包含的表:
EOF

# 如果能连接数据库，列出所有表
if command -v mysql &> /dev/null; then
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" \
        -e "USE $DB_NAME; SHOW TABLES;" 2>/dev/null | tail -n +2 >> "$BACKUP_PATH/backup_info.txt" || echo "无法获取表列表" >> "$BACKUP_PATH/backup_info.txt"
elif docker ps | grep -q xiaoshiliu-mysql; then
    docker exec xiaoshiliu-mysql mysql -u"$DB_USER" -p"$DB_PASSWORD" \
        -e "USE $DB_NAME; SHOW TABLES;" 2>/dev/null | tail -n +2 >> "$BACKUP_PATH/backup_info.txt" || echo "无法获取表列表" >> "$BACKUP_PATH/backup_info.txt"
fi

echo "🗜️  压缩备份文件..."

# 压缩备份文件
cd "$BACKUP_DIR"
tar -czf "xiaoshiliu_backup_$TIMESTAMP.tar.gz" "xiaoshiliu_backup_$TIMESTAMP"

if [ $? -eq 0 ]; then
    # 删除未压缩的文件夹
    rm -rf "xiaoshiliu_backup_$TIMESTAMP"
    echo "✅ 备份文件已压缩: $BACKUP_DIR/xiaoshiliu_backup_$TIMESTAMP.tar.gz"
else
    echo "❌ 备份文件压缩失败"
    exit 1
fi

cd ..

echo "🧹 清理旧备份..."

# 清理7天前的备份文件
find "$BACKUP_DIR" -name "xiaoshiliu_backup_*.tar.gz" -mtime +7 -delete 2>/dev/null || true

# 显示备份文件大小
BACKUP_SIZE=$(du -h "$BACKUP_DIR/xiaoshiliu_backup_$TIMESTAMP.tar.gz" | cut -f1)

echo ""
echo "🎉 备份完成！"
echo "📁 备份文件: $BACKUP_DIR/xiaoshiliu_backup_$TIMESTAMP.tar.gz"
echo "📏 文件大小: $BACKUP_SIZE"
echo "⏰ 备份时间: $(date)"
echo ""
echo "📋 备份内容:"
echo "  - 数据库完整备份 (database.sql)"
echo "  - 环境配置文件 (.env)"
echo "  - Docker 配置文件"
echo "  - 备份信息文件"
echo ""
echo "💡 恢复说明:"
echo "  1. 解压备份文件: tar -xzf xiaoshiliu_backup_$TIMESTAMP.tar.gz"
echo "  2. 恢复数据库: mysql -u用户名 -p密码 数据库名 < database.sql"
echo "  3. 恢复配置文件到相应位置"
echo ""
echo "🗂️  当前备份文件列表:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "  (无备份文件)"
