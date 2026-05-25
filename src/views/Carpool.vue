<script setup>
import { ref ,onMounted} from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 定义变量
const destination = ref('')
const departureTime= ref('')
const carpools = ref([])
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
    alert('发布失败，请稍后再试')
  }
}
//取消拼车
async function cancel(carpoolId) {
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

//格式化时间
function formatTime(time) {
  const d = new Date(time)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 172800000) return '昨天'
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <!-- 拼车功能开发中 -->
  <div class="container-publish">
    <ul>
      <li><label ><input type="datetime-local" v-model="departureTime"></label></li>
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
  <div class="container-card"></div>
  <!--拼成功了，显示拼车信息-->
  <div class="container-list">
    <div v-if="carpools.length === 0">暂无匹配的拼车信息</div>
    <div v-else v-for="item in carpools" :key="item._id" class="carpool-card">
      <p>用户：{{ item.user?.username }}</p>
      <p>出发时间：{{ formatTime(item.departureTime) }}</p>
      <p>目的地：{{ destinationMap[item.destination] || item.destination }}</p>
      <button @click="applyCarpool(item._id)">申请拼车</button>
      <!-- 如果是自己发布的，显示取消按钮 -->
      <button v-if="isOwner(item)" @click="cancel(item._id)">取消订单</button>
    </div>
  </div>
</template>

<style scoped>
li{
  list-style: none;
}
.container-publish{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

</style>