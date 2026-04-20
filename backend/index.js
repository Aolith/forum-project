//通过express搭建Web服务器
const express=require('express')

const app=express()
const port=3001

//用get请求访问路径
app.get('/', (req, res) => {
  res.send('你好 Express!')
})
//用post请求访问路径/login
app.post('/login',(req,res)=>{
  res.send('登录成功')
})
//在指定端口启动服务器
app.listen(port,()=>{
  console.log(`服务器在${port}端口启动成功`)
})

