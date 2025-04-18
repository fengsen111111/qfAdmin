<script setup>
  import { inject, onBeforeMount, reactive, ref, getCurrentInstance, watch } from "vue";
  import { FormComponents } from "../../form_components/form";
  import { TableComponents } from "../../table_components/table";
  import { InfoCircleOutlined, UpCircleOutlined, DownCircleOutlined, PlusOutlined, CloseCircleOutlined } from "@ant-design/icons-vue";
  import { message } from 'ant-design-vue';

  let emit = defineEmits(["openChildPage", "closeChildPage"]);
  const global = inject("global").value;


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

  const post_params = reactive({
    id: '',//商品ID 修改时必传  
    name: '',//商品名
    store_id: '',//门店ID    
    cover_image: '',//封面图   
    images: [
      // 'https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025219/gg18q1kw4mis6i77msqtb1nqbh3sso1r.png',
      // 'https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025219/gg18q1kw4mis6i77msqtb1nqbh3sso1r.png',
      // 'https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025219/gg18q1kw4mis6i77msqtb1nqbh3sso1r.png',
      // 'https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025219/gg18q1kw4mis6i77msqtb1nqbh3sso1r.png',
      // 'https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025219/gg18q1kw4mis6i77msqtb1nqbh3sso1r.png',
      // 'https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025219/gg18q1kw4mis6i77msqtb1nqbh3sso1r.png',
      // 'https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025219/gg18q1kw4mis6i77msqtb1nqbh3sso1r.png',
      // 'https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025219/gg18q1kw4mis6i77msqtb1nqbh3sso1r.png',
      // 'https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025219/gg18q1kw4mis6i77msqtb1nqbh3sso1r.png',
      // 'https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025219/gg18q1kw4mis6i77msqtb1nqbh3sso1r.png'
    ],//相册  
    detail: '',//详情 富文本  
    type_id: '',//商品分类ID  
    brand_id: '',//商品品牌ID   
    status: false,//启用状态 Y上架 N下架    
    attributes: [
      // {
      //   key: '产地',
      //   value: '四川'
      // }
    ],//商品属性  
    services: [
      // {
      //   key: '全网低价',
      //   value: '多平台对比，优惠力度最大'
      // },
      // {
      //   key: '热销爆款',
      //   value: '热门商品，大家都在买'
      // }
    ],//商品服务  
    goods_sizes: [
      // {
      //   id: '',//
      //   name: '',//名称  
      //   stock: '',//库存
      //   old_price: '',//原价
      //   price: '',//价格
      //   uper_status: false,//是否需要推荐官推荐
      //   commission: '',//佣金
      //   status: false,//启用状态
      //   order: '',//排序  
      // }
    ],//商品规格  post_params
    goods_type: 'a',//商品类型 a普通商品 b海外进口 c海外CC个人行邮  
    is_used: 'N',//是否二手 Y是 N不是  
    is_customized: 'N',//是否定制 Y是 N不是  
    is_plan_salled: 'a',//是否预售 a非预售 b定时预售 c时段预售 d规格预售    
    need_send_time: 'a',//承诺发货时间 a当日发货 b24小时 c48小时  
    carriage_id: '',//运费模板ID 
  })
  const bfb = ref(0)//填写进度

  watch(() => post_params.type_id, (newVal, oldVal) => {
    console.log('type_id 分类变化:', newVal);
    bfb.value = 50
    if (post_params.brand_id) {
      bfb.value = 100
    }
  });

  const del_pp_text = ref(false)

  watch(() => post_params.brand_id, (newVal, oldVal) => {
    del_pp_text.value = false
    console.log('brand_id 品牌变化:', newVal);
    setTimeout(() => {
      const exists = ppList.some(item => item.value == newVal);
      if (exists) {
        bfb.value = 50
        if (post_params.type_id) {
          bfb.value = 100
        }
      } else {
        // 品牌已删除
        post_params.brand_id = ''
        del_pp_text.value = true
      }
    }, 2000);

  });


  // 删除服务
  function delFw(index) {
    post_params.services.splice(index, 1)
  }
  // 删除属性
  function delSx(index) {
    post_params.attributes.splice(index, 1)
  }
  // 删除轮播图
  function delImgLb(index) {
    post_params.images.splice(index, 1)
  }
  // 删除封面图
  function delImgFm(index) {
    post_params.cover_image = ''
  }
  // 添加规格
  function addGG() {
    post_params.goods_sizes.push({
      id: '',//
      name: '',//名称  
      stock: '',//库存
      old_price: '',//原价
      price: '',//价格
      uper_status: false,//是否需要推荐官推荐
      commission: '',//佣金
      status: false,//启用状态
      order: '',//排序  
    })
  }
  // 删除规格
  function delGG(index) {
    post_params.goods_sizes.splice(index, 1)
  }

  const component_state = reactive({
    isCollapse: false,
    myValue: post_params.detail,
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
      paste_as_text: true,  // 纯文本粘贴，避免额外格式
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
      },
    },
  })

  let props = defineProps(["pageData"]);
  const pageData = props.pageData;
  console.log('props数据', props.pageData.data);
  // 查看当前数据
  function lookData() {
    global.axios
      .post('decoration/Goods/webGetGoodsDetail', {
        id: props.pageData.data.id
      }, global)
      .then((res) => {
        console.log('商品数据', res.goods_datas);
        if (res.goods_datas) {
          res.goods_datas.id = props.pageData.data.id
          res.goods_datas.status = res.goods_datas.status == 'Y' ? true : false
          component_state.myValue = res.goods_datas.detail
          res.goods_datas.goods_sizes.map((item) => {
            item.status = item.status == 'Y' ? true : false
            item.uper_status = item.uper_status == 'Y' ? true : false
          })
          // 富文本单独更新
          Object.assign(post_params, res.goods_datas);
          // post_params.goods_type = res.goods_type//商品类型 a普通商品 b海外进口 c海外CC个人行邮  
          // post_params.is_used = res.is_used//是否二手 Y是 N不是 
          // post_params.is_customized = res.is_customized//是否定制 Y是 N不是  
          // post_params.is_plan_salled = res.is_plan_salled//是否预售 a非预售 b定时预售 c时段预售 d规格预售 
          // post_params.need_send_time = res.need_send_time//承诺发货时间 a当日发货 b24小时 c48小时  
          // post_params.carriage_id = res.carriage_id//运费模板ID
        } else {
          // 是新增时清空
          // post_params.id = ''
          // post_params.name = ''
          // post_params.store_id = ''
          // post_params.cover_image = ''
          // post_params.images = []
          // post_params.detail = ''
          // post_params.type_id = ''
          // post_params.brand_id = ''
          // post_params.status = ''
          // post_params.attributes = []
          // post_params.services = []
          // post_params.goods_sizes = []
          // // 
          // post_params.goods_type = 'a'//商品类型 a普通商品 b海外进口 c海外CC个人行邮  
          // post_params.is_used = 'N'//是否二手 Y是 N不是 
          // post_params.is_customized = 'N'//是否定制 Y是 N不是  
          // post_params.is_plan_salled = 'a'//是否预售 a非预售 b定时预售 c时段预售 d规格预售 
          // post_params.need_send_time = 'a'//承诺发货时间 a当日发货 b24小时 c48小时  
          // post_params.carriage_id = ''//运费模板ID
        }
      })
  }
  // 有数据，编辑数据
  if (props.pageData.data.id) {
    lookData()
  } else {
    // 没有id就是新增商品
    post_params.type_id = props.pageData.data.typeId
  }

  const activeKey = ref(['1', '2']);

  const visibleSx = ref(false)
  const SxName = ref('')//添加的属性名
  // 添加属性
  function addSx() {
    console.log('name', SxName.value);
    if (!SxName.value) {
      message.error('请填写属性')
      return false
    }
    post_params.attributes.push({
      key: SxName.value,
      value: ''
    })
    SxName.value = ''
    visibleSx.value = false
  }

  const FwName = ref('')//服务添加内容
  const visibleFw = ref(false)//服务弹框开关
  // 添加服务
  function addFw() {
    console.log('name', FwName.value);
    if (!FwName.value) {
      message.error('请填写服务')
      return false
    }
    post_params.services.push({
      key: FwName.value,
      value: ''
    })
    FwName.value = ''
    visibleFw.value = false
  }

  // 上传封面
  function uploadFm(options) {
    console.log('option', options);
    global.file.uploadFile(global, options.file, 'image', 'coverImg', true, completeFm)
  }
  // 封面图
  function completeFm(response) {
    post_params.cover_image = response.url
    console.log('回调', response);
  }

  const sqJbxx = ref(false)//商品信息收起展开
  const ser_sqJbxx = ref(false)//服务信息收起展开

  let uploadQueue = []; // 保存要上传的文件
  let isUploading = false; //用于指示上传进度的标志
  // 批量上传
  function upload(options) {
    uploadQueue.push(options);
    if (!isUploading) {
      processQueue();
    }
  }
  async function processQueue() {
    isUploading = true;
    while (uploadQueue.length > 0) {
      const currentOptions = uploadQueue.shift(); // 从队列中删除第一个文件
      try {
        // 等待当前文件上传
        await uploadFileWrapper(global, currentOptions.file, 'image', 'shopImg', true, completeList);
        console.log('上传成功');
      } catch (error) {
        console.log('上传失败');
      }
    }
    isUploading = false; // 队列处理完成时重置标志
  }
  function uploadFileWrapper(global, file, type, category, flag, callback) {
    return new Promise((resolve, reject) => {
      global.file.uploadFile(global, file, type, category, flag, (err, result) => {
        if (err) reject(err);
        else resolve(result);
        completeList(err)
      });
    });
  }
  // 上传回调
  function completeList(response) {
    console.log('商品图片回调', response);
    post_params.images.push(response.url)
  }
  // 商家id
  function getStoreID() {
    global.axios
      .post('decoration/Store/getStoreID', {}, global)
      .then((res) => {
        // console.log('商家id', res);
        post_params.store_id = res.store_id
        getGoodsTypeList()
        getGoodsBrandList()
      });
  }
  getStoreID()
  const spflList = ref([])//商品分类列表
  // 商品分类列表
  function getGoodsTypeList() {
    global.axios
      .post('decoration/GoodsType/getGoodsTypeList', {
        // store_id: post_params.store_id
      }, global)
      .then((res) => {
        console.log('商品分类列表', res.list);
        spflList.value = res.list
      });
  }
  const ppList = ref([])//品牌列表
  // 商品品牌列表
  function getGoodsBrandList() {
    global.axios
      .post('decoration/Setting/getGoodsBrandList', {
        store_id: post_params.store_id
      }, global)
      .then((res) => {
        // console.log('商品品牌列表', res);
        ppList.value = res.list
      });
  }

  let spinning = ref(false) //加载状态
  function loading() {
    spinning.value = true
    setTimeout(() => {
      spinning.value = false
    }, 1000);
  }
  // 提交商品数据
  function tjShopData() {
    post_params.detail = component_state.myValue
    post_params.status = post_params.status ? 'Y' : 'N',
      post_params.goods_sizes.map((item) => {
        item.uper_status = item.uper_status ? 'Y' : 'N',//是否需要推荐官推荐
          item.status = item.status ? 'Y' : 'N'//启用状态
      })

    if (post_params.type_id.value) {
      // 有值就重新拿
      post_params.type_id = post_params.type_id.value
    } else {
      // 没得值说明没动
    }
    loading()
    console.log('post_params', post_params);
    global.axios
      .post('decoration/Goods/webAddGoods', post_params, global)
      .then((res) => {
        console.log('提交数据结果', res);
        // message.success('操作成功');
        emit("closeChildPageTwo", pageData.page_key);
      });
  }

  function reset() {
    global.Modal.confirm({
      title: global.findLanguage("该操作会导致未保存的数据丢失，请谨慎操作！"),
      okText: global.findLanguage("确定"),
      cancelText: global.findLanguage("取消"),
      okType: "primary",
      onOk: function () {
        console.log('重置');
        lookData()
        loading()//加载
      },
    });
  }
  // 返回上一页
  function closeChildPage(page_key) {
    emit("closeChildPage", page_key);
  }

  const treeData = ref([])
  // 行政区数据
  function getAreas() {
    global.axios
      .post('factory_system/Base/getAreas', {}, global)
      .then((res) => {
        // console.log('行政区数据',res);
        treeData.value = res.areas
        getStoreCarriageList()//处理模板数据
      });
  }
  getAreas()
  // 查询对应地区id
  function findItemByLabel(data, targetLabel) {
    for (const item of data) {
      if (item.label === targetLabel) {
        return item;
      }
      if (item.children) {
        const found = findItemByLabel(item.children, targetLabel);
        if (found) return found;
      }
    }
    return null;
  }
  function findItemByAdcode(data, targetAdcode) {
    for (const item of data) {
      if (item.adcode === targetAdcode) {
        return item;
      }
      if (item.children) {
        const found = findItemByAdcode(item.children, targetAdcode);
        if (found) return found;
      }
    }
    return null;
  }

  // 所有运费模板
  const allYfmb = ref([])
  function getStoreCarriageList() {
    global.axios
      .post('decoration/Carriage/getStoreCarriageList', post_params, global)
      .then((res) => {
        // console.log('所有模板数据', res);
        // allYfmb.value = []
        allYfmb.value = res.list.map((item) => {
          let arr = [] //不包邮地区
          item.price_city.map((item) => {
            arr.push(item.adcode)
          })
          item.unsupport.map((item) => {
            arr.push(item.adcode)
          })
          const result = treeData.value.filter(item => !arr.includes(item.adcode));
          return {
            bydq: result.map((iss) => {
              return iss.label
            }),
            ...item,
            price_city: item.price_city.map((iss) => {
              let price_city = findItemByAdcode(treeData.value, iss.adcode)
              // console.log('price_city', price_city);
              iss = {
                ...iss,
                ...price_city
              }
              return iss
            }),
            unsupport: item.unsupport.map((iss) => {
              let unsupport = findItemByAdcode(treeData.value, iss.adcode)
              // console.log('unsupport', unsupport);
              iss = {
                ...iss,
                ...unsupport
              }
              return iss
            }),
          }
        })
        console.log('allYfmb', allYfmb.value);
      });
  }


</script>

<template>
  <!--搜索-->
  <div>
    <a-spin :spinning="spinning">
      <div class="wcdiv">
        <div style="display: flex;align-items: center;">
          <a-button v-show="pageData.hasOwnProperty('parent_page_key')" class="iconfont button-class"
            style="font-size: 18px !important; padding: 0 10px; float: left;margin-right: 20px;"
            @click="closeChildPage(pageData.page_key)">&#xe6d2;
          </a-button>
          <div class="spbj">商品编辑
          </div>
        </div>
        <div class="flex">
          <!-- <div class="tjBtn" @click="tjShopData">提交</div> -->
          <div class="cz" @click="reset">重置</div>
        </div>
      </div>
      <div style="display: flex;justify-content: space-between;cursor: pointer">
        <div style="width: 15%;">
          <div style="border: 1px solid #eff0f4;border-radius: 5px;overflow: hidden;">
            <div style="background-color: #ff7300;color: #fff;text-align: center;padding: 10px 20px;">
              商品填写建议
            </div>
            <div style="padding: 10px;display: flex;">
              <div>属性</div>
              <div style="color: #ff7300;margin-left: 20px;">填写属性，获取流量</div>
            </div>
          </div>

          <div style="border: 1px solid #eff0f4;margin-top: 20px;border-radius: 5px;overflow: hidden;">
            <div style="background-color: #407cff;color: #fff;text-align: center;padding: 10px 20px;">
              发布助手
            </div>
            <div style="padding: 10px;color: #999999;">
              <div>商品轮播图</div>
              <div>a.尺寸宽高需要均大于480px</div>
              <div>b.大小3M以内</div>
              <div>c.数量限制在10张以内</div>
              <div>d.图片格式仅支持JPG,PNG格式</div>
              <div>e.批量上传时，图片须等宽高且不小于480px</div>
              <div
                style="display: flex;padding: 10px;border: 1px solid #ffecc8;background-color: #fff6e6;border-radius: 5px;">
                <div>
                  <InfoCircleOutlined style="color: #ff7300;font-size: 14px;" />
                </div>
                <div style="margin-left: 5px;color: black;">请按要求填写商品信息，上传商品图片（注意轮播图上传事项）</div>
              </div>
            </div>
          </div>
        </div>
        <!-- 商品信息等 -->
        <div style="width: 84%;overflow: auto;height: 88vh;">
          <!-- 基本信息 -->
          <div style="padding: 20px;border: 1px solid #f5f5f5;width: 100%;">
            <div style="display: flex;font-size: 16px;">
              <div style="color: #407cff;">1</div>
              <div style="margin-left: 5px;">基本信息</div>
            </div>
            <div v-show="!sqJbxx">
              <div>
                <div style="display: flex;margin-top: 20px;margin-left: 20px;">
                  <div style="display: flex;">
                    <div style="color: red;">*</div>
                    <div>商品轮播图</div>
                  </div>
                  <div style="margin-left: 20px;">
                    <div style="color: #ff7300;">请优先上传主轮播图，预填白底图</div>
                    <div style="color: #999999;">
                      图片要求：宽高比为1：1，或3：4，且宽高均大于480px，大小3M内，已上传{{post_params.images.length}}/10张。
                    </div>
                    <div style="margin-top: 5px;display: grid;grid-template-columns: repeat(9, minmax(0, 1fr));">
                      <div
                        style="position: relative;margin-right: 10px;border-radius: 4px;overflow: hidden;display: flex;height: 90px;width: 90px;"
                        v-for="(item,index) in post_params.images" :key="index">
                        <!-- <img :src="item" style="width: 100px;height: 100px;margin-right: 10px;border-radius: 4px;" alt=""> -->
                        <a-image :width="90" :src="item" :preview="{ src: item }" />
                        <div @click="delImgLb(index)" class="imgClose" style="margin-left: 10px;">
                          <CloseCircleOutlined />
                        </div>
                      </div>
                      <a-upload v-if="post_params.images.length<10" :customRequest="upload" :multiple="true"
                        :file-list="[]" list-type="picture-card">
                        <div style="text-align: center;">
                          <PlusOutlined style="font-size: 30px;color: #999999;" />
                        </div>
                      </a-upload>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div style="display: flex;margin-top: 20px;margin-left: 20px;">
                  <div style="display: flex;">
                    <div style="color: red;">*</div>
                    <div>商品封面图</div>
                  </div>
                  <div style="margin-left: 20px;">
                    <div style="color: #ff7300;">请优先上传封面图，预填白底图</div>
                    <div style="color: #999999;">
                      图片要求：宽高比为1：1，或3：4，且宽高均大于480px，大小3M内，已上传{{post_params.cover_image?1:0}}/1张。
                    </div>
                    <div style="margin-top: 5px;display: flex;">
                      <div v-if="post_params.cover_image"
                        style="position: relative;display: flex;overflow: hidden;border-radius: 4px;">
                        <a-image :width="90" :src="post_params.cover_image"
                          :preview="{ src: post_params.cover_image }" />
                        <div @click="delImgFm()" class="imgClose" style="margin-left: 10px;">
                          <CloseCircleOutlined />
                        </div>
                      </div>
                      <div v-else>
                        <a-upload :customRequest="uploadFm" :multiple="false" :file-list="[]" list-type="picture-card">
                          <div style="width: 90px;height: 88px;border: 1px solid #f5f5f5;text-align: center;">
                            <PlusOutlined style="font-size: 30px;color: #999999;margin-top: 30%;" />
                          </div>
                        </a-upload>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style="margin-top: 20px;margin-left: 34px;align-items: center;">
                <div style="display: flex;align-items: center;">
                  <div style="display: flex;">
                    <div style="color: red;">*</div>
                    <div>商品标题</div>
                  </div>
                  <a-input type="text" v-model:value="post_params.name" style="margin-left: 20px;width: 79.5%;"
                    placeholder="商品标题组成：商品描述+规格，最多输入30个汉字" />
                </div>
              </div>
              <div style="margin-top: 20px;margin-left: 20px;align-items: center;">
                <div style="display: flex;align-items: center;">
                  <div style="display: flex;">
                    <div style="color: red;">*</div>
                    <div>上下架商品</div>
                  </div>
                  <div style="margin-left: 20px;">
                    <a-switch v-model:checked="post_params.status" checked-children="上架" un-checked-children="下架" />
                  </div>
                </div>
              </div>
              <div style="margin-top: 20px;margin-left: 40px;">
                <div style="display: flex;">
                  <div>商品属性</div>
                  <div style="margin-left: 20px;background-color: #f7f8fa;border-radius: 5px;width: 80%;">
                    <div style="padding:10px 20px;display: flex;justify-content: space-between;">
                      <div style="display: flex;">
                        <div style="display: flex;">
                          <div>填写率</div>
                          <div style="margin-left: 5px;">
                            <a-progress type="circle" :percent="bfb" :width="16" :strokeWidth="8" :format="() => null"
                              trailColor="#999999" strokeColor="#ff7300" />
                          </div>
                          <div style="color: #ff7300;margin-left: 5px;">{{bfb?bfb+'%':''}}</div>
                        </div>
                        <div style="margin-left: 20px;color: #999999;width: 60%;">
                          请准确填写属性，有利于商品在搜索和推荐中露出，错误填写可能面临商品下架或流量流失
                        </div>
                      </div>
                      <div style="display: flex;">
                        <div>没有合适属性值？</div>
                        <div @click="()=>{visibleSx=true}" style="color: #407cff;">点击添加</div>
                      </div>
                    </div>
                    <div style="background-color: #999999;height: 1px;width: 100%;"></div>
                    <div
                      style="padding:10px 20px;display: flex;justify-content: space-between;background-color: #f7f8fa;">
                      <div style="width: 45%;">
                        <div>
                          <div style="display: flex;margin: 10px 0px;">
                            <div style="width: 30%;text-align: right;display: flex;justify-content: space-between;">
                              <div></div>
                              <div style="display: flex;margin-top: 10px;">
                                <div style="color: red;">*</div>
                                <div>分类</div>
                              </div>
                            </div>
                            <div style="margin-left: 20px; width: 200px;">
                              <a-tree-select v-model:value="post_params.type_id" disabled labelInValue
                                style="width: 100%;" placeholder="请选择商品分类" :tree-data="spflList" :field-names="{
                                children: 'children',
                                label: 'name',
                                value: 'id',
                              }">
                              </a-tree-select>
                              <!-- <div style="color: red;font-size: 12px;">商品分类请选到三级</div> -->
                            </div>
                          </div>
                        </div>
                        <div>
                          <div style="display: flex;margin: 10px 0px;">
                            <div style="width: 30%;text-align: right;display: flex;justify-content: space-between;">
                              <div></div>
                              <div style="display: flex;">
                                <div style="color: red;">*</div>
                                <div>品牌</div>
                              </div>
                            </div>
                            <div>
                              <a-select ref="select" v-model:value="post_params.brand_id"
                                style="width: 200px;margin-left: 20px;" placeholder="请选择品牌">
                                <a-select-option :value="item.value" v-for="item in ppList"
                                  :key="item.value">{{item.label}}</a-select-option>
                              </a-select>
                              <span v-if="del_pp_text"
                                style="color: #ff0000;padding-left: 20px;font-size: 12px;">品牌已被删除，请重新选择</span>
                              <!-- <div style="padding-left: 20px;font-size: 12px;color: #999999;">未找到需要的品牌？<span
                                  style="color: #ff7300;">点击申请</span></div> -->
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style="width: 45%;">
                        <div>
                          <template v-for="(item,index) in post_params.attributes" :key="index">
                            <div style="display: flex;align-items: center;margin: 10px 0px;">
                              <div style="width: 30%;text-align: right;">{{item.key}}</div>
                              <a-input type="text" v-model:value="item.value" style="width: 55%;margin-left: 20px;"
                                placeholder="请输入具体属性值" />
                              <CloseCircleOutlined @click="delSx(index)" style="margin-left: 10px;" />
                            </div>
                          </template>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style="margin-top: 20px;">
                  <div style="display: flex;">
                    <div>商品详情</div>
                    <div style="margin-left:20px;width: 80%;">
                      <editor id="init" v-model="component_state.myValue" :init="component_state.init">
                      </editor>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div @click="()=>{sqJbxx=!sqJbxx}"
              style="display: flex;align-items: center;margin-left: 77px;margin-top: 10px;color: #407cff;">
              <div style="margin-right: 5px;">{{sqJbxx?'展开':'收起'}}</div>
              <UpCircleOutlined v-if="!sqJbxx" style="color: #407cff;font-size: 14px;" />
              <DownCircleOutlined v-else style="color: #407cff;font-size: 14px;" />
            </div>
          </div>
          <!-- 添加属性 -->
          <a-modal v-model:visible="visibleSx" title="添加属性" @ok="addSx">
            <div>
              <div style="display: flex;align-items: center;">
                <div>名称</div>
                <a-input type="text" v-model:value="SxName" style="margin-left: 20px;width: 80%;" placeholder="请填写名称" />
              </div>
            </div>
          </a-modal>
          <!-- 规格与库存 -->
          <div style="padding: 20px;margin-top: 20px;border: 1px solid #f5f5f5;width: 100%;">
            <div style="display: flex;font-size: 16px;">
              <div style="color: #407cff;">2</div>
              <div style="margin-left: 5px;">规格与库存</div>
            </div>
            <div>
              <div style="display: flex;margin-top: 20px;margin-left: 20px;">
                <div style="display: flex;">
                  <div style="color: red;">*</div>
                  <div>价格及库存</div>
                </div>
                <div style="margin-left: 20px;width: 90%;">
                  <div style="background-color: #f7f8fa;padding: 20px;border-radius: 5px;">
                    <div style="display: flex;justify-content: space-between;">
                      <div>
                        <div style="color: #ff7300;">请如实填写库存信息，以确保商品可以在承诺时间内发出，避免出现违规</div>
                      </div>
                      <div style="color: #407cff;" @click="addGG">添加规格</div>
                    </div>
                    <table
                      style="border-collapse: collapse; width: 100%;margin-top: 10px;border: 1px solid #f0f2f5;letter-spacing: 1px;text-align: center;">
                      <tr style="display: grid;grid-template-columns: repeat(9, minmax(0, 1fr));text-align: center;">
                        <th>
                          <div style="color: #999999;">操作</div>
                        </th>
                        <th>
                          <div style="display: flex;">
                            <div style="display: flex;margin: 0 auto;">
                              <div style="color: red;">*</div>
                              <div style="color: #999999;">名称</div>
                            </div>
                          </div>
                        </th>
                        <th>
                          <div style="display: flex;">
                            <div style="display: flex;margin: 0 auto;">
                              <div style="color: red;">*</div>
                              <div style="color: #999999;">库存</div>
                            </div>
                          </div>
                        </th>
                        <th>
                          <div style="display: flex;">
                            <div style="display: flex;margin: 0 auto;">
                              <div style="color: red;">*</div>
                              <div style="color: #999999;">原价</div>
                            </div>
                          </div>
                        </th>
                        <th>
                          <div style="display: flex;">
                            <div style="display: flex;margin: 0 auto;">
                              <div style="color: red;">*</div>
                              <div style="color: #999999;">拼单价</div>
                            </div>
                          </div>
                        </th>
                        <th>
                          <div style="color: #999999;">推荐管推荐</div>
                        </th>
                        <th>
                          <div style="color: #999999;">佣金</div>
                        </th>
                        <th>
                          <div style="color: #999999;">启用状态</div>
                        </th>
                        <th>
                          <div style="color: #999999;">排序</div>
                        </th>
                      </tr>
                      <template v-if="post_params.goods_sizes.length==0">
                        <a-empty />
                      </template>
                      <template v-else>
                        <template v-for="(item,index) in post_params.goods_sizes" :key="index">
                          <tr
                            style="display: grid;grid-template-columns: repeat(9, minmax(0, 1fr));text-align: center;background-color: #fff;">
                            <td>
                              <div style="color: red;margin-top: 5px;" @click="delGG(index)">删除</div>
                            </td>
                            <td>
                              <a-input type="text" v-model:value="item.name" placeholder="请输入名称" />
                            </td>
                            <td>
                              <a-input type="text" v-model:value="item.stock" placeholder="请输入库存" />
                            </td>
                            <td>
                              <a-input type="text" v-model:value="item.old_price" placeholder="请输入原价" />
                            </td>
                            <td>
                              <a-input type="text" v-model:value="item.price" placeholder="输入拼单价" />
                            </td>
                            <td>
                              <a-switch v-model:checked="item.uper_status" checked-children="是"
                                un-checked-children="否" />
                            </td>
                            <td>
                              <a-input type="text" v-model:value="item.commission" placeholder="输入佣金" />
                            </td>
                            <td>
                              <a-switch v-model:checked="item.status" checked-children="是" un-checked-children="否" />
                            </td>
                            <td>
                              <a-input type="text" v-model:value="item.order" placeholder="请输入排序" />
                            </td>
                          </tr>
                        </template>
                      </template>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 服务与承诺 -->
          <div style="padding: 20px;margin-top: 20px;border: 1px solid #f5f5f5;width: 100%;">
            <div style="display: flex;font-size: 16px;">
              <div style="color: #407cff;">3</div>
              <div style="margin-left: 5px;">商品服务</div>
            </div>
            <div v-show="!ser_sqJbxx">
              <div style="display: flex;margin-top: 20px;margin-left: 40px;">
                <div style="display: flex;">
                  <div style="color: red;">*</div>
                  <div>商品类型</div>
                </div>
                <div style="margin-left: 20px;">
                  <a-radio-group v-model:value="post_params.goods_type" name="radioGroup">
                    <a-radio value="a">普通商品</a-radio>
                    <a-radio value="b">海外进口</a-radio>
                    <a-radio value="c">海外CC个人行邮</a-radio>
                  </a-radio-group>
                </div>
              </div>
              <div style="display: flex;margin-top: 20px;margin-left: 40px;">
                <div style="display: flex;">
                  <div style="color: red;">*</div>
                  <div>是否二手</div>
                </div>
                <div style="margin-left: 20px;">
                  <a-radio-group v-model:value="post_params.is_used" name="radioGroup">
                    <a-radio value="N">非二手</a-radio>
                    <a-radio value="Y">二手</a-radio>
                  </a-radio-group>
                </div>
              </div>
              <div style="display: flex;margin-top: 20px;margin-left: 40px;">
                <div style="display: flex;">
                  <div style="color: red;">*</div>
                  <div>是否定制</div>
                </div>
                <div style="margin-left: 20px;">
                  <a-radio-group v-model:value="post_params.is_customized" name="radioGroup">
                    <a-radio value="N">非定制</a-radio>
                    <a-radio value="Y">部分库存定制</a-radio>
                  </a-radio-group>
                </div>
              </div>
              <div style="display: flex;margin-top: 20px;margin-left: 40px;">
                <div style="display: flex;">
                  <div style="color: red;">*</div>
                  <div>是否预售</div>
                </div>
                <div style="margin-left: 20px;">
                  <a-radio-group v-model:value="post_params.is_plan_salled" name="radioGroup">
                    <a-radio value="a">非预售</a-radio>
                    <a-radio value="b">定时预售</a-radio>
                    <a-radio value="c">时段预售</a-radio>
                    <a-radio value="d">规格预售</a-radio>
                  </a-radio-group>
                </div>
              </div>
              <div style="display: flex;margin-top: 20px;margin-left: 18px;">
                <div style="display: flex;">
                  <div>承诺发货时间</div>
                </div>
                <div style="margin-left: 20px;">
                  <a-radio-group v-model:value="post_params.need_send_time" name="radioGroup">
                    <a-radio value="a">当日发货</a-radio>
                    <a-radio value="b">24小时
                      <!-- <span style="color: #FF7300;margin-left: 10px;">获额外流量扶持</span> -->
                    </a-radio>
                    <a-radio value="c">48小时</a-radio>
                  </a-radio-group>
                </div>
              </div>
              <div style="display: flex;margin-top: 20px;margin-left: 40px;">
                <div style="display: flex;">
                  <div style="color: red;">*</div>
                  <div>运费模板</div>
                </div>
                <div style="margin-left: 20px;width: 80%;">
                  <a-radio-group v-model:value="post_params.carriage_id" name="radioGroup">
                    <a-radio :value="item.id" v-for="item in allYfmb" :key="item.id">{{item.name}}</a-radio>
                    <!-- <a-radio value="2">其它模板</a-radio> -->
                  </a-radio-group>
                  <template v-for="item in allYfmb" :key="item.id">
                    <template v-if="item.id == post_params.carriage_id">
                      <div style="background-color: #f7f8fa;color: #999999;padding: 20px;margin-top: 10px;">
                        <div style="padding-left: 14px;display: flex;">
                          <span>包邮配送地区：</span>
                          <span style="width: 80%;">
                            <span v-for="(iss,index_bydq) in item.bydq" :key="index_bydq">
                              {{iss}}
                              <span>{{index_bydq+1==item.bydq.length?'。':'、'}}</span>
                            </span>
                          </span>
                        </div>
                        <div style="display: flex;margin-top: 10px;">
                          <span>不包邮配送地区：</span>
                          <div v-if="item.price_city.length>0">
                            <div v-for="(iss,index_sity) in item.price_city" :key="iss.index_sity">
                              <div v-if="iss.price_type=='a'">
                                （{{index_sity+1}}）{{iss.label}}{{iss.base_number}}件{{iss.base_price}}元，每增{{iss.add_number}}件，加{{iss.add_price}}元。
                              </div>
                              <div v-else-if="iss.price_type=='b'">（{{index_sity+1}}）固定邮费 {{iss.order_price}} 元。</div>
                            </div>
                            <!-- <div>2）新疆1件内28.00元，每增加1件，加25元</div> -->
                          </div>
                          <div v-else>未设置</div>
                        </div>
                        <div style="margin-top: 10px;">不包邮配送地区：
                          <span v-for="(iss,index_unsupport) in item.unsupport" :key="index_unsupport">
                            {{iss.label}}
                            <span>{{index_unsupport+1==item.unsupport.length?'。':'、'}}</span>
                          </span>
                          <span v-if="item.unsupport.length==0">未设置</span>
                        </div>
                      </div>
                    </template>
                  </template>
                </div>
              </div>
              <div style="display: flex;margin-top: 20px;margin-left: 47px;">
                <div style="display: flex;">
                  <div>库存计件</div>
                </div>
                <div style="margin-left: 20px;">
                  支付成功减库存
                </div>
              </div>
              <!-- <div style="display: flex;margin-top: 20px;margin-left: 68px;">
                <div style="display: flex;">
                  <div style="color: red;">*</div>
                  <div>承诺</div>
                </div>
                <div style="margin-left: 20px;">
                  <div>承诺是否是商家服务？？？？</div>
                  <a-checkbox-group style="display: grid;" :options="['7天无理由退货 该类商品，必须支持无理由退货','假一赔十']" />
                </div>
              </div> -->
              <div style="display: flex;margin-top: 20px;margin-left: 47px;">
                <div>商品服务</div>
                <div style="margin-left: 20px;background-color: #f7f8fa;border-radius: 5px;width: 80%;">
                  <div style="padding:10px 20px;display: flex;justify-content: space-between;">
                    <div style="color: #999999;width: 80%;">请准确填写包含的服务内容，错误填写可能面不必要麻烦</div>
                    <div style="display: flex;">
                      <div>没有合适服务？</div>
                      <div @click="()=>{visibleFw=true}" style="color: #407cff;">点击添加</div>
                    </div>
                  </div>
                  <div style="background-color: #999999;height: 1px;width: 100%;"></div>
                  <div
                    style="padding:10px 20px;display: flex;justify-content: space-between;background-color: #f7f8fa;">
                    <div style="width: 100%;">
                      <div>
                        <template v-if="post_params.services.length==0">
                          <a-empty />
                        </template>
                        <template v-for="(item,index) in post_params.services" :key="index">
                          <div style="display: flex;align-items: center;margin: 10px 0px;">
                            <div style="width: 13%;text-align: right;">{{item.key}}</div>
                            <a-input type="text" v-model:value="item.value" style="width: 75%;margin-left: 20px;"
                              placeholder='请输入服务描述信息' />
                            <CloseCircleOutlined @click="delFw(index)" style="margin-left: 10px;" />
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div @click="()=>ser_sqJbxx=!ser_sqJbxx"
              style="display: flex;align-items: center;margin-left: 77px;margin-top: 10px;color: #407cff;">
              <div style="margin-right: 5px;">{{ser_sqJbxx?'展开':'收起'}}</div>
              <UpCircleOutlined v-if="!ser_sqJbxx" style="color: #407cff;font-size: 14px;" />
              <DownCircleOutlined v-else style="color: #407cff;font-size: 14px;" />
            </div>
          </div>
          <!-- 添加服务 -->
          <a-modal v-model:visible="visibleFw" title="添加服务" @ok="addFw">
            <div>
              <div style="display: flex;align-items: center;">
                <div>名称</div>
                <a-input type="text" v-model:value="FwName" style="margin-left: 20px;width: 80%;" placeholder="请填写名称" />
              </div>
            </div>
          </a-modal>
          <div style="padding: 20px;margin-top: 20px;border: 1px solid #f5f5f5;width: 100%;text-align: center;">
            <a-button type="primary" @click="tjShopData()">提交商品数据</a-button>
          </div>
          <!-- 留底高 -->
          <div style="height: 100px;"></div>
        </div>
      </div>
    </a-spin>
  </div>
  <!--导出-->
</template>

<style scoped>
  ::v-deep(.ant-upload.ant-upload-select-picture-card) {
    width: 90px !important;
    height: 90px !important;
  }

  th,
  td {
    border: 1px solid #f0f2f5;
    padding: 8px 10px;
  }

  .imgClose {
    width: 15px;
    height: 15px;
    position: absolute;
    right: 5px;
    top: 4px;
    color: #fff;
  }


  .wcdiv {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .spbj {
    /* color: #1890ff; */
    /* font-weight: bold; */
    font-size: 18px;
  }

  .cz {
    background-color: #f97425;
    color: white;
    padding: 5px 20px;
    border-radius: 5px
  }

  .flex {
    display: flex;
  }

  .tjBtn {
    margin-right: 20px;
    background-color: #0ccd00;
    color: white;
    padding: 5px 20px;
    border-radius: 5px;
  }
</style>