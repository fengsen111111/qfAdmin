<script setup>
let props = defineProps(['value', 'config'])

</script>

<template>
  <span v-html="props.value"></span>
</template>

<style scoped>

</style>