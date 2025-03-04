<script setup>

let props = defineProps(["pageData"])
const pageData = props.pageData

let emit = defineEmits(["openChildPage", "closeChildPage"])

function openChildPage(pageData) {
  emit('openChildPage', pageData)
}

function closeChildPage(page_key) {
  global.Modal.confirm({
    title: global.findLanguage('确定要返回吗？'),
    okText: global.findLanguage('确定'),
    cancelText: global.findLanguage('取消'),
    okType: 'primary',
    onOk: function () {
      emit('closeChildPage', page_key)
    }
  });
}

</script>
<template>
  <div>
    <img alt="" src="/resource/image/index_img.png" style="width: 100%;max-height: 500px;margin-top: 5vh">
  </div>
</template>
<style scoped>

</style>