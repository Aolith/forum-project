<script setup>
import { ref } from "vue"
import { usePostsStore } from "@/stores/post"
const emit = defineEmits(['cancel-reply'])
const props = defineProps({
  postId: String,  // 帖子 ID，由父组件传入
  replyingTo: Object, // { commentId, authorName } 或 null
})

const postsStore = usePostsStore()
const commentText = ref("")
const submitting = ref(false)

async function submit() {
  if (!commentText.value.trim()) {
    alert("内容不能为空!")
    return
  }
  
  const body = { comment: commentText.value }
  if (props.replyingTo) {
    body.replyTo = props.replyingTo.authorId   
    body.replyToCommentId = props.replyingTo.commentId
  }

  submitting.value = true
  try {
    await postsStore.addComment(props.postId, body)
    commentText.value = ""
    // 提交完成后，告知父组件取消回复状态
    emit('cancel-reply')
  } catch (err) {
    alert("评论失败：" + (err.message || "网络错误，请稍后重试"))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="comment-form">
    <p class="form-label">评论区</p>
    <div v-if="replyingTo" class="replying-bar">
      <span>回复 @{{ replyingTo.authorName }}</span>
      <button @click="$emit('cancel-reply')">取消</button>
    </div>
    <textarea
      v-model="commentText"
      placeholder="写下你的想法..."
      class="comment-input"
    ></textarea>
    <div class="form-actions">
      <button @click="submit" class="btn-submit" :disabled="submitting">
        {{ submitting ? "提交中..." : "提交评论" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.comment-form {
  margin-bottom: var(--space-md);
}

.form-label {
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.comment-input {
  width: 100%;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-body);
  resize: vertical;
  outline: none;
  min-height: 80px;
  box-sizing: border-box;
  transition: border-color var(--transition-fast);
}

.comment-input:focus {
  border-color: var(--color-primary);
  background: var(--color-surface);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-xs);
}

.btn-submit {
  padding: var(--space-xs) var(--space-md);
  border-radius: 20px;
  border: none;
  background: var(--color-primary);
  color: white;
  font-size: var(--font-size-small);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-submit:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-card-hover);
}
.replying-bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-primary-light);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-small);
  color: var(--color-primary);
  margin-bottom: var(--space-xs);
}
.replying-bar button {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: var(--font-size-small);
  padding: 0;                  /* 加这行，去掉按钮默认内边距 */
  line-height: 1;             /* 加这行，确保按钮文本垂直居中 */
}
.replying-bar button:hover {
  color: #e74c3c;
}
</style>
