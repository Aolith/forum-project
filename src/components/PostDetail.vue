<script setup>
import CommentForm from './CommentForm.vue'
import CommentList from './CommentList.vue'
import LikeButton from './LikeButton.vue';
  import { computed,watch,ref} from 'vue';
  import { useRoute,useRouter } from 'vue-router';
  import { usePostsStore } from '@/stores/post'
  import { useUserStore } from '@/stores/user'
  const userStore = useUserStore()
  const postsStore=usePostsStore()
  const route=useRoute()
  const router=useRouter()
  const post = computed(() => postsStore.posts.find(p => p._id === route.params.id))
  // 在 <script setup> 里，computed 下面
console.log('route.path:', route.path)
console.log('route.params:', route.params)
  function goHome() {
    router.push('/')
  }
  //
  const commentText=ref('')
  //watch监听
 watch(() => post.value?.likes, (newlikes) => {
  if (newlikes && newlikes >= 10) console.log("热门帖子!")
}, { immediate: true })
  //
  const deletePost = postsStore.deletePost
  const likesCount = postsStore.likesCount
  const updatePosts = postsStore.updatePosts
  const addComment=postsStore.addComment
  const deleteComment=postsStore.deleteComment
  const saveComment=postsStore.saveComment
//删除帖子
  function deletes(postId){
    if(confirm("确定要删除吗？")){
      deletePost(postId)
      goHome()
    }
  }

//编辑
const pId=ref(null)
const pText=ref('')
  function updates(postId,postCont){
    pId.value=postId
    pText.value=postCont
  }
//内联编辑
  function savePost(){
    const newContent=pText.value
    if(newContent!==null&&newContent.trim()!==""){
    updatePosts(pId.value,newContent)
    pText.value=''
    pId.value=null
    }
  }
  function cancelPost(){
    pId.value = null
  }
//
  function handleSubmitComment(comment) {
    addComment(post.value._id, comment)      
      // 调用注入的 addComment
  }
  function handleDeleteComment(commentId) {
    deleteComment(post.value._id, commentId)  
      // 调用注入的 deleteComment
  }
  function Like(){
    likesCount(post.value._id)
    //点赞组件
  }
  function handleSaveComment(commentText, comtId) {
    saveComment(post.value._id, comtId, commentText)
       
      // 调用注入的 saveComment
  }
</script>

<template>
  <div class="detail-container">
    <button class="back-btn" @click="goHome">← 回到首页</button>
    
    <div v-if="post" class="post-card">
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
        <CommentForm v-model="commentText" @submit-comment="handleSubmitComment" />
        <CommentList 
          :comments="post.comments" 
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
.post-card {
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
}

.post-card .post-content {
  text-align: center;
  font-size: var(--font-size-body);
  color: var(--color-text);
  line-height: 1.8;
  margin-bottom: var(--space-md);
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

</style>