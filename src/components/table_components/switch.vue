<script setup>
import {inject, onBeforeMount, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['value', 'structure', 'rowValue', 'id'])
const component_state = reactive({
  switchData: '',
  checked: false,
})

let emit = defineEmits(["tableHandles", "refresh"])

function tableHandles(handleInfo, requestParams) {
  emit('tableHandles', {handleInfo, requestParams})
}

onBeforeMount(() => {
  if (props.value === props.structure.config.values[1].value)
    component_state.checked = true
})

function change() {
  let checkedValue
  if (component_state.checked)
    checkedValue = props.structure.config.values[1].value
  else
    checkedValue = props.structure.config.values[0].value

  let requestParams = {
    'change_field': props.structure.field,
    'change_value': checkedValue,
    'id': props.id,
  }
  let handleInfo = {
    handleType: 'editValue',
    requestUrl: props.structure.config.requestUrl
  }
  tableHandles(handleInfo, requestParams)
}
</script>

<template>
  {{global.findLanguage(props.structure.config.values[0].label)}}
  <a-switch v-model:checked="component_state.checked" @change="change"/>
  {{global.findLanguage(props.structure.config.values[1].label)}}
</template>


<style scoped>
.switch-class {
  margin: 0 10px;
}
</style>