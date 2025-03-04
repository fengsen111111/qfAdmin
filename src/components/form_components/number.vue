<script setup>
import {inject, onBeforeMount, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['structure'])
const component_state = reactive({
  min: 0,
  max: 100,
  step: 0.01,
  disabled: false,
})
onBeforeMount(() => {
  if (props.structure.config) {
    if (props.structure.config.min)
      component_state.min = props.structure.config.min
    if (props.structure.config.max)
      component_state.max = props.structure.config.max
    if (props.structure.config.step)
      component_state.step = props.structure.config.step

    if (props.structure.config.disabled)
      component_state.disabled = props.structure.config.disabled
  }
})
</script>
<template>
  <a-input-number v-model:value="props.structure.value" :disabled="component_state.disabled" :max="component_state.max"
                  :min="component_state.min" :step="component_state.step"
                  style="width: 100%"/>
</template>

<style scoped>

</style>