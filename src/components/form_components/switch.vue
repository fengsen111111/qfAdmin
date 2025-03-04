<script setup>
import {inject, onBeforeMount, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['structure'])
const component_state = reactive({
  checked: true
})
onBeforeMount(() => {
  if (props.structure.value == props.structure.config.values[1]['value']) {
    component_state.checked = true
  } else {
    component_state.checked = false
  }
})

function change() {
  if (component_state.checked)
    props.structure.value = props.structure.config.values[1]['value']
  else
    props.structure.value = props.structure.config.values[0]['value']

}
</script>
<template>
  {{global.findLanguage(props.structure.config.values[0]['label'])}}
  <a-switch v-model:checked="component_state.checked" @change="change()"/>
  {{global.findLanguage(props.structure.config.values[1]['label'])}}

</template>

<style scoped>

</style>