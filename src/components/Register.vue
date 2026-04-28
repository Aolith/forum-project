<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const userStore = useUserStore()
const nameId = ref('')
const snoId = ref('')
const numId = ref('')

// 正则
function validateSno(s) {
  return /^\d{10}$/.test(s)
}
function validatePassword(n) {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(n)
}

// 跳转登录
function goLogin() {
  alert('注册成功!请重新登录!')
  router.push('/Login')
}

async function handleRegister() {
  if (!validateSno(snoId.value)) {
    alert('学号必须是10位数字')
    return
  }
  if (!validatePassword(numId.value)) {
    alert('密码必须包含字母和数字,长度8-16位')
    return
  }
  // 验证完成添加新用户
  const result = await userStore.addUser(nameId.value, snoId.value, numId.value)
  if (result.success) {
    goLogin()
  } else {
    alert(result.msg)
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">注册校园论坛</h2>

      <form @submit.prevent="handleRegister" class="auth-form">
        <input
          v-model="nameId"
          type="text"
          placeholder="姓名"
          class="auth-input"
        >
        <input
          v-model="snoId"
          type="text"
          placeholder="学号（10位数字）"
          class="auth-input"
        >
        <input
          v-model="numId"
          type="password"
          placeholder="密码（8-16位，包含字母和数字）"
          class="auth-input"
          autocomplete="new-password"
        >
        <button type="submit" class="btn-submit">确认注册</button>
      </form>

      <p class="auth-link">
        已有账号？<router-link to="/Login">去登录</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-lg);
}

.auth-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-card);
  width: 100%;
  max-width: 400px;
}

.auth-title {
  text-align: center;
  font-size: 20px;
  color: var(--color-text);
  margin-bottom: var(--space-lg);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.auth-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-body);
  background-color: var(--color-primary-light);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  outline: none;
  box-sizing: border-box;
  transition: all var(--transition-fast);
}

.auth-input:focus {
  background-color: var(--color-surface);
  box-shadow: 0 0 0 2px var(--color-primary);
}

.auth-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.btn-submit {
  margin-top: var(--space-sm);
  padding: var(--space-sm);
  border: none;
  border-radius: 20px;
  background: var(--color-primary);
  color: white;
  font-size: var(--font-size-body);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-submit:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-card-hover);
}

.auth-link {
  text-align: center;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  margin-top: var(--space-md);
}

.auth-link a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>