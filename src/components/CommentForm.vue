//负责评论输入和提交按钮
<script setup>
const props=defineProps(['modelValue'])
const emit= defineEmits(['submit-comment','update:modelValue'])

function submit(){
    if(props.modelValue.trim()){
      emit('submit-comment',props.modelValue)
    }
  }
</script>

<template>
  <p>评论区：</p>
  <textarea :value="modelValue" @input="$emit('update:modelValue',$event.target.value)" ></textarea>
  <button @click="submit">提交评论</button>
</template>

<style scoped>
textarea {
  resize: none;
  display:block;
  overflow: auto;
  height: 50px;
  width: 200px;
  margin-bottom: 10px;
}
</style>