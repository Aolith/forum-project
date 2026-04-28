<script setup>
import { ref } from 'vue'

const editingId = ref(null)
const editText = ref('')

const props = defineProps({
  comments: Array,
  postAuthorId: String,      // 帖主ID
  currentUserId: String       // 当前登录用户ID
})
const emit = defineEmits(['delete-comment', 'save-comment'])

// 权限判断
function canEdit(comment) {
  return comment.author?._id === props.currentUserId
}
function canDelete(comment) {
  // 评论作者 或 帖主 可以删除
  return comment.author?._id === props.currentUserId || props.postAuthorId === props.currentUserId
}

// 格式化时间（简化为“4月28日 14:30”）
function formatTime(time) {
  const d = new Date(time)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function deletes(comtId) {
  if (confirm("确定要删除这条评论吗？")) {
    emit('delete-comment', comtId)
  }
}

function update(comtId, comment) {
  editingId.value = comtId
  editText.value = comment
}

function save() {
  emit('save-comment', editText.value, editingId.value)
  editText.value = ''
  editingId.value = null
}

function cancel() {
  editingId.value = null
  editText.value = ''
}
</script>

<template>
  <div v-for="c in comments" :key="c._id" class="comment-card">

    <!-- 内联编辑模式 -->
    <div v-if="c._id === editingId" class="comment-edit">
      <textarea v-model="editText" class="comment-textarea"></textarea>
      <div class="comment-edit-actions">
        <button @click="save" class="btn-sm btn-save">保存</button>
        <button @click="cancel" class="btn-sm btn-cancel">取消</button>
      </div>
    </div>

    <!-- 正常展示模式 -->
    <div v-else>
      <p class="comment-body">{{ c.comment }}</p>
      <div class="comment-footer">
        <span class="comment-author">{{ c.author?.name }}</span>
        <span class="comment-time">{{ formatTime(c.time) }}</span>
        <div class="comment-actions">
          <button v-if="canEdit(c)" @click="update(c._id, c.comment)" class="btn-sm btn-edit">编辑</button>
          <button v-if="canDelete(c)" @click="deletes(c._id)" class="btn-sm btn-delete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 评论卡片 */
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

/* 评论正文 */
.comment-body {
  font-size: var(--font-size-body);
  color: var(--color-text);
  margin-bottom: var(--space-xs);
  line-height: 1.6;
}

/* 底部信息栏：作者 + 时间 + 操作按钮 */
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

/* 时间戳：弱化、不显眼 */
.comment-time {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-right: auto;        /* 把按钮推到右侧 */
  opacity: 0.7;
}

/* 操作按钮组 */
.comment-actions {
  display: flex;
  gap: var(--space-xs);
}

/* 通用小按钮 */
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

/* 编辑区 */
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
}

.comment-textarea:focus {
  border-color: var(--color-primary);
}

.comment-edit-actions {
  display: flex;
  gap: var(--space-xs);
}
</style>