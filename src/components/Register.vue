<script setup>

</script>

<template>
    <div class="Registerarea">
    <h2>请完成注册</h2>
    <div class="Register_form">
      <form>
        <ul>
          <li><label for="name" class="inp">姓名：</label><input type="text" id="name" ></li>
          <li><label for="sno" class="inp">学号：</label><input type="text" id="sno" ></li>
          <li><label for="num" class="inp">密码：</label><input type="text" id="num" ></li>
          <li class="subRegister">
            <input type="submit" value="确认注册" class="btn">
          </li>
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
    margin-top: 20px;
  }
  .subRegister input {
    width: 80px;
    height: 40px;
    font-size: 18px;
    background-color: red;
    border: none;
    color: #fff;
  }
</style>