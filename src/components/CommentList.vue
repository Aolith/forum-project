//负责显示评论列表和每条评论的删除按钮,编辑按钮
<script setup>
import { ref } from 'vue';
const editingId=ref(null)
const editText=ref('')

const props=defineProps(['comments'])  
const emit=defineEmits(['delete-comment','save-comment'])
function deletes(comtId){
  if(confirm("确定要删除这条评论吗？")){
    emit('delete-comment',comtId)
  }
}
function update(comtId,comment){
  editingId.value=comtId
  editText.value=comment
}
function save(){
  emit('save-comment',editText.value,editingId.value)
  editText.value=''
  editingId.value=null
}
function cancel(){
  editingId.value = null
  editText.value = ''
}
</script>

<template>
  <div v-for="c in comments" :key="c._id">
    <div v-if="c._id===editingId">
      <textarea  v-model="editText"></textarea>
      <button @click="save">保存</button>
      <button @click="cancel">取消</button>
    </div>
    <div v-else>
      <p>{{ c.author?.name}}</p>
      <p>{{ c.comment }}</p>
      <p>{{ new Date(c.time).toLocaleString() }}</p>
      <button @click="deletes(c._id)">删除评论</button>
      <button @click="update(c._id,c.comment)">编辑评论</button>
    </div>
  </div>
</template>

<style scoped>
</style>