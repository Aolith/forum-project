<template>
  <div :class="themeStore.theme" style="min-height: 100vh;">
    <nav v-if="!$route.meta.hideNav">
      <router-link to="/">论坛首页</router-link>
      <router-link to="/about">关于我</router-link>
      <router-link to="/Login">登录</router-link> 
      <button @click="themeStore.toggleTheme">切换主题</button>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'
const themeStore=useThemeStore()
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
#app, .light, .dark {  /* 假设你的根 div 有这些类 */
  min-height: 100vh;    /* 视口高度的 100% */
}
.light {
  background-color: white;
  color: black;
}
.dark {
  background-color: black;
  color: white;
}
nav {
  padding: 10px;
  background: transparent;
  margin-bottom: 20px;
}
nav a {
  margin-right: 15px;
  text-decoration: none;
  color: #333;
}
nav a.router-link-active {
  font-weight: bold;
  color: #42b983;
}
</style>