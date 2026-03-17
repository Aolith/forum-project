<script setup>
import { inject,computed } from 'vue' 
const posts=inject('posts')
const totalComments = computed(() => {
  return posts.value.reduce((sum, post) => sum + post.comments.length, 0)
})
</script> 

<template>
  <div>
    <h1>校园论坛</h1>
    <p>欢迎来到我的第一个Vue项目!</p >
    <p>作者：凹里</p >
    <p>总评论数:{{ totalComments }}</p>
    <div v-for="post in posts" :key="post.id" class="post">
        <router-link :to="'/post/'+post.id" class="post-link">
        <h2 >{{ post.title }}</h2>
        <p>评论数:{{ post.comments.length }}</p>
        </router-link>
    </div>
  </div>
</template>

<style scoped>

h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
  color: red;
}
p {
  font-size: 16px;
  color: pink;
}
.post h2 {
  display: inline-block;
  text-align: center;
  margin-top: 10px;
  color: rgb(95, 231, 255);
}
.post-link {
  text-decoration: none;
  color: inherit;
}
.post p {
  margin-left: 10px;
  display: inline;
  color: rgb(203, 199, 255);
}
</style>