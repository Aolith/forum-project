<template>
  <div :class="themeStore.theme" style="min-height: 100vh">
    <nav v-if="!$route.meta.hideNav">
  <!-- 左侧：始终显示的导航链接 -->
      <div>
        <router-link to="/">论坛首页</router-link>
        <router-link to="/write">写帖子</router-link>
        <router-link to="/Carpool">拼好车</router-link>
      </div>

  <!-- 右侧：用户主页和消息提醒 包在一起 -->
      <div style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
        <template v-if="userStore.currentUser">
          <router-link to="/Notifications" class="notification-icon">
            <img src="/notification-bell.svg" alt="通知" />
            <span v-if="notificationStore.unreadCount > 0" class="notification-badge">{{ notificationStore.unreadCount>99?'99+' : notificationStore.unreadCount }}</span>
          </router-link>
          <router-link to="/Profile" class="nav-avatar">
            <img :src="(userStore.currentUser?.avatar || '/default-avatar.png') + '?v=' + (userStore.currentUser?.avatarVersion || 1)" alt="头像"  @error="e => e.target.src = '/default-avatar.png'" />
          </router-link>
        </template>
        <template v-else>
          <router-link to="/Login">登录</router-link>
        </template>
      </div>
    </nav>
    <router-view v-slot="{ Component }">
      <keep-alive include="HomeView">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup>
import { useThemeStore } from "@/stores/theme"
import { useUserStore } from "./stores/user"
import { useNotificationStore } from "./stores/notification"

const themeStore = useThemeStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
notificationStore.autoPolling() // 组件挂载时启动自动轮询管理

</script>

<style>
/* 导航栏容器：居中 + 与首页同宽 */
nav {
  flex-wrap: wrap; 
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-sm) var(--space-lg);
  background-color: transparent;
  margin-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
}


nav a {
  margin-top: 4px;
  margin-bottom: 4px;
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
  margin-top: 4px;
  margin-bottom: 4px;
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
/*消息提醒图标 */
.notification-icon {
  position: relative;
  display: flex;
  align-items: center;
}
.notification-icon img {
  width: 30px;
  height: 30px;
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}
.notification-icon:hover img {
  opacity: 1;
}
.notification-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: #e74c3c;
  color: white;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-weight: 600;
}
</style>
