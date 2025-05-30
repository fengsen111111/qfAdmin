<script setup>
  import { inject, onBeforeMount, reactive, ref, getCurrentInstance, watch } from "vue";
  import { RightOutlined, InfoCircleOutlined, UpCircleOutlined, DownCircleOutlined, PlusOutlined, CloseCircleOutlined, ExclamationCircleOutlined, ExclamationCircleFilled } from "@ant-design/icons-vue";
  import { message } from 'ant-design-vue';
  import Draggable from 'vuedraggable';//排序插件

  let emit = defineEmits(["openChildPage", "closeChildPage", "closeChildPageTwo", "editType", "toShopInfo"]);
  const global = inject("global").value;
  import dayjs from 'dayjs';

  const post_params = reactive({
    id: '',//商品ID 修改时必传  
    name: '',//商品名
    store_id: '',//门店ID    
    cover_image: '',//封面图   
    images: [],//相册   
    detail: [],//详情 富文本  
    type_id: '',//商品分类ID  
    brand_id: '',//商品品牌ID   
    status: false,//启用状态 Y上架 N下架    
    attributes: [],//商品属性  
    services: [],//商品服务  
    goods_sizes: [
      {
        id: '',//
        name: '',//名称  
        stock: '',//库存
        old_price: '',//原价
        price: '',//价格
        uper_status: false,//是否需要推荐官推荐
        commission: '',//佣金
        status: false,//启用状态
        order: '',//排序  
      },
    ],//商品规格  post_params
    goods_type: 'a',//商品类型 a普通商品 b海外进口 c海外CC个人行邮  
    is_used: 'N',//是否二手 Y是 N不是  
    is_customized: 'N',//是否定制 Y是 N不是  
    is_plan_salled: 'a',//是否预售 a非预售 b定时预售 c时段预售 d规格预售    
    need_send_time: 'a',//承诺发货时间 a当日发货 b24小时 c48小时  
    carriage_id: '',//运费模板ID 

    power_level_id: '',//曝光等级id
    power_start_time: '',//曝光开始时间
    power_end_time: '',//曝光结束时间
    power: '',//曝光量

  })
  const bfb = ref(0)//填写进度

  watch(() => post_params.type_id, (newVal, oldVal) => {
    // console.log('type_id 分类变化:', newVal);
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
      const exists = ppList.value.some(item => item.value == newVal);
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
    zztext()
  }
  // 删除规格
  function delGG(index) {
    post_params.goods_sizes.splice(index, 1)
  }

  function setRangePicker(time1, time2) {
    // 支持秒级时间戳（自动转毫秒）
    const toDayjs = (val) => {
      if (!val) return null;
      if (typeof val === 'number' && val.toString().length === 10) {
        return dayjs(val * 1000);
      }
      return dayjs(val);
    };
    const start = toDayjs(time1);
    const end = toDayjs(time2);
    if (start && end && start.isValid() && end.isValid()) {
      timeStaEnd.value = [start, end];
    } else {
      timeStaEnd.value = []; // 清空不合法的情况
    }
    console.log('timeStaEnd', timeStaEnd.value);
  }

  let props = defineProps(["pageData"]);
  const pageData = props.pageData;
  // console.log('props数据', props.pageData.data);
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
          res.goods_datas.goods_sizes.map((item) => {
            item.status = item.status == 'Y' ? true : false
            item.uper_status = item.uper_status == 'Y' ? true : false
          })
          // 富文本单独更新
          Object.assign(post_params, res.goods_datas);
          // 服务单独更新
          // cn_value.value = res.goods_datas.services.map((item) => {
          //   return item.key
          // })
          // }
          let arrSer = cnOption.value.filter(item => res.goods_datas.service_ids.includes(item.id));
          arrSer.map((item) => {
            cn_value.value.push(item.value)
          })
          cncChange()//更新左边显示
          // 曝光时间单独更行
          setRangePicker(res.goods_datas.power_start_time * 1000, res.goods_datas.power_end_time * 1000)
          shopGuige.value[0].value = []
          shopGuige.value[1].value = []
          res.goods_datas.goods_sizes.map((item, index) => {
            shopGuige.value[0].value.push({
              label: item.name,
              isCustom: false
            })
            shopGuige.value[1].value.push({
              label: item.stock,
              isCustom: false
            })
          })
        }
      })
  }
  // 有数据，编辑数据
  if (props.pageData.data.id) {
    setTimeout(() => {
      lookData()
    }, 1000);
  } else {
    // 没有id就是新增商品
    post_params.type_id = props.pageData.data.typeId[2]
  }
  //固定属性
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
      value: '',
      type: 'input',
      is_del: true
    })
    SxName.value = ''
    visibleSx.value = false
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
        _shopInfo()
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
        // console.log('商品分类列表', res.list, post_params.type_id);
        spflList.value = res.list
        // 根据分类id找到对应分类，并设置固定属性，只有新增
        let result = findItemById(res.list, post_params.type_id)
        // console.log('找到对应项', result.default_attributes);
        post_params.attributes = []
        result.default_attributes.map((item) => {
          post_params.attributes.push({
            key: item.key,
            value: '',
            type: 'select',
            is_del: false,
            option: item.values
          })
        })
        if (props.pageData.data.id) {
          // 编辑页面赋值
          setTimeout(() => {

          }, 1000);
        }
      });
  }
  function findItemById(list, targetId) {
    for (const item of list) {
      if (item.id === targetId) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const found = findItemById(item.children, targetId);
        if (found) {
          return found;
        }
      }
    }
    return null; // 如果没找到，返回 null
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

  function loading() {
    console.log('加载');
  }
  // 提交商品数据
  function tjShopData() {
    console.log('提交');
    //a待审核 b 已通过 c已拒绝
    if (check_status.value == 'b') {
      console.log('店铺通过审核');
    } else {
      message.warning('通过店铺初审后才能发布商品')
      return false
    }
    // console.log('shopObj.deposit_money',shopObj.value.deposit_money);

    if (pay_Obj.value.pay_info || shopObj.value.deposit_money > 0) {
      pay_info_Vis.value = true
      return false
    }
    if (timeStaEnd.value) {
      post_params.power_start_time = Number(timeStaEnd.value[0]?.valueOf()) / 1000
      post_params.power_end_time = Number(timeStaEnd.value[1]?.valueOf()) / 1000
    }
    // 新增不要曝光量字段
    if (!props.pageData.data.id) {
      console.log('新增不要曝光量字段');
      delete post_params.power
    }
    post_params.status = post_params.status==true ? 'Y' : 'N',
      post_params.goods_sizes.map((item) => {
        item.uper_status = item.uper_status ? 'Y' : 'N',//是否需要推荐官推荐
          item.status = item.status ? 'Y' : 'N'//启用状态
      })
    if (post_params.type_id.value) {
      // 有值就重新拿
      post_params.type_id = post_params.type_id.value.length > 2 ? post_params.type_id.value[2] : post_params.type_id.value
    } else {
      // 没得值说明没动
    }
    // service_ids:[],//服务数组
    post_params.service_ids = []
    // post_params.services = 
    delete post_params.services
    wgxdcn.value.map((item) => {
      // console.log('item',item);
      post_params.service_ids.push(item.id)
      // return {
      //   key: item.label,
      //   value: item.value
      // }
    })
    delete post_params.power_level_id
    delete post_params.power_start_time
    delete post_params.power_end_time
    delete post_params.power
    console.log('post_params', post_params);
    //   运费模板不检索
    const requiredFields = ['name', 'store_id', 'cover_image', 'images', 'brand_id', 'carriage_id']; //需要检索的字段
    if (!validatePostParams(post_params, requiredFields)) {
      // console.error('表单未填写完整');
      // message.error('表单未填写完整')
      return false
    }

    const goodsSizes = post_params.goods_sizes;
    const incompleteItems = goodsSizes.filter(item => {
      // || !item.commission; 佣金
      return !item.name || !item.price || !item.stock
    });
    if (incompleteItems.length > 0) {
      console.log('以下规格未填写完整：', incompleteItems);
      message.error('商品规格未填写完整')
      return false
    } else {
      console.log('所有规格已填写完整');
    }

    loading()
    global.axios
      .post('decoration/Goods/webAddGoods', post_params, global)
      .then((res) => {
        console.log('提交数据结果', res);
        if (props.pageData.data.id) {
          global.Modal.confirm({
            title: global.findLanguage(
              "保存成功，点击确定返回上一页！"
            ),
            okText: global.findLanguage("确定"),
            cancelText: global.findLanguage("取消"),
            okType: "primary",
            onOk: function () {
              emit("closeChildPage", pageData.page_key);
            },
          });
        } else {
          // 没有id就是新增商品
          // emit("closeChildPageTwo", pageData.page_key);
          message.success('操作成功');
          setTimeout(() => {
            emit('editType')
          }, 2000);
        }
      });
  }


  // 检索字段填写情况
  function validatePostParams(post_params, requiredFields = []) {
    for (const field of requiredFields) {
      const value = post_params[field];
      if (value === undefined || value === null || value === '') {
        // console.warn(`字段 ${field} 是必填项`);
        // ['name', 'store_id', 'cover_image', 'images', 'brand_id', 'carriage_id']; //需要检索的字段
        if (field == 'name') {
          message.error('商品名称未填写')
        } else if (field == 'cover_image') {
          message.error('商品封面图未填写')
        } else if (field == 'images') {
          message.error('商品轮播图未填写')
        } else if (field == 'brand_id') {
          message.error('商品品牌未选择')
        } else if (field == 'carriage_id') {
          message.error('运费模板未选择')
        }
        return false;
      }
    }
    return true;
  }

  function reset() {
    global.Modal.confirm({
      title: global.findLanguage("该操作会导致未保存的数据丢失，请谨慎操作！"),
      okText: global.findLanguage("确定"),
      cancelText: global.findLanguage("取消"),
      okType: "primary",
      onOk: function () {
        if (props.pageData.data.id) {
          lookData()
        } else {
          // 没有id就是新增商品
          post_params.name = ''
          post_params.cover_image = ''
          post_params.images = []
          post_params.detail = []
          post_params.brand_id = ''
          post_params.status = false
          // 重新赋值属性 
          getGoodsTypeList()

          post_params.services = [
            // {
            //   key: '全网低价',
            //   value: '多平台对比，优惠力度最大'
            // },
            // {
            //   key: '热销爆款',
            //   value: '热门商品，大家都在买'
            // }
          ]
          post_params.goods_sizes = [
            {
              id: '',//
              name: '',//名称  
              stock: '',//库存
              old_price: '',//原价
              price: '',//价格
              uper_status: false,//是否需要推荐官推荐
              commission: '',//佣金
              status: false,//启用状态
              order: '',//排序  
            },
          ]
          post_params.carriage_id = ''
          post_params.power_level_id = ''
          post_params.power_start_time = ''
          post_params.power_end_time = ''
          timeStaEnd.value = []
          post_params.goods_type = 'a'
          post_params.is_used = 'N'
          post_params.is_customized = 'N'
          post_params.is_plan_salled = 'a'
          post_params.need_send_time = 'a'
        }
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
      .post('decoration/Carriage/getStoreCarriageList', {}, global)
      .then((res) => {
        // console.log('所有模板数据', res);
        // allYfmb.value = []

        let mbsz = []
        res.list.map((item) => {
          if (item.status == 'Y') {
            mbsz.push(item)
          }
        })

        allYfmb.value = mbsz.map((item) => {
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
        // console.log('所有运费模板', allYfmb.value);
        // 有数据，编辑数据
        if (props.pageData.data.id) {
        } else {
          // 新增默认第一个模板
          if (allYfmb.value.length > 0) {
            post_params.carriage_id = allYfmb.value[0].id
          }
        }
      });
  }

  const bgdjList = ref([])
  // 曝光等级
  function getPowerLevelList() {
    global.axios
      .post('decoration/PowerLevel/getPowerLevelList', {
        type: 'goods'
      }, global)
      .then((res) => {
        // console.log('曝光等级列表', res);
        bgdjList.value = res.list
      });
  }
  getPowerLevelList()

  const timeStaEnd = ref()//曝光日期

  function editType() {
    console.log('修改分类');
    emit("editType");
  }

  // 承诺 
  const cn_value = ref([])
  // 我勾选的承诺
  const wgxdcn = ref([])
  const cnOption = ref([])
  // 商品可用服务
  function getGoodsServiceList() {
    global.axios
      .post('decoration/GoodsService/getGoodsServiceList', {
      }, global)
      .then((res) => {
        console.log('商品可用服务', res.list);
        cnOption.value = []
        res.list.map((item) => {
          cnOption.value.push({
            label: item.name,
            value: item.name,
            text: item.introduce,
            id: item.id
          })
        })
        // 有数据，编辑数据
        if (props.pageData.data.id) {
          console.log('编辑不赋值');
        } else {
          // 没有id就是新增商品
          cn_value.value[0] = cn_value.value[0] ? cn_value.value[0] : res.list[0].name
        }
        cncChange()
      });
  }
  getGoodsServiceList()


  // 承诺变化了
  function cncChange() {
    // console.log('承诺变化了', cn_value.value);
    wgxdcn.value = cnOption.value.filter(item => cn_value.value.includes(item.value));
  }

  // 商品规格
  const shopGuige = ref([
    {
      labelValue: 'name',
      labelOption: [
        { label: '名称', value: 'name' },
        // { label: '库存', value: 'stock' },
        // { label: '排序', value: 'order' },
      ],
      value: [
        { label: '', isCustom: false },
      ],
      isSort: false,//开始排序
    },
    {
      labelValue: 'stock',
      labelOption: [
        // { label: '名称', value: 'name' },
        { label: '库存', value: 'stock' },
        // { label: '排序', value: 'order' },
      ],
      value: [
        { label: '', isCustom: false },
      ],
      isSort: false,//开始排序
    }
  ])

  // 删除
  function removeItem(index, val_index) {
    shopGuige.value[index].value.splice(val_index, 1)
  }

  // 添加定制规格
  function addDzgg(index) {
    shopGuige.value[index].value.push({
      label: '定制',
      isCustom: true
    })
  }
  // 添加规格
  function addgg(index) {
    shopGuige.value[index].value.push({
      label: '',
      isCustom: false
    })
  }
  // 上移下移动
  function downUp(index) {
    if (index == 0) {
      // 下移
      const item = shopGuige.value[index]
      shopGuige.value.splice(index, 1)
      shopGuige.value.splice(index + 1, 0, item)
    } else {
      // 上移
      const item = shopGuige.value[index]
      shopGuige.value.splice(index, 1)
      shopGuige.value.splice(index - 1, 0, item)
    }
  }

  // 表格内容组装
  function zztext() {
    shopGuige.value.map((item, index) => {
      // console.log('item.labelValue', item.labelValue);
      // console.log('item.value', item.value);
      if (item.labelValue == 'name') {
        // 名称
        if (item.value.length > 0) {
          post_params.goods_sizes.map((iss, iss_index) => {
            // iss.name = item.value[iss_index] ? item.value[iss_index].label ? item.value[iss_index].label : iss.name : iss.name
            iss.name = item.value[iss_index] ? item.value[iss_index].label : ''
          })
        } else {
          post_params.goods_sizes.map((iss, iss_index) => {
            iss.name = ''
          })
        }
      } else if (item.labelValue == 'stock') {
        // 库存
        if (item.value.length > 0) {
          post_params.goods_sizes.map((iss, iss_index) => {
            // iss.stock = item.value[iss_index] ? item.value[iss_index].label ? item.value[iss_index].label : iss.stock : iss.stock
            iss.stock = item.value[iss_index] ? item.value[iss_index].label : ''
          })
        } else {
          post_params.goods_sizes.map((iss, iss_index) => {
            iss.stock = ''
          })
        }
      } else if (item.labelValue == 'order') {
        //排序
        if (item.value.length > 0) {
          post_params.goods_sizes.map((iss, iss_index) => {
            iss.order = item.value[iss_index] ? item.value[iss_index].label ? item.value[iss_index].label : iss.order : iss.order
          })
        }
      }
    })
  }
  // 监听商品规格变化
  watch(
    shopGuige.value,
    (newVal, oldVal) => {
      // console.log('商品规格变化', newVal, shopGuige.value)
      zztext()
    },
    { deep: true },
  )

  // 当前商家审核状态
  const check_status = ref('')//a待审核 b 已通过 c已拒绝
  const shopObj = ref({})//商家信息
  // 当前商家店铺信息
  function _shopInfo() {
    global.axios.post('decoration/Store/webGetStoreInfo', {
      store_id: post_params.store_id
    }, global)
      .then(res => {
        console.log('店铺数据', res);
        shopObj.value = res
        check_status.value = res.check_status// a待审核 b 已通过 c已拒绝
      })
  }

  const pay_Obj = ref({})//保证金支付数据
  const type_Pay = ref({})
  // 当前分类保证金缴纳情况
  function payTypePrices() {
    global.axios
      .post('decoration/Store/payTypePrices', {
        goods_type_ids: props.pageData.data.typeId,
        trade_type: 'A_NATIVE',
      }, global)
      .then((res) => {
        console.log('分类保证金缴纳情况', res);
        type_Pay.value = res
        pay_Obj.value = res
        if (res.pay_info) {
          pay_Obj.value.trans_amt = Number(pay_Obj.value.trans_amt).toFixed(2)
        } else {
          console.log('已缴纳');
        }
      })
  }
  payTypePrices()

  const pay_info_Vis = ref(false)//是否显示提示充值弹框

  // 
  function uploadAll(options) {
    uploadQueue.push(options);
    if (!isUploading) {
      processQueue_two();
    }
  }
  async function processQueue_two() {
    isUploading = true;
    while (uploadQueue.length > 0) {
      const currentOptions = uploadQueue.shift(); // 从队列中删除第一个文件
      try {
        // 等待当前文件上传
        await uploadFileWrapperTwo(global, currentOptions.file, 'image', 'shopImg', true, completeList);
        console.log('上传成功');
      } catch (error) {
        console.log('上传失败');
      }
    }
    isUploading = false; // 队列处理完成时重置标志
  }
  function uploadFileWrapperTwo(global, file, type, category, flag, callback) {
    return new Promise((resolve, reject) => {
      global.file.uploadFile(global, file, type, category, flag, (err, result) => {
        if (err) reject(err);
        else resolve(result);
        completeDetails(err)
      });
    });
  }

  // 详情图回调
  function completeDetails(response) {
    if (post_params.detail) {
      post_params.detail = post_params.detail
    } else {
      post_params.detail = []
    }
    post_params.detail.push(response.url)
  }
  // 删除详情图片
  function delImgXq(index) {
    post_params.detail.splice(index, 1)
  }

  const isYl = ref(false)//是否预览

  const sprmc = ref([])//商品热门词
  function sprmcList() {
    global.axios
      .post('decoration/Setting/getBaseTypes', {}, global)
      .then((res) => {
        console.log('商品热门词', res.goods_hot_words);
        sprmc.value = res.goods_hot_words
      })
  }
  sprmcList()
  import QRCode from 'qrcode';
  // 
  const isPay = ref(false)//支付弹窗
  let qrCodeData = ref('')//存储生成的二维码数据URL
  let timer = ref(null);
  const totalSeconds = ref(5 * 60); // 5 分钟
  const minute = ref('05');
  const second = ref('00');
  const cz_type = ref('')//dpbzj 店铺保证金  flbzj 分类保证金
  const codeGq = ref(false);//二维码没失效
  // 支付倒计时
  const updateTime = () => {
    codeGq.value = false
    const mins = Math.floor(totalSeconds.value / 60);
    const secs = totalSeconds.value % 60;
    minute.value = String(mins).padStart(2, '0');
    second.value = String(secs).padStart(2, '0');
    // if (totalSeconds.value < 290) {
    //   codeGq.value = true
    // }
    if (totalSeconds.value > 0) {
      totalSeconds.value--;
    } else {
      clearInterval(timer.value);
      // 倒计时结束后的处理逻辑
      console.log('倒计时结束,二维码过期,清除二维码，关闭弹窗');
      // qrCodeData.value = ''
      // pay_info_Vis.value = false//
      // isPay.value = false//
      codeGq.value = true
    }
  };

  // 刷新二维码
  function sxewm() {
    console.log('当前二维码类型', cz_type.value);
    // cz_type    //dpbzj 店铺保证金  flbzj 分类保证金
    if (cz_type.value == 'dpbzj') {
      czbzj()
    } else if (cz_type.value == 'flbzj') {
      handPay()
    }
  }
  // 打开弹窗 分类保证金
  function handPay() {
    pay_Obj.value = {}//清除支付数据重新生成
    pay_info_Vis.value = false//关闭下面那个弹框
    payTypePrices()
    setTimeout(() => {
      cz_type.value = 'flbzj'
      if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
        totalSeconds.value = 5 * 60; // 5 分钟
        minute.value = '05';
        second.value = '00';
      }
      // 支付数据转二维码
      // console.log('分类生成', pay_Obj.value.pay_info);
      QRCode.toDataURL(pay_Obj.value.pay_info)
        .then((url) => {
          console.log('生成的二维码', url); // 将生成的二维码图片URL存储到状态中
          qrCodeData.value = url
          timer.value = setInterval(updateTime, 1000);
        })
        .catch((err) => {
          console.error('生成二维码失败', err);
        });
      isPay.value = true
    }, 1000);
  }
  // 查询支付结果
  function handOKCode() {
    console.log('确定');
    // 支付成功后刷新缴纳状态
    payTypePrices()
    _shopInfo()
    // if (cz_type.value = 'dpbzj') {
    //   isPay.value = false
    //   pay_info_Vis.value = false
    //   message.success('支付成功')
    //   return false
    // }
    // 查询支付结果
    global.axios
      .post('decoration/Store/payTypePricesResult', {
        money_log_id: pay_Obj.value.money_log_id
      }, global)
      .then((res) => {
        console.log('查询支付结果', res);
        // P支付中 S成功 F失败  
        if (res.result == 'P') {
          message.error('支付中')
        } else if (res.result == 'S') {
          message.success('支付成功')
          isPay.value = false
          pay_info_Vis.value = false
          // 支付成功后刷新缴纳状态
          // payTypePrices()
          // _shopInfo()
        } else if (res.result == 'F') {
          message.error('支付失败')
        } else {
          message.error('未知')
        }
      })
  }
  // 点击跳转店铺详情版
  // function czbzj() {
  //   pay_info_Vis.value = false
  //   emit('toShopInfo')
  // }

  // 点击直接缴纳版 店铺保证金
  function czbzj() {
    pay_Obj.value = {}//清除支付数据重新生成
    pay_info_Vis.value = false//关闭下面那个弹框
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
      totalSeconds.value = 5 * 60; // 5 分钟
      minute.value = '05';
      second.value = '00';
    }
    global.axios
      .post('decoration/Store/createStoreEnsureMoney', {
        store_id: post_params.store_id,
        trade_type: 'A_NATIVE',
        password: ''
      }, global)
      .then((res) => {
        console.log('结果', res);
        pay_Obj.value = res
        if (res.pay_info) {
          QRCode.toDataURL(res.pay_info)
            .then((url) => {
              console.log('生成的二维码', url); // 将生成的二维码图片URL存储到状态中
              qrCodeData.value = url
            })
            .catch((err) => {
              console.error('生成二维码失败', err);
            });
          cz_type.value = 'dpbzj'
          isPay.value = true
          timer.value = setInterval(updateTime, 1000);
        }
      })
  }
  // 表格规格输入内容变化
  function chnageInput() {
    shopGuige.value[0].value = []
    shopGuige.value[1].value = []
    post_params.goods_sizes.map((item, index) => {
      shopGuige.value[0].value.push({
        label: item.name,
        isCustom: false
      })
      shopGuige.value[1].value.push({
        label: item.stock,
        isCustom: false
      })
    })
  }

</script>

<template>
  <!--搜索-->
  <div>
    <div>
      <div class="wcdiv">
        <div class="a1">
          <div v-if="props.pageData.data.id">
            <a-button v-show="pageData.hasOwnProperty('parent_page_key')" class="a2 iconfont button-class"
              @click="closeChildPage(pageData.page_key)">&#xe6d2;
            </a-button>
          </div>
          <div v-else>
            <a-button class="a2 iconfont button-class" @click="editType()">&#xe6d2;
            </a-button>
          </div>
          <div class="spbj">商品编辑
          </div>
        </div>
        <div class="flex" style="cursor: pointer;">
          <!-- <div class="tjBtn" @click="tjShopData">提交</div> -->
          <div class="cz" @click="reset">重置</div>
        </div>
      </div>
      <div class="a3">
        <div style="width: 15%;overflow: auto;height: 84vh;">
          <div class="a4">
            <div class="a5">
              商品填写建议
            </div>
            <div class="a6">
              <div>属性</div>
              <div class="a7">填写属性，获取流量</div>
            </div>
          </div>

          <div class="a8">
            <div class="a9">
              发布助手
            </div>
            <div class="a10">
              <div>商品轮播图</div>
              <div>a.尺寸宽高需要均大于480px</div>
              <div>b.大小3M以内</div>
              <div>c.数量限制在10张以内</div>
              <div>d.图片格式仅支持JPG,PNG格式</div>
              <div>e.批量上传时，图片须等宽高且不小于480px</div>
              <div class="a11">
                <div>
                  <InfoCircleOutlined class="a12" />
                </div>
                <div class="a13">请按要求填写商品信息，上传商品图片（注意轮播图上传事项）</div>
              </div>
              <!-- 承诺 -->
              <div style="color: #00000099;">
                <div v-for="(item,cn_index) in wgxdcn" :key="cn_index">
                  <div style="margin: 10px 0px 5px 0px;">{{item.label}}</div>
                  <div>{{item.text}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 商品信息等 -->
        <div class="a14">
          <div style="margin-bottom: 10px;">
            <!-- 新增才有 有id就是编辑-->
            <div v-if="!props.pageData.data.id" class="a15">
              <span>商品分类</span>
              <span style="margin-left: 20px;">{{props.pageData.data.typeName}}</span>
              <span @click="editType()" class="a16">修改分类</span>
            </div>
            <!-- 没给钱才有 -->
            <div v-if="type_Pay.pay_info||shopObj.deposit_money>0" class="a20">
              <ExclamationCircleOutlined class="a21" />
              <span v-if="type_Pay.pay_info">类目保证金{{type_Pay.trans_amt}}元,</span>
              <span v-if="type_Pay.pay_info" class="c22" @click="handPay()">去缴纳</span>
              <span
                v-if="shopObj.deposit_money>0">结合店铺经营情况，共需{{shopObj.deposit_money}}元店铺保证金，当前保证金余额{{shopObj.avl_bal}}元，还需要缴纳{{shopObj.deposit_money}}元店铺保证金</span>
              <span v-if="shopObj.deposit_money>0" class="a22" @click="czbzj">店铺保证金</span>
              <!-- <span v-if="pay_Obj.pay_info||shopObj.deposit_money>0" class="c22" @click="czbzj()">去缴纳</span> -->

            </div>
          </div>
          <!-- <div style="overflow: auto;width: 100%;height: 85%; "> -->
          <!-- 高度没分类加 +7%  没缴纳金额+ 6%  height: 85%;             是编辑                            缴费-->
          <div class="a23" :style="{ 'height': props.pageData.data.id ? '92%' : false?'91%':'85%' }">
            <!-- 基本信息 -->
            <div class="a24">
              <div class="a25">
                <div style="color: #407cff;">1</div>
                <div style="margin-left: 5px;">基本信息</div>
              </div>
              <div v-show="!sqJbxx">
                <div>
                  <div class="a26">
                    <div style="display: flex;">
                      <div style="color: red;">*</div>
                      <div>商品轮播图</div>
                    </div>
                    <div style="margin-left: 20px;">
                      <div style="color: #ff7300;">请优先上传主轮播图，预填白底图</div>
                      <div style="color: #999999;">
                        图片要求：宽高比为1：1，或3：4，且宽高均大于480px，大小3M内，已上传{{post_params.images.length}}/10张。
                      </div>
                      <div class="a27">
                        <Draggable v-model="post_params.images" item-key="index" :component-data="{
                            style: {
                              display: 'contents' // 重点！！让 Draggable 自己不占布局
                            }
                          }" :animation="200">
                          <template #item="{ element, index }">
                            <div class="a28">
                              <div class="a29" v-if="index == 0">
                                主轮播图
                              </div>
                              <a-image :width="90" :height="90" :src="element" :preview="{ src: element }" />
                              <div @click="delImgLb(index)" class="imgClose">
                                <CloseCircleOutlined />
                              </div>
                            </div>
                          </template>
                        </Draggable>

                        <div>
                          <a-upload v-if="post_params.images.length < 10" :customRequest="upload" :multiple="true"
                            :file-list="[]" list-type="picture-card" class="a30">
                            <div style="text-align: center;">
                              <PlusOutlined class="a31" />
                            </div>
                          </a-upload>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div class="a32">
                    <div style="display: flex;">
                      <div style="color: red;">*</div>
                      <div>商品封面图</div>
                    </div>
                    <div style="margin-left: 20px;">
                      <div style="color: #ff7300;">请优先上传封面图，预填白底图</div>
                      <div style="color: #999999;">
                        图片要求：宽高比为1：1，或3：4，且宽高均大于480px，大小3M内，已上传{{post_params.cover_image?1:0}}/1张。
                      </div>
                      <div class="a33">
                        <div v-if="post_params.cover_image" class="a34">
                          <a-image :width="90" :src="post_params.cover_image"
                            :preview="{ src: post_params.cover_image }" />
                          <div @click="delImgFm()" class="imgClose" style="margin-left: 10px;">
                            <CloseCircleOutlined />
                          </div>
                        </div>
                        <div v-else>
                          <a-upload :customRequest="uploadFm" :multiple="false" :file-list="[]"
                            list-type="picture-card">
                            <div class="a35">
                              <PlusOutlined class="a36" />
                            </div>
                          </a-upload>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="a37">
                  <div style="display: flex;">
                    <div style="display: flex;">
                      <div style="color: red;">*</div>
                      <div>商品标题</div>
                    </div>
                    <div class="a38">
                      <div style="display: flex;align-items: center;">
                        <a-input type="text" v-model:value="post_params.name" style="width: 79.5%;" maxlength="30"
                          placeholder="商品标题组成：商品描述+规格，最多输入30个汉字" />
                        <div style="margin-left: 10px;">{{post_params.name.length}}/30</div>
                      </div>
                      <div class="a39">
                        <span class="a40">热搜词推荐</span>:
                        <span @click="post_params.name=post_params.name+item" class="a41" v-for="item in sprmc"
                          :key="item">{{item}}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="a42">
                  <div class="a43">
                    <div style="display: flex;">
                      <div style="color: red;">*</div>
                      <div>发布不上架</div>
                    </div>
                    <div style="margin-left: 20px;display: flex;">
                      <span>下架</span>
                      <a-switch v-model:checked="post_params.status" style="margin: 0 5px;" />
                      <span>上架</span>
                    </div>
                  </div>
                </div>
                <div class="a44">
                  <div style="display: flex;">
                    <div>商品属性</div>
                    <div class="a45">
                      <div class="a46">
                        <div style="display: flex;">
                          <div style="display: flex;">
                            <div>填写率</div>
                            <div style="margin-left: 5px;">
                              <a-progress type="circle" :percent="bfb" :width="16" :strokeWidth="8" :format="() => null"
                                trailColor="#999999" strokeColor="#ff7300" />
                            </div>
                            <div class="a47">{{bfb?bfb+'%':''}}</div>
                          </div>
                          <div class="a48">
                            请准确填写属性，有利于商品在搜索和推荐中露出，错误填写可能面临商品下架或流量流失
                          </div>
                        </div>
                        <div style="display: flex;">
                          <div>没有合适属性值？</div>
                          <div @click="()=>{visibleSx=true}" style="color: #407cff;">点击添加</div>
                        </div>
                      </div>
                      <div class="a49"></div>
                      <div class="a50">
                        <div style="width: 45%;">
                          <div>
                            <div class="a51">
                              <div class="a52">
                                <div></div>
                                <div class="a53">
                                  <div style="color: red;">*</div>
                                  <div>分类</div>
                                </div>
                              </div>
                              <div class="a54">
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
                            <div class="a55">
                              <div class="a56">
                                <div></div>
                                <div style="display: flex;">
                                  <div style="color: red;">*</div>
                                  <div>品牌</div>
                                </div>
                              </div>
                              <div>
                                <a-select ref="select" v-model:value="post_params.brand_id" class="a57"
                                  placeholder="请选择品牌">
                                  <a-select-option :value="item.value" v-for="item in ppList"
                                    :key="item.value">{{item.label}}</a-select-option>
                                </a-select>
                                <span v-if="del_pp_text" class="a58">品牌已被删除，请重新选择</span>
                                <!-- <div style="padding-left: 20px;font-size: 12px;color: #999999;">未找到需要的品牌？<span
                        style="color: #ff7300;">点击申请</span></div> -->
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style="width: 45%;">
                          <div>
                            <template v-for="(item,index) in post_params.attributes" :key="index">
                              <div class="a59">
                                <div class="a60">{{item.key}}</div>
                                <template v-if="item.type=='input'">
                                  <a-input type="text" v-model:value="item.value" class="a61" placeholder="请输入具体属性值" />
                                </template>
                                <template v-else-if="item.type=='select'">
                                  <a-select v-model:value="item.value" class="a62" placeholder="请选择">
                                    <a-select-option :value="iss" v-for="iss in item.option"
                                      :key="iss">{{iss}}</a-select-option>
                                  </a-select>
                                </template>
                                <!-- 是否可删除 -->
                                <CloseCircleOutlined v-if="item.is_del" @click="delSx(index)"
                                  style="margin-left: 10px;" />
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
                      <div class="a63">
                        <div>详情介绍商品以提升转化。若未编辑，商品发布后轮播图将自动填充至图文详情
                          <!-- <span class="a64">查看教程</span> -->
                        </div>
                        <div class="a65">
                          <div class="a66">
                            <div class="a67">
                              <span>页面预览</span>
                              <span @click="()=>{isYl=!isYl}" style="color: #407cff;">{{isYl?'关闭':'预览'}}</span>
                            </div>
                            <div class="a68">
                              <div v-if="!isYl">
                                <a-empty style="margin-top: 130px;" description="暂未编辑商品详情" />
                                <div class="a69">编辑商品详情，提升商品转化率</div>
                              </div>
                              <div v-else>
                                <img :src="post_params.images[0]" class="a70" alt="">
                                <div class="a71">
                                  <div style="display: flex;">
                                    <img :src="img" class="a72" v-for="img in post_params.images" :key="img" alt="">
                                  </div>
                                  <div class="a73">
                                    <div class="a74">
                                      ￥{{post_params.goods_sizes[0].price}}</div>
                                    <div style="color: #333333;">规格：{{post_params.goods_sizes[0].name}}</div>
                                  </div>
                                  <div style="font-weight: bold;">{{post_params.name}}</div>
                                  <div class="a75">
                                    <div v-if="post_params.goods_type=='a'" class="a76">
                                      普通商品</div>
                                    <div v-if="post_params.goods_type=='b'" class="a76">
                                      海外进口</div>
                                    <div v-if="post_params.goods_type=='c'" class="a76">
                                      海外CC个人行邮</div>
                                    <div v-if="post_params.is_used=='Y'" class="a76">
                                      二手</div>
                                    <div v-if="post_params.is_customized=='Y'" class="a76">
                                      定制</div>
                                    <div v-if="post_params.is_plan_salled=='a'" class="a76">
                                      非预售
                                    </div>
                                    <div v-if="post_params.is_plan_salled=='b'" class="a76">
                                      定时预售
                                    </div>
                                    <div v-if="post_params.is_plan_salled=='c'" class="a76">
                                      时段预售
                                    </div>
                                    <div v-if="post_params.is_plan_salled=='d'" class="a76">
                                      规格预售
                                    </div>
                                    <div v-if="post_params.need_send_time=='a'" class="a76">
                                      当日发货
                                    </div>
                                    <div v-if="post_params.need_send_time=='b'" class="a76">
                                      24小时
                                    </div>
                                    <div v-if="post_params.need_send_time=='c'" class="a76">
                                      48小时
                                    </div>
                                  </div>
                                  <div style="display: flex;">
                                    <div style="display: flex;">
                                      <div class="a77">销量</div>
                                      <div class="a78">0</div>
                                    </div>
                                    <div class="a79">
                                      <div class="a80">库存</div>
                                      <div class="a81">
                                        {{post_params.goods_sizes[0].stock}}</div>
                                    </div>
                                  </div>
                                  <div style="margin: 10px 0px;">
                                    <div v-for="item in cn_value" :key="item" class="a82">
                                      <div style="color: #666666;">{{item}}</div>
                                      <RightOutlined />
                                    </div>
                                  </div>
                                  <div style="font-weight: bold;">商品详情</div>
                                  <div class="a83" v-if="post_params.attributes.length>0">
                                    <div v-for="item in post_params.attributes" :key="item.key" class="a84">
                                      <div style="color: #999999;">{{item.key}}</div>
                                      <div>{{item.value}}</div>
                                    </div>
                                  </div>
                                  <div>
                                    <div v-if="post_params.detail.length>0">
                                      <img :src="img" v-for="img in post_params.detail" :key="img" style="width: 100%;"
                                        alt="">
                                    </div>
                                    <div v-else>
                                      <img :src="img" v-for="img in post_params.images" :key="img" style="width: 100%;"
                                        alt="">
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div class="a85">
                              <div>
                                <div style="display: flex;">
                                  <div>快速编辑</div>
                                  <div>已上传<span style="color: #f97425;">{{post_params.detail.length}}</span>/50张</div>
                                </div>
                                <div>仅支持上传图片，拖拽可调整顺序</div>
                              </div>

                              <a-upload :customRequest="uploadAll" :multiple="true" :file-list="[]" list-type="text">
                                <div class="a86">
                                  本地上传</div>
                              </a-upload>
                            </div>
                            <div class="a87">
                              <Draggable v-model="post_params.detail" item-key="index" :component-data="{
                                style: {
                                  display: 'contents' // 重点！！让 Draggable 自己不占布局
                                }
                              }" :animation="200">
                                <template #item="{ element, index }">
                                  <div class="a88">
                                    <a-image :width="90" :height="90" :src="element" :preview="{ src: element }" />
                                    <div @click="delImgXq(index)" class="imgClose">
                                      <CloseCircleOutlined />
                                    </div>
                                  </div>
                                </template>
                              </Draggable>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div @click="()=>{sqJbxx=!sqJbxx}" class="a89">
                <div style="margin-right: 5px;">{{sqJbxx?'展开':'收起'}}</div>
                <UpCircleOutlined v-if="!sqJbxx" class="a90" />
                <DownCircleOutlined v-else class="a90" />
              </div>
            </div>
            <!-- 添加属性 -->
            <a-modal v-model:visible="visibleSx" title="添加属性" @ok="addSx">
              <div>
                <div style="display: flex;align-items: center;">
                  <div>名称</div>
                  <a-input type="text" v-model:value="SxName" class="a91" placeholder="请填写名称" />
                </div>
              </div>
            </a-modal>
            <!-- 规格与库存 -->
            <div class="a92">
              <div class="a93">
                <div style="color: #407cff;">2</div>
                <div style="margin-left: 5px;">规格与库存</div>
              </div>
              <div>
                <div class="a94">
                  <div style="display: flex;">
                    <!-- <div style="color: red;">*</div> -->
                    <div>商品规格</div>
                  </div>
                  <div class="a95">
                    <div class="a96">
                      <div>最多配置2个商品规格类型</div>
                      <div v-for="(item,index) in shopGuige" :key="index" class="a97">
                        <div class="a98">
                          <!-- v-model:value="item.value" -->
                          <a-select v-model:value="item.labelValue" style="width: 200px;" placeholder="请选择">
                            <a-select-option :key="index+iss.value" :value="iss.value"
                              v-for="iss in item.labelOption">{{iss.label}}</a-select-option>
                          </a-select>
                          <div class="a99">
                            <span @click="downUp(index)">{{index==0?'下移':'上移'}}</span>
                            <span class="a100">|</span>
                            <span @click="()=>{shopGuige[index].value=[]}">删除规格类型</span>
                          </div>
                        </div>
                        <!-- 是否点击了开始排序 -->
                        <div v-if="item.isSort" style="padding: 10px;">
                          <Draggable v-model="item.value" item-key="label" :component-data="{
                            style: {
                              display: 'grid',
                              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                              gap: '10px'
                            }
                          }">
                            <template #item="{ element, val_index }">
                              <div class="b1">
                                <a-input v-model:value="element.label" placeholder="请输入规格名称" style="width: 200px;" />
                                <div @click="removeItem(index,val_index)" class="b2">删除</div>
                                <div v-if="element.isCustom" class="b3">
                                  定制
                                </div>
                              </div>
                            </template>
                          </Draggable>
                        </div>
                        <div v-else class="b4">
                          <template v-for="(xx,xx_index) in item.value" :key="xx_index">
                            <div class="b5">
                              <a-input placeholder="请输入规格名称" v-model:value="xx.label" style="width: 200px;" />
                              <div @click="removeItem(index,xx_index)" class="b6">删除
                              </div>
                              <div v-if="xx.isCustom" class="b7">
                                定制
                              </div>
                            </div>
                          </template>
                        </div>
                        <div class="b8">
                          <div @click="()=>{shopGuige[index].isSort = !shopGuige[index].isSort}"
                            style="margin-right: 20px;">{{ shopGuige[index].isSort?'确定':'开始排序'}}</div>
                          <div @click="addgg(index)" style="margin-right: 20px;">添加规格</div>
                          <div @click="addDzgg(index)" v-if="item.labelValue=='name'" style="margin-right: 20px;">添加定制规格
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="b9">
                  <div style="display: flex;">
                    <div style="color: red;">*</div>
                    <div>价格及库存</div>
                  </div>
                  <div class="b10">
                    <div class="b11">
                      <div class="b12">
                        <div>
                          <div style="color: #ff7300;">请如实填写库存信息，以确保商品可以在承诺时间内发出，避免出现违规</div>
                        </div>
                        <div style="color: #407cff;" @click="addGG">添加规格</div>
                      </div>
                      <table class="b13">
                        <tr class="b14">
                          <th>
                            <div style="color: #999999;">操作</div>
                          </th>
                          <th>
                            <template v-if="shopGuige[0].labelValue=='name'">
                              <div style="display: flex;">
                                <div style="display: flex;margin: 0 auto;">
                                  <div style="color: red;">*</div>
                                  <div style="color: #999999;">名称</div>
                                </div>
                              </div>
                            </template>
                            <template v-else-if="shopGuige[0].labelValue=='stock'">
                              <div style="display: flex;">
                                <div style="display: flex;margin: 0 auto;">
                                  <div style="color: red;">*</div>
                                  <div style="color: #999999;">库存</div>
                                </div>
                              </div>
                            </template>
                          </th>
                          <th>
                            <template v-if="shopGuige[1].labelValue=='name'">
                              <div style="display: flex;">
                                <div style="display: flex;margin: 0 auto;">
                                  <div style="color: red;">*</div>
                                  <div style="color: #999999;">名称</div>
                                </div>
                              </div>
                            </template>
                            <template v-else-if="shopGuige[1].labelValue=='stock'">
                              <div style="display: flex;">
                                <div style="display: flex;margin: 0 auto;">
                                  <div style="color: red;">*</div>
                                  <div style="color: #999999;">库存</div>
                                </div>
                              </div>
                            </template>
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
                            <tr class="b15">
                              <td>
                                <div class="b16" @click="delGG(index)">删除</div>
                              </td>
                              <td>
                                <template v-if="shopGuige[0].labelValue=='name'">
                                  <a-input @change="chnageInput()" type="text" v-model:value="item.name"
                                    placeholder="请输入名称" />
                                </template>
                                <template v-else-if="shopGuige[0].labelValue=='stock'">
                                  <a-input @change="chnageInput()" type="text" v-model:value="item.stock"
                                    placeholder="请输入库存" />
                                </template>
                              </td>
                              <td>
                                <template v-if="shopGuige[1].labelValue=='name'">
                                  <a-input @change="chnageInput()" type="text" v-model:value="item.name"
                                    placeholder="请输入名称" />
                                </template>
                                <template v-else-if="shopGuige[1].labelValue=='stock'">
                                  <a-input @change="chnageInput()" type="text" v-model:value="item.stock"
                                    placeholder="请输入库存" />
                                </template>
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
            <div class="b17">
              <div class="b18">
                <div style="color: #407cff;">3</div>
                <div style="margin-left: 5px;">商品服务</div>
              </div>
              <div v-show="!ser_sqJbxx">
                <div class="b19">
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
                <div class="b19">
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
                <div class="b19">
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
                <div class="b19">
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
                <div class="b20">
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
                <div class="b19">
                  <div style="display: flex;">
                    <div style="color: red;">*</div>
                    <div>运费模板</div>
                  </div>
                  <div class="b21">
                    <div v-if="allYfmb.length==0">暂无启用模板！</div>
                    <a-radio-group v-model:value="post_params.carriage_id" name="radioGroup">
                      <a-radio :value="item.id" v-for="item in allYfmb" :key="item.id">{{item.name}}</a-radio>
                      <!-- <a-radio value="2">其它模板</a-radio> -->
                    </a-radio-group>
                    <template v-for="item in allYfmb" :key="item.id">
                      <template v-if="item.id == post_params.carriage_id">
                        <div class="b22">
                          <div class="b23">
                            <span>包邮配送地区：</span>
                            <span style="width: 80%;">
                              <span v-for="(iss,index_bydq) in item.bydq" :key="index_bydq">
                                {{iss}}
                                <span>{{index_bydq+1==item.bydq.length?'。':'、'}}</span>
                              </span>
                            </span>
                          </div>
                          <div class="b24">
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
                          <div class="b25">不配送地区：
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
                <div class="b26">
                  <div style="display: flex;">
                    <div>库存计件</div>
                  </div>
                  <div style="margin-left: 20px;">
                    支付成功减库存
                  </div>
                </div>
                <div v-show="false" class="b27">
                  <div style="display: flex;">
                    <div style="color: red;">*</div>
                    <div>商品曝光等级</div>
                  </div>
                  <div style="margin-left: 20px;">
                    <a-radio-group v-model:value="post_params.power_level_id" name="radioGroup">
                      <a-radio :value="item.id" v-for="item in bgdjList"
                        :key="item.id">{{item.name}}(消耗曝光量：{{item.power}})</a-radio>
                    </a-radio-group>
                  </div>
                </div>
                <div v-show="false" class="b28">
                  <div style="display: flex;">
                    <div style="color: red;">*</div>
                    <div>曝光时间</div>
                  </div>
                  <div style="margin-left: 20px;">
                    <a-range-picker v-model:value="timeStaEnd" show-time />
                  </div>
                </div>
                <div v-show="false" v-if="props.pageData.data.id" class="b29">
                  <div class="b30">
                    <div style="display: flex;">
                      <div>曝光量</div>
                    </div>
                    <a-input-number :min="0" v-model:value="post_params.power" class="b31" placeholder="请输入曝光量" />
                  </div>
                </div>
                <div class="b32">
                  <div style="display: flex;">
                    <div style="color: red;">*</div>
                    <div>承诺</div>
                  </div>
                  <div style="margin-left: 20px;">
                    <a-checkbox-group style="display: grid;" v-model:value="cn_value" :options="cnOption"
                      @change="cncChange" />
                  </div>
                </div>
              </div>
              <div @click="()=>ser_sqJbxx=!ser_sqJbxx" class="b33">
                <div style="margin-right: 5px;">{{ser_sqJbxx?'展开':'收起'}}</div>
                <UpCircleOutlined v-if="!ser_sqJbxx" class="b34" />
                <DownCircleOutlined v-else class="b34" />
              </div>
            </div>

            <div class="b35">
              <a-button type="primary" @click="tjShopData()">提交商品数据</a-button>
            </div>
            <!-- 需提示缴纳保证金 -->
            <a-modal v-model:visible="pay_info_Vis" :footer="null" style="z-index: 8;">
              <div style="position: relative;">
                <div class="b36">
                  <ExclamationCircleFilled class="b38" />
                </div>
                <div class="b37">
                  <span v-if="pay_Obj.pay_info">类目保证金{{pay_Obj.trans_amt}}元,</span>
                  <span
                    v-if="shopObj.deposit_money>0">结合店铺经营情况，共需{{shopObj.deposit_money}}元店铺保证金，当前保证金余额{{shopObj.avl_bal}}元，还需要缴纳{{shopObj.deposit_money}}元店铺保证金</span>
                </div>
                <div class="b39">
                  <div class="b40" style="cursor: pointer;">
                    <div class="b41" @click="czbzj" v-if="shopObj.deposit_money>0">缴纳店铺保证金</div>
                    <div class="b41" @click="handPay" v-else-if="pay_Obj.pay_info">缴纳分类保证金</div>
                    <div @click="pay_info_Vis=false" class="b42">暂不充值
                    </div>
                  </div>
                </div>
              </div>
            </a-modal>
            <!-- 留底高 -->
            <div style="height: 100px;"></div>
          </div>
          <!-- 支付弹框 -->
          <a-modal v-model:visible="isPay" :centered="true" @ok="handOKCode" :keyboard="false" ok-text="已支付"
            style="z-index: 999999;" cancel-text="放弃" :maskClosable="false">
            <div class="container">
              <div class="pcHeader">
                <img class="logoImg"
                  src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/shopImg/2025421/tjgvd9d3mr771js7f2o6hqqjsegs2p9b.png"
                  alt="Logo" title="Logo" />
                <div class="headerTitle">收银台</div>
              </div>
              <div class="price">
                <span class="priceUnit">¥</span>
                <span class="priceNumber" v-if="cz_type=='dpbzj'">{{shopObj.deposit_money}}</span>
                <span class="priceNumber" v-if="cz_type=='flbzj'">{{pay_Obj.trans_amt}}</span>
              </div>
              <div class="payTimeRemaining">
                <span class="payTxt">支付剩余时间</span>
                <span class="time">
                  <!-- <span class="timeItem" id="pay_minute">05</span><span class="timeSplit">:</span><span
            class="timeItem" id="pay_second">00</span> -->
                  <span class="time">
                    <span class="timeItem">{{ minute }}</span>
                    <span class="timeSplit">:</span>
                    <span class="timeItem">{{ second }}</span>
                  </span>
                </span>
              </div>
              <div class="payType">
                <ul class="payTab">
                  <li class="payItem activePayItem" style="--theme: #0B5AFE" data-type="alipay">
                    <img class="payIcon"
                      src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/coverImg/2025421/1lbj3114n1mkb3mt71ak14ajhv5gc5nh.png" />
                    <span class=" payTitle">支付宝</span>
                  </li>
                </ul>
                <div class="payContent">
                  <!-- <img :src="qrCodeData" alt="支付二维码" /> -->
                  <img :src="qrCodeData" alt="支付二维码" :style="{opacity: codeGq?'0.1':'1'}" />
                  <div v-if="codeGq" style="position: relative;top: -100px;color: #000000;">
                    二维码已失效
                    <div style="color: #ff0000;cursor: pointer;" @click="sxewm">刷新</div>
                  </div>
                  <div class="conetentTxt"><span class="payDesc"><span id="payName">使用支付宝App扫码完成支付</span></span>
                  </div>
                </div>
              </div>
            </div>
          </a-modal>
        </div>
      </div>
    </div>
  </div>
  <!--导出-->
</template>

<style scoped>
  /*  */
  .container {
    width: 100%;
    max-width: 1080px;
    height: 100%;
    max-height: 720px;
    position: relative;
    text-align: center;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 14px;
  }

  .pcHeader {
    margin-left: 24px;
    align-items: center;
    display: flex;
    flex-direction: row;
  }

  .logoImg {
    object-fit: contain;
    height: 30px;
    margin-right: 10px;
    max-width: 160px;
  }

  .headerTitle {
    font-size: 18px;
    font-weight: 500;
    color: #050505;
  }

  .price {
    font-size: 30px;
    font-weight: 700;
    margin-bottom: 10px;
    font-family: DINAlternate, DINAlternate-Bold;
    color: #333333;
  }

  .priceUnit {
    font-size: 20px;
    font-weight: 400;
    margin-right: 4px;
  }

  .priceNumber {
    font-size: 24px;
    font-weight: 500;
    margin-left: 4px;
  }

  .payTimeRemaining {
    margin-bottom: 6px;
  }

  .payTxt {
    color: #999;
    margin-right: 11px;
  }

  .time {
    font-weight: 400;
    font-size: 14px;
    color: #000000;
  }

  .timeItem {
    background: rgba(0, 0, 0, 0.04);
    border-radius: 2px;
    padding: 2px;
  }

  .timeSplit {
    margin: 0 4px;
  }

  .payTab {
    margin-top: 20px;
    display: flex;
    border-bottom: 1px solid #e9e6e6;
  }

  .payItem {
    padding: 10px 20px;
    background: #ffffff;
    font-size: 14px;
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
    margin-right: 20px;
    box-sizing: border-box;
  }

  .payItem:last-of-type {
    margin-right: 0;
  }

  .payIcon {
    height: 20px;
    object-fit: contain;
    margin-right: 10px;
  }

  .activePayItem {
    border-radius: 6px 6px 0px 0px;
    border: 1px solid #e9e6e6;
    border-bottom: none;
  }

  .payItem:first-of-type::after {
    position: absolute;
    content: '推荐';
    right: -18px;
    top: -11px;
    width: 36px;
    height: 22px;
    text-align: center;
    line-height: 22px;
    border-radius: 10px 0 10px 0;
    background: #E74E4E;
    color: #ffffff;
    z-index: 999;
    font-size: 12px;
  }

  .activePayItem::before {
    position: absolute;
    content: '';
    right: 0;
    bottom: -1px;
    width: 100%;
    height: 3px;
    background: #ffffff;
    z-index: 999;
  }

  .payContent {
    display: flex;
    width: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .conetentTxt {
    text-align: center;
    font-weight: 400;
    color: #000000;
    /* margin-bottom: 55px; */
  }

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

  .a1 {
    display: flex;
    align-items: center;
  }

  .a2 {
    font-size: 18px !important;
    padding: 0 10px;
    float: left;
    margin-right: 20px;
  }

  .a3 {
    display: flex;
    justify-content: space-between;
    cursor: pointer;
  }

  .a4 {
    border: 1px solid #eff0f4;
    border-radius: 5px;
    overflow: hidden;
  }

  .a5 {
    background-color: #ff7300;
    color: #fff;
    text-align: center;
    padding: 10px 20px;
  }

  .a6 {
    padding: 10px;
    display: flex;
  }

  .a7 {
    color: #ff7300;
    margin-left: 20px;
  }

  .a8 {
    border: 1px solid #eff0f4;
    margin-top: 20px;
    border-radius: 5px;
    overflow: hidden;
  }

  .a9 {
    background-color: #407cff;
    color: #fff;
    text-align: center;
    padding: 10px 20px;
  }

  .a10 {
    padding: 10px;
    color: #999999;
  }

  .a11 {
    display: flex;
    padding: 10px;
    border: 1px solid #ffecc8;
    background-color: #fff6e6;
    border-radius: 5px;
  }

  .a12 {
    color: #ff7300;
    font-size: 14px;
  }

  .a13 {
    margin-left: 5px;
    color: black;
  }

  .a14 {
    width: 84%;
    height: 84vh;
  }

  .a15 {
    border-radius: 4px;
    padding: 10px 60px;
    border: 1px solid #f5f5f5;
    width: 100%;
    display: flex;
    margin-bottom: 10px;
  }

  .a16 {
    color: #1890FF;
    margin-left: 10px;
  }

  .a17 {
    display: flex;
    border: 1px solid #ffdaa3;
    border-radius: 3px;
    padding: 5px 10px;
    align-items: center;
    background-color: #fff6e6;
  }

  .a18 {
    color: #ff7300;
    margin-right: 10px;
  }

  .a19 {
    color: #1890FF;
    margin-left: 10px;
  }

  .a20 {
    display: flex;
    border: 1px solid rgb(255, 218, 163);
    border-radius: 3px;
    padding: 5px 10px;
    align-items: center;
    background-color: #FFF6E6;
  }

  .a21 {
    color: #ff7300;
    margin-right: 10px;
  }

  .a22 {
    color: #1890FF;
    margin-left: 10px;
    cursor: pointer;
  }

  .c22 {
    color: #1890FF;
    margin-right: 10px;
    cursor: pointer;
  }

  .a23 {
    overflow: auto;
    width: 100%;
  }

  .a24 {
    padding: 20px;
    border: 1px solid #f5f5f5;
    width: 100%;
    border-radius: 4px;
  }

  .a25 {
    display: flex;
    font-size: 16px;
  }

  .a26 {
    display: flex;
    margin-top: 20px;
    margin-left: 20px;
  }

  .a27 {
    margin-top: 5px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .a28 {
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    height: 90px;
    width: 90px;
  }

  .a29 {
    background-color: #1890FF;
    color: #fff;
    font-size: 12px;
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 999;
    padding: 0px 5px;
    border-radius: 4px 0px 4px 0px;
  }

  .a30 {
    width: 90px;
    height: 90px;
    border-radius: 4px;
  }

  .a31 {
    font-size: 30px;
    color: #999999;
  }

  .a32 {
    display: flex;
    margin-top: 20px;
    margin-left: 20px;
  }

  .a33 {
    margin-top: 5px;
    display: flex;
  }

  .a34 {
    position: relative;
    display: flex;
    overflow: hidden;
    border-radius: 4px;
  }

  .a35 {
    width: 90px;
    height: 88px;
    border: 1px solid #f5f5f5;
    text-align: center;
  }

  .a36 {
    font-size: 30px;
    color: #999999;
    margin-top: 30%;
  }

  .a37 {
    margin-top: 20px;
    margin-left: 34px;
    align-items: center;
  }

  .a38 {
    margin-left: 20px;
    width: 90%;
  }

  .a39 {
    margin-top: 10px;
    color: #999999;
  }

  .a40 {
    border-bottom: 1px dashed #999999;
  }

  .a41 {
    background-color: #f0f7ff;
    color: #4874dd;
    padding: 0 5px;
    border-radius: 4px;
    margin-right: 5px;
  }

  .a42 {
    margin-top: 20px;
    margin-left: 20px;
    align-items: center;
  }

  .a43 {
    display: flex;
    align-items: center;
  }

  .a44 {
    margin-top: 20px;
    margin-left: 40px;
  }

  .a45 {
    margin-left: 20px;
    background-color: #f7f8fa;
    border-radius: 5px;
    width: 80%;
  }

  .a46 {
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
  }

  .a47 {
    color: #ff7300;
    margin-left: 5px;
  }

  .a48 {
    margin-left: 20px;
    color: #999999;
    width: 60%;
  }

  .a49 {
    background-color: #999999;
    height: 1px;
    width: 100%;
  }

  .a50 {
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    background-color: #f7f8fa;
  }

  .a51 {
    display: flex;
    margin: 10px 0px;
  }

  .a52 {
    width: 30%;
    text-align: right;
    display: flex;
    justify-content: space-between;
  }

  .a53 {
    display: flex;
    margin-top: 10px;
  }

  .a54 {
    margin-left: 20px;
    width: 200px;
  }

  .a55 {
    display: flex;
    margin: 10px 0px;
  }

  .a56 {
    width: 30%;
    text-align: right;
    display: flex;
    justify-content: space-between;
  }

  .a57 {
    width: 200px;
    margin-left: 20px;
  }

  .a58 {
    color: #ff0000;
    padding-left: 20px;
    font-size: 12px;
  }

  .a59 {
    display: flex;
    align-items: center;
    margin: 10px 0px;
  }

  .a60 {
    width: 30%;
    text-align: right;
  }

  .a61 {
    width: 55%;
    margin-left: 20px;
  }

  .a62 {
    width: 55%;
    margin-left: 20px;
  }

  .a63 {
    margin-left: 20px;
    width: 80%;
  }

  .a64 {
    cursor: pointer;
    color: #407cff;
  }

  .a65 {
    display: flex;
    margin-top: 10px;
  }

  .a66 {
    border: 1px solid #f5f5f5;
    width: 375px;
  }

  .a67 {
    padding: 10px;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #f5f5f5;
  }

  .a68 {
    height: 500px;
    overflow: auto;
  }

  .a69 {
    text-align: center;
    margin-top: -15px;
  }

  .a70 {
    width: 100%;
    height: 360px;
  }

  .a71 {
    padding: 10px;
    width: 100%;
  }

  .a72 {
    width: 60px;
    height: 60px;
    margin-right: 10px;
  }

  .a73 {
    display: flex;
    margin-top: 10px;
    width: 100%;
    align-items: center;
    justify-content: space-between;
  }

  .a74 {
    color: #ff0000;
    font-weight: bold;
    font-size: 26px;
  }

  .a75 {
    display: flex;
    margin: 10px 0px
  }

  .a76 {
    margin-right: 5px;
    padding: 2px 5px;
    border-radius: 2px;
    border: 1px solid #4DB23F;
    color: #4DB23F;
  }

  .a77 {
    color: #fff;
    background-color: #FA6C2F;
    padding: 0px 8px;
  }

  .a78 {
    color: #FA6C2F;
    border: 1px solid #FA6C2F;
    padding: 0px 8px;
  }

  .a79 {
    display: flex;
    margin-left: 10px;
  }

  .a80 {
    color: #fff;
    background-color: #36A9FC;
    padding: 0px 8px;
  }

  .a81 {
    color: #36A9FC;
    border: 1px solid #36A9FC;
    padding: 0px 8px;
  }

  .a82 {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .a83 {
    background-color: #f5f5f5;
    padding: 10px;
    margin: 10px 0px;
  }

  .a84 {
    display: flex;
    justify-content: space-between;
  }

  .a85 {
    border: 1px solid #f5f5f5;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 28vw;
    margin-left: 10px;
  }

  .a86 {
    padding: 2px 10px;
    border: 1px solid #407cff;
    border-radius: 4px;
    color: #407cff;
  }

  .a87 {
    margin-top: 5px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-left: 10px;
    padding: 10px;
    width: 28vw;
  }

  .a88 {
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    height: 90px;
    width: 90px;
  }

  .a89 {
    display: flex;
    align-items: center;
    margin-left: 77px;
    margin-top: 10px;
    color: #407cff;
  }

  .a90 {
    color: #407cff;
    font-size: 14px;
  }

  .a91 {
    margin-left: 20px;
    width: 80%;
  }

  .a92 {
    padding: 20px;
    margin-top: 20px;
    border: 1px solid #f5f5f5;
    width: 100%;
    border-radius: 4px;
  }

  .a93 {
    display: flex;
    font-size: 16px;
  }

  .a94 {
    display: flex;
    margin-top: 20px;
    margin-left: 40px;
  }

  .a95 {
    margin-left: 20px;
    width: 90%;
  }

  .a96 {
    background-color: #f7f8fa;
    padding: 20px;
    border-radius: 5px;
  }

  .a97 {
    width: 100%;
    margin-top: 10px;
    background-color: #fff;
    margin-bottom: 20px;
  }

  .a98 {
    padding: 10px;
    display: flex;
    justify-content: space-between;
    width: 100%;
    border-bottom: 1px solid #999999;
  }

  .a99 {
    cursor: pointer;
    color: #1890FF;
  }

  .a100 {
    color: #999999;
    margin: 0 10px;
  }

  .b1 {
    display: flex;
    align-items: center;
    position: relative;
    margin-bottom: 10px;
  }

  .b2 {
    color: #1890FF;
    margin-left: 10px;
    cursor: pointer;
  }

  .b3 {
    position: absolute;
    left: 170px;
    top: 0px;
    font-size: 10px;
    color: #fff;
    background-color: #f97425;
    padding: 0px 5px;
    border-radius: 0px 4px 0px 4px;
  }

  .b4 {
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr))
  }

  .b5 {
    display: flex;
    align-items: center;
    position: relative;
    margin-bottom: 10px;
  }

  .b6 {
    color: #1890FF;
    margin-left: 10px;
  }

  .b7 {
    position: absolute;
    left: 170px;
    top: 0px;
    font-size: 10px;
    color: #fff;
    background-color: #f97425;
    padding: 0px 5px;
    border-radius: 0px 4px 0px 4px;
  }

  .b8 {
    padding: 0px 10px 10px 10px;
    display: flex;
    color: #1890FF;
  }

  .b9 {
    display: flex;
    margin-top: 20px;
    margin-left: 20px;
  }

  .b10 {
    margin-left: 20px;
    width: 90%;
  }

  .b11 {
    background-color: #f7f8fa;
    padding: 20px;
    border-radius: 5px;
  }

  .b12 {
    display: flex;
    justify-content: space-between;
  }

  .b13 {
    border-collapse: collapse;
    width: 100%;
    margin-top: 10px;
    border: 1px solid #f0f2f5;
    letter-spacing: 1px;
    text-align: center;
  }

  .b14 {
    display: grid;
    grid-template-columns: repeat(9, minmax(0, 1fr));
    text-align: center;
  }

  .b15 {
    display: grid;
    grid-template-columns: repeat(9, minmax(0, 1fr));
    text-align: center;
    background-color: #fff;
  }

  .b16 {
    color: red;
    margin-top: 5px;
  }

  .b17 {
    padding: 20px;
    margin-top: 20px;
    border: 1px solid #f5f5f5;
    width: 100%;
    border-radius: 4px;
  }

  .b18 {
    display: flex;
    font-size: 16px;
  }

  .b19 {
    display: flex;
    margin-top: 20px;
    margin-left: 40px;
  }

  .b20 {
    display: flex;
    margin-top: 20px;
    margin-left: 18px;
  }

  .b21 {
    margin-left: 20px;
    width: 80%;
  }

  .b22 {
    background-color: #f7f8fa;
    color: #999999;
    padding: 20px;
    margin-top: 10px;
  }

  .b23 {
    padding-left: 14px;
    display: flex;
  }

  .b24 {
    display: flex;
    margin-top: 10px;
  }

  .b25 {
    margin-top: 10px;
    margin-left: 28px;
  }

  .b26 {
    display: flex;
    margin-top: 20px;
    margin-left: 47px;
  }

  .b27 {
    display: flex;
    margin-top: 20px;
    margin-left: 13px;
  }

  .b28 {
    display: flex;
    margin-top: 20px;
    margin-left: 40px;
  }

  .b29 {
    margin-top: 20px;
    margin-left: 60px;
    align-items: center;
  }

  .b30 {
    display: flex;
    align-items: center;
  }

  .b31 {
    margin-left: 20px;
    width: 412px;
  }

  .b32 {
    display: flex;
    margin-top: 20px;
    margin-left: 68px;
  }

  .b33 {
    display: flex;
    align-items: center;
    margin-left: 77px;
    margin-top: 10px;
    color: #407cff;
  }

  .b34 {
    color: #407cff;
    font-size: 14px;
  }

  .b35 {
    padding: 20px;
    margin-top: 20px;
    border: 1px solid #f5f5f5;
    width: 100%;
    text-align: center;
  }

  .b36 {
    padding: 5px;
    background-color: #fff;
    position: absolute;
    left: 45%;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    top: -70px;
  }

  .b37 {
    text-align: center;
    margin-top: 20px;
    line-height: 30px;
  }

  .b38 {
    color: #ff7300;
    font-size: 40px;
  }

  .b39 {
    display: flex;
    margin-top: 20px;
  }

  .b40 {
    display: flex;
    margin: 0 auto;
  }

  .b41 {
    color: #fff;
    background-color: #1890FF;
    margin-right: 10px;
    padding: 2px 10px;
    border-radius: 4px;
  }

  .b42 {
    color: #00000099;
    padding: 2px 10px;
    border-radius: 4px;
    border: 1px solid #00000099;
  }
</style>