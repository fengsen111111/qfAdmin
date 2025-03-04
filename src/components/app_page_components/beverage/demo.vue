<template>
  {{ pageData.type }}
  <br>
  {{ pageData.page_key }}
  <!--  <button v-if="pageData.hasOwnProperty('parent_page_key')" @click="closeChildPage(pageData.page_key)">关闭子页面</button>-->
</template>

<script setup>
let props = defineProps(["pageData"])
const pageData = props.pageData

let emit = defineEmits(["openChildPage", "closeChildPage"])

function openChildPage(pageData) {
  emit('openChildPage', pageData)
}

function closeChildPage(page_key) {
  emit('closeChildPage', page_key)
}
</script>

<style scoped>

</style>