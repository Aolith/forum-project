<script setup>
import { ref, computed ,watch} from "vue"
import { useRouter } from "vue-router"
import { usePostsStore } from "@/stores/post"
import { compressImage } from '@/utils/compressImage'
const postsStore = usePostsStore()
const router = useRouter()

const title = ref("")
const content = ref("")
const category = ref("")
const anonymous = ref(false)
const images = ref([]) 
const showDropdown = ref(false)


const categoryLabel = computed(() => {
  const map = {
    study: '学习交流',
    life: '校园生活',
    trade: '二手交易',
    lost: '失物招领',
    other: '表白墙'
  }
  return map[category.value] || '请选择分区'
})
function selectCategory(value) {
  category.value = value
  showDropdown.value = false
}
//控制成功卡片的显示
const showSuccessCard = ref(false)
//倒计时秒数
const countdown = ref(2)
//提交中状态，防止重复点击
const submitting = ref(false)
async function submit() {
  if (!content.value.trim() || !title.value.trim()) {
    alert("标题和内容不能为空")
    return
  }
  if (!category.value) {
    alert("请选择分区")
    return
  }
  submitting.value = true               // 开始提交，按钮禁用
  try {
    await postsStore.addPost(content.value, title.value, category.value, anonymous.value, images.value)  // 等待后端返回
    
    // === 发帖成功 ===
    content.value = ""                  // 清空输入框
    title.value = ""
    category.value = ""
    anonymous.value = false
    images.value = []
    // 弹出成功卡片
    showSuccessCard.value = true
    countdown.value = 2
    
    // 启动倒计时
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        showSuccessCard.value = false
        router.push('/')               // 自动跳转首页
      }
    }, 1000)
    
  } catch (err) {
    alert('发布失败：' + (err.message || '网络错误，请稍后重试'))
  } finally {
    submitting.value = false           // 恢复按钮
  }
}

function reset() {
  if (confirm("确定清空吗？")) {
    content.value = ""
    title.value = ""
  }
}

watch(category, (newVal) => {
  if (newVal === 'other') {
    anonymous.value = true
  } else {
    anonymous.value = false
  }
})
//图片处理
const uploadingImages = ref(false)

async function handleImages(e) {
  const files = Array.from(e.target.files)
  if (files.length === 0) return

  uploadingImages.value = true
  try {
    // 限制最多 9 张图片
    if (images.value.length + files.length > 9) {
      alert('最多只能上传9张图片')
      return
    }
    for (const file of files) {
      const compressedFile = await compressImage(file)
      const formData = new FormData()
      formData.append('image', compressedFile)

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('forum-token')}`
        },
        body: formData
      })
      const data = await res.json()
      if (!data.url) throw new Error('上传失败')
      images.value.push(data.url)
    }
  } catch (err) {
    alert('图片上传失败：' + err.message)
  } finally {
    uploadingImages.value = false
  }
}


// 图片预览和删除
function previewImage(url) {
  window.open(url, '_blank')
}

function removeImage(index) {
  images.value.splice(index, 1)
}
</script>

<template>
  <div class="write-post">
    <div class="form-card">
      <label class="form-label">帖子分区</label>
      <!-- 自定义下拉 -->
    <div class="custom-select" @click="showDropdown = !showDropdown">
      <span>{{ categoryLabel }}</span>
      <ul v-if="showDropdown">
      <li @click.stop="selectCategory('study')">学习交流</li>
      <li @click.stop="selectCategory('life')">校园生活</li>
      <li @click.stop="selectCategory('trade')">二手交易</li>
      <li @click.stop="selectCategory('lost')">失物招领</li>
      <li @click.stop="selectCategory('other')">表白墙</li>
      </ul>
    </div>
      <!-- 新增：匿名发布勾选框 -->
      <label class="form-label" v-if="category === 'other'">
        <input type="checkbox" v-model="anonymous" /> 匿名发布
      </label>
      <label class="form-label">帖子标题</label>
      <input v-model="title" class="title-input" placeholder="起个吸引人的标题吧..." />

      <label class="form-label">帖子内容</label>
      <textarea v-model="content" class="content-input" placeholder="分享你的想法..."></textarea>

      <label class="form-label">图片（可选）</label>
      <div class="image-upload-area">
        <label class="image-upload-label">
        选择图片
        <input type="file" accept="image/*" multiple @change="handleImages" style="display: none" />
        </label>
      </div>
      <div v-if="images.length" class="image-preview">
        <div v-for="(url, i) in images" :key="i" class="preview-img-wrapper" @click="previewImage(url)">
          <img :src="url" alt="预览图片" />
          <button class="preview-remove" @click.stop="removeImage(i)">✕</button>
        </div>
      </div>

      <div class="form-actions">
        <button 
          @click="submit" 
          class="btn btn-primary" 
          :disabled="submitting"
        >{{ submitting ? '发布中...' : '发布帖子' }}
        </button>
        <button @click="reset" class="btn btn-reset">清空重写</button>
      </div>
    </div>
    <!-- 成功卡片 -->
    <div v-if="showSuccessCard" class="success-overlay">
      <div class="success-card">
        <span class="success-icon">✅</span>
        <p class="success-text">发布成功！</p>
        <p class="success-hint">{{ countdown }}秒后自动返回首页</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 写帖子页面专属样式 */

/* 1. 整体容器：居中，与首页对齐 */
.write-post {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
  min-height: 80vh;
}

/* 2. 表单卡片：白色背景，圆润卡片 */
.form-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-card);
  max-width: 680px;
  margin: 0 auto;
}

/* 3. 标签样式 */
.form-label {
  display: block;
  font-size: var(--font-size-body);
  color: var(--color-text);
  font-weight: 500;
  margin-bottom: var(--space-sm);
  margin-top: var(--space-md);
}

/* 4. 标题输入框 */
.title-input {
  width: 100%;
  padding: var(--space-md);
  font-size: var(--font-size-title);
  background-color: var(--color-primary-light);
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text);
  outline: none;
  box-sizing: border-box;
  transition: background-color var(--transition-fast);
}

.title-input:focus {
  background-color: var(--color-surface);
  box-shadow: 0 0 0 2px var(--color-primary);
}

/* 5. 内容输入框 */
.content-input {
  width: 100%;
  height: 200px;
  padding: var(--space-md);
  font-size: var(--font-size-body);
  background-color: var(--color-primary-light);
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text);
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  transition: background-color var(--transition-fast);
}

.content-input:focus {
  background-color: var(--color-surface);
  box-shadow: 0 0 0 2px var(--color-primary);
}

/* 6. 按钮容器：居中排列 */
.form-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

/* 7. 可爱圆润的按钮 */
.btn {
  padding: var(--space-sm) var(--space-lg);
  border: none;
  border-radius: 20px;
  font-size: var(--font-size-body);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-card-hover);
}

.btn-reset {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.btn-reset:hover {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}
/* ========== 成功卡片样式 ========== */
.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.success-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  text-align: center;
  box-shadow: var(--shadow-card-hover);
  min-width: 250px;
}

.success-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--space-sm);
}

.success-text {
  font-size: var(--font-size-title);
  color: var(--color-text);
  font-weight: 600;
  margin-bottom: var(--space-sm);
}

.success-hint {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
/* 自定义下拉框 */
.custom-select {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-primary-light);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  position: relative;
}

.custom-select ul {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-top: var(--space-xs);
  list-style: none;
  z-index: 10;
  overflow: hidden;
}

.custom-select li {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  margin: var(--space-xs);
  transition: background var(--transition-fast);
  color: var(--color-text-secondary);
}

.custom-select li:hover {
  background: var(--color-primary-light);
}
.custom-select span {
  color: var(--color-text-secondary);
}
/* 匿名复选框美化 */
label:has(input[type="checkbox"]) {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
}

input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

input[type="checkbox"]:checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}
/* 图片上传区域 */
.image-upload-area {
  margin-top: var(--space-sm);
}

.image-upload-label {
  display: inline-block;
  padding: var(--space-xs) var(--space-md);
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.image-upload-label:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.image-preview {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
  margin-top: var(--space-md);
}

.preview-img-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.preview-img-wrapper:hover {
  transform: scale(1.05);
}

.preview-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.preview-img-wrapper:hover .preview-remove {
  opacity: 1;
}
</style>
