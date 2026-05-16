<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const reports = ref([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)

async function fetchReports() {
  loading.value = true
  try {
    const res = await fetch(`/api/admin/reported-posts?page=${page.value}&limit=20`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("forum-token")}`
      }
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }
    const data = await res.json()
    reports.value = data.posts
    totalPages.value = data.totalPages
  } catch (err) {
    alert("获取举报列表失败：" + err.message)
  } finally {
    loading.value = false
  }
}

async function deletePost(postId) {
  if (!confirm("确认删除此帖子？")) return
  try {
    const res = await fetch(`/api/admin/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("forum-token")}`
      }
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }
    reports.value = reports.value.filter(p => p._id !== postId)
    alert("帖子已删除")
  } catch (err) {
    alert("删除失败：" + err.message)
  }
}

async function ignorePost(postId) {
  if (!confirm("确认忽略此举报？")) return
  try {
    const res = await fetch(`/api/admin/posts/${postId}/ignore`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("forum-token")}`
      }
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }
    reports.value = reports.value.filter(p => p._id !== postId)
    alert("举报已忽略")
  } catch (err) {
    alert("操作失败：" + err.message)
  }
}

onMounted(() => {
  fetchReports()
})
</script>

<template>
  <main class="admin-page">
    <h2>管理员后台</h2>
    <p class="admin-desc">被举报的帖子列表</p>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="reports.length === 0" class="empty">暂无被举报的帖子</div>

    <div v-else>
      <div v-for="post in reports" :key="post._id" class="report-card">
        <div class="report-info">
          <p class="report-title">
            <router-link :to="'/post/' + post._id">{{ post.title }}</router-link>
          </p>
          <p class="report-excerpt">{{ post.content?.slice(0, 80) }}...</p>
          <p class="report-meta">{{ post.author?.name }} · {{ new Date(post.createdAt).toLocaleDateString() }}</p>
        </div>
        <div class="report-actions">
          <button @click="deletePost(post._id)" class="btn-delete">删除</button>
          <button @click="ignorePost(post._id)" class="btn-ignore">忽略</button>
        </div>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button :disabled="page <= 1" @click="page--, fetchReports()">上一页</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button :disabled="page >= totalPages" @click="page++, fetchReports()">下一页</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.admin-page {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.admin-desc {
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
  margin-bottom: var(--space-md);
}

.loading,
.empty {
  text-align: center;
  color: var(--color-text-secondary);
  padding: var(--space-lg);
}

.report-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-sm);
  box-shadow: var(--shadow-card);
}

.report-title {
  font-size: var(--font-size-body);
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.report-meta {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.report-actions {
  display: flex;
  gap: var(--space-sm);
}

.report-actions button {
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.report-title a {
  color: var(--color-text);
  text-decoration: none;
  transition: color var(--transition-fast);
}
.report-title a:hover {
  color: var(--color-primary);
}
.report-excerpt {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}
.btn-delete {
  background: transparent;
  color: #e74c3c;
  border-color: #e74c3c;
}
.btn-delete:hover {
  background: #e74c3c;
  color: white;
}

.btn-ignore {
  background: transparent;
  color: var(--color-text-secondary);
}
.btn-ignore:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.pagination button {
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>