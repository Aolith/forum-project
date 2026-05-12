import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"
import About from "../components/about.vue"
import Login from "@/components/Login.vue"
import Register from "@/components/Register.vue"
const routes = [
  { path: "/", component: HomeView },
  { path: "/about", component: About },
  { path: "/Login", component: Login },
  { path: "/Register", component: Register },
  {
    path: "/post/:id",
    component: () => import("../components/PostDetail.vue"),
    meta: { hideNav: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})


//路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('forum-token')
  
  // 1. 已登录用户不能去登录/注册页
  if ((to.path === '/Login' || to.path === '/Register') && token) {
    return next('/')
  }
  
  // 2. 公开页面：首页、帖子详情、登录、注册，直接放行
  if (to.path === '/' || to.path.startsWith('/post/') || to.path === '/Login' || to.path === '/Register') {
    return next()
  }
  
  // 3. 其他页面（如写帖子）：未登录就跳转登录页
  if (!token) {
    return next('/Login')
  }
  
  // 4. 已登录用户访问其他页面，放行
  next()
})
export default router
