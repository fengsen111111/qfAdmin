<script setup>
import {inject, reactive} from 'vue'

import {MoreComponents} from '../other_components/more/more'

const global = inject('global').value

let props = defineProps(['value', 'structure', 'rowValue', 'id'])

const component_state = reactive({
  isCollapse: false,
  timer: new Date().getTime(),
  roundNumber: Math.floor(Math.random() * (9999 - 1 + 1)) + 1,
})

function collapse() {
  component_state.isCollapse = true;
}

</script>


<template>
  <div>
    <a class="ant-dropdown-link" href="javascript:;" @click="collapse">
      {{ global.findLanguage('查看') }}
    </a>
    <a-modal v-model:visible="component_state.isCollapse" :centered="true" :closable="true" :footer="null"
             :keyboard="false" :maskClosable="true" width="30%">
      <div
          style="height: 85vh;overflow-y: auto;background: url('/resource/image/loading.gif') center center no-repeat #fff;background-size:20%"
          v-show="$root.spinning"></div>
      <div style="height: 85vh;overflow-y: auto;" v-show="!$root.spinning">
        <div v-for="(field, index) in props.structure.config.children" :key="index" style="margin-bottom: 20px">
          <strong style="margin-bottom: 5px;display: block;font-size: 16px">{{ field['label'] }} </strong>
          <component :is="MoreComponents[field['component']]"
                     :key="component_state.timer + component_state.roundNumber + 'colIndex' + index"
                     :config="field['config']"
                     :value="props.rowValue[field['field']]"/>
        </div>
      </div>
    </a-modal>
  </div>

</template>

<style scoped>

</style>