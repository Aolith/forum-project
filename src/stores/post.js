import { defineStore } from "pinia";
import { ref,watch } from "vue";

export const usePostsStore = defineStore('post', () => {
  const STORAGE_KEY = 'forum-posts'
  const defaultPosts = [
  { id: 1, title: '第一条帖子', content: '我终于要开始写论坛了！', likes: 0, comments: [] },
  { id: 2, title: '第二条帖子', content: '有点激动呢！', likes: 0, comments: [] },
  { id: 3, title: '第三条帖子', content: '我会加油！', likes: 0, comments: [] }
  ]

  let saved = null
  try {
   saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch (e) {
    console.warn('Failed to parse posts from localStorage', e)
  }
  const posts = ref(saved || defaultPosts) //帖子数据

  //添加watch
  watch(posts, (newPosts) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts))
  }, { deep: true })


  // 添加帖子的方法
  function addPost(content) {
    posts.value.push({
    id: Date.now(),
    title:'新帖子',
    content,
    likes:0,
    comments:[]
    })
  }

  //删除帖子
function deletePost(id){
  posts.value=posts.value.filter(post=>post.id!==id)
}

//点赞帖子
function likesCount(id){
  const found = posts.value.find(post => post.id===id);
  found.likes++
}

//编辑帖子
function updatePosts(id,newContent){
  const found = posts.value.find(post => post.id===id);
  found.content=newContent
}

//提交评论
function addComment(id,newComment){
  const found = posts.value.find(post => post.id===id);
  if(found){
    found.comments.push({
      comment:newComment,
      time:Date.now(),
      id: Date.now() + '-' + Math.random()
    })
  }
}
//删除评论
function deleteComment(id,comtId){
  const found = posts.value.find(post => post.id===id)
  if(found){
    found.comments=found.comments.filter(comments=>comments.id!==comtId)
  }else{
    console.warn
  }
}
//保存编辑评论
function saveComment(id,commentText,comtId){
  const post = posts.value.find(p => p.id===id)
  if(!post)return
  const comment=post.comments.find(c=>c.id===comtId)
  if(comment){
    comment.comment=commentText
  }
}

  return { posts,addPost,deletePost,likesCount,updatePosts,addComment,deleteComment,saveComment }
})