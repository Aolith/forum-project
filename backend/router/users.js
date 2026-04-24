const express=require('express')
const userRouter=express.Router()

const users=require('../data/user')//引入数据

//用户登录
userRouter.post('/login',(req,res)=>{
  const {sno,password}=req.body
  //非空检验
  if (!sno || !password) {
    return res.status(400).json({ error: '学号和密码不能为空' })//接口的错误契约
  }
  //通过sno比对 对应的password
  //凡是需要获取对象本身，一律用 find；只要位置索引才用 findIndex。
  const key=users.find(users=>users.sno===sno)
  //没找到对应学号、学号不存在
  if(!key){
    return res.status(404).json({error:'学号不存在'})
  }
  //密码不正确
  if (key.password !== password){
    return res.status(401).json({ error: '密码不正确' })
  }
  //登录成功
  const { password: _, ...safeUser } = key // 剔除密码
 /*相当于  res.json({user: {
            sno: key.sno,
            name: key.name
          }}) */
  res.json({ user: safeUser })
})

//用户注册
userRouter.post('/register',(req,res)=>{
  const {sno,password,name}=req.body
  //非空检验
  if (!sno || !password || !name) {
    return res.status(400).json({ error: '内容不能为空' })
  }
  //重复检查
  const key=users.find(u=>u.id===sno)
  if (key) {
    return res.status(409).json({ error: '学号已被注册' })
  }
  //构造新的用户
  const newUser={
    sno:sno,
    password:password,
    name:name
  }
  //加入新用户
  users.push(newUser)

  res.status(201).json({
    user: {
      sno: newUser.sno,
      name: newUser.name
   }
  })
})

module.exports=userRouter