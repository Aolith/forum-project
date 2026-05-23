<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const notificationStore = useNotificationStore()
const notifications = ref([])
const loading = ref(true)

const typeLabels = {
  comment: '评论了你的帖子',
  reply: '回复了你的评论',
  like_post: '赞了你的帖子',
  like_comment: '赞了你的评论'
}

const typeIcons = {
  comment: '/notification-reply.svg',
  reply: '/notification-reply.svg',
  like_post: '/notification-like.svg',
  like_comment: '/notification-like.svg'
}


// 获取通知
async function fetchNotifications() {
  loading.value = true
  try {
    const res = await fetch('/api/notifications', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('forum-token')}`
      }
    })
    if (res.ok) {
      notifications.value = await res.json()
    }
  } catch (err) {
    console.error('获取通知失败', err)
  } finally {
    loading.value = false
  }
}

// 处理点击
async function handleClick(notification) {
  if (!notification.postId) return

  const wasUnread = !notification.isRead

  if (!notification.isRead) {
    try {
      const res = await fetch(`/api/notifications/${notification._id}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('forum-token')}`
        }
      })
      if (!res.ok) return
      notification.isRead = true
    } catch {
      return
    }
  }

  try {
    const check = await fetch(`/api/posts/${notification.postId}`, {
      method: 'HEAD',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('forum-token')}`
      }
    })

    if (check.ok) {
      if (wasUnread) notificationStore.decreaseUnreadCount()
      router.push(`/post/${notification.postId}`)
    } else if (check.status === 404) {
      notifications.value = notifications.value.filter(n => n._id !== notification._id)
      if (wasUnread) notificationStore.decreaseUnreadCount() 
      alert('该帖子已被删除或不存在')
    } else {
      alert('该帖子暂时无法访问')
    }
  } catch {
    alert('网络异常，请稍后再试')
  }
}


// 格式化时间
function formatTime(time) {
  const d = new Date(time)
  const now = new Date()
  const diff = now - d

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 172800000) return '昨天'
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
// 挂载
onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <main class="notifications-page">
    <h2>消息通知</h2>
    
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="notifications.length === 0" class="empty">
      <p>暂无通知</p>
    </div>
    
    <div v-else class="notification-list">
      <div 
        v-for="item in notifications" 
        :key="item._id" 
        class="notification-item"
        :class="{ unread: !item.isRead }"
        @click="handleClick(item)"
      >
        <img 
          :src="typeIcons[item.type] || '/notification-reply.svg'" 
          alt="通知类型" 
          class="notification-type-icon"
        />
        <div class="notification-content">
          <p class="notification-text">
            <span class="notification-sender">{{ item.sender?.name || '匿名用户' }}</span>
            {{ typeLabels[item.type] || item.type }}
          </p>
          <span class="notification-time">{{ formatTime(item.createdAt) }}</span>
        </div>
        <span v-if="!item.isRead" class="notification-dot"></span>
      </div>
    </div>
  </main>
</template>

<style scoped>
.notifications-page {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.notifications-page h2 {
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

.loading, .empty {
  text-align: center;
  color: var(--color-text-secondary);
  padding: var(--space-lg);
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.notification-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.notification-item:hover {
  background: var(--color-primary-light);
}

.notification-item.unread {
  border-left: 3px solid var(--color-primary);
  background: var(--color-bg);
}

.notification-type-icon {
  width: 24px;
  height: 24px;
  opacity: 0.6;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notification-text {
  font-size: var(--font-size-body);
  color: var(--color-text);
}

.notification-sender {
  font-weight: 500;
  color: var(--color-primary);
  margin-right: var(--space-xs);
}

.notification-time {
  font-size: 11px;
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.notification-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  flex-shrink: 0;
}
</style>