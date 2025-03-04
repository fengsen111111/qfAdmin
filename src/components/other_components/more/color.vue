<script setup>
import {inject} from 'vue'

const global = inject('global').value
let props = defineProps(['value', 'config'])
</script>

<template>
  <div style='width: 60px;height: 100%;' :style="{backgroundColor:props.value}">&nbsp;</div>
</template>

<style scoped>

</style>