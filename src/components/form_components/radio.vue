<script setup>
import {inject, onBeforeMount, reactive} from 'vue';
import {RadioComponents} from './radio';

const global = inject('global').value
let props = defineProps(['structure'])
const component_state = reactive({
  timer: '',
  roundNumber: '',
  nowItemIndex: '',  //当前子组件集的父级Index
  children: [],//子组件
})

onBeforeMount(() => {
  if (props.structure.config.values.length > 0)
    props.structure.config.values.forEach((item, index) => {
      if (item.value == props.structure.value) {
        showChildrenItem(item, index)
      }
    })
})

function showChildrenItem(item = [], index = '') {
  //查看是否有子组件
  component_state.children = [];
  component_state.nowItemIndex = '';
  if (item.hasOwnProperty("children")) {
    component_state.timer = new Date().getTime()
    component_state.roundNumber = Math.floor(Math.random() * (9999 - 1 + 1)) + 1
    component_state.nowItemIndex = index;
    component_state.children = item.children;
  }
}

</script>
<template>

  <a-radio-group v-model:value="props.structure.value" size="large">
    <a-radio v-for="(radio,radioIndex) in props.structure.config.values" :key="radioIndex"
             :value="radio.value" @click="showChildrenItem(radio,radioIndex)">
      <span v-html="radio.label"></span>
    </a-radio>
  </a-radio-group>

  <div v-if="component_state.children.length > 0"
       style="border: 1px solid #bbbaba;padding: 20px;border-radius: 5px;margin-top: 5px">
    <a-form-item v-for="(child,childIndex) in component_state.children" :key="childIndex"
                 :label="global.findLanguage(child.label)" v-show="child.hasOwnProperty('show') ? child.show : true">
               <span class="warning">
                        <span v-if="child.warning">
                            {{ global.findLanguage(child.warning) }}
                        </span>
                    </span>
      <component
          :is="RadioComponents[child.component]"
          :key="component_state.timer + component_state.roundNumber + childIndex"
          :structure="child"
      />
    </a-form-item>
  </div>

</template>

<style scoped>
.warning {
  color: red;
  margin-top: -10px;
  margin-bottom: 2px;
  display: block
}
</style>