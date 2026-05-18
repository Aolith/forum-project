import { defineStore } from "pinia"
import { ref, watch } from "vue"

export const usePostsStore = defineStore("post", () => {
  const STORAGE_KEY = "forum-posts"
  const posts = ref([]) // 初始为空，不从缓存恢复
  // 初始化：从数据库拉取
  async function fetchPosts(category, sort) {
    try {
      let url = '/api/posts'
      const params = []
      if (category) params.push(`category=${category}`)
      if (sort) params.push(`sort=${sort}`)
      if (params.length) url += '?' + params.join('&')

      const res = await fetch(url)
      if (!res.ok) throw new Error("获取帖子失败")
      const data = await res.json()
      posts.value = data
    } catch (err) {
      console.error("从数据库获取帖子失败，尝试降级到本地缓存:", err)
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        try {
          posts.value = JSON.parse(cached)
          console.log("已从本地缓存恢复数据")
        } catch (parseErr) {
          console.error("本地缓存数据损坏，恢复失败", parseErr)
        }
      } else {
        console.warn("没有可用的本地缓存，首页为空")
      }
    }
  }
  
  fetchPosts('', 'hot')

  //watch持久化
  watch(
    posts,
    (newPosts) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts))
    },
    { deep: true },
  )

  // 添加帖子的方法

  let isAddingPost = false
  async function addPost(content, title, category,anonymous,images) {
    if (isAddingPost) return// 防止重复提交
    isAddingPost = true
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("forum-token")}`,
        },
        body: JSON.stringify({ content, title,category,anonymous,images }), // 只传 content，因为 title 后端固定
      })
      if (!res.ok) {
        const errorData = await res.json()
        console.error("后端报错：", errorData.error)
        throw new Error(errorData.error || "新增失败")
      }
      const newPost = await res.json()
      posts.value.unshift(newPost)
      return newPost   // 把新帖子对象返回给调用方
    } catch (err) {
      console.error("新增帖子失败：", err)
      throw err        // 把错误重新抛出，让组件能捕获
    } finally {
      isAddingPost = false // 解锁
    }
  }


  //删除帖子
  async function deletePost(id) {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("forum-token")}`,
        },
        //delete没有请求体
      })
      if (!res.ok) {
        const errorData = await res.json()
        console.error("后端报错：", errorData.error)
        throw new Error(errorData.error || "删除失败")
      }
      const deletedPost = await res.json()
      posts.value = posts.value.filter((p) => p._id !== deletedPost._id)
    } catch (err) {
      console.error("删除帖子失败", err)
    }
  }

  //编辑帖子
  async function updatePosts(id, newContent) {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("forum-token")}`,
        },
        body: JSON.stringify({ content: newContent }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        console.error("后端报错：", errorData.error)
        throw new Error(errorData.error || "编辑失败")
      }
      const updatedPost = await res.json()
      posts.value = posts.value.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    } catch (err) {
      console.error("编辑帖子失败", err)
    }
  }

  let isLiking = false // 防抖锁，定义在 store 外面，被 likesCount 闭包
  //点赞帖子
  async function likesCount(id) {
    //如果正在点赞中，直接返回，不执行后续请求
    if (isLiking) return

    isLiking = true //上锁
    try {
      const res = await fetch(
        `/api/posts/${id}/likes`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("forum-token")}`,
          },
        },
      )
      if (!res.ok) {
        const errorData = await res.json()
        console.error("后端报错：", errorData.error)
        throw new Error(errorData.error || "点赞失败")
      }
      const updatedPost = await res.json()
      posts.value = posts.value.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    } catch (err) {
      console.error("点赞帖子失败", err)
    } finally {
      isLiking = false //解锁
    }
  }

  //提交评论
  async function addComment(postId, body) {
    try {
      const requestBody = typeof body === 'string' 
        ? { comment: body } 
        : body
      const res = await fetch(
        `/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("forum-token")}`,
          },
          body: JSON.stringify(requestBody),
        },
      )
      if (!res.ok) {
        const errorData = await res.json()
        console.error("后端报错：", errorData.error)
        throw new Error(errorData.error || "提交失败")
      }
      const updatedPost = await res.json()
      posts.value = posts.value.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    } catch (err) {
      console.error("提交评论失败", err)
      throw err
    }
  }

  //删除评论
  async function deleteComment(postId, commentId) {
    try {
      const res = await fetch(
        `/api/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("forum-token")}`,
          },
        },
      )
      if (!res.ok) {
        const errorData = await res.json()
        console.error("后端报错：", errorData.error)
        throw new Error(errorData.error || "删除失败")
      }
      const updatedPost = await res.json()
      posts.value = posts.value.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    } catch (err) {
      console.error("删除评论失败", err)
    }
  }

  //保存编辑评论
  async function saveComment(postId, commentId, comment) {
    try {
      const res = await fetch(
        `/api/posts/${postId}/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("forum-token")}`,
          },
          body: JSON.stringify({ comment }),
        },
      )
      if (!res.ok) {
        const errorData = await res.json()
        console.error("后端报错：", errorData.error)
        throw new Error(errorData.error || "编辑失败")
      }
      const updatedPost = await res.json()
      posts.value = posts.value.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    } catch (err) {
      console.error("编辑评论失败", err)
    }
  }

// 分页加载更多帖子
let currentPage = 1
let isLoadingMore = false  // 防并发锁

async function loadMorePosts(sort, category) {
  if (isLoadingMore) return  // 锁
  isLoadingMore = true
  
  currentPage++
  try {
    const params = [`page=${currentPage}`, 'limit=10']
    if (sort) params.push(`sort=${sort}`)
    if (category) params.push(`category=${category}`)
    const res = await fetch(`/api/posts?${params.join('&')}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('forum-token')}`,
      },
    })
    if (!res.ok) throw new Error("加载更多帖子失败")
    const newPosts = await res.json()
    posts.value = [...posts.value, ...newPosts]
  } catch (err) {
    console.error("加载更多帖子失败", err)
    currentPage--
  } finally {
    isLoadingMore = false  // 解锁
  }
}
function resetPage() {
  currentPage = 1
}

  return {
    posts,
    fetchPosts, 
    addPost,
    deletePost,
    likesCount,
    updatePosts,
    addComment,
    deleteComment,
    saveComment,
    loadMorePosts,
    resetPage,
  }
})
