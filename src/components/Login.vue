<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router';
import { ref } from 'vue';
const router=useRouter()
const userStore=useUserStore()
const snoId=ref('')
const numId=ref('')

function handleLogin(){
  if (!snoId.value || !numId.value){
    alert('学号和密码不能为空!')
    return
  }
  const result=userStore.userLogin(snoId.value,numId.value)
  if(result.success){
     router.push('/')
  }else{
    alert(result.msg)
  }
}
</script>

<template>
    <div class="loginarea">
    <h2>请完成登录</h2>
    <div class="Login_form">
      <form>
        <ul>
          <li><label for="sno" class="inp">学号：</label><input type="text" id="sno" v-model="snoId"></li>
          <li><label for="num" class="inp">密码：</label><input type="text" id="num" v-model="numId"></li>
          <li class="subLogin">
            <input type="submit" value="确认登录" class="btn" @click="handleLogin">
          </li>
          <li class="link"><p>没有账号,去<router-link to="/Register">注册</router-link></p></li>
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
  .loginarea {
    width: 300px;
    height: 200px;
    background-color: rgb(181, 181, 181);
    border: 1px solid rgb(13, 196, 232);
    margin: 100px auto;
  }
  .loginarea h2 {
    text-align: center;
    font-weight: 600;
  }
  .Login_form {
    width: 300px;
    height: 155px;
    margin-top: 10px;
    background-color: #ffffff;
  }
  .inp {
    color: black;
    margin-left: 40px;
  }
  .subLogin {
    text-align: center;
    margin-top: 20px;
  }
  .subLogin input {
    width: 80px;
    height: 40px;
    font-size: 18px;
    background-color: red;
    border: none;
    color: #fff;
  }
  .link {
    text-align: center;
    margin-top: 20px;
    color: black;
  }
  .link a {
    color: red;
  }
</style>