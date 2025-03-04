<script setup>
import {inject} from 'vue'
import PlayMedia from '@/components/other_components/play-media.vue'

const global = inject('global').value
let props = defineProps(['value', 'structure', 'rowValue', 'id'])

</script>


<template>
  <play-media v-if="props.value" :src="props.value"></play-media>
</template>


<style scoped>

</style>