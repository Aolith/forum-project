<script setup>
import { ref } from 'vue'

import { usePostsStore } from '@/stores/post'
const postsStore=usePostsStore()

const title = ref('')
const content = ref('')

function submit() {
  if (content.value.trim()&& title.value.trim()) {
    // 触发 addPost 事件，把输入内容传出去
    postsStore.addPost(content.value,title.value)
    content.value = '' // 清空输入框
    title.value=''
  } else {
    alert('内容不能为空')
  }
}

function reset() {
  if (confirm('确定清空吗？')) {
    content.value = ''
    title.value=''
  }
}
</script>

<template>
  <div>
    <p>帖子标题:</p >
    <textarea v-model="title" class="title"></textarea>
    <p>帖子内容:</p >
    <textarea v-model="content" class="content"></textarea>
    <button @click="submit">提交帖子</button>
    <button @click="reset">重置内容</button>
  </div>
</template>

<style scoped>
div {
  padding: 10px;
}
.title {
  resize: none;
  display:block;
  height: 20px;
  width: 300px;
  margin-bottom: 10px;
}
.content {
  resize: none;
  display:block;
  overflow: auto;
  height: 100px;
  width: 300px;
  margin-bottom: 10px;
}
</style>