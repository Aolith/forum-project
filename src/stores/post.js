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
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {   // 关键：只有数组才用
      saved = parsed
    }
  } catch (e) {
    console.warn('localStorage 数据损坏，已忽略', e)
  }
  const posts = ref(saved || defaultPosts)
  
  //添加watch
  watch(posts, (newPosts) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts))
  }, { deep: true })


  // 添加帖子的方法
async function addPost(content) {
  try {
    const res = await fetch('http://localhost:3001/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })  // 只传 content，因为 title 后端固定
    })
    if (!res.ok) throw new Error('新增失败')
    const data = await res.json()   // 后端返回整个新数组
    posts.value = data             // 直接替换本地状态
  } catch (err) {
    console.error('新增帖子失败：', err)
  }
}

  //删除帖子
async function deletePost(id){
  try{
    const res=await fetch(`http://localhost:3001/api/posts/${id}`,{
      method:'DELETE',
      //delete无请求体
    })
    if(!res.ok)throw new Error('删除失败')
    const data=await res.json()
    posts.value=data
  }catch(err){
    console.error('删除帖子失败',err)
  }
}

//编辑帖子
async function updatePosts(id,newContent){
  try{
    const res=await fetch(`http://localhost:3001/api/posts/${id}`,{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({content:newContent})
    })
    if(!res.ok)throw new Error('编辑失败')
    const data=await res.json()
    posts.value=data
  }catch(err){
    console.error('编辑帖子失败',err)
  }
}

//点赞帖子
async function likesCount(id) {
  try{
    const res=await fetch(`http://localhost:3001/api/posts/${id}/likes`,{
      method:'PUT',
      headers:{'Content-Type':'application/json'}
    })
    if(!res.ok)throw new Error('点赞失败')
    const data=await res.json()
    posts.value=data
  }catch(err){
    console.error('点赞帖子失败',err)
  }
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