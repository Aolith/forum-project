import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useUserStore = defineStore('user', () => {
  const USER_KEY="forum-users"
  const CURRENT_USER_KEY = "forum-current-user"  // 新增
  const defaultUsers=[
    {sno: '6020240921', password: 'huhanyu62', name: '胡涵钰'},
    {sno: '6020240950', password: 'congjiu55', name: '冯语涵'}
  ]

  let saved=null
  try{
    saved = JSON.parse(localStorage.getItem(USER_KEY))
  }catch(e){
    console.warn('Failed to parse users from localStorage', e)
  }
  const users = ref(saved || defaultUsers)
  //添加watch
  watch(users, (newUsers) => {
    localStorage.setItem(USER_KEY, JSON.stringify(newUsers))
  }, { deep: true })

  // 定义 currentUser
  const currentUser = ref(null)

  // 初始化时从 localStorage 恢复 currentUser
  const savedCurrent = localStorage.getItem(CURRENT_USER_KEY)
  if (savedCurrent) {
    currentUser.value = JSON.parse(savedCurrent)
  }
  // 监听 currentUser 变化，自动持久化
  watch(currentUser, (newUser) => {
    if (newUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser))
    } else {
      localStorage.removeItem(CURRENT_USER_KEY)
    }
  })


  function userLogin (snoId,numId){
    //通过sno比对 对应的password,用find？
    const found=users.value.find(users=>users.sno===snoId)
    if(!found){
      //密码不正确
      return { success: false, msg: '密码不正确!' }
    }
    if(found.password !== numId){
      //没找到对应学号、学号不存在
      return { success: false, msg: '学号不存在!' }
    }
    currentUser.value = { sno: found.sno, name: found.name }  // 只保存必要信息，不保存密码
    return { success: true, msg: '' }
  }
  // 添加 退出登录 方法
  function logout() {
    currentUser.value = null
  }

  return { users, currentUser, userLogin, logout }
})

