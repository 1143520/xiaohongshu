# 维护模式功能测试指南

## 功能概述

维护模式功能允许管理员在系统需要维护时，阻止普通用户访问，同时为用户提供友好的维护页面提示。

## 实现的功能

### ✅ 后端实现

1. **维护模式中间件** (`middleware/maintenance.js`)

   - 检查系统设置中的维护模式状态
   - 管理员用户不受影响，可正常访问
   - 普通用户收到 503 状态码和维护提示

2. **健康检查接口** (`/api/health`)
   - 用于检查系统状态
   - 不受维护模式影响
   - 维护页面用此接口检查恢复状态

### ✅ 前端实现

1. **请求拦截器升级** (`api/request.js`)

   - 添加 503 状态码处理
   - 自动跳转到维护模式页面

2. **维护模式页面** (`views/Maintenance.vue`)

   - 美观的维护提示界面
   - 实时状态检查功能
   - 自动刷新和手动重试

3. **路由配置**
   - 添加 `/maintenance` 路由
   - 独立于主布局的维护页面

## 测试步骤

### 1. 启用维护模式

```bash
# 方法1: 通过管理后台界面
1. 登录管理后台 /admin/login
2. 进入系统设置 /admin/settings
3. 开启维护模式开关
4. 保存设置

# 方法2: 直接修改数据库
UPDATE system_settings SET setting_value = 'true' WHERE setting_key = 'maintenance_mode';
```

### 2. 测试普通用户访问

```bash
# 普通用户访问任何页面都会被重定向到维护页面
1. 普通用户登录后访问 /
2. 系统自动跳转到 /maintenance
3. 看到维护提示页面
4. 页面每2分钟自动检查系统状态
```

### 3. 测试管理员访问

```bash
# 管理员不受维护模式影响
1. 管理员可正常访问所有功能
2. 包括系统设置页面关闭维护模式
```

### 4. 测试功能恢复

```bash
# 关闭维护模式后
1. 在管理后台关闭维护模式
2. 普通用户在维护页面点击"重新检查"
3. 系统检测到恢复，自动跳转回首页
4. 或者等待2分钟自动检查
```

## 接口测试

### 维护模式开启时

```bash
# 普通用户请求
curl -H "Authorization: Bearer <user_token>" http://localhost:3001/api/posts

# 预期响应
{
  "code": 503,
  "message": "系统正在维护中，请稍后再试",
  "data": {
    "maintenance": true,
    "retry_after": "1小时后"
  }
}
```

### 健康检查接口

```bash
# 任何时候都可访问
curl http://localhost:3001/api/health

# 预期响应
{
  "code": 200,
  "message": "OK",
  "timestamp": "2025-01-08T10:30:00.000Z",
  "uptime": 12345
}
```

### 管理员请求

```bash
# 管理员不受维护模式影响
curl -H "Authorization: Bearer <admin_token>" http://localhost:3001/api/admin/users

# 正常返回数据
```

## 维护页面功能

### 🎨 界面特性

- **现代化设计**: 渐变背景，毛玻璃效果
- **动态效果**: 脉冲动画，浮动装饰元素
- **响应式布局**: 适配手机、平板、桌面端
- **状态指示**: 实时显示维护进度

### 🔄 交互功能

- **自动检查**: 每 2 分钟自动检查系统状态
- **手动重试**: 用户可手动点击重新检查
- **返回首页**: 提供返回按钮（可能仍会被拦截）
- **联系方式**: 显示技术支持联系方式

### ⏱️ 时间显示

- **最后更新时间**: 显示页面最后刷新时间
- **预计恢复时间**: 显示预估的维护完成时间

## 配置说明

### 系统设置表结构

```sql
-- 维护模式设置
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('maintenance_mode', 'false', '维护模式开关');
```

### 中间件跳过的路径

```javascript
// 不受维护模式影响的接口
- /api/health (健康检查)
- /api/auth/admin/* (管理员认证)
- /api/admin/* (管理员接口)
- /api/system/* (系统设置)
```

## 自定义配置

### 修改维护页面内容

编辑 `src/views/Maintenance.vue`：

```javascript
// 自定义消息
const maintenanceMessage = ref("我们正在进行系统升级...");

// 自定义预计时间
const estimatedTime = ref("30分钟后");

// 自定义检查间隔（毫秒）
statusCheckTimer = setInterval(checkMaintenanceStatus, 120000); // 2分钟
```

### 修改中间件逻辑

编辑 `middleware/maintenance.js`：

```javascript
// 自定义跳过路径
if (req.path.startsWith("/api/custom-path")) {
  return next();
}

// 自定义错误响应
return res.status(503).json({
  code: 503,
  message: "自定义维护消息",
  data: {
    maintenance: true,
    retry_after: "自定义时间",
  },
});
```

## 故障排除

### 常见问题

1. **维护页面无法访问**

   - 检查路由配置是否正确
   - 确认组件导入路径

2. **管理员也被拦截**

   - 检查 token 是否正确传递
   - 验证用户类型判断逻辑

3. **维护模式无法关闭**

   - 直接修改数据库设置
   - 检查系统设置 API 是否正常

4. **页面样式异常**
   - 检查 SVG 图标是否正确导入
   - 确认 CSS 变量定义

### 调试命令

```bash
# 检查维护模式状态
SELECT * FROM system_settings WHERE setting_key = 'maintenance_mode';

# 强制关闭维护模式
UPDATE system_settings SET setting_value = 'false' WHERE setting_key = 'maintenance_mode';

# 查看服务器日志
tail -f logs/app.log
```

## 部署注意事项

1. **生产环境配置**

   - 确保数据库连接正常
   - 检查 CORS 配置包含维护页面域名

2. **负载均衡配置**

   - 健康检查接口应配置为负载均衡检查路径
   - 维护模式时可关闭部分实例

3. **CDN 配置**
   - 维护页面资源应配置合适的缓存策略
   - 确保静态资源在维护期间可正常访问

---

## 总结

维护模式功能已完整实现，包括：

- ✅ 后端中间件和状态检查
- ✅ 前端拦截器和维护页面
- ✅ 管理员权限保护
- ✅ 自动恢复检测
- ✅ 美观的用户界面
- ✅ 完善的错误处理

该功能可以在系统维护期间为用户提供良好的体验，避免看到错误页面或空白页面。
