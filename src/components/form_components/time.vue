<script setup>
import {inject, onBeforeMount, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['structure'])
const component_state = reactive({
  value: '',
  valueFormat: 'HH:mm:ss',
  placeholder: global.findLanguage('请选择时间'),
})

onBeforeMount(() => {
  if (props.structure.config) {
    if (props.structure.config.placeholder)
      component_state.placeholder = props.structure.config.placeholder
  }
})
</script>

<template>
  <a-time-picker
      v-model:value="props.structure.value"
      :placeholder="component_state.placeholder"
      :valueFormat="component_state.valueFormat"
      style="width: 100%"/>
</template>

<style scoped>

</style>