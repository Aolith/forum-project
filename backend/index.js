//通过express搭建Web服务器
const express=require('express')
const path=require('path')

const app=express()
const port=3001

//这是一个路由
app.get('/',(req,res)=>{
  res.send('hi')
})

//用户登录
app.post('/user/login',(req,res)=>{
  res.send('登录成功')
})
//用户注册
app.post('/user/register',(req,res)=>{
  res.send('注册成功')
})

app.get('/user/:id',(req,res)=>{
  const {id} =req.params
  res.send(`用户${id}完成登录`)
})

//发布动态
app.post('/dynamic',(req,res)=>{
  res.send('发布动态成功')
})
//获取动态
app.get('/dynamic',(req,res)=>{
  res.send('获取动态成功')
})
//更新动态
app.put('/dynamic',(req,res)=>{
  res.send('更新动态成功')
})
//删除动态
app.delete('/dynamic',(req,res)=>{
  res.send('删除动态成功')
})


//在指定端口启动服务器
app.listen(port,()=>{
  console.log(`服务器在${port}端口启动成功`)
})
