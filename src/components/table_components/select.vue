<script setup>
import {inject, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['value', 'structure', 'rowValue', 'id'])
const component_state = reactive({
  selectData: props.value,
})

let emit = defineEmits(["tableHandles", "refresh"])

function tableHandles(handleInfo, requestParams) {
  emit('tableHandles', {handleInfo, requestParams})
}

function change() {
  let requestParams = {
    'change_field': props.structure.field,
    'change_value': component_state.selectData,
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
  <a-select
      ref="select"
      v-model:value="component_state.selectData"
      :style="{width:'100%'}"
      style="width: 120px"
      @change="change"
  >
    <a-select-option value=""> {{global.findLanguage('请选择...')}}</a-select-option>
    <a-select-option v-for="(option,optionIndex) in props.structure.config.values" :key="optionIndex"
                     :value="option.value">
      {{ global.findLanguage(option.label) }}
    </a-select-option>
  </a-select>

</template>


<style scoped>

</style>