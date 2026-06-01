//消息通知模型
const mongoose=require('mongoose')

const NotificationSchema=new mongoose.Schema({
  //通知类型
  type:{
    type:String,
    enum:['comment','reply','like_post','like_comment','carpool_request','carpool_approve','carpool_reject','carpool_self_result'],
    required:true
  },
  //接收者和发送者
  sender:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  receiver:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  //关联的帖子id和评论id
  postId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Post',
    required:false
  },
  commentId:{
    type:mongoose.Schema.Types.ObjectId,
    default:null
  },
  carpoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carpool',
    default: null
  },
  //是否已读
  isRead:{
    type:Boolean,
    default:false
  },
},{
  timestamps:true
})

module.exports=mongoose.model('Notification',NotificationSchema)