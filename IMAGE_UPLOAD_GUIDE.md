# 图片上传接口选择功能使用指南

## 功能概述

本项目已实现可自定义选择图片上传接口的功能，用户可以在发布页面自由选择使用不同的图床服务上传图片。

## 支持的图床服务

### 1. 新叶图床（默认）

- **名称**: 新叶图床
- **特点**: 默认图床，无需 API 密钥
- **URL**: https://api.xinyew.cn/api/jdtc
- **使用方式**: 直接选择即可使用

### 2. 4399 图床

- **名称**: 4399 图床
- **特点**: 无需 API 密钥，稳定可靠
- **URL**: https://api.h5wan.4399sj.com/html5/report/upload
- **使用方式**: 直接选择即可使用
- **特殊配置**: 自动添加 `device: main_pc` 请求头

### 3. NodeImage 图床

- **名称**: NodeImage
- **特点**: 需要 API 密钥才能使用
- **URL**: https://api.nodeimage.com/api/upload
- **使用方式**: 选择后需要输入 API 密钥
- **获取 API 密钥**: 请访问 NodeImage 官网获取

## 功能特性

### 🎯 核心功能

- ✅ 支持三种图床服务选择
- ✅ 支持 API 密钥输入（NodeImage）
- ✅ 支持单文件上传
- ✅ 支持多文件批量上传
- ✅ 支持图片链接转换
- ✅ 支持拖拽上传
- ✅ 实时图床状态显示

### 🛡️ 安全特性

- ✅ 文件类型验证（仅支持图片）
- ✅ 文件大小限制（50MB）
- ✅ API 密钥安全传输
- ✅ 用户身份验证

## 使用方法

### 1. 在发布页面选择图床

1. 打开发布页面
2. 在"图片上传设置"区域选择想要使用的图床
3. 如果选择了 NodeImage，需要输入 API 密钥
4. 开始上传图片

### 2. 上传方式

#### 本地文件上传

- 点击"上传图片"按钮选择文件
- 或直接拖拽图片到上传区域
- 支持同时选择多张图片（最多 9 张）

#### 网络图片链接

- 点击"添加链接"按钮
- 输入图片 URL 地址
- 点击"转换"按钮将外链转为指定图床链接
- 支持 JPG、PNG、GIF、WebP 等格式

## 技术实现

### 后端 API

#### 获取图床列表

```http
GET /api/upload/hosts
Authorization: Bearer <token>
```

#### 单文件上传

```http
POST /api/upload/single
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <文件>
hostType: <图床类型> (可选，默认: default)
apiKey: <API密钥> (可选)
```

#### 多文件上传

```http
POST /api/upload/multiple
Content-Type: multipart/form-data
Authorization: Bearer <token>

files: <文件数组>
hostType: <图床类型> (可选，默认: default)
apiKey: <API密钥> (可选)
```

#### 图片链接转换

```http
POST /api/upload/convert-link
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "https://example.com/image.jpg",
  "hostType": "default", // 可选
  "apiKey": "your-api-key" // 可选
}
```

### 前端组件

#### 图床选择组件

位置: `/src/views/publish/index.vue`

- 图床下拉选择框
- API 密钥输入框（NodeImage 专用）
- 实时状态提示

#### 图片上传组件

位置: `/src/components/MultiImageUpload.vue`

- 接受图床设置参数
- 自动应用用户选择的图床
- 支持所有上传方式

## 配置文件

### 图床配置

位置: `/express-project/utils/imageHosts.js`

添加新图床的方法：

```javascript
const imageHosts = {
  // 新图床配置
  newHost: {
    name: "新图床名称",
    url: "https://api.example.com/upload",
    requiresApiKey: false, // 是否需要API密钥
    async upload(fileBuffer, filename, mimetype, apiKey) {
      // 上传逻辑实现
      return {
        success: true,
        url: "https://example.com/uploaded-image.jpg",
      };
    },
  },
};
```

## 用户界面

### 图床选择界面

```
┌─────────────────────────────────────┐
│ 📁 图片上传设置                      │
├─────────────────────────────────────┤
│ 选择图床: [新叶图床 ▼]               │
│                                     │
│ API 密钥: [输入NodeImage API密钥]    │  // 仅NodeImage显示
│ ℹ️ NodeImage 需要API密钥才能使用     │
└─────────────────────────────────────┘
```

### 上传区域

```
┌─────────────────────────────────────┐
│ 🖼️ [已上传图片1] [已上传图片2]      │
│                                     │
│     📤 上传图片                     │
│     或拖拽图片到此处                │
│     1/9                            │
│                                     │
│ [📤 上传图片] [🔗 添加链接]          │
└─────────────────────────────────────┘
```

## 错误处理

### 常见错误及解决方案

1. **"NodeImage 需要 API 密钥"**

   - 解决方案: 请输入有效的 NodeImage API 密钥

2. **"图片大小超过 50MB 限制"**

   - 解决方案: 请压缩图片或选择更小的文件

3. **"图床上传失败"**

   - 解决方案: 检查网络连接，或尝试其他图床

4. **"获取图床列表失败"**
   - 解决方案: 刷新页面，将自动使用默认图床

## 更新日志

### v1.0.0 (2025-01-08)

- ✅ 实现多图床支持
- ✅ 添加 NodeImage API 密钥支持
- ✅ 完善用户界面
- ✅ 添加链接转换功能
- ✅ 完善错误处理

## 注意事项

1. **API 密钥安全**: NodeImage 的 API 密钥仅在上传时使用，不会存储在本地
2. **图床选择**: 建议优先使用默认图床，备用 4399 图床
3. **文件限制**: 单个文件最大 50MB，最多同时上传 9 张图片
4. **网络环境**: 不同图床的访问速度可能因网络环境而异

## 开发者说明

### 代码结构

```
express-project/
├── utils/imageHosts.js          # 图床配置和上传逻辑
├── routes/upload.js             # 上传路由和API接口
└── ...

vue3-project/
├── src/
│   ├── api/upload.js            # 前端上传API
│   ├── components/
│   │   └── MultiImageUpload.vue # 图片上传组件
│   └── views/publish/index.vue  # 发布页面
└── ...
```

### 测试建议

1. 测试所有图床的上传功能
2. 测试 API 密钥验证机制
3. 测试文件大小和类型限制
4. 测试网络异常情况的处理

---

_如有问题或建议，请提交 Issue 或联系开发团队。_
