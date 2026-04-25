const mongoose = require('mongoose')

// 1. 先定义评论的子文档 Schema（因为它是嵌在帖子里的）
const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    default: Date.now//不能加括号
  }
});

// 2. 再定义帖子的主 Schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [commentSchema]  // 这里引用上面定义的评论 Schema
}, {
  timestamps: true  // 自动添加 createdAt 和 updatedAt 字段
});

// 3. 创建模型并导出
const Post = mongoose.model('Post', postSchema)
module.exports = Post