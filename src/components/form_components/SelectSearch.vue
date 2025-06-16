<script setup>
  import { inject, reactive, ref } from 'vue'

  const global = inject('global').value
  const props = defineProps(['structure'])

  const list = ref([])
  list.value = props.structure.config.values

  function filterOption(input, option) {
    const label = global.findLanguage(option.label || '')
    return label.toLowerCase().includes(input.toLowerCase())
  }
</script>
<template>
  <a-select v-model:value="props.structure.value" style="width: 100%" show-search :filter-option="filterOption"
    :options="list" placeholder="请选择快递公司" allow-clear />
</template>