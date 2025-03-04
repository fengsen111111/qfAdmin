<script setup>
import {inject, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['value', 'structure', 'rowValue', 'id'])
const component_state = reactive({
  orderData: props.value,
})


let emit = defineEmits(["tableHandles", "refresh"])

function tableHandles(handleInfo, requestParams) {
  emit('tableHandles', {handleInfo, requestParams})
}

function topMove() {
  component_state.orderData = component_state.orderData * 1 - 1 * 1
  if (component_state.orderData == 0)
    component_state.orderData = 1
  change()
}

function bottomMove() {
  component_state.orderData = component_state.orderData * 1 + 1 * 1
  change()
}

function change() {
  let requestParams = {
    'change_field': props.structure.field,
    'change_value': component_state.orderData,
    'id': props.id,

  }
  let handleInfo = {
    order:true,
    handleType: 'editValue',
    requestUrl: props.structure.config.requestUrl
  }
  tableHandles(handleInfo, requestParams)
}
</script>
<template>
  <div style="padding-top: 4px;float:left;">
    {{component_state.orderData}}
  </div>
  <div class="order">
    <div class="up" @click="topMove"></div>
    <div class="down" @click="bottomMove"></div>
  </div>


</template>

<style lang="less" scoped>
.order {
  width: 20px;
  margin-left: 10px;
  float: right;
}

.up {
  width: 0;
  height: 0;
  border-right: 10px solid transparent;
  border-left: 10px solid transparent;
  border-bottom: 10px solid rgb(76, 120, 202);
  margin-bottom: 10px;
  cursor: pointer;
}

.up:hover {
  border-bottom: 10px solid #908f8f;
}

.down {
  width: 0;
  height: 0;
  border-right: 10px solid transparent;
  border-left: 10px solid transparent;
  border-top: 10px solid rgb(76, 120, 202);
  cursor: pointer;
}

.down:hover {
  border-top: 10px solid #908f8f;
}
</style>