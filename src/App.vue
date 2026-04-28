<template>
  <div :class="themeStore.theme" style="min-height: 100vh;">
    <nav v-if="!$route.meta.hideNav">
      <div v-if="!userStore.currentUser">
        <router-link to="/Login"></router-link> 
      </div>
      <div v-else>
        <router-link to="/">论坛首页</router-link>
        <router-link to="/about">写帖子</router-link>
        <button @click="userStore.logout">退出登录</button>
        <button @click="themeStore.toggleTheme">切换主题</button>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from './stores/user';
const themeStore=useThemeStore()
const userStore=useUserStore()
</script>

<style>
/* 导航栏容器：居中 + 与首页同宽 */
nav {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-sm) var(--space-lg);
  background-color: transparent;
  margin-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
}

nav div {
  display: inline-block;
}

nav a {
  margin-right: 15px;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
  transition: color var(--transition-fast);
}

nav a:hover {
  color: var(--color-primary);
}

nav a.router-link-active {
  font-weight: bold;
  color: var(--color-primary);
}

nav button {
  margin-left: 10px;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

nav button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>