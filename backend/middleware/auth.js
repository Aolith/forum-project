const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: '未登录，请先登录' })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded;  // 把解析出的用户信息挂到 req.user 上
    next()
  } catch (err) {
    res.status(401).json({ error: 'Token 无效或已过期，请重新登录' })
  }
};