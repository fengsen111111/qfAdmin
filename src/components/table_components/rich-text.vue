<script setup>
import {inject, onBeforeMount, reactive} from 'vue'
import {APPConfig} from "../../config";

const global = inject('global').value
let props = defineProps(['value', 'structure', 'rowValue', 'id'])
const component_state = reactive({
  isCollapse: false,
  myValue: '',
})

onBeforeMount(() => {
  if (props.value) {
    if (props.value.includes(APPConfig.apiURL)) {
      component_state.myValue = global.axios.download(null, props.value, {name: ""}, global, "rich_text");
    } else {
      let xhr = new XMLHttpRequest();
      let okStatus = document.location.protocol === "file:" ? 0 : 200;
      xhr.open("GET", props.value, false);
      xhr.overrideMimeType("text/html;charset=utf-8");
      xhr.send(null);
      component_state.myValue = xhr.responseText;
    }
  }
})

function show_editor() {
  component_state.isCollapse = true
}
</script>
<template>
  <div>
    <a class="ant-dropdown-link" href="javascript:;" @click="show_editor">
      {{global.findLanguage('查看')}}
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