const express = require('express')
const postRouter = express.Router()
const auth = require('../middleware/auth')

const Post = require('../models/Post') //引入数据库
const filterSensitiveWords = require('../utils/filterSensitiveWords')
const anonymizePost = require('../utils/anonymizePost')
//get接口
postRouter.get('/', async (req, res) => {
  try {
    // 从查询参数中获取分页信息
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // 分区筛选
    const filter = {}
    if (req.query.category) {
      filter.category = req.query.category
    }
    let posts
    if (req.query.sort === 'hot') {
      // 按热度排序：likes + comments.length
      posts = await Post.aggregate([
        { $match: filter },
        {
          $addFields: {
            heat: { $add: ['$likes', { $size: '$comments' }] }
          }
        },
        { $sort: { heat: -1 } },
        { $skip: skip },
        { $limit: limit }
      ])
    posts = await Post.populate(posts, [
    { path: 'author', select: 'name wechat showWechat' }, 
    { path: 'comments.author', select: 'name' }
    ])
    const result = posts.map(post => anonymizePost(post))
    res.json(result)
    }else {
      // 原来的默认排序逻辑不变
      posts = await Post.find(filter)
        .populate('author', 'name wechat showWechat') 
        .populate('comments.author', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

      const result = posts.map(post => anonymizePost(post))
      res.json(result)
    }
  } catch (err) {
    console.error('获取帖子失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

//添加新帖子
postRouter.post('/', auth, async (req, res) => {
  try {
    //从请求体拿到前端发来的数据
    const { content, title, category, anonymous, images } = req.body
    //简单检验
    if (!title) {
      return res.status(400).json({ error: '标题不能为空' })
    }
    if (!content) {
      return res.status(400).json({ error: '内容不能为空' })
    }
    if (!category) {
      return res.status(400).json({ error: '分区不能为空' })
    }
    // 过滤敏感词
    const titleResult = filterSensitiveWords(title)
    const contentResult = filterSensitiveWords(content)

    if (titleResult.blocked || contentResult.blocked) {
      return res.status(400).json({ error: '内容包含违规信息，无法发布' })
    }

    //构造新帖子对象
    const newPost = {
      //MongoDB 会自动为每条文档生成一个全局唯一的 _id 字段（类型是 ObjectId，不是数字）
      title: titleResult.filtered,
      content: contentResult.filtered,
      category,
      anonymous: anonymous || false, //如果前端没传匿名字段，默认 false
      author: req.user._id, //从 token 里拿的当前用户 _id
      likes: 0,
      comments: [],
      images: images || []
    }
    //增加数据文档
    let createdPost = await Post.create(newPost)
    createdPost = await createdPost.populate('author', 'name wechat showWechat')
    const result = anonymizePost(createdPost)  
    console.log('添加成功:', createdPost._id)
    res.status(201).json(result) 
  } catch (err) {
    console.error('新增帖子失败', err)
    res.status(500).json({ error: '服务端内部错误' })
  }
})

//删除帖子
postRouter.delete('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    const post = await Post.findById(id)
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' })
    }
    // 如果帖子有作者信息，进行权限验证；没有作者信息的旧帖子直接允许删除
    if (post.author) {
      const user = req.user._id
      if (post.author.toString() !== user) {
        return res.status(403).json({ error: '只能删除自己的帖子' })
      }
    }
    const deletedPost = await Post.findByIdAndDelete(id)
    res.json(deletedPost)
  } catch (err) {
    console.error('删除帖子失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

//编辑帖子
postRouter.put('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    const post = await Post.findById(id)
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' })
    }
    //身份认证
    const user = req.user._id //从 token 里拿的当前用户 _id
    if (post.author.toString() !== user) {
      return res.status(403).json({ error: '只能编辑自己的帖子' })
    }
    const { content } = req.body
    if (content === undefined) {
      return res.status(400).json({ error: '内容不能为空' })
    }
    // 过滤敏感词
    const contentResult = filterSensitiveWords(content)

    if (contentResult.blocked) {
      return res.status(400).json({ error: '内容包含违规信息，修改失败' })
    }
    const updatedPost = await Post.findByIdAndUpdate(id, { content: contentResult.filtered }, { new: true })
    updatedPost = await Post.findById(updatedPost._id)
      .populate('author', 'name wechat showWechat')
      .populate('comments.author', 'name')
    const result = anonymizePost(updatedPost) 
    res.json(result)  
  } catch (err) {
    console.error('编辑帖子失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

//点赞帖子
postRouter.put('/:id/likes', auth, async (req, res) => {
  try {
    const id = req.params.id
    const post = await Post.findById(id)
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' })
    }
    //身份认证
    const user = req.user._id //从 token 里拿的当前用户 _id
    //防重复
    if (post.likedBy.includes(user)) {
      return res.status(400).json({ error: '你已经点过赞了' })
    }
    // 找到帖子 → 操作内存中的文档 → 整体保存
    post.likes += 1
    post.likedBy.push(req.user._id)
    await post.save()
    await post.populate('author', 'name wechat showWechat')
    await post.populate('comments.author', 'name')
     // 匿名处理
    const result = anonymizePost(post)
    return res.json(result)
  } catch (err) {
    console.error('点赞帖子失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 举报帖子
postRouter.put('/:id/report', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: '帖子不存在' })
    
    if (post.status === 'reported') {
      return res.status(400).json({ error: '该帖子已被举报' })
    }
    
    post.status = 'reported'
    await post.save()
    res.json({ message: '举报成功' })
  } catch (err) {
    console.error('举报帖子失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

module.exports = postRouter
