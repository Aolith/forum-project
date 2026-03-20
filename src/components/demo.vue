<script setup>
import { useCounterStore } from '@/stores/counter';
const counterStore=useCounterStore()
</script>

<template>
<button @click="counterStore.increment">{{ counterStore.count }}</button>
</template>

<style scoped>

</style>