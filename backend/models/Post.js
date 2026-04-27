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
  author:{
    type: mongoose.Schema.Types.ObjectId,  // 存储用户的 _id
    ref: 'User',        // 指向 users 集合
    //required: true 做完JWT之后补上
  },
  likes: {
    type: Number,
    default: 0
  },
  // 新增：记录点赞用户的 _id
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema]  // 这里引用上面定义的评论 Schema
}, {
  timestamps: true  // 自动添加 createdAt 和 updatedAt 字段
});

// 3. 创建模型并导出
const Post = mongoose.model('Post', postSchema)
module.exports = Post