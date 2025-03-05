<script setup>
import {inject, onBeforeMount, reactive} from "vue";
import {FormComponents} from "../../form_components/form";
import {TableComponents} from "../../table_components/table";

let props = defineProps(["pageData"]);
const pageData = props.pageData;

let emit = defineEmits(["openChildPage", "closeChildPage"]);

const global = inject("global").value;


</script>

<template>
  <!--搜索-->
  <div>
    发布商品
  </div>
  <!--导出-->
</template>

<style lang="less" scoped>

</style>
