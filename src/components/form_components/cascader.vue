<script setup>
import {inject, reactive} from 'vue';

const global = inject('global').value
let props = defineProps(['structure'])
const component_state = reactive({})
</script>

<template>
  <a-cascader
      v-model:value="props.structure.value"
      :field-names="{ label: 'label', value: 'value', children: 'children' }"
      :options="props.structure.config.values"
      :placeholder="props.structure.config.placeholder"
  />
</template>


<style scoped>

</style>