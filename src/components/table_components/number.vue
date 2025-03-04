<script setup>
import {inject, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['value', 'structure', 'rowValue', 'id'])
const component_state = reactive({
  numberData: props.value,
})

let emit = defineEmits(["tableHandles", "refresh"])

function tableHandles(handleInfo, requestParams) {
  emit('tableHandles', {handleInfo, requestParams})
}

function change() {
  let requestParams = {
    'change_field': props.structure.field,
    'change_value': component_state.numberData,
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
  <a-input-number
      v-model:value="component_state.numberData"
      :max="props.structure.config.max"
      :min="props.structure.config.min"
      :step="props.structure.config.step"
      :style="{width:'100%'}"
      @blur="change"
  />
</template>

<style scoped>

</style>