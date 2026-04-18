import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import HelloWorld from '../components/HelloWorld.vue'
import About from '../components/about.vue'
import Login from '@/components/Login.vue'
import Register from '@/components/Register.vue'
const routes = [
  { path: '/', component: HelloWorld, meta: { requiresAuth: true }},
  { path: '/about', component: About, meta: { requiresAuth: true }},
  { path: '/Login',component:Login},
  { path: '/Register',component:Register},
  { path: '/post/:id', component: () => import('../components/PostDetail.vue') ,meta: { hideNav: true }}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
//路由守卫
router.beforeEach((to, _, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.currentUser) {
    next('/Login')
  } else {
    next()
  }
})
export default router