<script setup>
import {onBeforeMount, reactive} from 'vue'

let props = defineProps(['value', 'structure', 'rowValue', 'id'])
const component_state = reactive({
  show_value: ''
})

onBeforeMount(() => {
  if (props.structure.hasOwnProperty('config') && props.structure.config.hasOwnProperty('values')) {
    props.structure.config.values.forEach((option) => {
      if (option.value === props.value) {
        component_state.show_value = option.label
      }
    })
  } else {
    component_state.show_value = props.value
  }
})

</script>

<template>
  <span v-html="component_state.show_value"></span>
</template>

<style scoped>

</style>