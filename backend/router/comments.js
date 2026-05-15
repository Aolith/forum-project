const express = require('express')
const commentRouter = express.Router({ mergeParams: true }) //嵌套路由的核心
const auth = require('../middleware/auth')

const Post = require('../models/Post') //引入数据库
const filterSensitiveWords = require('../utils/filterSensitiveWords')
//提交评论
commentRouter.post('/', auth, async (req, res) => {
  try {
    const postId = req.params.postId
    const { comment } = req.body
    if (!comment) return res.status(400).json({ error: '评论内容不能为空' })
      // 过滤敏感词
    const result = filterSensitiveWords(comment)
    if (result.blocked) {
      return res.status(400).json({ error: '评论包含违规信息' })
    }
    const filteredComment = result.filtered  // 用新变量接收过滤后的文本

    const post = await Post.findById(postId) //得到帖子对象
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' })
    }
    post.comments.push({
      comment: filteredComment,
      author: req.user._id,
      anonymous: post.anonymous //跟随帖子的匿名设置
    })
    await post.save()

    // 填充帖子作者和评论作者
    await post.populate('author', 'name')
    await post.populate('comments.author', 'name')

    res.status(201).json(post) //返回整个帖子
  } catch (err) {
    console.error('新增评论失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

//删除评论
commentRouter.delete('/:commentId', auth, async (req, res) => {
  try {
    const commentId = req.params.commentId
    const postId = req.params.postId
    const post = await Post.findById(postId) //得到帖子对象
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' })
    }
    const comment = post.comments.id(commentId)
    if (!comment) return res.status(404).json({ error: '评论不存在' })

    //身份验证
    const user = req.user._id //从 token 里拿的当前用户 _id
    const isCommentAuthor = comment.author && comment.author.toString() === user
    const isPostAuthor = post.author.toString() === user
    
    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ error: '无权限删除此评论' })
    }

    comment.deleteOne() // 删除这条子文档
    await post.save() //保存
    // 填充帖子作者和评论作者
    await post.populate('author', 'name')
    await post.populate('comments.author', 'name')
    res.json(post) //返回更新后的整个帖子
  } catch (err) {
    console.error('删除评论失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

//编辑评论
commentRouter.put('/:commentId', auth, async (req, res) => {
  try {
    const commentId = req.params.commentId
    const postId = req.params.postId
    const { comment } = req.body
    const post = await Post.findById(postId) //得到帖子对象
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' })
    }
    const commentDoc = post.comments.id(commentId) //找到子文档
    if (!commentDoc) {
      return res.status(404).json({ error: '评论不存在' })
    }
    //身份验证
    // 编辑评论的权限判断
    const user = req.user._id
    if (!commentDoc.author || commentDoc.author.toString() !== user) {
      return res.status(403).json({ error: '只能编辑自己的评论' })
    }
    commentDoc.comment = comment // 直接改子文档的 comment 属性
    await post.save() //保存父文档
    // 填充帖子作者和评论作者
    await post.populate('author', 'name')
    await post.populate('comments.author', 'name')
    res.json(post) //返回更新后的整个帖子
  } catch (err) {
    console.error('编辑评论失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

module.exports = commentRouter
