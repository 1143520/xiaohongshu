-- 标签表字段长度升级迁移脚本
-- 将标签名称字段从 varchar(50) 升级到 varchar(300)

USE `xiaoshiliu`;

-- 修改标签表的name字段长度
ALTER TABLE `tags` MODIFY COLUMN `name` varchar(300) NOT NULL COMMENT '标签名';

-- 验证修改结果
SHOW COLUMNS FROM `tags` LIKE 'name';

SELECT '标签表字段长度已成功升级到300字符' AS message;
