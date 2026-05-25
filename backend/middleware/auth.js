const jwt = require('jsonwebtoken')
const User = require('../models/User')

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: '未登录，请先登录' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // 只查必要字段，不包含密码（因为 select: false）
    const user = await User.findById(decoded._id).select('_id sno name role wechat avatar')
    if (!user) {
      return res.status(401).json({ error: '用户不存在' })
    }
    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ error: 'Token 无效或已过期，请重新登录' })
  }
}