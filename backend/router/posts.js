const express=require('express')
const postRouter=express.Router()

const posts = require('../data/post');//引入数据

//get接口
postRouter.get('/',(req,res)=>{
  res.json(posts)
})
//添加新帖子
postRouter.post('/',(req,res)=>{
  //从请求体拿到前端发来的数据
  const {content}=req.body
  //简单检验
  if (!content) {
    return res.status(400).json({ error: '内容不能为空' });
  }
  //构造新帖子对象
  const newPost={
    id: Date.now(),
    title:'新帖子',
    content,
    likes:0,
    comments:[]
    }
  //推入内存数组
  posts.push(newPost)
  //返回响应
  res.status(201).json(posts)
})

//删除帖子
postRouter.delete('/:id',(req,res)=>{
  const id = parseInt(req.params.id)
  const index = posts.findIndex(p => p.id === id)
  if (index === -1) {
    return res.status(404).json({ error: '帖子不存在' })
  }
  posts.splice(index, 1)
  res.json(posts) // 返回更新后数组
})

//编辑帖子
postRouter.put('/:id',(req,res)=>{
  const id=parseInt(req.params.id)
  const {content}=req.body
  const index = posts.findIndex(p => p.id === id)
  if(index===-1){
    return res.status(404).json({ error: '帖子不存在' })
  }
  if (content === undefined) {
  return res.status(400).json({ error: '内容不能为空' });
  }
  posts[index].content=content
  res.json(posts)
})

//点赞帖子
postRouter.put('/:id/likes',(req,res)=>{
  const id=parseInt(req.params.id)
  const index=posts.findIndex(p=>p.id===id)
  if(index===-1){
    return res.status(404).json({error:'帖子不存在'})
  }
  posts[index].likes++
  res.json(posts)
})


module.exports=postRouter