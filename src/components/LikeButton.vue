<script setup>
import { computed } from 'vue'

const emit = defineEmits(['like'])
const props = defineProps({
  likes: Number,           // 点赞总数
  likedBy: Array,          // 点赞用户 ID 数组
  currentUserId: String    // 当前登录用户 ID
})

// 判断当前用户是否已点赞
const hasLiked = computed(() => {
  return props.likedBy?.includes(props.currentUserId)
})

function handleLike() {
  emit('like')
}
</script>

<template>
  <div class="like-area">
    <!-- 已点赞：只显示数字，隐藏按钮 -->
    <span v-if="hasLiked" class="liked-count">❤️ {{ likes }} 人觉得很赞</span>
    
    <!-- 未点赞：显示按钮 + 数字 -->
    <button v-else @click="handleLike" class="btn-like">
      🤍 点赞 {{ likes }}
    </button>
  </div>
</template>

<style scoped>
.like-area {
  display: flex;
  align-items: center;
}

.liked-count {
  font-size: var(--font-size-small);
  color: var(--color-primary-dark);
  font-weight: 500;
}

.btn-like {
  padding: var(--space-xs) var(--space-sm);
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-like:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
  transform: scale(1.05);
}
</style>