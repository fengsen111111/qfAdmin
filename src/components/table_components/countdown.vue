<script setup>
import {onBeforeMount, reactive} from 'vue'

let props = defineProps(['value', 'structure', 'rowValue', 'id'])
const component_state = reactive({
  show_value: ''
})

onBeforeMount(() => {
  countdowm(props.value)
})


function countdowm(timestamp) {
  let timer = setInterval(function () {
    let nowTime = new Date();
    let endTime = new Date(timestamp * 1000);
    let t = endTime.getTime() - nowTime.getTime();
    if (t > 0) {
      let day = Math.floor(t / 86400000);
      let hour = Math.floor((t / 3600000) % 24);
      let min = Math.floor((t / 60000) % 60);
      let sec = Math.floor((t / 1000) % 60);
      hour = hour < 10 ? "0" + hour : hour;
      min = min < 10 ? "0" + min : min;
      sec = sec < 10 ? "0" + sec : sec;
      let format = '';
      if (day > 0) {
        format += `${day}天`;
      }
      if (hour > 0) {
        format += `${hour}小时`;
      }
      if (min > 0) {
        format += `${min}分`;
      }
      if (sec > 0) {
        format += `${sec}秒`;
      }
      component_state.show_value = format;
    } else {
      clearInterval(timer);
      component_state.show_value = '0秒';
    }
  }, 1000);
}


</script>

<template>
  <span v-html="component_state.show_value"></span>
</template>

<style scoped>

</style>