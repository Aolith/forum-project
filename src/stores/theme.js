import { ref, watch } from "vue";
import { defineStore } from "pinia";

export const useThemeStore=defineStore('theme',()=>{
//主题转换
  const STORAGE_KEY = 'forum-theme'
  const saved = localStorage.getItem(STORAGE_KEY)//本地持久化

  const theme = ref(saved || 'light')
//添加watch
watch(theme,(newtheme)=>{
   localStorage.setItem(STORAGE_KEY, newtheme)
})

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  
  return {theme,toggleTheme}
})