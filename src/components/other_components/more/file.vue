<script setup>
import {inject} from 'vue'

const global = inject('global').value
let props = defineProps(['value', 'config'])


function download() {
  global.Modal.confirm({
    title: global.findLanguage('确定要下载该文件吗？'),
    okText: global.findLanguage('确定'),
    cancelText: global.findLanguage('取消'),
    okType: 'primary',
    onOk: function () {
      global.file.download(props.value.url, props.value.name, global)
    }
  });
}

</script>

<template>
  <span v-if="props.value" style="color: #1890ff;cursor: pointer" @click="download">{{ props.value.name }}</span>
</template>


<style scoped>

</style>