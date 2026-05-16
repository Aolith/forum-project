<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/stores/user"

const userStore = useUserStore()
const router = useRouter()

const signature = ref(userStore.currentUser?.signature || "")
const editing = ref(false)

const showFeedback = ref(false)
const feedbackText = ref("")
async function saveProfile() {
  if (signature.value.length > 50) {
    alert("签名不能超过50个字")
    return
  }
  const result = await userStore.updateProfile({
    signature: signature.value,
  })
  if (result.success) {
    editing.value = false
    alert("修改成功")
  } else {
    alert("修改失败：" + result.msg)
  }
}

function logout() {
  if (confirm("确认退出登录吗？")) {
    userStore.logout()
    router.push("/")
  }
}

async function submitFeedback() {
  if (!feedbackText.value.trim()) {
    alert("建议内容不能为空")
    return
  }
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: feedbackText.value })
    })
    if (!res.ok) throw new Error("提交失败")
    alert("感谢你的建议！")
    showFeedback.value = false
    feedbackText.value = ""
  } catch (err) {
    alert("提交失败：" + err.message)
  }
}
</script>

<template>
  <main class="profile-page">
    <article class="profile-card">
      <!-- 头像：居中 -->
      <figure class="avatar-section">
        <img :src="userStore.currentUser?.avatar || '/default-avatar.png'" alt="头像" />
      </figure>

      <!-- 姓名：头像下面 -->
      <dl class="info-row">
        <dt>姓名</dt>
        <dd>
        {{ userStore.currentUser?.name  }}
        </dd>
      </dl>

      <!-- 签名：大框 -->
      <dl class="info-row">
        <dt>签名</dt>
        <dd>
          <textarea v-if="editing" v-model="signature" class="signature-input" maxlength="50" ></textarea>
          <span v-else>{{ signature || "未设置" }}</span>
        </dd>
      </dl>

      <!-- 提建议 -->
      <div class="feedback-trigger" @click="showFeedback = true">
        <span>💬 提建议</span>
      </div>
      <!-- 提建议弹窗 -->
      <div v-if="showFeedback" class="feedback-overlay" @click.self="showFeedback = false">
        <div class="feedback-card">
          <p class="feedback-title">提建议</p>
          <textarea v-model="feedbackText" placeholder="你的建议…" maxlength="200"></textarea>
          <div class="feedback-actions">
            <button @click="submitFeedback">提交</button>
            <button @click="showFeedback = false">取消</button>
          </div>
        </div>
      </div>
      <!-- 管理后台 -->
      <router-link v-if="userStore.currentUser?.role === 'admin'" to="/admin" class="btn-admin">管理后台</router-link>

      <!-- 操作按钮 -->
      <footer class="actions">
        <button v-if="editing" class="btn-save" @click="saveProfile">保存</button>
        <button class="btn-edit" @click="editing = !editing">{{ editing ? '取消' : '编辑资料' }}</button>
        <button class="btn-logout" @click="logout">退出登录</button>
      </footer>
    </article>
  </main>
</template>

<style scoped>
.profile-page {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-lg);
}

.profile-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-card);
}

.avatar-section img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-primary);
  margin-bottom: var(--space-md);
}

.info-row dd {
  margin: 0;
}
.info-row {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-md);
}

.info-row dt {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
}

.info-row dd {
  margin: 0;
}


.actions {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.actions button {
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: var(--font-size-small);
  transition: all var(--transition-fast);
}

.actions button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
/* 头像区 */
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-md);
}

.avatar-section img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-primary);
}

/* 签名输入框：大框 */
.signature-input {
  width: 100%;
  height: 80px;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-body);
  resize: vertical;
  outline: none;
  text-align: center;
  /* 文本换行——防溢出 */
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  overflow: hidden;
}

/* 编辑资料按钮：蓝底白字 */
.btn-edit {
  background: var(--color-primary) !important;
  color: white !important;
  border: none !important;
}

.btn-edit:hover {
  background: var(--color-primary-dark) !important;
}

/* 退出登录按钮：红色边框 */
.btn-logout {
  border-color: #e74c3c !important;
  color: #e74c3c !important;
}

.btn-logout:hover {
  background: #fde8e8 !important;
  color: #e74c3c !important;
}

/* 保存按钮 */
.btn-save {
  background: var(--color-primary) !important;
  color: white !important;
  border: none !important;
}

.btn-save:hover {
  background: var(--color-primary-dark) !important;
}

.btn-admin {
  display: inline-block;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-primary);
  background: var(--color-surface);
  color: var(--color-primary);
  text-decoration: none;
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: var(--space-sm);
}

.btn-admin:hover {
  background: var(--color-primary);
  color: white;
}
/*提建议*/
.feedback-trigger {
  margin-bottom: var(--space-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
  opacity: 0.6;
  transition: opacity var(--transition-fast);
}
.feedback-trigger:hover { opacity: 1; color: var(--color-primary); }

.feedback-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.3);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}
.feedback-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: var(--shadow-card);
}
.feedback-title {
  font-size: var(--font-size-body);
  color: var(--color-text);
  margin-bottom: var(--space-md);
}
.feedback-card textarea {
  width: 100%;
  height: 100px;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-body);
  resize: vertical;
  outline: none;
}
.feedback-actions {
  display: flex; justify-content: center; gap: var(--space-sm);
  margin-top: var(--space-md);
}
.feedback-actions button {
  padding: var(--space-xs) var(--space-md);
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: var(--font-size-small);
  transition: all var(--transition-fast);
}
.feedback-actions button:first-child {
  background: var(--color-primary);
  color: white;
  border: none;
}
.feedback-actions button:first-child:hover {
  background: var(--color-primary-dark);
}
</style>