const express = require('express')
const userRouter = express.Router()
const bcrypt = require('bcryptjs') //引入哈希
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
//引入数据库
const User = require('../models/User')
const Whitelist = require('../models/Whitelist')

//用户登录
userRouter.post('/login', async (req, res) => {
  try {
    const { sno, password } = req.body
    //非空检验
    if (!sno || !password) {
      return res.status(400).json({ error: '学号和密码不能为空' }) //接口的错误契约
    }
    const user = await User.findOne({ sno }) //用户用 findOne({ sno }) 是因为用户以 sno 为唯一标识
    //没找到对应学号、学号不存在
    if (!user) {
      return res.status(404).json({ error: '学号不存在' })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: '密码不正确' })
    }
    //登录成功
    const { password: _, ...safeUser } = user.toObject() // Mongoose 文档需要 .toObject() 才能解构
    //生成token
    const token = jwt.sign(
      { sno: user.sno, _id: user._id }, // 把用户信息编码进 token
      process.env.JWT_SECRET, // 用密钥加密
      { expiresIn: '7d' }, // token 7 天后过期
    )
    res.json({ user: safeUser, token }) // 返回 token 给前端
  } catch (err) {
    console.error('登录失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

//用户注册
userRouter.post('/register', async (req, res) => {
  try {
    const { sno, password, name } = req.body
    //非空检验
    if (!sno || !password || !name) {
      return res.status(400).json({ error: '内容不能为空' })
    }
    // 字数限制校验
    if (name.length > 7) {
      return res.status(400).json({ error: '姓名应为7个字以内' })
    }
    if (!/^\d{10}$/.test(sno)) {
      return res.status(400).json({ error: '学号必须为10位数字' })
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(password)) {
      return res.status(400).json({ error: '密码必须包含字母和数字，长度8-16位' })
    }
    //白名单校验
    const whitelistEntry = await Whitelist.findOne({ sno })
    if (!whitelistEntry) {
      return res.status(400).json({ error: '学号不存在，无法注册' })
    }
    if (whitelistEntry.name.trim() !== name.trim()) {
      return res.status(400).json({ error: '姓名与学号不匹配' })
    }
    //重复检查
    const key = await User.findOne({ sno })
    if (key) {
      return res.status(409).json({ error: '学号已被注册' })
    }
    //构造新的用户
    const hashedPassword = await bcrypt.hash(password, 10)
    //增加数据文档
    const createdUser = await User.create({
      sno: sno,
      password: hashedPassword, // ← 存入哈希后的乱码
      name: name,
    })
    console.log('添加成功:', createdUser._id)
    const { password: _, ...safeUser } = createdUser.toObject()
    res.status(201).json({ user: safeUser })
  } catch (err) {
    console.error('注册失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 更新个人资料
userRouter.put('/profile', auth, async (req, res) => {
  try {
    const { signature, avatar, wechat, showWechat } = req.body  // 先解构

    // 非空校验移到解构之后
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ error: '用户不存在' })

    if (signature && signature.length > 50) {
      return res.status(400).json({ error: '签名不能超过50个字' })
    }
    if (wechat && wechat.length > 20) {
      return res.status(400).json({ error: '微信号不能超过20个字' })
    }
    if (signature !== undefined) user.signature = signature
    if (avatar !== undefined) user.avatar = avatar
    if (wechat !== undefined) user.wechat = wechat
    if (showWechat !== undefined) user.showWechat = showWechat
    await user.save()
    res.json({ user: { _id: user._id, sno: user.sno, name: user.name, signature: user.signature, avatar: user.avatar, wechat: user.wechat, showWechat: user.showWechat } })
  } catch (err) {
    console.error('更新个人资料失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})
module.exports = userRouter
