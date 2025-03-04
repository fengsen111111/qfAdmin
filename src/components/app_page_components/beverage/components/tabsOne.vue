<script setup>
  import { ref, inject, reactive, defineProps } from 'vue'


  import Editor from '@tinymce/tinymce-vue'

  import 'tinymce/tinymce'
  import 'tinymce/themes/silver/theme'
  import 'tinymce/icons/default'
  import 'tinymce/models/dom'

  import 'tinymce/plugins/image' // 插入上传图片插件
  import 'tinymce/plugins/media' // 插入视频插件
  import 'tinymce/plugins/table' // 插入表格插件
  import 'tinymce/plugins/lists' // 列表插件
  import 'tinymce/plugins/link' //  链接插件
  import 'tinymce/plugins/wordcount' // 字数统计插件

  const props = defineProps({
    shopId: {
      type: String,
    }
  });
  // console.log('props传值', props.shopId);

  const global = inject('global').value

  let shopParams = ref([])
  // 商品参数
  const _shopParams = () => {
    global.axios
      .post('beverage/GoodsAttribute/findTableRecords', {}, global)
      .then((res) => {
        shopParams.value = res.list
        // console.log('商品参数数据', shopParams.value);
        formState.value.attributes = []
        res.list.map((item) => {
          formState.value.attributes.push({
            goods_attribute_id: item.id,
            value: '',
            name: item.name
          })
        })
        _shopDetails() //重新赋值
      });
  }
  _shopParams()

  let formState = ref({
    goods_type_id: "",//商品分类ID
    name: "",//商品名称  
    introduce: "",//摘要
    cover_image: '',//封面图
    content: "",//详情
    level_one: "",//一级规格ID
    level_two: "",//二级规格ID  
    level_changes: "",//规格换算  
    attributes: [
      {
        goods_attribute_id: '',//选择参数
        value: '',//参数值
      }
    ],//商品参数
  })//基础信息所有数据
  let checkedList = ref([])
  let checkAll = ref(false)
  const onCheckAllChange = () => {
    console.log('全选');
    if (checkedList.value.length == serveList.value.length) {
      checkedList.value = []
      checkAll.value = false
    } else {
      checkAll.value = true
      checkedList.value = []
      serveList.value.map((item) => {
        checkedList.value.push(item.value)
      })
    }
  }

  const _shopDetails = () => {
    global.axios
      .post('beverage/Goods/getGoods', {
        id: props.shopId
      }, global)
      .then((res) => {
        // console.log('商品数据', res);
        formState.value = {
          goods_type_id: res.goods_type_id,//商品分类ID
          name: res.name,//商品名称  
          cover_image: res.cover_image,//封面图
          introduce: res.introduce,//摘要  
          content: res.content,//详情
          level_one: res.level_one,//一级规格ID
          level_two: res.level_two,//二级规格ID  
          level_changes: res.level_changes,//规格换算  
          // attributes: res.attributes,//商品参数
        }
        // 商品参数单独更新
        formState.value.attributes = []//先清空数据
        console.log('商品参数form', shopParams.value);
        console.log('打开商品的规格', res.attributes);
        // 不等于 undefined
        if (res.attributes) {
          // 不是[] 
          if (res.attributes.length) {
            shopParams.value.map((item) => {
              res.attributes.map((iss) => {
                if (item.id == iss.goods_attribute_id) {
                  // 匹配成功
                  formState.value.attributes.push({
                    ...iss,
                    name: item.name
                  })
                }
              })
            })
          } else {
            // 没有数据时
            shopParams.value.map((key) => {
              formState.value.attributes.push({
                goods_attribute_id: key.id,
                name: key.name,
                value: ''
              })
            })
          }
        }else{
          // 没有数据时
          shopParams.value.map((key) => {
              formState.value.attributes.push({
                goods_attribute_id: key.id,
                name: key.name,
                value: ''
              })
            })
        }

        // 富文本单独更新
        component_state.myValue = res.content
        // 服务勾选单独更新
        checkedList.value = res.services
      });
  }
  if (props.shopId) {
    // 编辑商品
    _shopDetails()
  }
  const component_state = reactive({
    isCollapse: false,
    myValue: formState.content,
    init: {
      promotion: false,
      language_url: `/tinymce/langs/zh_CN.js`,
      language: 'zh_CN',
      selector: "#init",
      skin_url: `/tinymce/skins/ui/oxide`,
      content_css: `/tinymce/skins/content/default/content.css`,
      height: '30vh',
      plugins: 'lists image media table wordcount link',
      toolbar: false,
      branding: false,
      menubar: true,
      paste_data_images: false, // 允许粘贴图像
      images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
        global.file.uploadFile(global, blobInfo.blob(), 'rich_text_file', 'rich_text_file', true, resolve)
      }),
      file_picker_types: 'media',
      video_template_callback: function (data) {
        return '<span class="mce-preview-object mce-object-video" contenteditable="false" data-mce-object="video" data-mce-p-allowfullscreen="allowfullscreen" data-mce-p-frameborder="no" data-mce-p-scrolling="no" data-mce-p-src=' + data.source + ' data-mce-p-width=' + data.width + ' data-mce-p-height=' + data.height + ' data-mce-p-controls="controls" data-mce-html="%20"> <video width=' + data.width + ' height=' + data.height + ' controls="controls"> <source src=' + data.source + ' type=' + data.sourcemime + '></source> </video> </span>';
      },
      file_picker_callback: (callback, value, meta) => {
        let input = document.createElement('input');//创建一个隐藏的input
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'video/*');
        input.onchange = function () {
          let fileObj = this.files[0];//选取第一个文件
          global.file.uploadFile(global, fileObj, 'rich_text_file', 'rich_text_file', true, callback);
        };
        //触发点击
        input.click();
      }
    },
  })

  const typeList = ref([])
  // 分类列表
  const _typeList = () => {
    global.axios
      .post('beverage/GoodsType/getTypeList', {}, global)
      .then((res) => {
        typeList.value = res.list
        // console.log('分类数据', typeList.value);
      });
  }
  _typeList()

  const serveList = ref([])
  // 服务列表信息
  const _serveList = () => {
    global.axios
      .post('beverage/GoodsService/getServiceList', {}, global)
      .then((res) => {
        serveList.value = res.list
        // console.log('服务数据', serveList.value);
      });
  }
  _serveList()



  let guigeList = ref([])
  let guigeListTwo = ref([])
  const _guigeList = () => {
    global.axios
      .post('beverage/GoodsSize/findTableRecords', {}, global)
      .then((res) => {
        guigeList.value = res.list.filter(item=>item.level=='a')
        guigeListTwo.value = res.list.filter(item=>item.level=='b')
        console.log('商品规格数据', guigeList.value);
      });
  }

  _guigeList()

  const changeServer = () => {
    console.log('服务数据', checkedList.value);
  }
  // 暴露数据出去
  defineExpose({
    formState,
    checkedList,
    component_state,
    _shopDetails
  })


  // 上传
  function upload(options) {
    console.log('option', options);
    global.file.uploadFile(global, options.file, 'image', 'shopImg', true, complete)
  }
  // 封面图
  function complete(response) {
    formState.value.cover_image = response.url
  }


</script>


<template>
  <div class="auto">
    <div>
      <a-form :model="formState" :label-col="{style: {width: '120px'}}" :wrapper-col="{sapn:14}">
        <div class="jbxx">
          <!-- {{props.shopId}} -->
          基础信息
        </div>
        <a-row>
          <a-col :span="13">
            <a-form-item label="商品封面图">
              <div v-if="formState.cover_image">
                <img style="width: 100px;border-radius: 4px;" :src="formState.cover_image" alt="" />
              </div>
              <div class="xztp">
                <a-upload :customRequest="upload" :file-list="[]" list-type="text">
                  选择图片
                </a-upload>
              </div>
            </a-form-item>

          </a-col>

          <a-col :span="13">
            <a-form-item label="所属分类">
              <a-tree-select v-model:value="formState.goods_type_id"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                :fieldNames="{children:'children', title:'label', key:'value', value: 'value' }" placeholder="请选择二级分类"
                :tree-data="typeList" class="ssfl" />
            </a-form-item>
          </a-col>

          <a-col :span="13">
            <a-form-item label="商品名称">
              <a-input v-model:value="formState.name" placeholder="请输入商品名称" />
            </a-form-item>
          </a-col>

          <a-col :span="13">
            <a-form-item label="商品摘要">
              <a-input v-model:value="formState.introduce" placeholder="请输入商品摘要" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="6">
            <a-form-item label="一级规格">
              <a-select v-model:value="formState.level_one" placeholder="选择">
                <a-select-option v-for="item in guigeList" :key="item.id"
                  :value="item.id">{{item.name}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="二级规格">
              <a-select v-model:value="formState.level_two" placeholder="选择">
                <a-select-option v-for="item in guigeListTwo" :key="item.id"
                  :value="item.id">{{item.name}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="规格换算">
              <a-input onkeyup="value=value.replace(/[^\d]/g,'')" v-model:value="formState.level_changes"
                placeholder="请输入规格换算" />
            </a-form-item>
          </a-col>
        </a-row>

        <div class="spxx">
          商品信息</div>
        <a-row>
          <a-col :span="12">
            <a-form-item label="商品服务">
              <a-checkbox v-model:checked="checkAll" :indeterminate="false" @change="onCheckAllChange">
                全选
              </a-checkbox>
              <br>
              <a-checkbox-group v-model:value="checkedList" :options="serveList" @change="changeServer">
                <template #label="{ value }">
                  <span>{{ label }}</span>
                </template>
              </a-checkbox-group>
            </a-form-item>
            <!-- {{formState.attributes}} -->
            <a-form-item label="商品参数" v-if="formState.attributes">
              <table class="table_one">
                <tr class="bgF5">
                  <th scope="col">商品参数名称</th>
                  <th scope="col">参数值</th>
                </tr>
                <tr v-for="item in formState.attributes" :key="item.goods_attribute_id">
                  <td>{{item.name}}</td>
                  <td><a-input type="text" v-model:value="item.value" /></td>
                </tr>
              </table>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="商品详情">
              <editor id="init" v-model="component_state.myValue" :init="component_state.init">
              </editor>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
  </div>
</template>


<style>
  .auto {
    overflow: auto;
    height: 100%;
  }

  /* 商品信息css */
  .jbxx {
    background-color: #f5F5F5;
    padding: 10px 20px;
    width: 100%;
    margin-bottom: 20px;
    font-weight: bold;
  }

  .ssfl {
    width: 100%;
    overflow-x: scroll;
    white-space: nowrap;
  }

  .spxx {
    background-color: #f5F5F5;
    padding: 10px 20px;
    width: 100%;
    margin-bottom: 20px;
    font-weight: bold;
  }

  .bgF5 {
    background-color: #f5F5F5;
  }

  /* 商品信息css */




  .table_one {
    border-collapse: collapse;
    border: 1px solid rgb(140 140 140);
    font-family: sans-serif;
    font-size: 0.8rem;
    letter-spacing: 1px;
    text-align: center;
  }

  .table_two {
    border-collapse: collapse;
    border: 2px solid #1890ff;
    font-family: sans-serif;
    font-size: 0.8rem;
    letter-spacing: 1px;
    text-align: center;
  }



  .table_one th,
  td {
    border: 1px solid #e9e9e9;
    padding: 10px 60px;
  }

  .table_two th,
  td {
    border: 1px solid #e9e9e9;
    padding: 10px 20px;
  }

  td:last-of-type {
    text-align: center;
  }

  .ant-tabs-card>.ant-tabs-nav .ant-tabs-tab-active,
  .ant-tabs-card>div>.ant-tabs-nav .ant-tabs-tab-active {
    background: #1890ff !important;
    color: white !important;
  }


  .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    text-shadow: 0 0 0.25px currentcolor;
    color: white !important;
  }

  .ant-tabs-tab {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 12px 0;
    font-size: 14px;
    background: transparent;
    border: 0;
    outline: none;
    cursor: pointer;
    margin-right: 20px !important;
    background: white !important;
    font-weight: bold;
    border: 2px solid #f5f5f5 !important;
    border-radius: 10px 10px 0px 0px !important;
  }
</style>