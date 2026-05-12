<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"  // 用于跳转
import { usePostsStore } from "@/stores/post"
const postsStore = usePostsStore()
const router = useRouter()

const title = ref("")
const content = ref("")

//控制成功卡片的显示
const showSuccessCard = ref(false)
//倒计时秒数
const countdown = ref(2)
//提交中状态，防止重复点击
const submitting = ref(false)
async function submit() {
  if (!content.value.trim() || !title.value.trim()) {
    alert("标题和内容不能为空")
    return
  }
  submitting.value = true               // 开始提交，按钮禁用
  try {
    await postsStore.addPost(content.value, title.value)  // 等待后端返回
    
    // === 发帖成功 ===
    content.value = ""                  // 清空输入框
    title.value = ""
    
    // 弹出成功卡片
    showSuccessCard.value = true
    countdown.value = 2
    
    // 启动倒计时
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        showSuccessCard.value = false
        router.push('/')               // 自动跳转首页
      }
    }, 1000)
    
  } catch (err) {
    alert('发布失败：' + (err.message || '网络错误，请稍后重试'))
  } finally {
    submitting.value = false           // 恢复按钮
  }
}

function reset() {
  if (confirm("确定清空吗？")) {
    content.value = ""
    title.value = ""
  }
}
</script>

<template>
  <div class="write-post">
    <div class="form-card">
      <label class="form-label">帖子标题</label>
      <input v-model="title" class="title-input" placeholder="起个吸引人的标题吧..." />

      <label class="form-label">帖子内容</label>
      <textarea v-model="content" class="content-input" placeholder="分享你的想法..."></textarea>

      <div class="form-actions">
        <button @click="submit" class="btn btn-primary">发布帖子</button>
        <button @click="reset" class="btn btn-reset">清空重写</button>
      </div>
    </div>
    <!-- 成功卡片 -->
    <div v-if="showSuccessCard" class="success-overlay">
      <div class="success-card">
        <span class="success-icon">✅</span>
        <p class="success-text">发布成功！</p>
        <p class="success-hint">{{ countdown }}秒后自动返回首页</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 写帖子页面专属样式 */

/* 1. 整体容器：居中，与首页对齐 */
.write-post {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
  min-height: 80vh;
}

/* 2. 表单卡片：白色背景，圆润卡片 */
.form-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-card);
  max-width: 680px;
  margin: 0 auto;
}

/* 3. 标签样式 */
.form-label {
  display: block;
  font-size: var(--font-size-body);
  color: var(--color-text);
  font-weight: 500;
  margin-bottom: var(--space-sm);
  margin-top: var(--space-md);
}

/* 4. 标题输入框 */
.title-input {
  width: 100%;
  padding: var(--space-md);
  font-size: var(--font-size-title);
  background-color: var(--color-primary-light);
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text);
  outline: none;
  box-sizing: border-box;
  transition: background-color var(--transition-fast);
}

.title-input:focus {
  background-color: var(--color-surface);
  box-shadow: 0 0 0 2px var(--color-primary);
}

/* 5. 内容输入框 */
.content-input {
  width: 100%;
  height: 200px;
  padding: var(--space-md);
  font-size: var(--font-size-body);
  background-color: var(--color-primary-light);
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text);
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  transition: background-color var(--transition-fast);
}

.content-input:focus {
  background-color: var(--color-surface);
  box-shadow: 0 0 0 2px var(--color-primary);
}

/* 6. 按钮容器：居中排列 */
.form-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

/* 7. 可爱圆润的按钮 */
.btn {
  padding: var(--space-sm) var(--space-lg);
  border: none;
  border-radius: 20px;
  font-size: var(--font-size-body);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-card-hover);
}

.btn-reset {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.btn-reset:hover {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}
/* ========== 成功卡片样式 ========== */
.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.success-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  text-align: center;
  box-shadow: var(--shadow-card-hover);
  min-width: 250px;
}

.success-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--space-sm);
}

.success-text {
  font-size: var(--font-size-title);
  color: var(--color-text);
  font-weight: 600;
  margin-bottom: var(--space-sm);
}

.success-hint {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}
</style>
