<script setup>
import {inject, reactive} from 'vue'

const global = inject('global').value
let props = defineProps(['value', 'structure', 'rowValue', 'id'])
const component_state = reactive({
  textareaValue: props.value,
  isCollapse: false
})

function collapse() {
  component_state.isCollapse = true;
}
</script>

<template>
  <div>
    <a class="ant-dropdown-link" href="javascript:;" @click="collapse">
      {{global.findLanguage('查看')}}
    </a>
    <a-modal v-model:visible="component_state.isCollapse" :centered="true" :closable="true" :footer="null"
             :keyboard="false"
             :maskClosable="true"
             width="24%">
      <a-textarea
          v-model:value="component_state.textareaValue"
          :autoSize="true"
          :disabled="true"
          :style="{width:'100%',border:0,backgroundColor:'#FFFFFF',color:'rgba(0, 0, 0, 0.85)',cursor:'default'}"
      />
    </a-modal>
  </div>

</template>

<style scoped>

</style>