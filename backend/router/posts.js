const express=require('express')
const postRouter=express.Router()

const Post=require('../models/Post')//引入数据库
//get接口
postRouter.get('/',async (req,res)=>{
  try{
    const posts=await Post.find()
    res.json(posts)
  }catch(err){
    console.error('获取帖子失败',err)
    res.status(500).json({error:'服务器内部错误'})
  }
})
//添加新帖子
postRouter.post('/',async(req,res)=>{
  try{
    //从请求体拿到前端发来的数据
    const {content}=req.body
    //简单检验
    if (!content) {
      return res.status(400).json({ error: '内容不能为空' })
    }
    //构造新帖子对象
    const newPost={
      //MongoDB 会自动为每条文档生成一个全局唯一的 _id 字段（类型是 ObjectId，不是数字）
      title:'新帖子',
      content,
      likes:0,
      comments:[]
    }
    //增加数据文档
    const createdPost= await Post.create(newPost)
    console.log('添加成功:', createdPost._id)
    res.status(201).json(createdPost)
  }catch(err){
    console.error('新增帖子失败',err)
    res.status(500).json({error:'服务端内部错误'})
  }
})

//删除帖子
postRouter.delete('/:id',async(req,res)=>{
  try{
    const id = req.params.id
    const deletedPost= await Post.findByIdAndDelete(id)
    if(!deletedPost){
      return res.status(404).json({ error: '帖子不存在' })
    }
    res.json(deletedPost)
  }catch(err){
    console.error('删除帖子失败',err)
    res.status(500).json({error:'服务器内部错误'})
  }
})

//编辑帖子
postRouter.put('/:id',async(req,res)=>{
  try{
    const id=req.params.id
    const {content}=req.body
    if (content === undefined) {
      return res.status(400).json({ error: '内容不能为空' })
    }
    const updatedPost=await Post.findByIdAndUpdate(
      id,
      {content},
      {new:true}
    )
    if(!updatedPost){
      return res.status(404).json({ error: '帖子不存在' })
    }
    res.json(updatedPost)
  }catch(err){
    console.error('编辑帖子失败',err)
    res.status(500).json({error:'服务器内部错误'})
  }
})

//点赞帖子
postRouter.put('/:id/likes',async(req,res)=>{
  try{
    const id=req.params.id
    const updatedPost=await Post.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      {new:true}
    )
    if(!updatedPost){
      return res.status(404).json({ error: '帖子不存在' })
    }
    res.json(updatedPost)
  }catch(err){
    console.error('点赞帖子失败',err)
    res.status(500).json({error:'服务器内部错误'})
  }
})


module.exports=postRouter