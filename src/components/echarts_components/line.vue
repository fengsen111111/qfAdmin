<script setup>
import {inject, onBeforeMount, reactive, watch} from 'vue'

const global = inject('global').value
let props = defineProps(['color', 'data'])
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
      trigger: 'item',
    },
    xAxis: {
      type: 'category',
      data: component_state.allData.keys
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: component_state.allData.values,
        type: 'line',
      }
    ],
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

<script>
export default {
  name: "Line",
  props: ['color', 'data'],
  data() {
    return {
      timer: new Date().getTime(),
      roundNumber: Math.floor(Math.random() * (9999 - 1 + 1)) + 1,
    }
  },
  mounted() {
    let _this = this
    if (_this.data) {
      let myChart = _this.$echarts.init(document.getElementById(_this.timer + '_' + _this.roundNumber));
      let option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: _this.data.keys
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: _this.data.values,
            type: 'line',
          }
        ],
        grid: {
          top: '10%',
          left: '2%',
          right: '3%',
          bottom: '3%',
          containLabel: true
        },
      };
      myChart.setOption(option);
    }
  }
}
</script>

<style scoped>

</style>