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
  like_comment: '赞了你的评论',
  carpool_request: '想和你拼车',
  carpool_approve: '同意了你的拼车申请',
  carpool_reject: '拒绝了你的拼车申请'
}

const typeIcons = {
  comment: '/notification-reply.svg',
  reply: '/notification-reply.svg',
  like_post: '/notification-like.svg',
  like_comment: '/notification-like.svg',
  carpool_request: '/notification-car.svg',
  carpool_approve: '/notification-car.svg',
  carpool_reject: '/notification-car.svg'
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
  // 拼车类通知不在这里处理，由各自按钮负责
  if (notification.type && notification.type.startsWith('carpool_')) {
    return
  }
  if (!notification.postId) {
    alert('该通知关联的帖子已失效')
    return
  }

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
      notifications.value = notifications.value.filter(n => n._id !== notification._id)
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

// 同意拼车申请
async function approveApplicant(carpoolId, applicantId) {
  try {
    const res = await fetch(`/api/carpool/${carpoolId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('forum-token')}`
      },
      body: JSON.stringify({ applicantId })
    })
    if (res.ok) {
      alert('已同意，对方可查看你的微信号')
      // 从列表中移除这条申请通知
      notifications.value = notifications.value.filter(n => {
        return !(n.type === 'carpool_request' && n.carpoolId === carpoolId)
      })
      // 减少未读计数（如果该通知未读）
      const notification = notifications.value.find(n => n.carpoolId === carpoolId && n.type === 'carpool_request')
      if (notification && !notification.isRead) {
        notificationStore.decreaseUnreadCount()
      }
      window.dispatchEvent(new Event('carpool-updated'))
    } else {
      const data = await res.json()
      throw new Error(data.error || '操作失败')
    }
  } catch (err) {
    alert(err.message)
  }
}

// 查看拼车微信号
async function viewContact(carpoolId) {
  try {
    const res = await fetch(`/api/carpool/${carpoolId}/contact`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('forum-token')}` }
    })
    if (res.ok) {
      const { wechat } = await res.json()
      alert('对方微信号：' + wechat)
    } else {
      const data = await res.json()
      throw new Error(data.error || '获取失败')
    }
  } catch (err) {
    alert(err.message)
  }
}

// 拒绝拼车申请
async function rejectApplicant(carpoolId, applicantId) {
  try {
    const res = await fetch(`/api/carpool/${carpoolId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('forum-token')}`
      },
      body: JSON.stringify({ applicantId })
    })
    if (res.ok) {
      alert('已拒绝该申请')
      // 从列表中移除这条申请通知
      notifications.value = notifications.value.filter(n => {
        return !(n.type === 'carpool_request' && n.carpoolId === carpoolId)
      })
      // 减少未读计数（如果该通知未读）
      const notification = notifications.value.find(n => n.carpoolId === carpoolId && n.type === 'carpool_request')
      if (notification && !notification.isRead) {
        notificationStore.decreaseUnreadCount()
      }
      window.dispatchEvent(new Event('carpool-updated'))
    } else {
      const data = await res.json()
      throw new Error(data.error || '操作失败')
    }
  } catch (err) {
    alert(err.message)
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
        <!-- 拼车申请通知：仅发布者可见，显示同意按钮 -->
        <template v-if="item.type === 'carpool_request'">
        <button 
          @click.stop="approveApplicant(item.carpoolId, item.sender?._id)"
          class="btn-approve"
        >
          同意
        </button>
        <button
          @click.stop="rejectApplicant(item.carpoolId, item.sender?._id)"
          class="btn-reject"
        >
          拒绝
        </button>
      </template>

        <!-- 拼车同意通知：仅申请人可见，显示查看微信按钮 -->
        <button 
          v-if="item.type === 'carpool_approve'"
          @click.stop="viewContact(item.carpoolId)"
          class="btn-view-wechat"
        >
          查看微信
        </button>
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

/* 拼车操作按钮 */
.btn-approve {
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 8px;
  white-space: nowrap;
}

.btn-reject {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 8px;
  white-space: nowrap;
}
.btn-reject:hover {
  background: #c0392b;
}

.btn-view-wechat {
  background: #2980b9;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 8px;
  white-space: nowrap;
}

</style>