//通过express搭建Web服务器
const express=require('express')
const cors = require('cors')
const path=require('path')

const app=express()
app.use(cors())
app.use(express.json())
const port=3001

//引入post路由
const postRouter=require('./router/posts')
app.use('/api/posts',postRouter)

//在指定端口启动服务器
app.listen(port,()=>{
  console.log(`服务器在${port}端口启动成功`)
})
