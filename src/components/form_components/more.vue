<script setup>
import {inject, onBeforeMount, reactive} from 'vue';
import {MoreComponents} from './more.js';

const global = inject('global').value
let props = defineProps(['structure'])
const component_state = reactive({
  allShowStatus: false,
  valuesStructure: []
})
onBeforeMount(() => {

  if (props.structure.value.length > 0) {
    props.structure.value.forEach((item, index) => {
      let structure = JSON.parse(JSON.stringify(item))

      structure['show_structure'] = false

      Object.entries(item).forEach(function([key, value]) {

        if (value.field === props.structure.title_field) {
          structure['title'] = value.value
        }
        structure.forEach((row, row_index) => {
          if(row["field"] === value.field){
            structure[row_index].value = value.value
          }
        })
      });
      component_state.valuesStructure.push(structure)
    })
  }
  props.structure.value = component_state.valuesStructure
})

function addStructure() {
  component_state.valuesStructure.forEach((item, index) => {
    item['show_structure'] = false
    Object.entries(item).forEach(function([key, item2]) {
      if (item2.hasOwnProperty("field") && item2.field === props.structure.title_field) {
        item['title'] = item2.value
      }
    })
  })

  let item = JSON.parse(JSON.stringify(props.structure.config.children))
  item['show_structure'] = true
  component_state.valuesStructure.push(item)
  props.structure.value = component_state.valuesStructure
}
function editStructure(structureIndex) {
  component_state.valuesStructure.forEach((item, index) => {
    item['show_structure'] = false
    if (structureIndex === index) {
      item['show_structure'] = true
      Object.entries(item).forEach(function([key, item2]) {
        if (item2.hasOwnProperty("field") && item2.field === props.structure.title_field) {
          item['title'] = item2.value
        }
      })
    }
  })
}
function deleteStructure(structureIndex) {
  component_state.valuesStructure.splice(structureIndex, 1)
  props.structure.value = component_state.valuesStructure
}

function clearStructure() {
  component_state.valuesStructure = [];
  props.structure.value = [];
}

function showOrHide() {
  component_state.valuesStructure.forEach((item, index) => {
    item['show_structure'] = !component_state.allShowStatus
    Object.entries(item).forEach(function([key, item2]) {
      if (item2.hasOwnProperty("field") && item2.field === props.structure.title_field) {
        item['title'] = item2.value
      }
    })
  })
  component_state.allShowStatus = !component_state.allShowStatus
}

function hideStructure(structureIndex) {
  component_state.valuesStructure.forEach((item, index) => {
    if (structureIndex === index) {
      item['show_structure'] = false
      Object.entries(item).forEach(function([key, item2]) {
        if (item2.hasOwnProperty("field") && item2.field === props.structure.title_field) {
          item['title'] = item2.value
        }
      })
    }
  })
}
</script>

<template>
  <a-button class="button-class button-warning" style="margin-left: 0;margin-right: 10px"  @click="clearStructure">{{
    global.findLanguage('清空') }}
  </a-button>
  <a-button @click="showOrHide">{{ global.findLanguage('全部展开/收起') }}</a-button>

  <div >
    <div v-for="(structure,structureIndex) in component_state.valuesStructure" :key="structureIndex"
         style="overflow-x: auto;border: 1px solid #bbbaba;padding: 5px;border-radius: 5px;margin-top: 5px">
      <div style="float: right;" v-show="structure.show_structure">
        <span v-show="structure.show_structure" @click="hideStructure(structureIndex)" class="iconfont"
              style="font-size: 14px;color: #7c7b7b;margin-right: 5px;cursor: pointer"
              :title="global.findLanguage('收起')">&#xe614;</span>
        <span class="iconfont" @click="deleteStructure(structureIndex)"
              style="font-size: 14px;color: #7c7b7b;margin-right: 5px;cursor: pointer"
              :title="global.findLanguage('删除')">&#xe761;</span>
      </div>
      <div style="clear: both;"></div>
      <div v-show="structure.show_structure">
        <a-form-item v-for="(child,childIndex) in structure" :key="childIndex"
                     :label="global.findLanguage(child.label)" v-show="child.hasOwnProperty('show') ? child.show : true">
            <span class="warning">
              <span v-if="child.warning">
                {{ global.findLanguage(child.warning) }}
              </span>
          </span>
          <component
              :is="MoreComponents[child.component]"
              :key="structureIndex + childIndex"
              :structure="child"
          />
        </a-form-item>
      </div>
      <div style="clear: both;"></div>
      <div v-show="!structure.show_structure" style="text-align: center;">
        <span @click="editStructure(structureIndex)" class="iconfont"
              style="font-size: 18px;color: #7c7b7b;margin-right: 5px;cursor: pointer"
              :title="global.findLanguage('展开')"><span
            style="font-size: 14px;margin-right: 5px;">{{ structure.title }}</span>&#xe62a;</span>
      </div>
    </div>

    <div
        style="text-align: center;overflow-x: auto;border: 1px solid #bbbaba;padding: 5px;border-radius: 5px;margin-top: 5px">
      <span @click="addStructure()" class="iconfont"
            style="font-size: 18px;color: #7c7b7b;margin-right: 5px;cursor: pointer" :title="global.findLanguage('展开')"><span
          style="font-size: 14px;margin-right: 5px;">添加</span>&#xe767;</span>
    </div>
  </div>

</template>


<style scoped>
.warning {
  color: red;
  margin-top: -10px;
  margin-bottom: 2px;
  display: block;
}
</style>