<script setup>
import { ref } from "vue"
import { useRouter,useRoute } from "vue-router"
import { useUserStore } from "@/stores/user"

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const signature = ref(userStore.currentUser?.signature || "")
const editing = ref(false)

const showFeedback = ref(false)
const feedbackText = ref("")

const uploadingAvatar = ref(false)
const fileInput = ref(null)

const wechat = ref(userStore.currentUser?.wechat || '')
const showWechat = ref(userStore.currentUser?.showWechat || false)

function triggerUpload() {
  fileInput.value.click()
}

async function handleAvatarUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  uploadingAvatar.value = true
  try {
    // 1. 从后端获取签名
    const res = await fetch('/api/upload/upload-signature')
    const { timestamp, signature: uploadSignature, cloudName } = await res.json()

    // 2. 构建 FormData，直传 Cloudinary
    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', '964427695737617') 
    formData.append('timestamp', timestamp)
    formData.append('signature', uploadSignature)
    formData.append('folder', 'forum/avatars')

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    })
    const data = await uploadRes.json()
    console.log('Cloudinary 返回:', data)

    if (!data.secure_url) throw new Error('上传失败')

    // 3. 更新用户头像
    await userStore.updateProfile({ avatar: data.secure_url })
    alert('头像更新成功！')
  } catch (err) {
    alert('头像上传失败：' + err.message)
  } finally {
    uploadingAvatar.value = false
  }
}
async function saveProfile() {
  if (signature.value.length > 50) {
    alert("签名不能超过50个字")
    return
  }
  const result = await userStore.updateProfile({
    signature: signature.value,
    wechat: wechat.value,
    showWechat: showWechat.value
  })
  if (result.success) {
    editing.value = false
    alert("修改成功")
  } else {
    alert("修改失败：" + result.msg)
  }
}

function logout() {
  if (confirm("确认退出登录吗？")) {
    userStore.logout()
    router.push("/")
  }
}

async function submitFeedback() {
  if (!feedbackText.value.trim()) {
    alert("建议内容不能为空")
    return
  }
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: feedbackText.value })
    })
    if (!res.ok) throw new Error("提交失败")
    alert("感谢你的建议！")
    showFeedback.value = false
    feedbackText.value = ""
  } catch (err) {
    alert("提交失败：" + err.message)
  }
}

</script>

<template>
  <main class="profile-page">
    <article class="profile-card">
      <!-- 头像：居中 -->
      <figure class="avatar-section" @click="triggerUpload">
        <img :src="userStore.currentUser?.avatar || '/default-avatar.png'" alt="头像" />
        <input type="file" accept="image/*" @change="handleAvatarUpload" ref="fileInput" style="display: none" />
        <div class="avatar-overlay" v-if="!uploadingAvatar">更换头像</div>
        <div class="avatar-overlay" v-else>上传中...</div>
      </figure>

      <!-- 姓名：头像下面 -->
      <dl class="info-row">
        <dt>姓名</dt>
        <dd>
        {{ userStore.currentUser?.name  }}
        </dd>
      </dl>

      <!-- 签名：大框 -->
      <dl class="info-row">
        <dt>签名</dt>
        <dd>
          <textarea v-if="editing" v-model="signature" class="signature-input" maxlength="50" ></textarea>
          <span v-else>{{ signature || "未设置" }}</span>
        </dd>
      </dl>

      <!-- 微信号 -->
      <dl class="info-row">
        <dt>微信号</dt>
        <dd>
          <input v-if="editing" v-model="wechat" placeholder="选填，用于二手交易联系" maxlength="30" />
          <span v-else>
          {{ wechat 
            ? (route.params.userId && route.params.userId !== userStore.currentUser?._id 
            ? wechat.slice(0, 2) + '****' + wechat.slice(-2) 
            : wechat) 
            : '未设置' 
          }}
          </span>
        </dd>
      </dl>
      <label class="wechat-toggle" v-if="editing">
        <input type="checkbox" v-model="showWechat" /> 在二手交易帖子中显示微信号
      </label>
      <p v-if="editing" class="wechat-hint">仅自己可见，他人查看时显示为星号</p>
      <!-- 提建议 -->
      <div class="feedback-trigger" @click="showFeedback = true">
        <span>💬 提建议</span>
      </div>
      <!-- 提建议弹窗 -->
      <div v-if="showFeedback" class="feedback-overlay" @click.self="showFeedback = false">
        <div class="feedback-card">
          <p class="feedback-title">提建议</p>
          <textarea v-model="feedbackText" placeholder="你的建议…" maxlength="200"></textarea>
          <div class="feedback-actions">
            <button @click="submitFeedback">提交</button>
            <button @click="showFeedback = false">取消</button>
          </div>
        </div>
      </div>
      <!-- 管理后台 -->
      <router-link v-if="userStore.currentUser?.role === 'admin'" to="/admin" class="btn-admin">管理后台</router-link>

      <!-- 操作按钮 -->
      <footer class="actions">
        <button v-if="editing" class="btn-save" @click="saveProfile">保存</button>
        <button class="btn-edit" @click="editing = !editing">{{ editing ? '取消' : '编辑资料' }}</button>
        <button class="btn-logout" @click="logout">退出登录</button>
      </footer>
    </article>
  </main>
</template>

<style scoped>
.profile-page {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-lg);
}

.profile-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-card);
}

.avatar-section img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-primary);
  margin-bottom: var(--space-md);
}

.info-row dd {
  margin: 0;
}
.info-row {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-md);
}

.info-row dt {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
}



.actions {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.actions button {
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: var(--font-size-small);
  transition: all var(--transition-fast);
}

.actions button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 签名输入框：大框 */
.signature-input {
  width: 100%;
  height: 80px;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-body);
  resize: vertical;
  outline: none;
  text-align: center;
  /* 文本换行——防溢出 */
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  overflow: hidden;
}

/* 编辑资料按钮：蓝底白字 */
.btn-edit {
  background: var(--color-primary) !important;
  color: white !important;
  border: none !important;
}

.btn-edit:hover {
  background: var(--color-primary-dark) !important;
}

/* 退出登录按钮：红色边框 */
.btn-logout {
  border-color: #e74c3c !important;
  color: #e74c3c !important;
}

.btn-logout:hover {
  background: #fde8e8 !important;
  color: #e74c3c !important;
}

/* 保存按钮 */
.btn-save {
  background: var(--color-primary) !important;
  color: white !important;
  border: none !important;
}

.btn-save:hover {
  background: var(--color-primary-dark) !important;
}

.btn-admin {
  display: inline-block;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-primary);
  background: var(--color-surface);
  color: var(--color-primary);
  text-decoration: none;
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: var(--space-sm);
}

.btn-admin:hover {
  background: var(--color-primary);
  color: white;
}
/*提建议*/
.feedback-trigger {
  margin-bottom: var(--space-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
  opacity: 0.6;
  transition: opacity var(--transition-fast);
}
.feedback-trigger:hover { opacity: 1; color: var(--color-primary); }

.feedback-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.3);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}
.feedback-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: var(--shadow-card);
}
.feedback-title {
  font-size: var(--font-size-body);
  color: var(--color-text);
  margin-bottom: var(--space-md);
}
.feedback-card textarea {
  width: 100%;
  height: 100px;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-body);
  resize: vertical;
  outline: none;
}
.feedback-actions {
  display: flex; justify-content: center; gap: var(--space-sm);
  margin-top: var(--space-md);
}
.feedback-actions button {
  padding: var(--space-xs) var(--space-md);
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: var(--font-size-small);
  transition: all var(--transition-fast);
}
.feedback-actions button:first-child {
  background: var(--color-primary);
  color: white;
  border: none;
}
.feedback-actions button:first-child:hover {
  background: var(--color-primary-dark);
}

/*头像样式*/
.avatar-section {
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-md);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 80px;
  height: 80px;
  background: rgba(0,0,0,0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: var(--font-size-small);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.avatar-section:hover .avatar-overlay {
  opacity: 1;
}

/* 微信号输入框 */
.info-row input {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-body);
  text-align: center;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color var(--transition-fast);
}

.info-row input:focus {
  border-color: var(--color-primary);
  background: var(--color-surface);
}
/* 微信号隐私开关 */
.wechat-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  cursor: pointer;
  margin-top: var(--space-xs);
  margin-bottom: var(--space-sm);
}

.wechat-toggle input[type="checkbox"] {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-bg);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  flex-shrink: 0;
}

.wechat-toggle input[type="checkbox"]:checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.wechat-toggle input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 11px;
  font-weight: bold;
}
.wechat-hint {
  font-size: 11px;
  color: var(--color-text-secondary);
  opacity: 0.5;
  text-align: center;
  margin-top: 2px;
  margin-bottom: var(--space-xs);
}
</style>