const moogoose=require('mongoose')

const carpoolSchema=new moogoose.Schema({
    user:{
      type:moogoose.Schema.Types.ObjectId,
      ref:'User',
      required:true
    },
    wechat:{
      type:String,
      required:true
    },
    departureTime:{
      type:Date,
      required:true
    },
    destination:{
      type:String,
      required:true,
      enum:['南昌站','南昌南站','南昌西站','南昌东站','昌北机场']
    },
    status:{
      type:String,
      default:'active',
      enum:['active','expired','cancelled'] 
    },
    expireAt:{
      type:Date,
      required:true
    }
},{
  timestamps:true
})
//过滤掉过期的
carpoolSchema.index({expireAt:1},{expireAfterSeconds:0})

module.exports=moogoose.model('Carpool',carpoolSchema)