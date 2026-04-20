//通过express搭建Web服务器
const express=require('express')
const path=require('path')

const app=express()
const port=3001

// 1. 设置模板文件存放的目录，这里是指向项目根目录下的 'views' 文件夹
app.set('views', path.join(__dirname, 'views'));
// 2. 设置使用的模板引擎为 ejs
//app.set('view engine', 'ejs')
app.set('view engine','html')
// 3. 设置指定后缀名的文件用什么引擎
app.engine('html',require('ejs').__express)

/* app.get('/user/:id',(req,res)=>{
  const {id}= req.params
  res.render('user.ejs',{
    id
  })
}) */

app.get('/user/:id',(req,res)=>{
  const {id}= req.params

  res.render('user',{
    id,
    title:`用户${id}的首页`,
    html:'<h1>我是html字符串</h1>',
    user:[{
    username:'Alex',
    gender:'male'
    },
    {
    username:'Aim',
    gender:'female'
    }]
  })
})

//在指定端口启动服务器
app.listen(port,()=>{
  console.log(`服务器在${port}端口启动成功`)
})
