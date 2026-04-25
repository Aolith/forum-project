//通过express搭建Web服务器
require('dotenv').config()
const express=require('express')
const mongoose=require('mongoose')
const cors = require('cors')
const path=require('path')

//连接MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB连接成功'))
.catch(err => console.error('MongoDB连接失败', err))

const app=express()
app.use(cors())
app.use(express.json())
const port=3001

//引入post路由
const postRouter=require('./router/posts')
app.use('/api/posts',postRouter)

//引入comment路由
const commentRouter=require('./router/comments')
app.use('/api/posts/:postId/comments',commentRouter)

//引入user路由
const userRouter=require('./router/users')
app.use('/api/users',userRouter)

//在指定端口启动服务器
app.listen(port,()=>{
  console.log(`服务器在${port}端口启动成功`)
})
