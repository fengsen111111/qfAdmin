<script setup>
import {inject, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['value', 'config'])
const component_state = reactive({
  isCollapse: false,
  myValue: props.value,
})

function show_rich_text() {
  component_state.isCollapse = true
}
</script>
<template>
  <div>
    <a class="ant-dropdown-link" href="javascript:;" @click="show_rich_text">
      {{ global.findLanguage('查看') }}
    </a>
    <a-modal v-model:visible="component_state.isCollapse" :centered="true" :closable="true" :footer="null"
             :keyboard="false"
             :maskClosable="false" :width="props.config.width+'px'">
      <div style="margin-top: 20px;width: 100%;height: 500px;overflow-y: auto" v-html="component_state.myValue"></div>
    </a-modal>
  </div>
</template>

<style scoped>
.iconfont {
  font-size: 24px;
}
</style>