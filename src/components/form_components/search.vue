<script setup>
  import { inject, onBeforeMount, reactive,watch } from 'vue'

  const global = inject('global').value
  let props = defineProps(['structure'])
  const component_state = reactive({
    dataSource: [],
    label: ''
  })
  watch(props, () => {
    // console.log('props',props.structure);
    if(!props.structure.value){
      component_state.label = ''
    }
  });

  onBeforeMount(() => {
    if (props.structure.config.valueUrl)
      global.axios.post(props.structure.config.valueUrl + props.structure.value, {}, global, false)
        .then(res => {
          component_state.label = res
        })
  })

  function handleSearch(value) {
    global.axios.post(props.structure.config.optionUrl + value, {}, global, false)
      .then(res => {
        component_state.dataSource = res
      })
  }

  function handleChange(value) {
    props.structure.value = value
    component_state.dataSource.forEach((item, index) => {
      if (item.value == value)
        component_state.label = item.label
    })
  }

</script>
<template>
  <a-select :default-active-first-option="false" :filter-option="false" :not-found-content="null"
    :placeholder="global.findLanguage('请选择...')" :show-arrow="false" :value="component_state.label" show-search
    @change="handleChange" @search="handleSearch">
    <a-select-option v-for="(option,optionIndex) in component_state.dataSource" :key="optionIndex"
      :value="option.value">
      {{ global.findLanguage(option.label) }}
    </a-select-option>
  </a-select>
</template>

<style scoped>

</style>