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
  <div class="profile-page">
    <div class="profile-card">
      <!-- 头像：居中 -->
      <div class="avatar-section">
        <img :src="userStore.currentUser?.avatar || '/default-avatar.png'" alt="头像" />
      </div>

      <!-- 昵称：头像下面 -->
      <div class="info-row">
        <label>昵称</label>
        <input v-if="editing" v-model="nickname" />
        <span v-else>{{ nickname || "未设置" }}</span>
      </div>

      <!-- 签名：大框 -->
      <div class="info-row">
        <label>签名</label>
        <textarea v-if="editing" v-model="signature" class="signature-input"></textarea>
        <span v-else>{{ signature || "未设置" }}</span>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <button v-if="editing" class="btn-save" @click="saveProfile">保存</button>
        <button class="btn-edit" @click="editing = !editing">{{ editing ? '取消' : '编辑资料' }}</button>
        <button class="btn-logout" @click="logout">退出登录</button>
      </div>
    </div>
  </div>
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

.info-row {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-md);
}

.info-row label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
}

.info-row input,
.info-row span {
  font-size: var(--font-size-body);
  color: var(--color-text);
}

.info-row input {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  text-align: center;
  outline: none;
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