<script setup>
import {inject, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['structure'])
const component_state = reactive({})
</script>
<template>
  <a-select
      ref="select"
      v-model:value="props.structure.value"
      style="width:100%"
  >
    <a-select-option value="">{{global.findLanguage('请选择...')}}</a-select-option>
    <a-select-option v-for="(option,index) in props.structure.config.values" :value="option.value">
      <span v-html="global.findLanguage(option.label)"></span>
    </a-select-option>
  </a-select>
</template>

<style scoped>

</style>