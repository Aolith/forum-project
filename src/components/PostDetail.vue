<script setup>
import CommentForm from "./CommentForm.vue"
import CommentList from "./CommentList.vue"
import LikeButton from "./LikeButton.vue"
import { computed, watch, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { usePostsStore } from "@/stores/post"
import { useUserStore } from "@/stores/user"
const userStore = useUserStore()
const postsStore = usePostsStore()
const route = useRoute()
const router = useRouter()
const post = computed(() => postsStore.posts.find((p) => p._id === route.params.id))
// 在 <script setup> 里，computed 下面
console.log("route.path:", route.path)
console.log("route.params:", route.params)
function goHome() {
  router.back()
}
//
//watch监听
watch(
  () => post.value?.likes,
  (newlikes) => {
    if (newlikes && newlikes >= 10) console.log("热门帖子!")
  },
  { immediate: true },
)
//
const deletePost = postsStore.deletePost
const likesCount = postsStore.likesCount
const updatePosts = postsStore.updatePosts
const deleteComment = postsStore.deleteComment
const saveComment = postsStore.saveComment
//删除帖子
function deletes(postId) {
  if (confirm("确定要删除吗？")) {
    deletePost(postId)
    goHome()
  }
}

//编辑
const pId = ref(null)
const pText = ref("")
function updates(postId, postCont) {
  pId.value = postId
  pText.value = postCont
}
//内联编辑
function savePost() {
  const newContent = pText.value
  if (newContent !== null && newContent.trim() !== "") {
    updatePosts(pId.value, newContent)
    pText.value = ""
    pId.value = null
  }
}
function cancelPost() {
  pId.value = null
}
//删除评论
function handleDeleteComment(commentId) {
  deleteComment(post.value._id, commentId)
  // 调用注入的 deleteComment
}
function Like() {
  likesCount(post.value._id)
  //点赞组件
}
function handleSaveComment(commentText, comtId) {
  saveComment(post.value._id, comtId, commentText)

  // 调用注入的 saveComment
}
//举报帖子
async function reportPost() {
  if (!confirm('确认举报此帖子吗？')) return
  try {
    const res = await fetch(`/api/posts/${post.value._id}/report`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('forum-token')}`
      }
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }
    alert('举报成功，管理员将处理此帖子')
  } catch (err) {
    alert('举报失败：' + err.message)
  }
}
</script>

<template>
  <div class="detail-container">
    <button class="back-btn" @click="goHome">← 回到首页</button>

    <div v-if="post" class="post-card">
      <button 
        v-if="userStore.currentUser && String(post.author?._id) !== String(userStore.currentUser?._id)"
        class="btn-report"
        @click="reportPost"
      >举报</button>
      <!-- 内联编辑模式 -->
      <div v-if="post._id == pId">
        <h2>{{ post.title }}</h2>
        <textarea v-model="pText"></textarea>
        <div class="post-actions">
          <button @click="savePost">保存</button>
          <button @click="cancelPost">取消</button>
        </div>
      </div>

      <!-- 正常展示模式 -->
      <div v-else>
        <h2>{{ post.title }}</h2>
        <p class="post-content">{{ post.content }}</p>
        <div class="post-actions">
          <template v-if="post.author?._id === userStore.currentUser?._id">
            <button @click="updates(post._id, post.content)">编辑帖子</button>
            <button @click="deletes(post._id)">删除帖子</button>
          </template>
          <LikeButton
            @like="Like"
            :likes="post.likes"
            :likedBy="post.likedBy"
            :currentUserId="userStore.currentUser?._id"
          />
        </div>
      </div>

      <!-- 评论区 -->
      <div class="comment-section">
        <!-- 已登录用户显示评论输入框 -->
        <CommentForm
          v-if="userStore.currentUser"
          :postId="post._id"
        />
        <!-- 游客模式：整张卡片可点击，跳转登录页 -->
        <router-link to="/Login" v-else class="login-card">
          <span class="card-icon">💬</span>
          <div class="card-text">
            <strong>参与讨论</strong>
            <span>登录后即可发表评论</span>
          </div>
          <span class="card-arrow">→</span>
        </router-link>
        <CommentList
          :comments="post.comments"
          :postId="post._id" 
          :postAuthorId="post.author?._id"
          :currentUserId="userStore.currentUser?._id"
          @delete-comment="handleDeleteComment"
          @save-comment="handleSaveComment"
        />
      </div>

    </div>

    <div v-else>
      <p>帖子不存在!</p>
    </div>
  </div>
</template>

<style scoped>
.detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-lg);
}

/* 回到首页按钮 */
.back-btn {
  margin-bottom: var(--space-md);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.back-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 帖子卡片 */
/* 帖子卡片 */
.post-card {
  position: relative;
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-card);
}

.post-card h2 {
  text-align: center;
  font-size: 22px;
  color: var(--color-text);
  margin-bottom: var(--space-md);
  /* 文本换行——防溢出 */
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  overflow: hidden;
}

.post-card .post-content {
  text-align: center;
  font-size: var(--font-size-body);
  color: var(--color-text);
  line-height: 1.8;
  margin-bottom: var(--space-md);
  /* 文本换行——防溢出 */
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  overflow: hidden;
}
/* 操作按钮区 */
.post-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.post-actions button {
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.post-actions button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 评论区容器 */
.comment-section {
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

/* 内联编辑的 textarea */
textarea {
  width: 100%;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-body);
  resize: vertical;
  outline: none;
}
textarea:focus {
  border-color: var(--color-primary);
}
/* 游客登录提示 */
.login-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  margin: var(--space-sm) 0;
  background: var(--color-primary);
  border-radius: var(--radius-md);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.login-card:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.card-icon {
  font-size: 2rem;
}

.card-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-text strong {
  font-size: var(--font-size-body);
  color: #fff;
}

.card-text span {
  font-size: var(--font-size-small);
  color: rgba(255, 255, 255, 0.85);
}

.card-arrow {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
}
/* 举报按钮 */
.btn-report {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-text-secondary);
  font-size: 12px;
  cursor: pointer;
  opacity: 0.35;
  transition: all var(--transition-fast);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.btn-report:hover {
  opacity: 1;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  background: rgba(231, 76, 60, 0.08);
}

.btn-report:focus-visible {
  opacity: 1;
  outline: 2px solid #e74c3c;
  outline-offset: 1px;
}
</style>
