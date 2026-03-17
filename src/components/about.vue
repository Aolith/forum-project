<script setup>
import { ref ,inject} from 'vue'
const addPost=inject('addPost')
// 定义要触发的事件

const content = ref('')

function submit() {
  if (content.value.trim()) {
    // 触发 addPost 事件，把输入内容传出去
    addPost(content.value)
    content.value = '' // 清空输入框
  } else {
    alert('内容不能为空')
  }
}

function reset() {
  if (confirm('确定清空吗？')) {
    content.value = ''
  }
}
</script>

<template>
  <div>
    <p>帖子内容:</p >
    <textarea v-model="content"></textarea>
    <button @click="submit">提交帖子</button>
    <button @click="reset">重置内容</button>
  </div>
</template>

<style scoped>
div {
  padding: 10px;
}
textarea {
  resize: none;
  display:block;
  overflow: auto;
  height: 100px;
  width: 300px;
  margin-bottom: 10px;
}
</style>