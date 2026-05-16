<template>
  <div :class="themeStore.theme" style="min-height: 100vh">
    <nav v-if="!$route.meta.hideNav">
  <!-- 左侧：始终显示的导航链接 -->
      <div>
        <router-link to="/">论坛首页</router-link>
        <router-link to="/write">写帖子</router-link>
      </div>

  <!-- 右侧：用户操作 + 主题切换 包在一起 -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <template v-if="userStore.currentUser">
          <router-link to="/profile" class="nav-avatar">
            <img :src="userStore.currentUser?.avatar || '/default-avatar.png'" alt="头像" />
          </router-link>
          <router-link v-if="userStore.currentUser?.role === 'admin'" to="/admin">管理后台</router-link>
        </template>
        <template v-else>
          <router-link to="/Login">登录</router-link>
          <router-link to="/Register">注册</router-link>
        </template>
        <button @click="themeStore.toggleTheme">切换主题</button>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { useThemeStore } from "@/stores/theme"
import { useUserStore } from "./stores/user"
const themeStore = useThemeStore()
const userStore = useUserStore()
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
  justify-content: space-between; /* 左右分散对齐 */
  align-items: center;
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
.nav-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-border);
  transition: border-color var(--transition-fast);
  cursor: pointer;
}

.nav-avatar img:hover {
  border-color: var(--color-primary);
}
</style>
