<script setup>
  const emit=defineEmits(['like'])
  const props=defineProps(['likes'])  
  function handleLikes(){
    emit('like')
  }
</script>

<template>
    <p class="likes">{{ likes }}</p>
    <button @click="handleLikes">点赞</button>
</template>

<style scoped>
.likes {
  display: inline-block;
  font-size: 12px;
  color: rgb(255, 75, 105);
  margin: 0 10px;
}
</style>