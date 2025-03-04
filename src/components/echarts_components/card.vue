<script setup>
let props = defineProps(['name', 'value', 'startColor', 'endColor', 'icon'])
</script>
<template>
  <a-col :span="6">
    <div :style="{background:'linear-gradient(45deg,'+props.startColor+' 0%,'+props.endColor+' 100%)'}" class="card">
      <div style="font-size: 20px;padding: 24px 0 0 30px">{{ props.name }}</div>
      <div style="font-size: 40px;margin: 10px 0 0 30px;font-weight: bold">{{ props.value }}</div>
      <div class="iconfont" style="font-size: 50px;position: absolute;top: 44px;right: 40px">{{ props.icon }}</div>
    </div>
  </a-col>
</template>

<script>
export default {
  name: "Card",
  props: ['name', 'value', 'startColor', 'endColor', 'icon'],
}
</script>

<style scoped>
.card {
  height: 150px;
  margin-top: 10px;
  margin-right: 10px;
  margin-left: 10px;
  border-radius: 20px;
  opacity: 1;
  color: #FFF;
}
</style>