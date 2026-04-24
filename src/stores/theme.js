import { ref } from "vue";
import { defineStore } from "pinia";

export const useThemeStore=defineStore('theme',()=>{
//主题转换
  const STORAGE_KEY = 'forum-theme'
  const saved = localStorage.getItem(STORAGE_KEY)//本地持久化

  const theme = ref(saved || 'light')

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  
  return {theme,toggleTheme}
})