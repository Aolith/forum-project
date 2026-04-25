import { defineStore } from "pinia";
import { ref,watch } from "vue";

export const usePostsStore = defineStore('post', () => {
  const STORAGE_KEY = 'forum-posts'
  const posts = ref([])  // 初始为空，不从缓存恢复
// 初始化：从数据库拉取
async function fetchPosts() {
  try {
    const res = await fetch('http://localhost:3001/api/posts');
    if (!res.ok) throw new Error('获取帖子失败');
    const data = await res.json();
    posts.value = data;

    // 注意：这里不手动写 localStorage，因为你下面的 watch 会自动同步
  } catch (err) {
    console.error('从数据库获取帖子失败，尝试降级到本地缓存:', err);

    // 降级：读缓存
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        posts.value = JSON.parse(cached);
        console.log('已从本地缓存恢复数据');
      } catch (parseErr) {
        console.error('本地缓存数据损坏，恢复失败', parseErr);
      }
    } else {
      console.warn('没有可用的本地缓存，首页为空');
    }
  }
}

// store 创建时立即调用一次，拉取数据库数据
fetchPosts()
  
  //watch持久化
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
    const newPost=await res.json()
    posts.value.push(newPost)
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
    const deletedPost=await res.json()
    posts.value=posts.value.filter(p=>p._id!==deletedPost._id)
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
    const updatedPost=await res.json()
    posts.value=posts.value.map(p => p._id === updatedPost._id ? updatedPost : p)
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
    //记得加防抖锁
    const updatedPost=await res.json()
    posts.value=posts.value.map(p => p._id === updatedPost._id ? updatedPost : p)
  }catch(err){
    console.error('点赞帖子失败',err)
  }
}

//提交评论
async function addComment(postId,newComment) {
  try{
    const res=await fetch(`http://localhost:3001/api/posts/${postId}/comments`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({comment:newComment})
    })
    if(!res.ok)throw new Error('提交失败')
    const updatedPost = await res.json()
    posts.value = posts.value.map(p => p._id === updatedPost._id ? updatedPost : p)
  }catch(err){
    console.error('提交评论失败',err)
  }
}


//删除评论
async function deleteComment(postId,commentId) {
  try{
    const res=await fetch(`http://localhost:3001/api/posts/${postId}/comments/${commentId}`,{
      method:'DELETE'
    })
    if(!res.ok)throw new Error('删除失败')
    const updatedPost = await res.json()
    posts.value = posts.value.map(p => p._id === updatedPost._id ? updatedPost : p)
  }catch(err){
    console.error('删除评论失败',err)
  }
}

//保存编辑评论
async function saveComment(postId,commentId,comment) {
  try{
    const res=await fetch(`http://localhost:3001/api/posts/${postId}/comments/${commentId}`,{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({comment})
    })
    if(!res.ok)throw new Error('编辑失败')
    const updatedPost = await res.json()
    posts.value = posts.value.map(p => p._id === updatedPost._id ? updatedPost : p)
  }catch(err){
    console.error('编辑评论失败',err)
  }
}

  return { posts,addPost,deletePost,likesCount,updatePosts,addComment,deleteComment,saveComment }
})