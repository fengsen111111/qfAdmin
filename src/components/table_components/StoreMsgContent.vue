<script setup>
  import { inject } from 'vue'

  const global = inject('global').value
  let props = defineProps(['value', 'structure', 'rowValue', 'id', 'field'])
  console.log('props', props.structure);


</script>

<template>
  <div>
    <!-- 修改前 -->
    <div v-if="props.structure.field=='before'">
      <div v-if="props.value[0]=='h'">
        <a-image :width="60" :src="props.value" :preview="{ src: props.value }" />
      </div>
      <div v-else>
        {{props.value}}
      </div>
    </div>
    <!-- 修改后 -->
    <div v-else>
      <div v-if="props.value[0]=='h'">
        <a-image :width="60" :src="props.value" :preview="{ src: props.value }" />
      </div>
      <div v-else>
        {{props.value}}
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>