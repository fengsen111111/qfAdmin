<script setup>
import {inject, onBeforeMount, reactive} from "vue";

const global = inject("global").value;
let props = defineProps(["structure"]);
const component_state = reactive({
  placeholder: "",
  disabled: false,
});

onBeforeMount(() => {
  if (props.structure.config) {
    if (props.structure.config.placeholder)
      component_state.placeholder = props.structure.config.placeholder;
    if (props.structure.config.disabled)
      component_state.disabled = props.structure.config.disabled;
  }
});
</script>

<template>
  <a-textarea
      v-model:value="props.structure.value"
      :autoSize="{ minRows: 2, maxRows: 5 }"
      :disabled="component_state.disabled"
      :placeholder="global.findLanguage(component_state.placeholder)"
      allow-clear
  />
</template>

<style scoped></style>
