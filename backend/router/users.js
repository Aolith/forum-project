const express=require('express')
const userRouter=express.Router()
const bcrypt = require('bcryptjs')//引入哈希

//引入数据库
const User = require('../models/User')

//用户登录
userRouter.post('/login',async(req,res)=>{
  try{
    const {sno,password}=req.body
    //非空检验
    if (!sno || !password) {
      return res.status(400).json({ error: '学号和密码不能为空' })//接口的错误契约
    }
    const user=await User.findOne({sno})//用户用 findOne({ sno }) 是因为用户以 sno 为唯一标识
    //没找到对应学号、学号不存在
    if(!user){
      return res.status(404).json({error:'学号不存在'})
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: '密码不正确' })
    }
    //登录成功
    const { password: _, ...safeUser } = user.toObject()// Mongoose 文档需要 .toObject() 才能解构 
    res.json({ user: safeUser })
  }catch(err){
    console.error('登录失败',err)
    res.status(500).json({error:'服务器内部错误'})
  }
})

//用户注册
userRouter.post('/register',async(req,res)=>{
  try{
    const {sno,password,name}=req.body
    //非空检验
    if (!sno || !password || !name) {
      return res.status(400).json({ error: '内容不能为空' })
    }
    //重复检查
    const key=await User.findOne({sno})
    if (key) {
      return res.status(409).json({ error: '学号已被注册' })
    }
    //构造新的用户
    const hashedPassword = await bcrypt.hash(password, 10)
    //增加数据文档
    const createdUser= await User.create({
      sno: sno,
      password: hashedPassword,  // ← 存入哈希后的乱码
      name: name
    })
    console.log('添加成功:', createdUser._id)
    const { password: _, ...safeUser } = createdUser.toObject()
    res.status(201).json({ user: safeUser })
  }catch(err){
    console.error('注册失败',err)
    res.status(500).json({error:'服务器内部错误'})
  }
})

module.exports=userRouter