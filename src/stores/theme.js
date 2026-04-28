import { ref, watch } from "vue";
import { defineStore } from "pinia";

export const useThemeStore = defineStore('theme', () => {
  const STORAGE_KEY = 'forum-theme'
  const saved = localStorage.getItem(STORAGE_KEY)

  const theme = ref(saved || 'light')

  // 1. 初始化：应用保存的主题（设置 html 属性）
  applyTheme(theme.value)

  // 2. 监听变化：持久化 + 应用
  watch(theme, (newTheme) => {
    localStorage.setItem(STORAGE_KEY, newTheme)
    applyTheme(newTheme)
  })

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  // 3. 核心函数：修改 html 标签的 data-theme 属性
  function applyTheme(name) {
    document.documentElement.setAttribute('data-theme', name)
  }

  return { theme, toggleTheme }
})