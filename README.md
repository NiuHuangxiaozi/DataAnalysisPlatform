# 基于多维数据流挖掘的云资源智能调度系统

一个基于 Vue 3 + iView 的现代化云资源管理平台，提供智能调度和多维数据分析功能。

## 🚀 功能特性

- **双重登录方式**
  - 账号密码登录（默认账号密码：123）
  - 单点登录（SSO）支持，通过URL参数 `?token=bearer_token` 自动登录
- **智能仪表板**
  - 实时资源监控（CPU、内存、网络、存储）
  - 智能调度状态展示
  - 多维数据流挖掘分析
- **现代化UI设计**
  - 基于 iView (View UI Plus) 组件库
  - 响应式设计，支持移动端访问
  - 优雅的渐变色彩和动画效果

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **UI组件库**: View UI Plus (iView)
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **构建工具**: Vite
- **HTTP客户端**: Axios

## 📦 安装与运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 生产环境构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 🔐 登录方式

### 1. 账号密码登录
- 访问登录页面
- 输入账号：`123`
- 输入密码：`123`
- 点击登录按钮

### 2. 单点登录（SSO）
- 在URL中添加token参数：`http://localhost:3000/login?token=your_bearer_token`
- 系统会自动验证token并跳转到主页面
- token验证通过 `/api/verify_token` 接口进行

## 📁 项目结构

```
src/
├── components/          # 可复用组件
├── views/              # 页面组件
│   ├── Login.vue       # 登录页面
│   └── Dashboard.vue   # 主仪表板页面
├── store/              # 状态管理
│   └── auth.js         # 认证相关状态
├── router/             # 路由配置
│   └── index.js        # 路由定义
├── App.vue             # 根组件
└── main.js            # 应用入口
```

## 🎨 界面预览

### 登录界面
- 居中的卡片式设计
- 渐变背景色
- 清晰的系统标题和登录提示
- 响应式表单验证

### 主界面
- 顶部导航栏，包含系统名称和用户信息
- 资源监控卡片，显示CPU、内存、网络、存储使用率
- 功能面板，展示资源监控和智能调度信息
- 数据流挖掘分析区域，显示处理量和预测准确率

## 🔧 开发说明

### 代码规范
- 使用 Vue 3 Composition API
- 遵循 iView 设计规范
- 组件采用单文件组件（SFC）格式
- 使用 ES6+ 语法特性

### 状态管理
- 使用 Pinia 进行状态管理
- 认证状态统一管理
- 支持持久化存储

### 路由配置
- 基于 Vue Router 4
- 支持路由守卫
- 自动处理认证状态

## 📝 注意事项

1. 默认的账号密码登录仅用于演示，生产环境请对接真实的认证系统
2. SSO功能需要后端提供 `/api/verify_token` 接口支持
3. 项目使用了现代浏览器特性，建议使用 Chrome、Firefox、Safari 等现代浏览器
4. 移动端访问已优化，支持响应式布局

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

## 📄 许可证

MIT License
