/**
 * 对帖子对象及其评论进行匿名处理
 * @param {Object} post - Mongoose 文档或普通对象
 * @returns {Object} 处理后的普通对象
 */
function anonymizePost(post) {
  const postObj = post.toObject ? post.toObject() : post

  // 帖子作者匿名
  if (postObj.anonymous) {
    if (!postObj.author || typeof postObj.author !== 'object') {
      postObj.author = {}
    }
    postObj.author.name = '匿名用户'
    postObj.author.wechat = ''           
    postObj.author.showWechat = false    
  }

  // 评论作者匿名
  if (postObj.comments && Array.isArray(postObj.comments)) {
    postObj.comments.forEach(comment => {
      if (postObj.anonymous && comment.author) {
        comment.author.name = '匿名用户'    
      }
    });
  }

  return postObj
}

module.exports = anonymizePost