<script setup>
  import { inject, onBeforeMount, reactive, ref, watch, shallowRef } from "vue";
  import { FormComponents } from "../../form_components/form";
  import { TableComponents } from "../../table_components/table";
  import { Row, Col } from 'ant-design-vue';
  import { InfoCircleOutlined, CheckCircleOutlined, PlusOutlined, ExclamationCircleOutlined, SearchOutlined,RightOutlined } from "@ant-design/icons-vue";
  import AMapLoader from '@amap/amap-jsapi-loader';
  let props = defineProps(["pageData"]);
  const pageData = props.pageData;

  let emit = defineEmits(["openChildPage", "closeChildPage"]);

  const global = inject("global").value;

  const typeVal = ref()//分类数据绑定

  const treeData = [
    {
      "value": "708254360949230782",
      "label": "沙发分类",
      "children": [
        {
          "value": "709234176053743359",
          "label": "转角沙发"
        },
        {
          "value": "709238917815078051",
          "label": "直排沙发"
        },
        {
          "value": "709239093015347518",
          "label": "弧形沙发"
        },
        {
          "value": "709239231989419965",
          "label": "模块沙发"
        },
        {
          "value": "709239500701698740",
          "label": "异性沙发"
        }
      ]
    },
    {
      "value": "708254439080724194",
      "label": "厨具分类",
      "children": []
    },
    {
      "value": "708254497968751348",
      "label": "茶姬分类",
      "children": [
        {
          "value": "709240095353341319",
          "label": "欧式茶几"
        },
        {
          "value": "709240316242166756",
          "label": "中式茶几"
        }
      ]
    },
    {
      "value": "708254576372878351",
      "label": "橱柜分类",
      "children": [
        {
          "value": "709239712065258806",
          "label": "直排橱窗"
        },
        {
          "value": "709239880290404991",
          "label": "转角橱窗"
        }
      ]
    },
    {
      "value": "745908191140774200",
      "label": "鞋靴",
      "children": []
    },
    {
      "value": "747645711100677929",
      "label": "测试分类32",
      "children": []
    }
  ]
</script>

<template>
  <!--搜索-->
  <div style="padding: 20px;overflow: auto;height: 100%;">
    <div style="font-size: 18px;margin-bottom: 20px;">发布新商品</div>
    <div
      style="display: flex;border: 1px solid #91d5ff;border-radius: 3px;padding:5px 10px;align-items: center;background-color: #F0F7FF;">
      <ExclamationCircleOutlined style="color: #91d5ff;margin-right: 10px;" />
      发布须知：准确选择类目有利于商品曝光，促进转化；若错放类目将会导致流量降权或下架整改、其他违规处理。 查看发布攻略
    </div>
    <div style="border: 1px solid #f5f5f5; border-radius: 5px;padding: 20px;margin-top: 10px;">
      <div>选择分类</div>
      <div style="margin-top: 10px;">
        <a-tree-select v-model:value="typeVal" show-search style="width: 100%;"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" placeholder="请输入关键词搜索分类" allow-clear
          tree-default-expand-all :tree-data="treeData" tree-node-filter-prop="label">
          <template #title="{ value: val, label }">
            <b v-if="val === 'parent 1-1'" style="color: #08c">sss</b>
            <template v-else>{{ label }}</template>
          </template>
        </a-tree-select>
      </div>
      <div
        style="margin-top: 10px;border: 1px solid #d9d9d9;display: grid;grid-template-columns: repeat(3, minmax(0, 1fr));">
        <div>
          <div :class="item.value=='708254360949230782'?'checked_one_type':''" v-for="item in treeData" :key="item.value" style="padding: 10px 20px;display: flex;justify-content: space-between;">
            {{item.label}}
            <RightOutlined style="color: #999999;" />
          </div>
        </div>
        <div>
          <div :class="item.value=='708254360949230782'?'checked_one_type':''" style="display: flex;justify-content: space-between;padding: 10px 20px;border-left: 1px solid #d9d9d9;border-right: 1px solid #d9d9d9;"
            v-for="item in treeData" :key="item.value">
            {{item.label}}
            <RightOutlined style="color: #999999;" />
          </div>
        </div>
        <div>
          <div :class="item.value=='708254360949230782'?'checked_one_type':''" v-for="item in treeData" :key="item.value" style="display: flex;justify-content: space-between;padding: 10px 20px;">
            {{item.label}}
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--导出-->
</template>

<style scoped>
  .checked_one_type{
    background-color: #f7f8fa;
  }
  ::v-deep(.ant-select-selection-search) {
    right: 50px !important;
  }
</style>