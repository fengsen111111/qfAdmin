<script setup>
import {inject, onBeforeMount, reactive, watch} from 'vue'

const global = inject('global').value
let props = defineProps(['data'])
const component_state = reactive({
  myChart:{},
  allData:{},
  timer: new Date().getTime(),
  roundNumber: Math.floor(Math.random() * (9999 - 1 + 1)) + 1,
})
watch(
    () => props.data,
    (newValue) => {
      component_state.allData = newValue
      setOption()
    }
)
onBeforeMount(() => {
  component_state.allData = props.data
  component_state.myChart = global.echarts.init(document.getElementById(component_state.timer + '_' + component_state.roundNumber));
  setOption()
})

function setOption() {
  let option = {
    legend: {},
    tooltip: {
      trigger: 'item',
    },
    dataset: {
      dimensions: component_state.allData.dimensions,
      source: component_state.allData.source
    },
    xAxis: {type: 'category'},
    yAxis: {},
    series: [{type: 'bar', itemStyle: {borderRadius: 3}}, {type: 'bar', itemStyle: {borderRadius: 3}}, {
      type: 'bar',
      itemStyle: {borderRadius: 3}
    }],
    grid: {
      top: '10%',
      left: '2%',
      right: '3%',
      bottom: '3%',
      containLabel: true
    },
  };
  component_state.myChart.setOption(option);
}

</script>
<template>
  <div :id="component_state.timer+'_'+component_state.roundNumber" style="height: 280px;width: 100%"></div>
</template>

<style scoped>

</style>