<script setup>
  import { inject,ref } from 'vue'

  const global = inject('global').value
  let props = defineProps(['value', 'structure', 'rowValue', 'id'])
  const detailsVis = ref(false)
  const urlH5 = ref('')
  function open(item){
    detailsVis.value=true
    urlH5.value = 'https://h5.qfcss.cn/#/pages/home/components/shopDetail/index?id=' + item.goods_id + '&identity=pc'
  }
</script>

<template>
  <div>
    <div v-for="item in props.value" :key="item.goods_id">{{item.goods_name}}<span style="color: #40A9FF;margin-left: 10px;cursor: pointer;" @click="open(item)">查看详情</span></div>
    <!-- 作品、商品详情 弹框 -->
    <a-modal v-model:visible="detailsVis" style="width: 460px;" :footer="null" :centered="true" title="详情"
      :maskClosable="false" width="420px">
      <div style="display: flex; justify-content: center; align-items: center;">
        <iframe :src="urlH5" frameborder="0"
          style="width: 390px; height: 844px; border: 1px solid #ccc; border-radius: 12px;"></iframe>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>

</style>