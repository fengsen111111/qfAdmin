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
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        type: 'pie',
        radius: [30, 110],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8
        },
        label: {
          show: false,
          position: 'center'
        },
        labelLine: {
          show: false
        },
        data: component_state.allData
      }
    ]
  };
  component_state.myChart.setOption(option);
}
</script>
<template>
  <div :id="component_state.timer+'_'+component_state.roundNumber" style="height: 280px;width: 100%"></div>

</template>

<style scoped>

</style>