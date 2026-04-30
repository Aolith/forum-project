<script setup> 
import { computed, onMounted, onUnmounted } from 'vue' 
import { usePostsStore } from '@/stores/post'
import { throttle } from '@/utils/throttle'
const postsStore=usePostsStore()
const posts=postsStore.posts
const totalComments = computed(() => {
  return posts.length
})

//创建节流后的滚动处理函数
const handleScroll = throttle(() => {
  const{scrollTop,scrollHeight,clientHeight}=document.documentElement

  //距离底部 50px 时触发加载更多
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    postsStore.loadMorePosts()
  }
},1000)

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script> 

<template>
  <div class="home-container">
    <h1>校园论坛</h1>
    <p>总帖子数:{{ totalComments }}</p>
    <div v-for="post in posts" :key="post._id" class="post">
      <router-link :to="'/post/' + post._id" class="post-link">
        <h2>{{ post.title }}</h2>
        <p class="likes">👍 {{ post.likes }}</p>
        <p class="comment-count">💬 {{ post.comments.length }}</p>
        <p class="author">{{ post.author?.name }}</p>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-lg);
  background-color: var(--color-primary-light);  /* 追加这一行 */
  border-radius: var(--radius-lg);               /* 给大盒子也加圆角，与卡片风格统一 */
}

/* 页面标题区 */
h1 {
  text-align: center;
  font-weight: 500;
  font-size: 2rem;
  color: var(--color-surface);
  margin-bottom: var(--space-md);
}

p {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

/* -------------------- 帖子卡片 -------------------- */
.post {
  background-color: var(--color-surface);  /* 白色，不动 */
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-md);
  box-shadow: var(--shadow-card);
  transition: box-shadow var(--transition-fast);
}

.post:hover {
  box-shadow: var(--shadow-card-hover);
}

.post h2 {
  text-align: center;
  font-size: 22px;
  color: var(--color-primary);        /* 确保用主色 */
  margin-bottom: var(--space-xs);
}

/* 点赞数：紧贴标题下方，居中 */
.post .likes {
  text-align: center;
  font-size: var(--font-size-small);
  color: var(--color-primary-dark);
  margin-bottom: var(--space-sm);
}

/* 作者：右下角，不显眼 */
.post .author {
  display: block;
  text-align: right;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  margin-top: var(--space-sm);
}

/* 评论数 */
.post .comment-count {
  text-align: center;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.post-link {
  text-decoration: none;
  color: inherit;
  display: block;                                 /* 让整个卡片可点击 */
}
</style>