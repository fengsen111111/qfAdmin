<script setup>
  import { inject, onBeforeMount, reactive, ref, watch, shallowRef } from "vue";
  import { FormComponents } from "../../form_components/form";
  import { TableComponents } from "../../table_components/table";
  import { Row, Col, message } from 'ant-design-vue';
  import { InfoCircleOutlined, CheckCircleOutlined, PlusOutlined, ExclamationCircleOutlined, SearchOutlined, RightOutlined } from "@ant-design/icons-vue";
  import AMapLoader from '@amap/amap-jsapi-loader';
  let props = defineProps(["pageData"]);
  const pageData = props.pageData;

  let emit = defineEmits(["openChildPage", "closeChildPage"]);

  const global = inject("global").value;

  const typeVal = ref()//分类数据绑定
  const treeData = ref([])//分类数据
  function getGoodsTypeList() {
    global.axios
      .post('decoration/GoodsType/getGoodsTypeList', {}, global)
      .then((res) => {
        // console.log('商品分类列表', res.list);
        treeData.value = res.list.map((item) => {
          return {
            value: item.id,
            label: item.name,
            children: item.children.length == 0 ? [] : item.children.map((iss) => {
              return {
                value: iss.id,
                label: iss.name,
                children: iss.children.length == 0 ? [] : iss.children.map((y) => {
                  return {
                    value: y.id,
                    label: y.name,
                  }
                })
              }
            })
          }
        })
      });
  }
  getGoodsTypeList()
  const checkClassify = ref({
    oneClassify: '',
    oneList: [],
    twoClassify: '',
    twoList: [],
    threeClassify: '',
  })
  const selClassify = ref('')//已选分类名字
  const isXn = ref(false)//是否是虚拟类目
  function onChange(val, label) {
    const path = findCategoryPath(treeData.value, val);
    // console.log('找到上级数据', path);
    selClassify.value = ''//清空
    if (path[0].label == '虚拟商品') {
      isXn.value = true
    } else {
      isXn.value = false
    }
    if (path.length >0) {
      checkClassify.value.oneClassify = path[0].value
      checkClassify.value.oneList = path[0].children
      selClassify.value = path[0].label
    }
    if (path.length >1) {
      checkClassify.value.twoClassify = path[1].value
      checkClassify.value.twoList = path[1].children
      selClassify.value = path[0].label + ' > ' + path[1].label
    }
    if (path.length >2) {
      checkClassify.value.threeClassify = path[2].value
      selClassify.value = path[0].label + ' > ' + path[1].label + ' > ' + path[2].label
    }
    // console.log('typeVal',typeVal.value);

  }
  function findCategoryPath(data, val, path = []) {
    for (const category of data) {
      if (category.value === val) {
        return [...path, category]; // 找到目标，返回路径
      }
      if (category.children && category.children.length > 0) {
        const result = findCategoryPath(category.children, val, [...path, category]);
        if (result) return result;
      }
    }
    return null; // 未找到
  }

  // 
  function editData(index, item) {
    if (index == 1) {
      checkClassify.value.oneClassify = item.value
      checkClassify.value.oneList = item.children
      checkClassify.value.twoList = []
    } else if (index == 2) {
      checkClassify.value.twoClassify = item.value
      checkClassify.value.twoList = item.children
    } else if (index == 3) {
      checkClassify.value.threeClassify = item.value
    }
    typeVal.value = item.value
    // console.log('点击的级别',index);
    // console.log('点击的数据',item);
    const path = findCategoryPath(treeData.value, item.value);
    // console.log('上级数据',path);
    selClassify.value = ''//清空
    if (path[0].label == '虚拟商品') {
      isXn.value = true
    } else {
      isXn.value = false
    }
    if (path.length >0) {
      selClassify.value = path[0].label
    }
    if (path.length >1) {
      selClassify.value = path[0].label + ' > ' + path[1].label
    }
    if (path.length >2) {
      selClassify.value = path[0].label + ' > ' + path[1].label + ' > ' + path[2].label
    }
  }

  let arrType = ref([])//缓存的分类
  arrType.value = localStorage.getItem('hcspfl') ? JSON.parse(localStorage.getItem('hcspfl')).slice(0, 4) : []
  // console.log('缓存的分类', arrType.value);

  // 发布该类商品
  function handFb() {
    let arr = selClassify.value.split(' > ')
    console.log('arr', arr);
    if (arr.length != 3) {
      message.error('请选择三级分类！');
      return false
    }
    arrType.value.unshift(selClassify.value)
    arrType.value = [...new Set(arrType.value)];//数组去重
    localStorage.setItem('hcspfl', JSON.stringify(arrType.value))
  }
  // 点击缓存的分类
  function cliHcType(str) {
    // console.log('点击缓存的分类', str);
    let arr = str.split(' > ')
    treeData.value.map((one) => {
      if (one.label == arr[0]) {
        one.children.map((two) => {
          if (two.label == arr[1]) {
            two.children.map((three) => {
              if (three.label == arr[2]) {
                const path = findCategoryPath(treeData.value, three.value);
                // console.log('path',path);
                selClassify.value = ''//清空
                if (path[0].label == '虚拟商品') {
                  isXn.value = true
                } else {
                  isXn.value = false
                }
                if (path.length >0) {
                  checkClassify.value.oneClassify = path[0].value
                  checkClassify.value.oneList = path[0].children
                  selClassify.value = path[0].label
                }
                if (path.length >1) {
                  checkClassify.value.twoClassify = path[1].value
                  checkClassify.value.twoList = path[1].children
                  selClassify.value = path[0].label + ' > ' + path[1].label
                }
                if (path.length >2) {
                  checkClassify.value.threeClassify = path[2].value
                  selClassify.value = path[0].label + ' > ' + path[1].label + ' > ' + path[2].label
                }
              }
            })
          }
        })
      }
    })
  }


</script>

<template>
  <!--搜索-->
  <div style="padding: 20px;overflow: auto;height: 100%;">
    <div style="font-size: 18px;margin-bottom: 20px;">发布新商品</div>
    <div
      style="display: flex;border: 1px solid #91d5ff;border-radius: 3px;padding:5px 10px;align-items: center;background-color: #F0F7FF;">
      <ExclamationCircleOutlined style="color: #91d5ff;margin-right: 10px;" />
      发布须知：准确选择类目有利于商品曝光，促进转化；若错放类目将会导致流量降权或下架整改、其他违规处理。 <span style="color: #1890FF
      ">查看发布攻略</span>
    </div>
    <div style="border: 1px solid #f5f5f5; border-radius: 5px;padding: 20px;margin-top: 10px;">
      <div v-if="arrType.length>0" style="margin-bottom: 10px;">
        <div style="margin-bottom: 10px;">最近使用的分类</div>
        <div>
          <span @click="cliHcType(item)" v-for="item in arrType" :key="item" class="hover"
            style="background-color: #f7f8fa;padding: 5px;border-radius: 5px;margin-right: 10px;">{{item}}</span>
        </div>
      </div>
      <div style="display: flex;align-items: center;">
        <div>选择分类</div>
        <div style="color: red;margin-left: 20px;font-size: 12px;">商品分类请选到三级</div>
      </div>
      <div style="margin-top: 10px;">
        <a-tree-select @change="onChange" v-model:value="typeVal" show-search style="width: 100%;"
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
          <div @click="editData(1,item)" :class="item.value==checkClassify.oneClassify?'checked_one_type':''"
            v-for="item in treeData" :key="item.value"
            style="padding: 10px 20px;display: flex;justify-content: space-between;">
            {{item.label}}
            <RightOutlined style="color: #999999;" />
          </div>
        </div>
        <div style="border-left: 1px solid #d9d9d9;border-right: 1px solid #d9d9d9;">
          <div v-if="checkClassify.oneList.length==0">
            <a-empty style="margin-top: 10%;" />
          </div>
          <div @click="editData(2,item)" :class="item.value==checkClassify.twoClassify?'checked_one_type':''"
            style="display: flex;justify-content: space-between;padding: 10px 20px;"
            v-for="item in checkClassify.oneList" :key="item.value">
            {{item.label}}
            <RightOutlined style="color: #999999;" />
          </div>
        </div>
        <div>
          <div v-if="checkClassify.twoList.length==0">
            <a-empty style="margin-top: 10%;" />
          </div>
          <div @click="editData(3,item)" :class="item.value==checkClassify.threeClassify?'checked_one_type':''"
            v-for="item in checkClassify.twoList" :key="item.value"
            style="display: flex;justify-content: space-between;padding: 10px 20px;">
            {{item.label}}
          </div>
        </div>
      </div>
      <!-- 已选分类 -->
      <div v-if="selClassify" style="background-color: #f7f8fa;padding: 20px;margin-top: 10px;display: flex;">
        <div>已选分类</div>
        <div style="margin-left: 20px;">
          <div>{{selClassify}}</div>
          <div v-if="isXn" style="color: #FF7300;"> 本类目为虚拟商品类目，请勿发布实物商品 </div>
        </div>
      </div>
    </div>
    <!-- 确认发布按钮 -->
    <div style="text-align: center;margin-top: 20px;">
      <a-button @click="handFb" type="primary">确认发布该类商品</a-button>
    </div>
  </div>
  <!--导出-->
</template>

<style scoped>

  .hover:hover{
    color: #1890FF;
  }

  .checked_one_type {
    background-color: #f7f8fa;
  }

  ::v-deep(.ant-select-selection-search) {
    right: 50px !important;
  }
</style>