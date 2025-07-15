<script setup>
  import { inject } from 'vue'

  const global = inject('global').value
  let props = defineProps(['value', 'structure', 'rowValue', 'id'])

  let emit = defineEmits(["tableHandles", "refresh"])

  function tableHandles(handleData) {
    // console.log('handleData',handleData);
    emit('tableHandles', handleData)
  }
  function handle(button) {
    // console.log('点击按钮',button);
    let requestParams = {}
    if (button.field) {
      requestParams[button.key] = props.rowValue[button.field]
    } else {
      requestParams[button.key] = props.value
    }
    tableHandles({ handleInfo: button, requestParams })
  }

  //根据数据判断按钮是否显示
  function showButton(button) {
    // console.log('button', button);
    let showStatus = true;
    if (button.show) {
      button.showValue = props.rowValue[button.show]
    }
    if (props.rowValue['ProhibitDataManipulation'] === true && (button.handleType == 'request' || (button.handleType == 'jump' && button.page == 'FormPage')))
      showStatus = false;
    if (button.valueControl) {
      if (button.valueControl.rule === 'eq') {
        if (button.handleType !== 'pay') {
          if (button.valueControl.condition !== props.rowValue[button.valueControl.field])
            showStatus = false;
        }
      }
      if (button.valueControl.rule === 'neq') {
        if (button.valueControl.condition === props.rowValue[button.valueControl.field])
          showStatus = false;
      }
      if (button.valueControl.rule === 'in') {
        showStatus = false
        button.valueControl.condition.forEach((item, index) => {
          if (item === props.rowValue[button.valueControl.field])
            showStatus = true
        })
      }
      if (button.valueControl.rule === 'out') {
        button.valueControl.condition.forEach((item, index) => {
          if (item === props.rowValue[button.valueControl.field])
            showStatus = false;
        })
      }
      if (button.valueControl.rule === 'gt') {
        if (button.valueControl.condition <= props.rowValue[button.valueControl.field])
          showStatus = false;
      }
      if (button.valueControl.rule === 'lt') {
        if (button.valueControl.condition >= props.rowValue[button.valueControl.field])
          showStatus = false;
      }
    }
    return showStatus;
  }

</script>


<template>
  <div v-if="!props.structure.open">
    <a-dropdown>
      <a class="ant-dropdown-link" href="javascript:;">
        {{ global.findLanguage('更多') }} <span class="iconfont" style="font-size: 16px!important;">&#xe6ab;</span>
      </a>
      <template #overlay>
        <a-menu>
          <span v-for="(button,buttonIndex) in props.structure.config">
            <a-menu-item v-if="showButton(button)">
              <a-button :key="buttonIndex" type="link" @click="handle(button)">
                <span v-if="button.showValue" :class="button.buttonType?button.buttonType:'primary'">（ {{
                  global.findLanguage(rowValue[button.showValue])
                  }} ）</span>
                <span v-else :class="button.buttonType?button.buttonType:'primary'">{{
                  global.findLanguage(button.name)
                  }}</span>
              </a-button>
            </a-menu-item>
          </span>

        </a-menu>
      </template>
    </a-dropdown>
  </div>
  <div v-else>
    <span @click="handle({handleType:'RecommendedOfficialExportBtn'})"
      style="color: #1890FF;font-size: 12px;margin-top: -10px;cursor: pointer;">导出</span>
    <a-button v-for="(button,buttonIndex) in props.structure.config" v-show="showButton(button)" :key="buttonIndex"
      :type="button.buttonStyle?button.buttonStyle:'link'" @click="handle(button)">
      <span v-if="button.showValue" :class="button.buttonType?button.buttonType:'primary'">{{
        global.findLanguage(rowValue[button.showValue])
        }}</span>
      <span v-else :class="button.buttonType?button.buttonType:'primary'">{{ global.findLanguage(button.name) }}</span>
    </a-button>
  </div>
</template>

<style lang="less" scoped>
  .button-class {
    margin-left: 5px;
    margin-right: 5px;
  }

  .ant-btn {
    padding: 0 6px;
  }

  .primary {}

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