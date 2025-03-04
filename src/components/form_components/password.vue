<script setup>
import {inject, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['structure'])
const component_state = reactive({})
</script>

<template>
  <a-input-password v-model:value="props.value" :placeholder="global.findLanguage('请输入密码')"/>
</template>


<style scoped>

</style>