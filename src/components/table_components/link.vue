<script setup>
import {inject} from 'vue'

const global = inject('global').value
let props = defineProps(['value', 'structure', 'rowValue', 'id'])
</script>

<template>
  <a :href="props.value" target="_blank">{{ props.value }}</a>
</template>

<style scoped>

</style>