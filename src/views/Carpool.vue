<script setup>
import { ref ,onMounted,computed} from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 定义变量
const destination = ref('')
const now = new Date()
const offset = now.getTimezoneOffset() * 60000
const localNow = new Date(now - offset).toISOString().slice(0, 16)
const departureTime = ref(localNow)
const minTime = localNow // 新增 minTime，值和默认值一样，但不会变
const carpools = ref([])
const myCarpool = computed(() => carpools.value.find(item => isOwner(item)))
const destinationMap = {
  nanchang_station: '南昌站',
  nanchang_south: '南昌南站',
  nanchang_west: '南昌西站',
  nanchang_east: '南昌东站',
  changbei_airport: '昌北机场'
}

function isOwner(carpool) {
  return carpool.user?._id === userStore.currentUser?._id
}
//发布拼车信息
async function publish(){
  try{
    const res = await fetch('/api/carpool',{
      method: 'POST',
      headers:{
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('forum-token')}`
      },
      body:JSON.stringify({destination:destination.value,departureTime:departureTime.value})
    })
    if (res.ok) {
      alert('发布成功')
      match()
      destination.value = ''
      departureTime.value = ''
    } else {
      const data = await res.json()
      throw new Error(data.error || '发布失败')
    }
  }catch(err){
    alert(err.message || '发布失败，请稍后再试')
  }
}
//取消拼车
async function cancel(carpoolId) {
  if (!confirm('确定要取消这个拼车订单吗？')) return 
  try {
    const res = await fetch(`/api/carpool/${carpoolId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('forum-token')}`
      }
    })
    if (res.ok) {
      alert('取消成功')
      match() // 取消后刷新列表
    } else {
      const data = await res.json()
      throw new Error(data.error || '取消失败')
    }
  } catch (err) {
    alert(err.message || '取消失败，请稍后再试')
  }
}
//匹配拼车信息
async function match(){
  try{
    const res = await fetch('/api/carpool',{
      method: 'GET',
      headers:{
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('forum-token')}`
      }
    })
    if (res.ok) {
      carpools.value = await res.json()
    } else {
      const data = await res.json()
      throw new Error(data.error || '匹配失败')
    }
  }catch(err){
    alert('匹配失败，请稍后再试')
  }
}
//发布成功和进入页面自动调用一次
onMounted(()=>{
  match()
})

//申请拼车
async function applyCarpool(carpoolId) {
  console.log('申请拼车', carpoolId)
  // 后续调用 POST /api/carpool/:id/apply
}

// 格式化出发时间（只显示具体时间，不用相对时间）
function formatDepartureTime(time) {
  const d = new Date(time)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <!-- 拼车功能开发中 -->
  <div class="container-publish">
    <ul>
      <li>
        <label>出发时间</label>
        <input type="datetime-local" v-model="departureTime" :min="minTime" @click="(e) => e.target.showPicker?.()"/>
      </li>
      <li><label><select name="" id="" v-model="destination">
        <option value="">请选择目的地</option>
        <option value="nanchang_station">南昌站</option>
        <option value="nanchang_south">南昌南站</option>
        <option value="nanchang_west">南昌西站</option>
        <option value="nanchang_east">南昌东站</option>
        <option value="changbei_airport">昌北机场</option>
      </select></label></li>
      <li><button @click="publish">立即拼车</button></li>
    </ul>
  </div>
  <!-- 拼车订单等待中 -->
    <!-- 我的订单 -->
  <div v-if="myCarpool" class="my-order-section">
    <h3>我的订单</h3>
    <div class="carpool-card">
      <p>目的地：{{ destinationMap[myCarpool.destination] || myCarpool.destination }}</p>
      <p>出发时间：{{ formatDepartureTime(myCarpool.departureTime) }}</p>
      <button class="cancel-btn" @click="cancel(myCarpool._id)">取消订单</button>
    </div>
  </div>

  <!-- 匹配列表 -->
  <div class="container-list">
    <!-- 等待中 -->
    <div v-if="myCarpool && carpools.length === 1" class="waiting-card">
      正在等待其他拼友...
    </div>
    <!-- 无匹配 -->
    <div v-else-if="carpools.length === 0">暂无匹配的拼车信息</div>
    <!-- 匹配列表（排除自己） -->
    <div v-else v-for="item in carpools.filter(i => !isOwner(i))" :key="item._id" class="carpool-card">
      <p>用户：{{ item.user?.name }}</p>
      <p>出发时间：{{ formatDepartureTime(item.departureTime) }}</p>
      <p>目的地：{{ destinationMap[item.destination] || item.destination }}</p>
      <button class="apply-btn" @click="applyCarpool(item._id)">申请拼车</button>
    </div>
  </div>
</template>

<style scoped>

li {
  list-style: none;
}

/* ========== 发布表单卡片 ========== */
.container-publish {
  max-width: 600px;
  margin: 0 auto var(--space-lg);
  padding: var(--space-lg);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.container-publish ul {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: 0;
}

.container-publish li {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.container-publish label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.container-publish input:not([type="datetime-local"]),
.container-publish select {
  min-height: 50px;
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-body);
  outline: none;
  transition: border-color var(--transition-fast);
  box-sizing: border-box;
}

.container-publish input:not([type="datetime-local"]):focus,
.container-publish select:focus {
  border-color: var(--color-primary);
  background: var(--color-surface);
}


.container-publish button {
  padding: var(--space-sm) var(--space-lg);
  border-radius: 20px;
  border: none;
  background: var(--color-primary);
  color: white;
  font-size: var(--font-size-body);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.container-publish button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-card-hover);
}

.container-publish input[type="datetime-local"] {
  width: 100%;
  min-height: 50px;
  padding: 0 var(--space-md);
  box-sizing: border-box;
}

/* ========== 拼车列表 ========== */
.container-list {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.carpool-card {
  padding: var(--space-lg) var(--space-md); /* 上下比左右大 */
  gap: var(--space-sm); 
  box-shadow:
    0 1px 2px rgba(0,0,0,0.12),   /* 紧贴的边缘，模拟厚度 */
    0 4px 16px rgba(0,0,0,0.06);  /* 扩散的虚影，模拟悬浮 */
  background: var(--color-surface);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  transition: box-shadow var(--transition-fast);
  align-items: flex-start;
  text-align: left;
}

.carpool-card:hover {
   box-shadow:
    0 2px 4px rgba(0,0,0,0.16),
    0 8px 24px rgba(0,0,0,0.08);
  transform: translateY(-2px); /* 轻微上浮 */
}

.carpool-card p {
  text-align: left;
  font-size: var(--font-size-body);
  color: var(--color-text);
  margin: 0;
}

.carpool-card p:first-child {
  font-weight: 500;
  color: var(--color-primary);
}

.carpool-card button {
  align-self: flex-end;
  padding: var(--space-xs) var(--space-md);
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.carpool-card button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}


/* ========== 空状态 ========== */
.container-list > div:first-child {
  text-align: center;
  padding: var(--space-lg);
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
}

.my-order-section {
  max-width: 600px;
  margin: 0 auto var(--space-md);
}

.waiting-card {
  text-align: center;
  padding: var(--space-lg);
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
}

/* 申请按钮绿色 */
.carpool-card .apply-btn {
  border-color: #27ae60;
  color: #27ae60;
  background: var(--color-surface);
}

.carpool-card .apply-btn:hover {
  background: #e6f9e6;
  border-color: #1e8449;
  color: #1e8449;
}
/* 取消按钮红色 */
.carpool-card .cancel-btn {
  border-color: #e74c3c;
  color: #e74c3c;
  background: var(--color-surface);
}

.carpool-card .cancel-btn:hover {
  background: #fde8e8;
  border-color: #c0392b;
  color: #c0392b;
}
</style>