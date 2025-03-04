<script setup>
import {inject, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['structure'])
const component_state = reactive({
  checkedKeys: JSON.parse(JSON.stringify(props.structure.value))
})
</script>

<template>
  <a-tree
      style="overflow-x: scroll;white-space:nowrap;"
      v-model:checkedKeys="props.structure.value"
      :fieldNames="{children:'children', title:'label', key:'value' }"
      :tree-data="props.structure.config.values"
      checkable
  ></a-tree>
</template>


<style scoped>

</style>