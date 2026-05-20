const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    sno: {
      type: String,
      required: true,
      unique: true, // 添加"主键"约束
    },
    password: {
      type: String,
      required: true,
    }, //之后要 bcrypt 哈希
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    signature: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    avatarCount: {
      type: Number,
      default: 0
    },
    avatarMonth: {
      type: Number,
      default: 0
    },
    avatarVersion: {
      type: Number,
      default: 1
    },
    wechat: {
      type: String,
      default: ''
    },
    showWechat: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true,
  },
)

const User = mongoose.model('User', userSchema)
module.exports = User
