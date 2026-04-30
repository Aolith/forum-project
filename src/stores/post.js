import { defineStore } from "pinia";
import { ref,watch } from "vue";

export const usePostsStore = defineStore('post', () => {
  const STORAGE_KEY = 'forum-posts'
  const posts = ref([])  // 初始为空，不从缓存恢复
// 初始化：从数据库拉取
async function fetchPosts() {
  try {
    const res = await fetch('https://forum-project-production.up.railway.app/api/posts');
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
async function addPost(content,title) {
  try {
    const res = await fetch('https://forum-project-production.up.railway.app/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('forum-token')}`
      },
      body: JSON.stringify({ content,title })  // 只传 content，因为 title 后端固定
    })
    if (!res.ok) {
      const errorData = await res.json()
      console.error('后端报错：', errorData.error)
      throw new Error(errorData.error || '新增失败')
    }
    const newPost=await res.json()
    posts.value.push(newPost)
  } catch (err) {
    console.error('新增帖子失败：', err)
  }
}

  //删除帖子
async function deletePost(id){
  try{
    const res=await fetch(`https://forum-project-production.up.railway.app/api/posts/${id}`,{
      method:'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('forum-token')}`
      }
      //delete没有请求体
    })
    if (!res.ok) {
      const errorData = await res.json()
      console.error('后端报错：', errorData.error)
      throw new Error(errorData.error || '删除失败')
    }
    const deletedPost=await res.json()
    posts.value=posts.value.filter(p=>p._id!==deletedPost._id)
  }catch(err){
    console.error('删除帖子失败',err)
  }
}

//编辑帖子
async function updatePosts(id,newContent){
  try{
    const res=await fetch(`https://forum-project-production.up.railway.app/api/posts/${id}`,{
      method:'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('forum-token')}`
      },
      body:JSON.stringify({content:newContent})
    })
    if (!res.ok) {
      const errorData = await res.json()
      console.error('后端报错：', errorData.error)
      throw new Error(errorData.error || '编辑失败')
    }
    const updatedPost=await res.json()
    posts.value=posts.value.map(p => p._id === updatedPost._id ? updatedPost : p)
  }catch(err){
    console.error('编辑帖子失败',err)
  }
}

let isLiking = false; // 防抖锁，定义在 store 外面，被 likesCount 闭包
//点赞帖子
async function likesCount(id) {
  //如果正在点赞中，直接返回，不执行后续请求
  if(isLiking)return

  isLiking=true//上锁
  try{
    const res=await fetch(`https://forum-project-production.up.railway.app/api/posts/${id}/likes`,{
      method:'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('forum-token')}`
      }
    })
    if (!res.ok) {
      const errorData = await res.json()
      console.error('后端报错：', errorData.error)
      throw new Error(errorData.error || '点赞失败')
    }
    const updatedPost=await res.json()
    posts.value=posts.value.map(p => p._id === updatedPost._id ? updatedPost : p)
  }catch(err){
    console.error('点赞帖子失败',err)
  }
  finally{
    isLiking=false//解锁
  }
}

//提交评论
async function addComment(postId,newComment) {
  try{
    const res=await fetch(`https://forum-project-production.up.railway.app/api/posts/${postId}/comments`,{
      method:'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('forum-token')}`
      },
      body:JSON.stringify({comment:newComment})
    })
    if (!res.ok) {
      const errorData = await res.json()
      console.error('后端报错：', errorData.error)
      throw new Error(errorData.error || '提交失败')
    }
    const updatedPost = await res.json()
    posts.value = posts.value.map(p => p._id === updatedPost._id ? updatedPost : p)
  }catch(err){
    console.error('提交评论失败',err)
  }
}


//删除评论
async function deleteComment(postId,commentId) {
  try{
    const res=await fetch(`https://forum-project-production.up.railway.app/api/posts/${postId}/comments/${commentId}`,{
      method:'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('forum-token')}`
      }
    })
    if (!res.ok) {
      const errorData = await res.json()
      console.error('后端报错：', errorData.error)
      throw new Error(errorData.error || '删除失败')
    }
    const updatedPost = await res.json()
    posts.value = posts.value.map(p => p._id === updatedPost._id ? updatedPost : p)
  }catch(err){
    console.error('删除评论失败',err)
  }
}

//保存编辑评论
async function saveComment(postId,commentId,comment) {
  try{
    const res=await fetch(`https://forum-project-production.up.railway.app/api/posts/${postId}/comments/${commentId}`,{
      method:'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('forum-token')}`
      },
      body:JSON.stringify({comment})
    })
    if (!res.ok) {
      const errorData = await res.json()
      console.error('后端报错：', errorData.error)
      throw new Error(errorData.error || '编辑失败')
    }
    const updatedPost = await res.json()
    posts.value = posts.value.map(p => p._id === updatedPost._id ? updatedPost : p)
  }catch(err){
    console.error('编辑评论失败',err)
  }
}

// 分页加载更多帖子
let currentPage = 1

async function loadMorePosts() {
  currentPage++
  try {
    const res = await fetch(`/api/posts?page=${currentPage}&limit=10`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('forum-token')}`
      }
    })
    if (!res.ok) throw new Error('加载更多帖子失败')
    const newPosts = await res.json()
    // 追加新数据，不覆盖已有数据
    posts.value.push(...newPosts)
  } catch (err) {
    console.error('加载更多帖子失败', err)
    currentPage--  // 失败时回滚页码
  }
}


  return { posts,addPost,deletePost,likesCount,updatePosts,addComment,deleteComment,saveComment,loadMorePosts }
})