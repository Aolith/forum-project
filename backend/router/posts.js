const express=require('express')
const postRouter=express.Router()
const auth = require('../middleware/auth')

const Post=require('../models/Post')//引入数据库
//get接口
postRouter.get('/',async (req,res)=>{
  try{
    // 从查询参数中获取分页信息，设置默认值
    const page = parseInt(req.query.page) || 1     // 当前页码，默认第 1 页
    const limit = parseInt(req.query.limit) || 10  // 每页数量，默认 10 条
    const skip = (page - 1) * limit                // 跳过的文档数

    const posts=await Post.find()
      .populate('author', 'name')
      .populate('comments.author', 'name')
      .sort({ createdAt: -1 })// 按创建时间倒序，最新的在前面
      .skip(skip)
      .limit(limit)

    res.json(posts)
  }catch(err){
    console.error('获取帖子失败',err)
    res.status(500).json({error:'服务器内部错误'})
  }
})
//添加新帖子
postRouter.post('/',auth,async(req,res)=>{
  try{
    //从请求体拿到前端发来的数据
    const {content,title}=req.body
    //简单检验
    if (!title) {
      return res.status(400).json({ error: '标题不能为空' })
    }
    if (!content) {
      return res.status(400).json({ error: '内容不能为空' })
    }
    //构造新帖子对象
    const newPost={
      //MongoDB 会自动为每条文档生成一个全局唯一的 _id 字段（类型是 ObjectId，不是数字）
      title,
      content,
      author:req.user._id,//从 token 里拿的当前用户 _id
      likes:0,
      comments:[]
    }
    //增加数据文档
    let createdPost = await Post.create(newPost)
    createdPost = await createdPost.populate('author', 'name')
    console.log('添加成功:', createdPost._id)
    res.status(201).json(createdPost)
  }catch(err){
    console.error('新增帖子失败',err)
    res.status(500).json({error:'服务端内部错误'})
  }
})

//删除帖子
postRouter.delete('/:id',auth,async(req,res)=>{
  try{
    const id = req.params.id
    const post=await Post.findById(id)
    if(!post){
      return res.status(404).json({ error: '帖子不存在' })
    }
    // 如果帖子有作者信息，进行权限验证；没有作者信息的旧帖子直接允许删除
    if (post.author) {
      const user = req.user._id
      if (post.author.toString() !== user) {
        return res.status(403).json({ error: '只能删除自己的帖子' })
      }
    }
    const deletedPost= await Post.findByIdAndDelete(id)
    res.json(deletedPost)
  }catch(err){
    console.error('删除帖子失败',err)
    res.status(500).json({error:'服务器内部错误'})
  }
})

//编辑帖子
postRouter.put('/:id',auth,async(req,res)=>{
  try{
    const id=req.params.id
    const post=await Post.findById(id)
    if(!post){
      return res.status(404).json({ error: '帖子不存在' })
    }
    //身份认证
    const user=req.user._id//从 token 里拿的当前用户 _id
    if(post.author.toString()!==user){
      return res.status(403).json({error:'只能编辑自己的帖子'})
    }
    const {content}=req.body
    if (content === undefined) {
      return res.status(400).json({ error: '内容不能为空' })
    }
    const updatedPost=await Post.findByIdAndUpdate(
      id,
      {content},
      {new:true}
    )
    res.json(updatedPost)
  }catch(err){
    console.error('编辑帖子失败',err)
    res.status(500).json({error:'服务器内部错误'})
  }
})

//点赞帖子
postRouter.put('/:id/likes',auth,async(req,res)=>{
  try{
    const id=req.params.id
    const post=await Post.findById(id)
    if(!post){
      return res.status(404).json({ error: '帖子不存在' })
    }
    //身份认证
    const user=req.user._id//从 token 里拿的当前用户 _id
    //防重复
    if(post.likedBy.includes(user)){
      return res.status(400).json({error:'你已经点过赞了'})
    }
    // 找到帖子 → 操作内存中的文档 → 整体保存
    post.likes += 1
    post.likedBy.push(req.user._id)
    await post.save()
    return res.json(post)
  }catch(err){
    console.error('点赞帖子失败',err)
    res.status(500).json({error:'服务器内部错误'})
  }
})


module.exports=postRouter