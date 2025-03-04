<script setup>
import {inject, onBeforeMount, reactive, watch} from 'vue'

const global = inject('global').value
let props = defineProps(['structure'])
const component_state = reactive({
  indeterminate: false,
  checkAll: false,
  checkedValue: props.structure.value
})
onBeforeMount(() => {
  changeCheckShow()
})
watch(
    () => component_state.checkedValue,
    (newValue) => {
      changeCheckShow()
    }
)


function changeCheckShow() {
  if (component_state.checkedValue.length === 0) {
    component_state.indeterminate = false
    component_state.checkAll = false
  }
  if (component_state.checkedValue.length > 0 && component_state.checkedValue.length < props.structure.config.values.length) {
    component_state.indeterminate = true
    component_state.checkAll = false
  }
  if (component_state.checkedValue.length === props.structure.config.values.length) {
    component_state.indeterminate = false
    component_state.checkAll = true
  }
  props.structure.value = component_state.checkedValue
}

function onCheckAllChange() {
  component_state.checkedValue = []
  if (component_state.checkAll) {
    props.structure.config.values.forEach((item, index) => {
      component_state.checkedValue[index] = item.value
    })
  }
}

</script>
<template>
  <div :style="{ borderBottom: '1px solid #E9E9E9',paddingBottom: '10px' ,marginBottom: '10px' }">
    <a-checkbox
        v-model:checked="component_state.checkAll"
        :indeterminate="component_state.indeterminate"
        @change="onCheckAllChange"
    >
      {{ global.findLanguage('全选') }}
    </a-checkbox>
  </div>

  <a-checkbox-group v-model:value="component_state.checkedValue" style="width: 100%;">
    <a-col v-for="(option, index) in props.structure.config.values" :key="index">
      <a-checkbox :value="option.value">{{ global.findLanguage(option.label) }}</a-checkbox>
    </a-col>
  </a-checkbox-group>
</template>

<style scoped>

</style>