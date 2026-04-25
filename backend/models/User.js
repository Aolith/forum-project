const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
  sno:{
    type:String,
    required:true,
    unique: true  // 添加"主键"约束
  },
  password:{
    type:String,
    required:true
  },//之后要 bcrypt 哈希
  name:{
    type:String,
    required:true
  }
},{
  timestamps:true
})

const User=mongoose.model('User',userSchema)
module.exports=User