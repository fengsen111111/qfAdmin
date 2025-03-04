<script setup>
import {inject, onBeforeMount, reactive, watch} from 'vue'

const global = inject('global').value
let props = defineProps(['structure'])
const component_state = reactive({
  value: parseInt(props.structure.value),
  count: 5,
})
onBeforeMount(() => {
  if (props.structure.config) {
    if (props.structure.config.count)
      component_state.count = props.structure.config.count
  }
})
watch(
    () => component_state.value,
    (newValue) => {
      props.structure.value = newValue
    }
)
</script>
<template>
  <a-rate v-model:value="component_state.value" :count="component_state.count"/>
</template>


<style scoped>

</style>