<script setup>
import { ref } from "vue"
import { usePostsStore } from "@/stores/post"

const props = defineProps({
  postId: String  // 帖子 ID，由父组件传入
})

const postsStore = usePostsStore()
const commentText = ref("")
const submitting = ref(false)

async function submit() {
  if (!commentText.value.trim()) {
    alert("内容不能为空!")
    return
  }
  
  submitting.value = true
  try {
    await postsStore.addComment(props.postId, commentText.value)
    commentText.value = ""  // 成功才清空
  } catch (err) {
    alert("评论失败：" + (err.message || "网络错误，请稍后重试"))
    // 不清空输入框，让用户修改
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="comment-form">
    <p class="form-label">评论区</p>
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
</style>
