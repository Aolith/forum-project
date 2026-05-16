const express = require('express')
const adminRouter = express.Router()
const auth = require('../middleware/auth')
const Post = require('../models/Post')
const User = require('../models/User')

// 管理员权限校验中间件
async function adminAuth(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: '无管理员权限' })
    }
    next()
  } catch (err) {
    res.status(500).json({ error: '服务器内部错误' })
  }
}

// GET /api/admin/reported-posts — 获取被举报的帖子
adminRouter.get('/reported-posts', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const posts = await Post.find({ status: 'reported' })
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Post.countDocuments({ status: 'reported' })

    res.json({ posts, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('获取被举报帖子失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// DELETE /api/admin/posts/:id — 管理员删除帖子
adminRouter.delete('/posts/:id', auth, adminAuth, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id)
    if (!post) return res.status(404).json({ error: '帖子不存在' })
    res.json({ message: '帖子已删除' })
  } catch (err) {
    console.error('管理员删除帖子失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// PUT /api/admin/posts/:id/ignore — 管理员忽略举报
adminRouter.put('/posts/:id/ignore', auth, adminAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: '帖子不存在' })
    
    post.status = 'normal'
    await post.save()
    res.json({ message: '举报已忽略' })
  } catch (err) {
    console.error('忽略举报失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

module.exports = adminRouter