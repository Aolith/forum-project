const express = require('express')
const notificationRouter = express.Router()
const auth = require('../middleware/auth')
const Notification = require('../models/Notification') //引入通知模型

//返回通知列表,倒序排列
notificationRouter.get('/',auth,async(req,res)=>{
  try{
    const notifications=await Notification.find({receiver:req.user._id})
      .populate('sender', 'name')
      .sort({createdAt:-1})
    res.json(notifications)
  }catch(err){
    console.error('获取通知列表失败',err)
    res.status(500).json({error:'服务器内部错误'})
  }
})
//返回未读通知的数量
notificationRouter.get('/unread-count',auth,async(req,res)=>{
  try{
    const count=await Notification.countDocuments({receiver:req.user._id,isRead:false})
    res.json({count})
  }catch(err){
    console.error('获取未读通知数量失败',err)
    res.status(500).json({error:'服务器内部错误'})
  }
})
//把通知标记为已读
notificationRouter.put('/:id/read',auth,async(req,res)=>{
  try{
    const notification=await Notification.findOneAndUpdate(
      {_id:req.params.id,receiver:req.user._id},
      {isRead:true},
      {new:true}
    )
    res.json(notification)
  }catch(err){
    console.error('标记通知为已读失败',err)
    res.status(500).json({error:'服务器内部错误'})
  }
})

module.exports=notificationRouter