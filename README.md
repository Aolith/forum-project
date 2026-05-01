#校园论坛

面向全校师生的校园交流论坛，支持帖子管理、评论互动、点赞、用户认证与权限控制。

在线可访问：https://www.aoliforum.me/

## 项目演示

<video src="./演示视频.mp4" controls width="100%"></video>

核心功能

· 帖子管理：发布帖子（标题+内容）、编辑、删除、点赞
· 评论系统：在帖子下发表评论、编辑、删除自己的评论
· 用户系统：注册/登录，密码加密存储，JWT 身份认证
· 权限控制：只有作者能删/改自己的帖子；只有评论者能编辑评论，帖主和评论者能删除评论；防重复点赞
· 主题切换：支持亮色/暗色模式
· 响应式布局：适配手机和电脑端浏览

技术栈

前端

· Vue 3 (Composition API)
· Pinia (状态管理)
· Vue Router (路由)
· Vite (构建工具)

后端

· Node.js + Express
· MongoDB + Mongoose
· JWT (身份认证)
· Bcrypt (密码加密)

部署

· 前端：Vercel
· 后端：Railway
· 数据库：MongoDB Atlas
· DNS：Cloudflare

项目亮点

1. 完整的权限控制系统

操作 权限要求
发帖 登录用户
编辑/删除帖子 帖子作者
点赞 登录用户（防重复）
发表评论 登录用户
编辑评论 评论作者
删除评论 评论作者或帖主

2. 安全措施

· 密码使用 Bcrypt 加密存储，登录使用 bcrypt.compare 验证
· JWT Token 认证，登录签发 Token，所有写操作需携带 Token
· 返回用户数据时剔除密码字段（.toObject() + 解构）
· IP 白名单控制数据库访问

3. 前后端分离架构

· RESTful API 设计，路由模块化拆分
· 统一错误处理契约 { error: string }
· 前端 Pinia Store 集中管理状态，异步操作模式统一

快速开始

环境准备

· Node.js ≥ 20.19.0
· MongoDB (本地或 Atlas)
· npm

安装与运行

```bash
# 克隆项目
git clone https://github.com/Aolith/forum-project.git
cd forum-project

# 后端
cd backend
npm install
cp .env.example .env  # 编辑 .env，填入 MONGO_URI 和 JWT_SECRET
npm run dev             # 启动后端 (localhost:3001)

# 前端（新终端）
cd ../
npm install
npm run dev             # 启动前端 (localhost:5173)
```

环境变量

后端 backend/.env

```env
MONGO_URI=mongodb://localhost:27017/forum
JWT_SECRET=your_secret_key
PORT=3001
```

项目结构

```
forum-project/
├── backend/                # Express 后端
│   ├── models/
│   │   ├── Post.js         # 帖子模型 (含评论子文档 Schema)
│   │   └── User.js         # 用户模型
│   ├── routes/
│   │   ├── posts.js        # 帖子路由 (CRUD + 点赞)
│   │   ├── comments.js     # 评论路由 (子文档操作)
│   │   └── users.js        # 用户路由 (注册/登录)
│   ├── middleware/
│   │   └── auth.js         # JWT 认证中间件
│   └── index.js            # 入口文件
├── src/                    # Vue3 前端
│   ├── components/         # 组件 (CommentForm, CommentList, LikeButton)
│   ├── stores/             # Pinia Store (posts, user, theme)
│   ├── views/              # 页面组件 (HomeView, PostDetail, Login, Register)
│   └── router/             # 路由配置
└── package.json
```

关于我

· 学校/专业：江西农业大学 计算机科学与技术 大二
· 掘金：https://juejin.cn/user/3300107619408827
· GitHub：github.com/Aolith

---

这个项目是我学习全栈开发的实战作品。从最初的 localStorage 模拟数据，到 Express 后端 + MongoDB 数据库，再到 JWT 认证和权限控制，每一步都是自己踩坑、总结、改进的过程。如果你也是正在学习全栈的同学，希望能给你一些启发。
