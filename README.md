
# 江农论坛 (aoliforum.me)

[![Vue3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 📌 项目简介

独立全栈开发的校园学生交流平台，覆盖帖子发布、评论互动、拼车渠道、消息通知、管理后台等完整功能。已上线运行，服务全校师生。

**在线地址**：[https://aoliforum.me](https://aoliforum.me)

## ✨ 核心功能

- **用户系统**：白名单注册、JWT 登录、个人主页、头像上传（每月限3次）
- **帖子管理**：发布/编辑/删除帖子、分区浏览、热度排序、图片压缩上传
- **评论互动**：发表评论、嵌套回复、点赞评论、帖主/作者删除权限
- **树洞匿名**：支持匿名发帖和匿名评论
- **消息通知**：评论/回复/点赞/拼车申请通知，Pinia 实时红点，已读清理
- **拼车渠道**：发布拼车、自动匹配（相同目的地±20分钟）、申请/同意/查看微信
- **管理后台**：帖子审核、白名单管理、RBAC 权限控制
- **安全防护**：bcrypt 密码哈希、JWT 鉴权改造、Helmet 安全头、CORS 白名单、接口限速、敏感词过滤、COS 防盗链
- **性能优化**：首屏关键 CSS 内联、路由懒加载、图片前端压缩、keep-alive 缓存、CDN 加速

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue3 + Vite + Pinia + Vue Router |
| 后端 | Node.js + Express + Mongoose |
| 数据库 | MongoDB Atlas |
| 存储 | 腾讯云 COS（图片） |
| 部署 | Vercel（前端）+ Render（后端）+ UptimeRobot（保活） |
| 安全 | Helmet、CORS、express-rate-limit、bcryptjs、jsonwebtoken |

## 📁 项目结构

```
my-forum/
├── backend/                  # Express 后端
│   ├── middleware/           # auth 中间件
│   ├── models/              # Mongoose 数据模型
│   ├── router/              # 路由模块（posts, users, comments, carpool, notifications 等）
│   ├── utils/               # 工具函数（敏感词过滤、匿名处理）
│   ├── index.js             # 服务入口
│   └── .env                 # 环境变量（需自行创建）
├── src/                     # Vue3 前端
│   ├── global.css           # 全局样式
│   ├── components/          # 公共组件（CommentForm, CommentList, LikeButton 等）
│   ├── router/              # 路由配置
│   ├── stores/              # Pinia 状态管理（user, posts, notification, theme ）
│   ├── views/               # 页面组件（HomeView, Profile, Notifications, Carpool, Admin 等）
│   ├── App.vue              # 根组件
│   └── main.js              # 前端入口
├── public/                  # 静态资源（无需构建）
├── index.html               # HTML 模板
├── vite.config.js           # Vite 配置（含代理）
└── package.json             # 依赖配置
```

## 🚀 本地运行

### 前置要求

- Node.js >= 18
- MongoDB 实例（可使用 MongoDB Atlas 免费层）
- 腾讯云 COS 存储桶（用于图片上传）

### 安装与启动

1. **克隆仓库**

   ```bash
   git clone https://github.com/Aolith/forum-project.git
   cd forum-project
   ```

2. **安装依赖**

   ```bash
   # 前端
   npm install
   # 后端
   cd backend && npm install
   ```

3. **配置环境变量**

   在 `backend` 目录下创建 `.env` 文件：

   ```env
   MONGO_URI=你的MongoDB连接字符串
   JWT_SECRET=你的JWT密钥
   COS_SECRET_ID=你的COS密钥ID（可选）
   COS_SECRET_KEY=你的COS密钥Key（可选）
   ```

4. **启动开发服务器**

   ```bash
   # 前端（在 my-forum 根目录）
   npm run dev
   # 后端（在 backend 目录）
   node index.js
   ```

   前端运行在 `http://localhost:5173`，后端运行在 `http://localhost:3001`。

## 📊 开发历程与心得

这个项目从大二开始历时三个月独立开发，从零基础到上线运行。期间踩过 JWT 鉴权改造、通知系统三次迭代、日历选择器 CSS 冲突、拼车匹配逻辑设计等实际工程问题，并全部记录在掘金技术博客中（累计近十篇文章，3万+展现）。这是一次完整的全栈工程实践，深刻体会到了安全意识、性能优化和架构设计的重要性。

## 👤 作者

- **Aolith**
- 江西农业大学 计算机科学与技术 大二
- 独立全栈开发，持续输出技术博客
- GitHub：[https://github.com/Aolith](https://github.com/Aolith)
- 项目演示视频：[B站链接](https://www.bilibili.com/video/BV1dGVd6UETW/)
