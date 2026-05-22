<script setup>
import { computed } from 'vue'
import CommentItem from './CommentItem.vue'

const props = defineProps({
  comments: Array,
  postId: String,
  postAuthorId: String,
  currentUserId: String,
})

const emit = defineEmits(['delete-comment', 'save-comment', 'reply'])

const nestedComments = computed(() => {
  const map = {}
  const roots = []

  props.comments.forEach(c => {
    map[c._id] = { ...c, children: [] }
  })

  props.comments.forEach(c => {
    if (c.replyToCommentId && map[c.replyToCommentId]) {
      map[c.replyToCommentId].children.push(map[c._id])
    } else {
      roots.push(map[c._id])
    }
  })

  return roots
})
</script>

<template>
  <CommentItem
    v-for="c in nestedComments"
    :key="c._id"
    :comment="c"
    :depth="0"
    :postId="postId"
    :postAuthorId="postAuthorId"
    :currentUserId="currentUserId"
    @delete-comment="$emit('delete-comment', $event)"
    @save-comment="(commentText, commentId) => emit('save-comment', commentText, commentId)"
    @reply="(commentId, authorId, authorName) => emit('reply', commentId, authorId, authorName)"
  />
</template>