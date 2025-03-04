<script setup>
import {inject, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['src'])
function show_video() {
  global.videoState.isCollapse = true
  global.videoState.options.src = props.src
}
</script>
<template>

  <a v-if="props.src.length > 0" class="ant-dropdown-link" href="javascript:;" @click="show_video">
    {{global.findLanguage('查看')}}
  </a>


</template>

<style scoped>

</style>