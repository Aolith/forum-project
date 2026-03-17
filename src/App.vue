<template>
  <div :class="theme" style="min-height: 100vh;">
    <nav v-if="!$route.meta.hideNav">
      <router-link to="/">论坛首页</router-link>
      <router-link to="/about">关于我</router-link>
      <button @click="toggleTheme">切换主题</button>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { ref, provide,watch } from 'vue'


// 帖子数据
const STORAGE_KEY = 'forum-posts'
const saved = localStorage.getItem(STORAGE_KEY)//本地持久化
const posts = ref(saved ? JSON.parse(saved) : [
  { id: 1, title: '第一条帖子', content: '我终于要开始写论坛了！', likes: 0, comments: [] },
  { id: 2, title: '第二条帖子', content: '有点激动呢！', likes: 0, comments: [] },
  { id: 3, title: '第三条帖子', content: '我会加油！', likes: 0, comments: [] }
])

//添加watch
watch(posts, (newPosts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts))
}, { deep: true })


// 添加帖子的方法
function addPost(content) {
  posts.value.push({
    id: Date.now(),
    title: '新帖子',
    content,
    likes:0,
    comments:[]
  })
}

// 主题相关
const theme = ref('light')
function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
provide('theme', theme)
provide('toggleTheme', toggleTheme)



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
provide('posts', posts)
provide('addPost', addPost)
provide('deletePost', deletePost)   // 注意函数名
provide('likesCount', likesCount)
provide('updatePosts', updatePosts)
provide('addComment',addComment)
provide('deleteComment',deleteComment)
provide('saveComment',saveComment)
</script>

<style>
#app, .light, .dark {  /* 假设你的根 div 有这些类 */
  min-height: 100vh;    /* 视口高度的 100% */
}
.light {
  background-color: white;
  color: black;
}
.dark {
  background-color: black;
  color: white;
}
nav {
  padding: 10px;
  background: transparent;
  margin-bottom: 20px;
}
nav a {
  margin-right: 15px;
  text-decoration: none;
  color: #333;
}
nav a.router-link-active {
  font-weight: bold;
  color: #42b983;
}
</style>