-- 数据库迁移脚本：为posts和comments表添加ip_location字段
-- 执行日期：2025-09-07
-- 用途：修复IP属地显示逻辑，从显示用户最后登录IP改为显示内容发布时IP

USE `xiaoshiliu`;

-- 为posts表添加ip_location字段
ALTER TABLE `posts` ADD COLUMN `ip_location` varchar(100) DEFAULT NULL COMMENT '发布时IP属地' AFTER `is_draft`;

-- 为comments表添加ip_location字段  
ALTER TABLE `comments` ADD COLUMN `ip_location` varchar(100) DEFAULT NULL COMMENT '评论时IP属地' AFTER `like_count`;

-- 为已有帖子和评论设置默认IP属地（从用户表的location字段复制）
UPDATE `posts` p 
JOIN `users` u ON p.user_id = u.id 
SET p.ip_location = u.location 
WHERE p.ip_location IS NULL;

UPDATE `comments` c 
JOIN `users` u ON c.user_id = u.id 
SET c.ip_location = u.location 
WHERE c.ip_location IS NULL;

-- 添加索引提升查询性能
CREATE INDEX `idx_posts_ip_location` ON `posts` (`ip_location`);
CREATE INDEX `idx_comments_ip_location` ON `comments` (`ip_location`);

-- 显示迁移完成信息
SELECT 
    'Migration completed' AS status,
    (SELECT COUNT(*) FROM posts WHERE ip_location IS NOT NULL) AS posts_with_location,
    (SELECT COUNT(*) FROM comments WHERE ip_location IS NOT NULL) AS comments_with_location;
