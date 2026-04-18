import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import About from '../components/about.vue'
import demo from '@/components/demo.vue'
import Login from '@/components/Login.vue'
import Register from '@/components/Register.vue'
const routes = [
  { path: '/', component: HelloWorld },
  { path: '/about', component: About },
  { path: '/demo', component: demo },
  { path: '/Login',component:Login},
  { path: '/Register',component:Register},
  { path: '/post/:id', component: () => import('../components/PostDetail.vue') ,meta: { hideNav: true }}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router