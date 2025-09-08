const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// 数据导出API - 需要管理员权限
router.get('/export', authenticateToken, async (req, res) => {
  try {
    // 验证管理员权限
    if (!req.user || req.user.type !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '需要管理员权限'
      });
    }

    const exportData = {
      exportTime: new Date().toISOString(),
      version: '1.0.0',
      data: {}
    };

    // 导出用户数据（脱敏处理）
    const [users] = await pool.execute(`
      SELECT 
        id, user_id, nickname, avatar, bio, location, 
        follow_count, fans_count, like_count, is_active,
        created_at, gender, zodiac_sign, mbti, education, major, interests
      FROM users 
      ORDER BY id
    `);
    exportData.data.users = users;

    // 导出帖子数据
    const [posts] = await pool.execute(`
      SELECT 
        id, user_id, title, content, category, 
        view_count, like_count, collect_count, comment_count,
        created_at, is_draft, ip_location
      FROM posts 
      ORDER BY id
    `);
    exportData.data.posts = posts;

    // 导出帖子图片
    const [postImages] = await pool.execute(`
      SELECT id, post_id, image_url 
      FROM post_images 
      ORDER BY post_id, id
    `);
    exportData.data.post_images = postImages;

    // 导出评论数据
    const [comments] = await pool.execute(`
      SELECT 
        id, post_id, user_id, parent_id, content, 
        like_count, ip_location, created_at
      FROM comments 
      ORDER BY id
    `);
    exportData.data.comments = comments;

    // 导出标签数据
    const [tags] = await pool.execute(`
      SELECT id, name, use_count, created_at 
      FROM tags 
      ORDER BY id
    `);
    exportData.data.tags = tags;

    // 导出帖子标签关联
    const [postTags] = await pool.execute(`
      SELECT id, post_id, tag_id, created_at 
      FROM post_tags 
      ORDER BY post_id, tag_id
    `);
    exportData.data.post_tags = postTags;

    // 导出关注关系
    const [follows] = await pool.execute(`
      SELECT id, follower_id, following_id, created_at 
      FROM follows 
      ORDER BY id
    `);
    exportData.data.follows = follows;

    // 导出点赞数据
    const [likes] = await pool.execute(`
      SELECT id, user_id, target_type, target_id, created_at 
      FROM likes 
      ORDER BY id
    `);
    exportData.data.likes = likes;

    // 导出收藏数据
    const [collections] = await pool.execute(`
      SELECT id, user_id, post_id, created_at 
      FROM collections 
      ORDER BY id
    `);
    exportData.data.collections = collections;

    // 导出通知数据
    const [notifications] = await pool.execute(`
      SELECT 
        id, user_id, sender_id, type, title, target_id, 
        comment_id, is_read, created_at
      FROM notifications 
      ORDER BY id
    `);
    exportData.data.notifications = notifications;

    // 导出系统设置
    const [systemSettings] = await pool.execute(`
      SELECT setting_key, setting_value, description, updated_at 
      FROM system_settings 
      ORDER BY setting_key
    `);
    exportData.data.system_settings = systemSettings;

    // 统计信息
    exportData.statistics = {
      total_users: users.length,
      total_posts: posts.length,
      total_comments: comments.length,
      total_tags: tags.length,
      total_follows: follows.length,
      total_likes: likes.length,
      total_collections: collections.length,
      total_notifications: notifications.length
    };

    // 生成文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `xiaoshiliu_backup_${timestamp}.json`;

    // 设置响应头
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    // 返回数据
    res.json(exportData);

    console.log(`数据导出成功 - 文件: ${filename}, 用户数: ${users.length}, 帖子数: ${posts.length}`);

  } catch (error) {
    console.error('数据导出失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '数据导出失败',
      error: error.message 
    });
  }
});

// 数据统计API（用于显示导出预览）- 需要管理员权限
router.get('/export/preview', authenticateToken, async (req, res) => {
  try {
    // 验证管理员权限
    if (!req.user || req.user.type !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '需要管理员权限'
      });
    }

    // 获取各表数据统计
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [postCount] = await pool.execute('SELECT COUNT(*) as count FROM posts');
    const [commentCount] = await pool.execute('SELECT COUNT(*) as count FROM comments');
    const [tagCount] = await pool.execute('SELECT COUNT(*) as count FROM tags');
    const [followCount] = await pool.execute('SELECT COUNT(*) as count FROM follows');
    const [likeCount] = await pool.execute('SELECT COUNT(*) as count FROM likes');
    const [collectionCount] = await pool.execute('SELECT COUNT(*) as count FROM collections');
    const [notificationCount] = await pool.execute('SELECT COUNT(*) as count FROM notifications');

    // 获取数据库大小估算
    const [dbSize] = await pool.execute(`
      SELECT 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);

    res.json({
      code: 200,
      message: 'success',
      data: {
        statistics: {
          users: userCount[0].count,
          posts: postCount[0].count,
          comments: commentCount[0].count,
          tags: tagCount[0].count,
          follows: followCount[0].count,
          likes: likeCount[0].count,
          collections: collectionCount[0].count,
          notifications: notificationCount[0].count
        },
        database_size_mb: dbSize[0].size_mb,
        export_time: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('获取导出预览失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取导出预览失败',
      error: error.message 
    });
  }
});

module.exports = router;
