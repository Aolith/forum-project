<template>
  <div>
    <select v-model="set" >
      <option value="" >--请选择--</option>
      <option value="add">加法</option>
      <option value="sub">减法</option>
      <option value="mul">乘法</option>
      <option value="dvi">除法</option>
    </select>
    <input v-model="num1" type="number" >
    <input v-model="num2" type="number" >
    <button @click="calculate">计算</button>
    <button @click="reset">清零</button>
    <p>结果:{{ result }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const num1=ref(0)
const num2=ref(0)
const result=ref(0)
const set=ref('')
function calculate(){
  if(!set.value)alert("请选择计算器功能!");
  switch(set.value){
    case "add":result.value=num1.value+num2.value;break;
    case "sub":result.value=num1.value-num2.value;break;
    case "mul":result.value=num1.value*num2.value;break;
    case "dvi":result.value=num1.value/num2.value;break;
  }
}
function reset(){
  num1.value=0
  num2.value=0
  result.value=0
}

</script>

<style scoped>
  div {
    width: 300px;
    height: 220px;
    border: 1px solid red;
    background-color: pink;
  }
  input {
    display: block;
    width: 100px;
    height: 40px;
    text-align: center;
    margin-left: 100px;
    margin-top: 10px;
  }
  button {
    text-align: center;
    margin: 20px 0px 10px 70px;
  }
  p {
    line-height: 16px;
    font-size: 16px;
    color: red;
    margin: 0 100px;
  }
</style>