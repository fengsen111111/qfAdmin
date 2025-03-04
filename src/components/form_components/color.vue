<script setup>
import {inject, onBeforeMount, reactive, ref, watch} from 'vue'
import { ColorPicker } from "vue3-colorpicker";
import "vue3-colorpicker/style.css";

const global = inject('global').value
let props = defineProps(['structure'])


const pureColor = ref(props.structure.value);
const handle_pureColorChange = (e) => {
  pureColor.value = e;
  props.structure.value = e;
}
</script>

<template>
  <div v-if="props.structure.config.disabled === false">
    <colorPicker format="hex" v-model:pureColor="pureColor" @pureColorChange="handle_pureColorChange"></colorPicker>
  </div>
  <div v-else>
      <div :style="{backgroundColor: props.structure.value,width:'50px',height:'24px'}"></div>
  </div>
</template>


<style scoped>

</style>