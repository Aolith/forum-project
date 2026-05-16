import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"

const routes = [
  { path: "/", component: HomeView },
  { path: "/write", component: () => import("../views/WritePost.vue") },  // 懒加载
  { path: "/Login", component: () => import("../views/Login.vue") },  // 懒加载
  { path: "/Register", component: () => import("../views/Register.vue") },  // 懒加载
  { path: "/Profile", component: () => import("../views/Profile.vue") },
  { path: '/admin', component: () => import('../views/Admin.vue') },
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
