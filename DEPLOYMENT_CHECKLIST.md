# 生产环境部署检查清单

## 部署前检查 ✅

### 代码准备

- [x] 前端代码编译正常，无语法错误
- [x] 后端路由和中间件配置正确
- [x] 数据库迁移脚本准备就绪
- [x] 环境配置文件检查完毕

### 功能测试

- [x] 时区显示统一为中国时区
- [x] 用户注册开关功能正常
- [x] 多图床配置和切换功能
- [x] 管理后台系统设置页面
- [x] 权限验证机制

## 部署后验证

### 1. 基础功能验证

```bash
# 检查服务状态
curl -X GET http://your-domain/api/health

# 检查数据库连接
curl -X GET http://your-domain/api/admin/system-settings/settings
```

### 2. 注册开关测试

1. 登录管理后台
2. 进入系统设置页面
3. 关闭用户注册开关
4. 前端验证注册选项是否隐藏
5. 尝试注册应显示"注册功能暂时关闭"
6. 重新开启注册开关，验证功能恢复

### 3. 图床功能测试

1. 在系统设置中切换图床类型
2. 测试每种图床的连通性
3. 上传图片验证是否使用正确图床
4. NodeImage 图床需配置 API Key 后测试

### 4. 时区显示验证

1. 发布新内容，检查时间显示
2. 查看用户注册时间
3. 验证评论和点赞时间
4. 确认所有时间均为中国时区

### 5. 管理功能验证

1. 登录管理员账户
2. 访问系统设置页面
3. 测试各项开关和配置
4. 验证设置保存和加载
5. 确认非管理员无法访问

## 性能和安全检查

### 性能监控

- [ ] 数据库查询性能
- [ ] 图片上传响应时间
- [ ] 系统设置加载速度
- [ ] 内存和 CPU 使用率

### 安全验证

- [ ] API 权限验证有效
- [ ] SQL 注入防护测试
- [ ] XSS 防护验证
- [ ] 文件上传安全检查

## 故障处理预案

### 数据库问题

1. 如果 system_settings 表创建失败

```sql
-- 手动创建表
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_setting_key` (`setting_key`)
);

-- 插入默认数据
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('user_registration_enabled', 'true', '是否开启用户注册'),
('maintenance_mode', 'false', '维护模式开关'),
('image_host_type', 'xinyew', '图床类型'),
('nodeimage_api_key', '', 'NodeImage图床API密钥');
```

### 图床连接问题

1. 检查网络连接
2. 验证 API 密钥配置
3. 切换到备用图床
4. 查看后端错误日志

### 注册功能异常

1. 检查 system_settings 表数据
2. 验证 API 接口响应
3. 清除浏览器缓存
4. 重启后端服务

## 回滚方案

### 代码回滚

```bash
# 如果出现严重问题，可回滚到上一版本
git checkout <previous-commit>
# 重新部署
```

### 数据库回滚

```sql
-- 如需回滚系统设置表
DROP TABLE IF EXISTS system_settings;
-- 恢复到之前的数据库状态
```

### 配置回滚

1. 将用户注册开关设为开启状态
2. 图床类型恢复为默认的新叶图床
3. 清空 NodeImage API Key 配置

## 监控和日志

### 关键日志位置

- 后端服务日志：`/var/log/xiaoshiliu/`
- 数据库查询日志：MySQL slow query log
- 前端错误日志：浏览器开发者工具

### 监控指标

- 用户注册成功率
- 图片上传成功率
- 系统设置变更频率
- API 响应时间

## 联系信息

- 技术负责人：[联系方式]
- 运维负责人：[联系方式]
- 紧急联系电话：[电话号码]

---

**重要提醒**:

1. 部署前请在测试环境完整验证所有功能
2. 生产环境操作前请备份数据库
3. 监控部署后 24 小时内的系统状态
4. 如有异常立即按回滚方案处理
