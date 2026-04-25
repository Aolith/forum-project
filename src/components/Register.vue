<script setup>
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
const router=useRouter()
const userStore=useUserStore()
const nameId=ref('')
const snoId=ref('')
const numId=ref('')
//正则
function validateSno(s){
  return /^\d{10}$/.test(s)
}
function validatePassword(n){
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(n)
}
//跳转登录
function goLogin(){
  alert('注册成功!请重新登录!')
  router.push('/Login')
}
async function handleRegister(){
  if (!validateSno(snoId.value)) {
    alert('学号必须是10位数字')
    return
  }
  if (!validatePassword(numId.value)) {
    alert('密码必须包含字母和数字,长度8-16位')
    return
  }
  //验证完成添加新用户
  const result = await userStore.addUser(nameId.value, snoId.value, numId.value)
  if(result.success){
    //注册完跳转登录页
    goLogin()
  }else{
    alert(result.msg)
  }
}
</script>

<template>
    <div class="Registerarea">
    <h2>请完成注册</h2>
    <div class="Register_form">
      <form @submit.prevent="handleRegister">
        <ul>
          <li><label for="name" class="inp">姓名：</label><input type="text" id="name" v-model="nameId"></li>
          <li><label for="sno" class="inp">学号：</label><input type="text" id="sno" v-model="snoId"></li>
          <li><label for="num" class="inp">密码：</label><input type="text" id="num" v-model="numId"></li>
          <li class="subRegister">
            <input type="submit" value="确认注册" class="btn">
          </li>
          <li class="link"><p>没有账号,去<router-link to="/Login">登录</router-link></p></li>
        </ul>
      </form>
    </div>
  </div>
</template>


<style scoped>
* {
    margin: 0;
    padding: 0;
}
  a {
    text-decoration: none;
    color: inherit;
  }
  li {
    list-style: none;
  } 
  .Registerarea {
    width: 300px;
    height: 190px;
    background-color: rgb(181, 181, 181);
    border: 1px solid rgb(13, 196, 232);
    margin: 100px auto;
  }
  .Registerarea h2 {
    text-align: center;
    font-weight: 600;
  }
  .Register_form {
    width: 300px;
    height: 145px;
    margin-top: 10px;
    background-color: #ffffff;
  }
  .inp {
    color: black;
    margin-left: 40px;
  }
  .subRegister {
    text-align: center;
    margin-top: 10px;
  }
  .subRegister input {
    width: 80px;
    height: 30px;
    font-size: 18px;
    background-color: red;
    border: none;
    color: #fff;
  }
  .link {
    margin-top: 5px;
    text-align: center;
    color: black;
  }
  .link a {
    color: red;
  }
</style>