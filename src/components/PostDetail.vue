<script setup>
import CommentForm from './CommentForm.vue'
import CommentList from './CommentList.vue'
import LikeButton from './LikeButton.vue';
  import { computed,watch,ref} from 'vue';
  import { useRoute,useRouter } from 'vue-router';
  import { usePostsStore } from '@/stores/post'
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
  <button @click="goHome">回到首页</button>
  <div v-if="post" class="post">
      <div v-if="post._id == pId">
        <h2>{{ post.title }}</h2>
        <textarea v-model="pText"></textarea>
        <button @click="savePost">保存</button>
        <button @click="cancelPost">取消</button>
      </div>
      <div v-else>
        <h2>{{ post.title }}</h2>
        <p>{{ post.content }}</p>
        <button @click="updates(post._id, post.content)">编辑帖子</button>
        <button @click="deletes(post._id)">删除帖子</button>
        <LikeButton @like="Like" :likes="post.likes"/>
      </div>
      <div  class="comment" >
        <CommentForm v-model="commentText"  @submit-comment="handleSubmitComment"  />
        <CommentList :comments="post.comments" @delete-comment="handleDeleteComment" @save-comment="handleSaveComment" />
      </div>  
    </div>
  <div v-else>
    <p>帖子不存在!</p>
  </div>
</template>

<style scoped>
  .post p,
  .post h2 {
  text-align: center;
  margin-top: 10px;
}

textarea {
  resize: none;
  display:block;
  overflow: auto;
  height: 50px;
  width: 200px;
  margin-bottom: 10px;
}


</style>