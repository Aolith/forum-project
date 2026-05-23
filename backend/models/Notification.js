//消息通知模型
const moongoose=require('mongoose')

const NotificationSchema=new moongoose.Schema({
  //通知类型
  type:{
    type:String,
    enum:['comment','reply','like_post','like_comment'],
    required:true
  },
  //接收者和发送者
  sender:{
    type:moongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  receiver:{
    type:moongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  //关联的帖子id和评论id
  postId:{
    type:moongoose.Schema.Types.ObjectId,
    ref:'Post',
    required:true
  },
  commentId:{
    type:moongoose.Schema.Types.ObjectId,
    default:null
  },
  //是否已读
  isRead:{
    type:Boolean,
    default:false
  },
},{
  timestamps:true
})

module.exports=moongoose.model('Notification',NotificationSchema)