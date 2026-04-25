import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useUserStore = defineStore('user', () => {
  const USER_KEY="forum-users"
  const CURRENT_USER_KEY = "forum-current-user"  // 新增
  const users = ref([])
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

//用户登录
async function userLogin(snoId,numId){
  try{
    const res=await fetch('http://localhost:3001/api/users/login',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({sno:snoId,password:numId})
    })
    if(!res.ok){
      const errorData = await res.json()
      return { success: false, msg: errorData.error || '登录失败' }
    }
    const data=await res.json()
    currentUser.value=data.user
    return { success: true, msg: '' }
  }catch(err){
    console.error('用户登录失败',err)
    return { success: false, msg: '网络错误，请稍后重试' }
  }
}

//添加新用户(注册)
async function addUser(nameId,snoId,numId) {
  try{
    const res=await fetch('http://localhost:3001/api/users/register',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({sno:snoId,password:numId,name:nameId})
    })
    if(!res.ok){
      const errorData = await res.json()
      return { success: false, msg: errorData.error || '注册失败' }
    }
    return { success: true, msg: '' }
  }catch(err){
    console.error('用户注册失败',err)
    return { success: false, msg: '网络错误，请稍后重试' }
  }
}    

//退出登录
  function logout() {
    if(confirm("确认退出登录吗?")){
      currentUser.value = null
    }
  }

  return { users, currentUser, userLogin, logout, addUser }
})

