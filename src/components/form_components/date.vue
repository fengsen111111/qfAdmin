<script setup>
import {inject, onBeforeMount, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['structure'])
const component_state = reactive({
  valueFormat: 'YYYY-MM-DD',
  showTime: true,
  placeholder: global.findLanguage('请选择日期'),
})
onBeforeMount(() => {
  if (props.structure.config) {
    if (props.structure.config.placeholder)
      component_state.placeholder = props.structure.config.placeholder
    if (props.structure.config.valueFormat)
      component_state.valueFormat = props.structure.config.valueFormat
    if (props.structure.config.valueFormat === 'YYYY-MM-DD')
      component_state.showTime = false
  }
})

</script>

<template>
  <a-date-picker
      v-model:value="props.structure.value"
      :placeholder="component_state.placeholder"
      :show-time="component_state.showTime"
      :valueFormat="component_state.valueFormat"
      style="width: 100%"/>

</template>

<style scoped>

</style>