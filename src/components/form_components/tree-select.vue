<script setup>
import {inject, onBeforeMount, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['structure'])
const component_state = reactive({
  disabled: false,
})
onBeforeMount(() => {
  if (props.structure.config.disabled)
    component_state.disabled = props.structure.config.disabled
})
</script>

<template>
  <a-tree-select
      v-model:value="props.structure.value"
      :disabled="component_state.disabled"
      :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
      :fieldNames="{children:'children', title:'label', key:'value', value: 'value' }"
      :placeholder="global.findLanguage('请选择...')"
      :tree-data="props.structure.config.values"
      style="width: 100%;overflow-x: scroll;white-space:nowrap;"
  />

</template>

<style scoped>

</style>