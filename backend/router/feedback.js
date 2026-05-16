const express = require('express')
const feedbackRouter = express.Router()
const Feedback = require('../models/Feedback')

feedbackRouter.post('/', async (req, res) => {
  try {
    const { content } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '建议内容不能为空' })
    }

    const feedback = await Feedback.create({
      content: content.trim(),
      author: req.user?._id  // 如果登录了记录作者，没登录也允许提交
    })

    res.status(201).json({ message: '感谢你的建议！', feedback })
  } catch (err) {
    console.error('提交建议失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

module.exports = feedbackRouter