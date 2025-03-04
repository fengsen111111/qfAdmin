<script setup>
import {inject, onBeforeMount, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['value', 'structure', 'rowValue', 'id'])
const component_state = reactive({
  count: 5,
  rate_value: props.value ? Number(props.value) : 0
})

let emit = defineEmits(["tableHandles", "refresh"])

function tableHandles(handleInfo, requestParams) {
  emit('tableHandles', {handleInfo, requestParams})
}

onBeforeMount(() => {
  if (props.structure.config && props.structure.config.count) {
    component_state.count = props.structure.config.count
  }
})

function change() {
  let requestParams = {
    'change_field': props.structure.field,
    'change_value': component_state.rate_value,
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
  <a-rate v-model:value="component_state.rate_value" :count="component_state.count"
          :disabled="props.structure.config.disabled" @change="change"/>
</template>

<style scoped>

</style>