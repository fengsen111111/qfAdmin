<script setup>
import {inject, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['value', 'structure', 'rowValue', 'id'])
const component_state = reactive({
  inputValue: props.value,
})

let emit = defineEmits(["tableHandles", "refresh"])

function tableHandles(handleInfo, requestParams) {
  emit('tableHandles', {handleInfo, requestParams})
}

function change() {
  let requestParams = {
    'change_field': props.structure.field,
    'change_value': component_state.inputValue,
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
  <a-input
      v-model:value="component_state.inputValue"
      :style="{width:'100%'}"
      allow-clear
      @blur="change"
  ></a-input>
</template>

<style scoped>

</style>