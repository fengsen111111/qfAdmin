<script setup>

let props = defineProps(['value', 'structure', 'rowValue', 'id'])

</script>
<template>
  <span v-show="props.value" class="iconfont" v-html="props.value"/>
</template>

<style scoped>
.iconfont {
  font-size: 24px;
}
</style>