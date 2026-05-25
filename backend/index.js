//通过express搭建Web服务器
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const helmet = require('helmet')
const Notification = require('./models/Notification')
const app = express()
//连接MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB连接成功')
    // 启动时立即清理一次
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const deleted = await Notification.deleteMany({
        isRead: true,
        createdAt: { $lt: oneDayAgo }
      })
      if (deleted.deletedCount > 0) {
        console.log(`启动时清理了 ${deleted.deletedCount} 条已读通知`)
      }
    } catch (err) {
      console.error('清理已读通知失败:', err)
    }
    
    // 每小时清理一次
    setInterval(async () => {
      try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const result = await Notification.deleteMany({
          isRead: true,
          createdAt: { $lt: oneDayAgo }
        })
        if (result.deletedCount > 0) {
          console.log(`已自动清理 ${result.deletedCount} 条已读通知`)
        }
      } catch (err) {
        console.error('清理已读通知失败:', err)
      }
    }, 60 * 60 * 1000)
  })
  .catch((err) => console.error('MongoDB连接失败', err))


app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}))
const rateLimit = require('express-rate-limit')
// 全局速率限制 — 所有 /api 请求
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '请求过于频繁，请稍后再试' }
})
app.use('/api', globalLimiter)

// 登录接口限速 — 防止撞库
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: '登录尝试过多，请15分钟后再试' }
})
app.use('/api/users/login', loginLimiter)

// 注册接口限速 — 防止批量注册
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 3,
  message: { error: '注册请求过于频繁，请稍后再试' }
})
app.use('/api/users/register', registerLimiter)
app.use(cors({
  origin: [
    'https://www.aoliforum.me',
    'https://aoliforum.me',
    'http://localhost:5173'
  ],
  credentials: true
}))
app.use(express.json({ limit: '1mb' }))
const port = 3001

//引入post路由
const postRouter = require('./router/posts')
app.use('/api/posts', postRouter)

//引入comment路由
const commentRouter = require('./router/comments')
app.use('/api/posts/:postId/comments', commentRouter)

//引入user路由
const userRouter = require('./router/users')
app.use('/api/users', userRouter)

//引入admin路由
const adminRouter = require('./router/admin')
app.use('/api/admin', adminRouter)

//引入feedback路由
const feedbackRouter = require('./router/feedback')
app.use('/api/feedback', feedbackRouter)

//引入upload路由
app.use('/api/upload', require('./router/upload'))

//引入notifications路由
const notificationsRouter = require('./router/notifications')
app.use('/api/notifications', notificationsRouter)

//引入carpool路由
const carpoolRouter = require('./router/carpool')
app.use('/api/carpool', carpoolRouter)

//在指定端口启动服务器
app.listen(port, () => {
  console.log(`服务器在${port}端口启动成功`)
})
