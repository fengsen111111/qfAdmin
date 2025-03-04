<script setup>
import {inject, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['value', 'structure', 'rowValue', 'id'])
const component_state = reactive({
  isCollapse: false,
  myValue: props.value,
})

function show_editor() {
  component_state.isCollapse = true
}
</script>
<template>
  <div>
    <a class="ant-dropdown-link" href="javascript:;" @click="show_editor">
      {{ global.findLanguage('查看') }}
    </a>
    <a-modal v-model:visible="component_state.isCollapse" :centered="true" :closable="true" :footer="null"
             :keyboard="false"
             :maskClosable="false" :width="props.structure.config.width+'px'">
      <div style="margin-top: 20px;width: 100%;height: 500px;overflow-y: auto" v-html="component_state.myValue"></div>
    </a-modal>
  </div>
</template>

<style scoped>
.iconfont {
  font-size: 24px;
}
</style>