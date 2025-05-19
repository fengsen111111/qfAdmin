<script setup>
import {onBeforeMount, reactive,ref} from 'vue'

let props = defineProps(['value', 'structure', 'rowValue', 'id'])
const component_state = reactive({
  show_value: ''
})



onBeforeMount(() => {
  console.log('props.value',props.value);
  if (props.structure.hasOwnProperty('config') && props.structure.config.hasOwnProperty('values')) {
    props.structure.config.values.forEach((option) => {
      if (option.value === props.value) {
        component_state.show_value = option.label
      }
    })
  } else {
    component_state.show_value = props.value
  }
  console.log('component_state.show_value',component_state.show_value);
  
  if(component_state.show_value.length>30){
    isZk.value = true
    editText.value = component_state.show_value.slice(0,30)+'...'
  }else{
    isZk.value = false
    editText.value = component_state.show_value
  }
})
const isZk = ref(false)//是否收起
const editText = ref('')//处理后文本

</script>

<template>
  <!-- <span v-html="component_state.show_value"></span> -->
   <div>
    <!-- <span v-if="component_state.show_value.length>30">{{component_state.show_value.slice(0,30)}}...<span style="color: #1890ff;">展开</span></span> -->
    <span v-html="isZk?editText:component_state.show_value"></span>
    <span v-if="component_state.show_value.length>30" style="color: #1890ff;cursor: pointer;" @click="isZk =!isZk">{{isZk?'展开':'收起'}}</span>
   </div>
</template>

<style scoped>

</style>