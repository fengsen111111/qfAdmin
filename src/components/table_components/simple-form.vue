<script setup>
import {inject, reactive, watch} from 'vue'

import {FormComponents} from '../form_components/form'

const global = inject('global').value
let props = defineProps(['value', 'structure', 'rowValue', 'id'])
const component_state = reactive({
  isCollapse: false,
  timer: new Date().getTime(),                                   //表单组件key组成字段
  roundNumber: Math.floor(Math.random() * (9999 - 1 + 1)) + 1,//表单组件key组成字段
})


watch(
    () => component_state.isCollapse,
    (newValue) => {
      if (!newValue)
        reset()
      else
        props.structure.config.children.forEach((component, index) => {
          if (props.rowValue[component.field]) {
            props.structure.config.children[index]['value'] = props.rowValue[component.field]
          }
        })
    }
)
let emit = defineEmits(["tableHandles", "refresh"])

function refreshTable() {
  emit('refresh')
}

function collapse() {
  component_state.isCollapse = true;
}

function submit() {
  global.Modal.confirm({
    title: global.findLanguage('确定要提交吗？'),
    okText: global.findLanguage('确定'),
    cancelText: global.findLanguage('取消'),
    okType: 'primary',
    onOk: function () {
      let url = props.structure.config.submitUrl
      if (props.structure.config.submitUrl.includes('?'))
        url = url + props.value
      global.axios.post(url, [props.structure.config.children], global, true, true, submitResult)
    }
  });
}

function submitResult(res) {
  setTimeout(function () {
    if (res !== false) {
      reset()
      refreshTable()
    }
  }, 1200)
}

function reset() {
  props.structure.config.children.forEach((component, index) => {
    if (component.component == 'CheckBox' || component.component == 'Tree' || component.component == 'Cascader')
      props.structure.config.children[index]['value'] = []
    else
      props.structure.config.children[index]['value'] = ''
  })
}
</script>

<template>

  <div>
    <div align="center">
      <a class="ant-dropdown-link" href="javascript:;" @click="collapse">
        <span :class="props.structure.buttonType?props.structure.buttonType:'primary'">{{global.findLanguage(props.structure.buttonName)}}</span>
      </a>
    </div>
    <template v-if="component_state.isCollapse">
      <a-modal v-model:visible="component_state.isCollapse" :centered="true" :closable="true" :footer="null"
               :keyboard="false"
               :maskClosable="true"
               width="24%">
        <div class="table-header">
          <div>
            <a-button class="button-class button-success" style="float: left" type="primary" @click="submit">
              {{global.findLanguage('提交')}}
            </a-button>
            <a-button class="button-class button-warning" style="float: left" type="primary" @click="reset">
              {{global.findLanguage('重置')}}
            </a-button>
          </div>
        </div>
        <div class="table">
          <a-form layout="vertical">
            <a-form-item v-for="(rowStructure,rowIndex) in props.structure.config.children"
                         v-show="rowStructure.hasOwnProperty('show')?rowStructure.show:true" :key="rowIndex"
                         :label="global.findLanguage(rowStructure.label)">
                      <span class="warning">
                        <span v-if="rowStructure.warning" v-html="global.findLanguage(rowStructure.warning)"></span>
                    </span>
              <component
                  :is="FormComponents[rowStructure.component]"
                  :key="component_state.timer + component_state.roundNumber + 'rowIndex' + rowIndex"
                  :structure="rowStructure"/>
            </a-form-item>
          </a-form>
        </div>
      </a-modal>
    </template>
  </div>

</template>

<style scoped>
.table-header {
  height: 30px;
  line-height: 30px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}

.table {
  height: calc(100vh - 300px) !important;
  overflow-y: auto;
  border-bottom: 1px solid #f0f0f0;
  border-top: 1px solid #f0f0f0;
}

.button-class {
  margin-left: 5px;
  margin-right: 5px;
}

.warning {
  color: red;
  margin-top: -10px;
  margin-bottom: 2px;
  display: block
}


.primary {

}

.danger {
  color: red;
}

.success {
  color: #52C41A;
}

.warning {
  color: #d48806;
}
</style>