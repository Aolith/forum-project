<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/stores/user"

const userStore = useUserStore()
const router = useRouter()

const nickname = ref(userStore.currentUser?.name || "")
const signature = ref(userStore.currentUser?.signature || "")
const editing = ref(false)

async function saveProfile() {
  if (nickname.value.length > 7) {
    alert("昵称不能超过7个字")
    return
  }
  if (signature.value.length > 50) {
    alert("签名不能超过50个字")
    return
  }
  if (!nickname.value.trim()) {
    alert("昵称不能为空")
    return
  }
  const result = await userStore.updateProfile({
    name: nickname.value,
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
        {{ nickname || "未设置" }}
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
</style>