<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const userStore = useUserStore()
const snoId = ref('')
const numId = ref('')

async function handleLogin() {
  if (!snoId.value || !numId.value) {
    alert('用户名和密码不能为空!')
    return
  }
  const result = await userStore.userLogin(snoId.value, numId.value)
  if (result.success) {
    router.push('/')
  } else {
    alert(result.msg)
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">登录校园论坛</h2>

      <form @submit.prevent="handleLogin" class="auth-form">
        <input
          v-model="snoId"
          type="text"
          placeholder="学号"
          class="auth-input"
          autocomplete="username"
        >
        <input
          v-model="numId"
          type="password"
          placeholder="密码"
          class="auth-input"
          autocomplete="current-password"
        >
        <button type="submit" class="btn-submit">确认登录</button>
      </form>

      <p class="auth-link">
        没有账号？<router-link to="/Register">去注册</router-link>
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