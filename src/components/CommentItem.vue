<script setup>
import { ref,computed } from "vue"
import { usePostsStore } from "@/stores/post"

const postsStore = usePostsStore()
const editingId = ref(null)
const editText = ref("")

const props = defineProps({
  comment: Object,
  depth: { type: Number, default: 0 },
  postId: String,
  postAuthorId: String,
  currentUserId: String,
})

const emit = defineEmits(["delete-comment", "save-comment", "reply"])

const hasLikedComment = computed(() => {
  return props.comment.likedBy?.includes(props.currentUserId)
})
// 编辑权限：仅评论作者可编辑
function canEdit(c) {
  if (!props.currentUserId) return false
  return c.author?._id === props.currentUserId
}
// 删除权限：评论作者或帖子作者
function canDelete(c) {
  if (!props.currentUserId) return false
  return c.author?._id === props.currentUserId || props.postAuthorId === props.currentUserId
}
// 格式化时间显示
function formatTime(time) {
  const d = new Date(time)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
}
// 删除评论
function deletes(comtId) {
  if (confirm("确定要删除这条评论吗？")) {
    emit("delete-comment", comtId)
  }
}
// 编辑评论
function update(comtId, comment) {
  editingId.value = comtId
  editText.value = comment
}

// 保存编辑
async function save() {
  try {
    await postsStore.saveComment(props.postId, editingId.value, editText.value)
    editText.value = ""
    editingId.value = null
  } catch (err) {
    alert("编辑失败：" + (err.message || "网络错误，请稍后重试"))
  }
}
// 取消编辑
function cancel() {
  editingId.value = null
  editText.value = ""
}
// 点赞评论
async function likeComment(commentId) {
  try {
    const res = await fetch(`/api/posts/${props.postId}/comments/${commentId}/likes`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('forum-token')}` }
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || '点赞失败')
    }
    const updatedPost = await res.json()
    
    // 替换 Store 中对应的帖子，触发响应式更新
    postsStore.posts = postsStore.posts.map(p => 
      p._id === updatedPost._id ? updatedPost : p
    )
  
  } catch (err) {
    alert(err.message)
  }
}
</script>

<template>
  <div class="comment-item">
    <div class="comment-card">
      <!-- 内联编辑模式 -->
      <div v-if="comment._id === editingId" class="comment-edit">
        <textarea v-model="editText" class="comment-textarea"></textarea>
        <div class="comment-edit-actions">
          <button @click="save" class="btn-sm btn-save">保存</button>
          <button @click="cancel" class="btn-sm btn-cancel">取消</button>
        </div>
      </div>

      <!-- 正常展示模式 -->
      <div v-else>
        <p class="comment-body">
          <span v-if="comment.replyTo" class="reply-hint">回复 @{{ comment.replyTo?.name }}</span>
          {{ comment.comment }}
        </p>
        <div class="comment-footer">
          <span class="comment-author">{{ comment.author?.name || '匿名用户' }}</span>
          <span class="comment-time">{{ formatTime(comment.time) }}</span>
          <!-- 已点赞：红心 + 数字 -->
          <span v-if="hasLikedComment" class="liked-count">
          ❤️{{ comment.likes || 0 }}
          </span>

        <!-- 未点赞：空心点赞按钮 -->
          <button 
            v-else 
            @click="likeComment(comment._id)" 
            class="btn-sm btn-like-comment"
          >
          🤍{{ comment.likes || 0 }}
          </button>
          <button v-if="currentUserId" @click="$emit('reply', comment._id, comment.author?._id, comment.author?.name)" class="btn-sm btn-reply">回复</button>
          <div class="comment-actions">
            <button v-if="canEdit(comment)" @click="update(comment._id, comment.comment)" class="btn-sm btn-edit">编辑</button>
            <button v-if="canDelete(comment)" @click="deletes(comment._id)" class="btn-sm btn-delete">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 子回复：用 ul > li 包裹，形成整齐的回复区域 -->
    <ul  v-if="comment.children && comment.children.length > 0" class="reply-list" :style="{ paddingLeft: depth === 0 ? '20px' : '0' }">
      <li v-for="child in comment.children" :key="child._id">
        <CommentItem
          :comment="child"
          :depth="1"
          :postId="postId"
          :postAuthorId="postAuthorId"
          :currentUserId="currentUserId"
          @delete-comment="$emit('delete-comment', $event)"
          @save-comment="(commentText, commentId) => emit('save-comment', commentText, commentId)"
          @reply="(commentId, authorId, authorName) => emit('reply', commentId, authorId, authorName)"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>

.comment-card {
  background-color: var(--color-bg);
  border-left: 4px solid var(--color-primary-light);
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
  margin-bottom: var(--space-sm);
  transition: all var(--transition-fast);
}

.comment-card:hover {
  background-color: var(--color-surface);
}

.comment-body {
  font-size: var(--font-size-body);
  color: var(--color-text);
  margin-bottom: var(--space-xs);
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  overflow: hidden;
}

.reply-hint {
  color: var(--color-primary);
  font-size: var(--font-size-small);
  margin-right: 4px;
}

.comment-footer {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.comment-author {
  font-size: var(--font-size-small);
  color: var(--color-primary);
  font-weight: 500;
}

.comment-time {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-right: auto;
  opacity: 0.7;
}

.comment-actions {
  display: flex;
  gap: var(--space-xs);
}

.btn-sm {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  border: none;
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: transparent;
}

.btn-edit {
  color: var(--color-primary);
}
.btn-edit:hover {
  background: var(--color-primary-light);
}

.btn-delete {
  color: var(--color-text-secondary);
}
.btn-delete:hover {
  color: #e74c3c;
  background: #fde8e8;
}

.btn-reply {
  color: var(--color-text-secondary);
}
.btn-reply:hover {
  color: var(--color-primary);
}

.btn-save {
  background: var(--color-primary);
  color: white;
}
.btn-save:hover {
  background: var(--color-primary-dark);
}

.btn-cancel {
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}
.btn-cancel:hover {
  background: var(--color-bg);
}

.comment-edit {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.comment-textarea {
  width: 100%;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--font-size-body);
  resize: vertical;
  outline: none;
  overflow-y: auto;
  overflow-x: hidden;
}

.comment-textarea:focus {
  border-color: var(--color-primary);
}

.comment-edit-actions {
  display: flex;
  gap: var(--space-xs);
}
.btn-like-comment {
  color: var(--color-text-secondary);
  cursor: pointer;
}
.btn-like-comment:hover {
  color: #e74c3c;
}
/* 已点赞数字 */
.liked-count {
  font-size: var(--font-size-small);
  color: var(--color-primary-dark);
  font-weight: 500;
  cursor: default;
}
/* 回复列表样式 */
.reply-list {
  list-style: none;
  padding-left: 20px;
  margin: 0;
}

.reply-list li {
  margin: 0;
  padding: 0;
}
</style>