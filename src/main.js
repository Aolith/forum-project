import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'        // 如果你用了路由
import './global.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)      // 如果用了路由
app.mount('#app')
