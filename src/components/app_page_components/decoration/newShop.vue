<script setup>
  import { inject, onBeforeMount, reactive, ref, watch, shallowRef } from "vue";
  import { FormComponents } from "../../form_components/form";
  import { TableComponents } from "../../table_components/table";
  import { Row, Col, message } from 'ant-design-vue';
  import { InfoCircleOutlined, CheckCircleOutlined, PlusOutlined, ExclamationCircleOutlined, SearchOutlined, RightOutlined } from "@ant-design/icons-vue";
  import AMapLoader from '@amap/amap-jsapi-loader';
  import publishPage from '@/components/app_page_components/decoration/publishPage.vue'//发布商品

  let props = defineProps(["pageData"]);
  const pageData = props.pageData;

  let emit = defineEmits(["openChildPage", "closeChildPage", "toShopDetails", "djtzmk"]);

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
                    children: y.children.length == 0 ? [] : y.children.map((z) => {
                      return {
                        value: z.id,
                        label: z.name,
                      }
                    })
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
    threeList: [],
    fourClassify: '',
  })
  const selClassify = ref('')//已选分类名字
  function onChange(val, label) {
    const path = findCategoryPath(treeData.value, val);
    selClassify.value = ''//清空
    if (path.length > 0) {
      checkClassify.value.oneClassify = path[0].value
      checkClassify.value.oneList = path[0].children
      selClassify.value = path[0].label
    }
    if (path.length > 1) {
      checkClassify.value.twoClassify = path[1].value
      checkClassify.value.twoList = path[1].children
      selClassify.value = path[0].label + ' > ' + path[1].label
    }
    if (path.length > 2) {
      checkClassify.value.threeClassify = path[2].value
      checkClassify.value.threeList = path[2].children
      selClassify.value = path[0].label + ' > ' + path[1].label + ' > ' + path[2].label
    }
    if (path.length > 3) {
      checkClassify.value.fourClassify = path[3].value
      selClassify.value = path[0].label + ' > ' + path[1].label + ' > ' + path[2].label + ' > ' + path[3].label
    }
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
      checkClassify.value.threeList = item.children
    } else if (index == 4) {
      checkClassify.value.fourClassify = item.value
    }
    typeVal.value = item.value
    const path = findCategoryPath(treeData.value, item.value);
    selClassify.value = ''//清空
    if (path.length > 0) {
      selClassify.value = path[0].label
    }
    if (path.length > 1) {
      selClassify.value = path[0].label + ' > ' + path[1].label
    }
    if (path.length > 2) {
      selClassify.value = path[0].label + ' > ' + path[1].label + ' > ' + path[2].label
    }
    if (path.length > 3) {
      selClassify.value = path[0].label + ' > ' + path[1].label + ' > ' + path[2].label + ' > ' + path[3].label
    }
  }

  let arrType = ref([])//缓存的分类
  arrType.value = localStorage.getItem('hcspfl') ? JSON.parse(localStorage.getItem('hcspfl')).slice(0, 4) : []

  const typeVis = ref(1)//1选分类 2 填商品信息

  // 发布该类商品2
  function handFb() {
    pageData.data = pageData.data ? pageData.data : {}
    pageData.data.typeId = [checkClassify.value.oneClassify, checkClassify.value.twoClassify, checkClassify.value.threeClassify, checkClassify.value.fourClassify]
    pageData.data.typeName = selClassify.value
    let arr = selClassify.value.split(' > ')
    if (arr.length != 4) {
      message.error('请选择四级分类！');
      return false
    }
    arrType.value.unshift(selClassify.value)
    arrType.value = [...new Set(arrType.value)];//数组去重
    localStorage.setItem('hcspfl', JSON.stringify(arrType.value))
    typeVis.value = 2
  }
  // 点击缓存的分类
  function cliHcType(str) {
    let arr = str.split(' > ')
    console.log('arr', arr);
    treeData.value.map((one) => {
      if (one.label == arr[0]) {
        one.children.map((two) => {
          if (two.label == arr[1]) {
            two.children.map((three) => {
              if (three.label == arr[2]) {
                three.children.map((four) => {
                  if (four.label == arr[3]) {
                    const path = findCategoryPath(treeData.value, four.value);
                    selClassify.value = ''//清空
                    console.log('path', path);
                    checkClassify.value.oneClassify = path[0].value
                    checkClassify.value.oneList = path[0].children
                    checkClassify.value.twoClassify = path[1].value
                    checkClassify.value.twoList = path[1].children
                    checkClassify.value.threeClassify = path[2].value
                    checkClassify.value.threeList = path[2].children
                    checkClassify.value.fourClassify = path[3].value
                    selClassify.value = path[0].label + ' > ' + path[1].label + ' > ' + path[2].label + ' > ' + path[3].label
                  }
                })
              }
            })
          }
        })
      }
    })
  }
  // 返回上一页
  function closeChildPage(page_key) {
    global.Modal.confirm({
      title: global.findLanguage(
        "确定要返回吗？该操作会导致未保存的数据丢失，请谨慎操作！"
      ),
      okText: global.findLanguage("确定"),
      cancelText: global.findLanguage("取消"),
      okType: "primary",
      onOk: function () {
        emit("closeChildPage", page_key);
      },
    });
  }
  // 保存成功
  function closeChildPageTwo(page_key) {
    global.Modal.confirm({
      title: global.findLanguage(
        "保存成功，点击确定返回上一页！"
      ),
      okText: global.findLanguage("确定"),
      cancelText: global.findLanguage("取消"),
      okType: "primary",
      onOk: function () {
        emit("closeChildPage", page_key);
      },
    });
  }
  // 跳转其它路由
  function handUrl(url) {
    global.router.push(url)
  }
  const spinning = ref(false)//加载
  // 子组件的修改分类
  function editType() {
    typeVis.value = 1
  }
  // 去店铺详情
  function toShopInfo() {
    console.log('去店铺详情');
    emit('toShopDetails')
  }
  // 去运费模板
  function _djtzmk() {
    emit("djtzmk", '快递物流', '运费模板');
  }
  function handleClick() {
    console.log('111');

  }
</script>

<template>
  <!--搜索-->
  <a-spin :spinning="spinning">
    <div v-if="typeVis==1" class="a1">
      <div class="a2">
        <a-button v-show="pageData.hasOwnProperty('parent_page_key')" class="iconfont button-class a3"
          @click="closeChildPage(pageData.page_key)">&#xe6d2;
        </a-button>
        <div style="font-size: 18px;">发布新商品</div>
      </div>
      <div class="a4">
        <ExclamationCircleOutlined class="a5" />
        发布须知：准确选择类目有利于商品曝光，促进转化；若错放类目将会导致流量降权或下架整改、其他违规处理。 <span style="color: #1890FF
      " @click="handUrl('/ruleCenter?title=帮助中心')">查看发布攻略</span>
      </div>
      <div class="a6">
        <div v-if="arrType.length>0" style="margin-bottom: 10px;">
          <div style="margin-bottom: 10px;">最近使用的分类</div>
          <div>
            <span @click="cliHcType(item)" v-for="item in arrType" :key="item" class="hover a7">{{item}}</span>
          </div>
        </div>
        <div class="a8">
          <div>选择分类</div>
          <div class="a9">商品分类请选到四级</div>
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
        <div class="a10">
          <div>
            <div @click="editData(1,item)" :class="item.value==checkClassify.oneClassify?'checked_one_type':''"
              v-for="item in treeData" :key="item.value" class="a11">
              {{item.label}}
              <RightOutlined style="color: #999999;" />
            </div>
          </div>
          <div class="a12">
            <div v-if="checkClassify.oneList.length==0">
              <a-empty style="margin-top: 10%;" />
            </div>
            <div @click="editData(2,item)" :class="item.value==checkClassify.twoClassify?'checked_one_type':''"
              class="a13" v-for="item in checkClassify.oneList" :key="item.value">
              {{item.label}}
              <RightOutlined style="color: #999999;" />
            </div>
          </div>
          <div class="a12">
            <div v-if="checkClassify.twoList.length==0">
              <a-empty style="margin-top: 10%;" />
            </div>
            <div @click="editData(3,item)" :class="item.value==checkClassify.threeClassify?'checked_one_type':''"
              v-for="item in checkClassify.twoList" :key="item.value" class="a14">
              {{item.label}}
            </div>
          </div>
          <div>
            <div v-if="checkClassify.threeList.length==0">
              <a-empty style="margin-top: 10%;" />
            </div>
            <div @click="editData(4,item)" :class="item.value==checkClassify.fourClassify?'checked_one_type':''"
              v-for="item in checkClassify.threeList" :key="item.value" class="a14">
              {{item.label}}
            </div>
          </div>
        </div>
        <!-- 已选分类 -->
        <div v-if="selClassify" class="a15">
          <div>已选分类</div>
          <div style="margin-left: 20px;">
            <div>{{selClassify}}</div>
          </div>
        </div>
      </div>
      <!-- 确认发布按钮 -->
      <div class="a16">
        <a-button @click="handFb" type="primary">确认发布该类商品</a-button>
      </div>
    </div>
    <div v-else class="a17">
      <publishPage :pageData="pageData" @closeChildPageTwo="closeChildPageTwo" @closeChildPage="closeChildPage"
        @editType="editType" @openChildPage="openChildPage" @toShopInfo="toShopInfo" @djtzmk="_djtzmk" />
    </div>
  </a-spin>
</template>

<style scoped>
  .hover:hover {
    color: #1890FF;
  }

  .checked_one_type {
    background-color: #f7f8fa;
  }

  ::v-deep(.ant-select-selection-search) {
    right: 50px !important;
  }

  .a1 {
    padding: 0px 10px;
    overflow: auto;
    height: 100%;
  }

  .a2 {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .a3 {
    font-size: 18px !important;
    padding: 0 10px;
    float: left;
    margin-right: 20px;
  }

  .a4 {
    display: flex;
    border: 1px solid #91d5ff;
    border-radius: 3px;
    padding: 5px 10px;
    align-items: center;
    background-color: #F0F7FF;
  }

  .a5 {
    color: #91d5ff;
    margin-right: 10px;
  }

  .a6 {
    border: 1px solid #f5f5f5;
    border-radius: 5px;
    padding: 20px;
    margin-top: 10px;
  }

  .a7 {
    background-color: #f7f8fa;
    padding: 5px;
    border-radius: 5px;
    margin-right: 10px;
  }

  .a8 {
    display: flex;
    align-items: center;
  }

  .a9 {
    color: red;
    margin-left: 20px;
    font-size: 12px;
  }

  .a10 {
    margin-top: 10px;
    border: 1px solid #d9d9d9;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border-radius: 4px;
  }

  .a11 {
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
  }

  .a12 {
    border-left: 1px solid #d9d9d9;
    border-right: 1px solid #d9d9d9;
  }

  .a13 {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
  }

  .a14 {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
  }

  .a15 {
    background-color: #f7f8fa;
    padding: 20px;
    margin-top: 10px;
    display: flex;
  }

  .a16 {
    text-align: center;
    margin-top: 20px;
  }

  .a17 {
    padding: 0px 10px;
    overflow: auto;
    height: 100%;
  }

  .a18 {
    padding: 20px;
    text-align: center;
  }
</style>