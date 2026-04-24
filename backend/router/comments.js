const express=require('express')
const commentRouter=express.Router({ mergeParams: true })//嵌套路由的核心

const posts=require('../data/post')//引入数据

//提交评论 
commentRouter.post('/',(req,res)=>{
  const postId=parseInt(req.params.postId)
  const {comment}=req.body
  if (!comment) return res.status(400).json({ error: '评论内容不能为空' })
  const index=posts.findIndex(p=>p.id===postId)
  if(index===-1){
    return res.status(404).json({error:'帖子不存在'})
  }
  posts[index].comments.push({
      comment:comment,
      time:Date.now(),
      id: Date.now()
    })
  res.json(posts)
})

//删除评论
commentRouter.delete('/:commentId',(req,res)=>{
  const commentId=parseInt(req.params.commentId)
  const postId=parseInt(req.params.postId)
  const indexPost=posts.findIndex(p=>p.id===postId)
  if(indexPost===-1){
    return res.status(404).json({error:'帖子不存在'})
  }
  const indexComt=posts[indexPost].comments.findIndex(p=>p.id===commentId)
  if(indexComt===-1){
    return res.status(404).json({error:'评论不存在'})
  }
  posts[indexPost].comments.splice(indexComt,1)
  res.json(posts)
})

//编辑评论
commentRouter.put('/:commentId',(req,res)=>{
  const commentId=parseInt(req.params.commentId)
  const postId=parseInt(req.params.postId)
  const {comment}=req.body
  const indexPost=posts.findIndex(p=>p.id===postId)
  if(indexPost===-1){
    return res.status(404).json({error:'帖子不存在'})
  }
  const indexComt=posts[indexPost].comments.findIndex(p=>p.id===commentId)
  if(indexComt===-1){
    return res.status(404).json({error:'评论不存在'})
  }
  posts[indexPost].comments[indexComt].comment=comment
  res.json(posts)
})

module.exports=commentRouter