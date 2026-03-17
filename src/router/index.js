import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import About from '../components/about.vue'

const routes = [
  { path: '/', component: HelloWorld },
  { path: '/about', component: About },
  { path: '/post/:id', component: () => import('../components/PostDetail.vue') ,meta: { hideNav: true }}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router