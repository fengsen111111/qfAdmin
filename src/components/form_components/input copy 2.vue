<script setup>
  import { inject, onBeforeMount, reactive, ref } from 'vue'

  const global = inject('global').value
  let props = defineProps(['structure'])
  const component_state = reactive({
    placeholder: '',
    disabled: false,
  })
  onBeforeMount(() => {
    if (props.structure.config) {
      if (props.structure.config.placeholder)
        component_state.placeholder = props.structure.config.placeholder
      if (props.structure.config.disabled)
        component_state.disabled = props.structure.config.disabled
    }
  })

  import { APPConfig } from "@/config";
  const timerCode = ref('')
  // 切换图形码
  function changeCaptcha() {
    timerCode.value = new Date().getTime()
  }

</script>

<template>
  <!-- <a-input
      v-model:value="props.structure.value"
      :disabled="component_state.disabled"
      :placeholder="component_state.placeholder"
      allow-clear/> -->
  <div>
    <div>
      <a-input v-model:value="props.structure.value" :placeholder="global.findLanguage('图形验证码')"
        :style="{width:'150px',float:'left'}" size="large" />
      <img :src="APPConfig.apiURL+'/factory_system/Base/getCaptcha?timer='+timerCode" alt=""
        style="width: 42%;height: 40px;border-radius: 3px;float: right" @click="changeCaptcha">
    </div>
    <span style="color: red;">{{timerCode}}</span>
  </div>
</template>


<style scoped>

</style>