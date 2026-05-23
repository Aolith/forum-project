import {defineStore} from "pinia"
import {ref} from "vue"
import { useUserStore } from "./user"

export const useNotificationStore = defineStore("notification",() => {
  const unreadCount = ref(0)
  let timer = null
  
  // 从服务器获取未读数
  async function fetchUnreadCount() {
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      unreadCount.value = 0
      return
    }
    try {
      const res = await fetch('/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${localStorage.getItem('forum-token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        unreadCount.value = data.count
        // 同步到 localStorage 作为兜底
        localStorage.setItem('unread-count', data.count)
      } else if (res.status === 401 || res.status === 403) {
        unreadCount.value = 0
        localStorage.removeItem('unread-count')
      } else {
        // 其他错误从缓存兜底
        const cached = localStorage.getItem('unread-count')
        if (cached !== null) unreadCount.value = parseInt(cached) || 0
      }
    } catch {
      const cached = localStorage.getItem('unread-count')
      if (cached !== null) unreadCount.value = parseInt(cached) || 0
    }
}

 // 减少未读数（标记已读成功后调用）
  function decreaseUnreadCount(amount = 1) {
    unreadCount.value = Math.max(0, unreadCount.value - amount)
    localStorage.setItem('unread-count', unreadCount.value)
  }

  // 启动轮询
  function startPolling() {
    if (timer) return
    fetchUnreadCount()
    timer = setInterval(fetchUnreadCount, 10000)
  }

  // 停止轮询
  function stopPolling() {
    clearInterval(timer)
    timer = null
    unreadCount.value = 0
    localStorage.removeItem('unread-count')
  }

  // 外部调用：根据用户登录状态自动启停
  function autoPolling() {
    const userStore = useUserStore()
    // 监听 currentUser 变化
    const unwatch = userStore.$subscribe((mutation, state) => {
      if (state.currentUser) {
        startPolling()
      } else {
        stopPolling()
      }
    })
    // 立即根据当前状态启动
    if (userStore.currentUser) startPolling()
    // 返回取消订阅函数（如果需要）
    return unwatch
  }


  return { unreadCount, fetchUnreadCount, decreaseUnreadCount, autoPolling }
})