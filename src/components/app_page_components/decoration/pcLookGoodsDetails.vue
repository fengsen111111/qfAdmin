<script setup>
  import { inject, onBeforeMount, reactive, ref, getCurrentInstance, watch } from "vue";
  import { RightOutlined, InfoCircleOutlined, UpCircleOutlined, DownCircleOutlined, PlusOutlined, CloseCircleOutlined, ExclamationCircleOutlined, ExclamationCircleFilled, QuestionCircleOutlined } from "@ant-design/icons-vue";
  import { message } from 'ant-design-vue';
  import Draggable from 'vuedraggable';//排序插件

  let emit = defineEmits(["openChildPage", "closeChildPage", "closeChildPageTwo", "editType", "toShopInfo", "djtzmk"]);
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
    status: true,//启用状态 Y上架 N下架    
    attributes: [],//商品属性  
    services: [],//商品服务  
    goods_sizes: [
      {
        id: '',//
        size_image: '',//商品规格图片  
        name: '',//名称  
        stock: '',//库存
        old_price: '',//原价
        price: '',//价格
        uper_status: false,//是否需要推荐官推荐
        integral_price: '',//可以积分抵扣的最大金额
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
  })
  const bfb = ref(0)//填写进度

  watch(() => post_params.type_id, (newVal, oldVal) => {
    bfb.value = 50
    if (post_params.brand_id) {
      bfb.value = 100
    }
  });

  const del_pp_text = ref(false)

  watch(() => post_params.brand_id, (newVal, oldVal) => {
    del_pp_text.value = false
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

  let props = defineProps(["pageData"]);
  const pageData = props.pageData;
  // 查看当前数据
  function lookData() {
    global.axios
      .post('decoration/Goods/webGetGoodsDetail', {
        id: props.pageData.data.id
      }, global)
      .then((res) => {
        if (res.goods_datas) {
          res.goods_datas.id = props.pageData.data.id
          res.goods_datas.status = res.goods_datas.status == 'Y' ? true : false
          res.goods_datas.goods_sizes.map((item) => {
            item.status = item.status == 'Y' ? true : false
            item.uper_status = item.uper_status == 'Y' ? true : false
          })
          Object.assign(post_params, res.goods_datas);
          let arrSer = cnOption.value.filter(item => res.goods_datas.service_ids.includes(item.id));
          cn_value.value = []
          arrSer.map((item) => {
            cn_value.value.push(item.value)
          })
          cncChange()//更新左边显示
          shopGuige.value = JSON.parse(JSON.stringify(parseGoodsSizesToGuige(post_params.goods_sizes)));
        }
      })
  }

  function parseGoodsSizesToGuige(goods_sizes) {
    const specMap = new Map();

    goods_sizes.forEach(item => {
      item.name.forEach(entry => {
        const [labelValue, label] = entry.split('：');
        if (!specMap.has(labelValue)) {
          specMap.set(labelValue, new Map());
        }
        const valueMap = specMap.get(labelValue);
        if (!valueMap.has(label)) {
          valueMap.set(label, {
            label,
            imgurl: item.size_image || '',
            isCustom: false
          });
        } else {
          // 如果已存在但当前 item.size_image 有值，更新 imgurl
          const existing = valueMap.get(label);
          if (!existing.imgurl && item.size_image) {
            existing.imgurl = item.size_image;
          }
        }
      });
    });

    // 转为响应式友好格式
    const result = [];
    for (const [labelValue, valueMap] of specMap.entries()) {
      const valuesArray = Array.from(valueMap.values());
      const hasImage = valuesArray.some(v => v.imgurl);
      result.push({
        labelValue,
        value: valuesArray,
        isSort: false,
        isUrlimg: hasImage // ✅ 如果当前规格下任意项有图，就设置为 true
      });
    }
    return result;
  }
  setTimeout(() => {
    lookData()
  }, 1000);
  //固定属性
  const visibleSx = ref(false)
  const SxName = ref('')//添加的属性名


  const sqJbxx = ref(false)//商品信息收起展开
  const ser_sqJbxx = ref(false)//服务信息收起展开

  const spflList = ref([])//商品分类列表
  // 商品分类列表
  function getGoodsTypeList() {
    global.axios
      .post('decoration/GoodsType/getGoodsTypeList', {
      }, global)
      .then((res) => {
        spflList.value = res.list
        // 根据分类id找到对应分类，并设置固定属性，只有新增
        let result = findItemById(res.list, post_params.type_id)
        post_params.attributes = []
        if (result) {
          result.default_attributes.map((item) => {
            post_params.attributes.push({
              key: item.key,
              value: '',
              type: 'select',
              is_del: false,
              is_must: item.is_must,//是否必填
              option: item.values
            })
          })
        }
      }, 1000);
  }
  getGoodsTypeList()

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
        ppList.value = res.list
      });
  }
  getGoodsBrandList()
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
        treeData.value = res.areas
        getStoreCarriageList()//处理模板数据
      });
  }
  getAreas()
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
        let mbsz = res.list.sort((a, b) => {// 把 status 为 Y 的排前面
          if (a.status === 'Y' && b.status !== 'Y') return -1;
          if (a.status !== 'Y' && b.status === 'Y') return 1;
          return 0; // status 相同则不变
        });

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
              iss = {
                ...iss,
                ...price_city
              }
              return iss
            }),
            unsupport: item.unsupport.map((iss) => {
              let unsupport = findItemByAdcode(treeData.value, iss.adcode)
              iss = {
                ...iss,
                ...unsupport
              }
              return iss
            }),
          }
        })
        if (props.pageData.data.id) {
        } else {
          if (allYfmb.value.length > 0) {
            post_params.carriage_id = allYfmb.value[0].id
          }
        }
      });
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
        cnOption.value = []
        res.list.map((item) => {
          cnOption.value.push({
            label: item.name,
            value: item.name,
            text: item.introduce,
            id: item.id
          })
        })
        cncChange()
      });
  }
  getGoodsServiceList()
  // 承诺变化了
  function cncChange() {
    wgxdcn.value = cnOption.value.filter(item => cn_value.value.includes(item.value));
  }
  // 商品规格
  const shopGuige = ref([])
  // 排列出所有组合
  function getAllCombinations(specs) {
    if (!specs.length) return [];
    return specs.reduce((acc, spec) => {
      const { labelValue, value } = spec;
      const options = value.map(item => item.label);
      if (acc.length === 0) {
        return options.map(option => ({ [labelValue]: option }));
      }
      const res = [];
      acc.forEach(prev => {
        options.forEach(option => {
          res.push({ ...prev, [labelValue]: option });
        });
      });
      return res;
    }, []);
  }

  // 表格内容组装
  function zztext() {
    const result = getAllCombinations(shopGuige.value); // 所有组合
    const newList = [];
    const oldList = post_params.goods_sizes || [];
    const oldMap = new Map();
    oldList.forEach(item => {
      oldMap.set(JSON.stringify(item.name), item); // 不再使用 ggInfo
    });
    result.forEach(item => {
      const name = shopGuige.value.map(spec => `${spec.labelValue}：${item[spec.labelValue]}`);
      let sizeImage = '';
      for (const spec of shopGuige.value) {
        if (spec.isUrlimg) {
          const match = spec.value.find(opt => opt.label === item[spec.labelValue]);
          if (match && match.imgurl) {
            sizeImage = match.imgurl;
            break;
          }
        }
      }
      const key = JSON.stringify(name);
      if (oldMap.has(key)) {
        const oldItem = { ...oldMap.get(key) };
        oldItem.name = name;
        oldItem.size_image = sizeImage;
        newList.push(oldItem);
      } else {
        newList.push({
          id: '',
          name,
          stock: '',
          old_price: '',
          price: '',
          uper_status: false,
          commission: '',
          integral_price: '',
          status: false,
          order: '',
          size_image: sizeImage,
        });
      }
    });
    post_params.goods_sizes = newList;
    post_params.goods_sizes.map((item, index) => {
      item.order = index + 1 + ''
    })
  }
  // 监听商品规格变化
  watch(
    shopGuige,
    (newVal, oldVal) => {
      if (newVal.length) {
        zztext()
      }
    },
    { deep: true },
  )

  const isYl = ref(true)//是否预览 //默认打开

  // 计算字符长度（中文2，英文1）
  function getCharLength(str) {
    return str.replace(/[^\x00-\xff]/g, '**').length
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
          <div class="spbj">商品详情
          </div>
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
                            </div>
                          </template>
                        </Draggable>
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
                      <div style="display: flex; align-items: center;">
                        <a-input type="text" :value="post_params.name" disabled style="width: 79.5%;"
                          placeholder="商品标题组成：商品描述+规格，最多输入30个汉字,60个字符" />
                        <div style="margin-left: 10px; white-space: nowrap;">
                          {{ getCharLength(post_params.name) }}/60
                        </div>
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
                      <a-switch v-model:checked="post_params.status" disabled style="margin: 0 5px;" />
                      <span>上架</span>
                      <span style="color: #ff0000;margin-left: 20px;">*选择不上架时，提交数据将在“商品管理”保存为草稿。</span>
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
                                <a-select ref="select" disabled v-model:value="post_params.brand_id" class="a57"
                                  placeholder="请选择品牌">
                                  <a-select-option :value="item.value" v-for="item in ppList"
                                    :key="item.value">{{item.label}}</a-select-option>
                                </a-select>
                                <span v-if="del_pp_text" class="a58">品牌已被删除，请重新选择</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style="width: 45%;">
                          <div>
                            <template v-for="(item,index) in post_params.attributes" :key="index">
                              <div class="a59">
                                <div style="display: flex;" class="a60">
                                  <div v-if="item.is_must=='Y'" style="color: red;">*</div>
                                  <div>{{item.key}}</div>
                                </div>
                                <template v-if="item.type=='input'">
                                  <a-input type="text" v-model:value="item.value" disabled class="a61"
                                    placeholder="请输入具体属性值" />
                                </template>
                                <template v-else-if="item.type=='select'">
                                  <a-select v-model:value="item.value" disabled class="a62" placeholder="请选择">
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
                        </div>
                        <div class="a65">
                          <div class="a66">
                            <div class="a67">
                              <span>页面预览(等待同步前台商品详情，暂时不看)</span>
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
            <!-- 规格与库存 -->
            <div class="a92">
              <div class="a93">
                <div style="color: #407cff;">2</div>
                <div style="margin-left: 5px;">规格与库存</div>
              </div>
              <div>
                <div class="a94">
                  <div style="display: flex;">
                    <div>商品规格</div>
                  </div>
                  <div class="a95">
                    <div class="a96">
                      <!-- <div>最多配置2个商品规格类型</div> -->
                      <div v-for="(item,index) in shopGuige" :key="index" class="a97">
                        <div class="a98">
                          <div style="display: flex;align-items: center;">
                            <a-input v-model:value="item.labelValue" placeholder="请输入规格名称" disabled
                              style="width: 200px;" />
                          </div>
                        </div>
                        <div class="b4">
                          <template v-for="(xx,xx_index) in item.value" :key="xx_index">
                            <div class="b5" style="position: relative;">
                              <div v-show="item.isUrlimg" class="itemImg"
                                style="display: flex;position: absolute;top: 1px;">
                                <div v-if="xx.imgurl">
                                  <a-image :width="30" :src="xx.imgurl" :preview="{ src: xx.imgurl }" />
                                </div>
                              </div>
                              <a-input placeholder="请输入小规格名称" v-model:value="xx.label" disabled
                                :style="{'margin-left': item.isUrlimg?'35px':'35px','width': item.isUrlimg?'165px':'200px'}" />
                              <div v-if="xx.isCustom" class="b7">
                                定制
                              </div>
                            </div>
                          </template>
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
                        <div style="color: #ff7300;">
                          <div>注意事项：(1)请如实填写库存信息，以确保商品可以在承诺时间内发出，避免出现违规。(2)修改规格的拼单价和库存后无需二次审核，仅限拼单价和库存。</div>
                        </div>
                      </div>
                      <table class="b13">
                        <tr class="b14 gridCol9">
                          <th>
                            <div style="display: flex;">
                              <div style="display: flex;margin: 0 auto;">
                                <div style="color: red;">*</div>
                                <div style="color: #999999;">规格</div>
                              </div>
                            </div>
                          </th>
                          <th>
                            <div style="display: flex;">
                              <div style="display: flex;margin: 0 auto;align-items: center;">
                                <div style="color: red;">*</div>
                                <div style="color: #999999;">库存</div>
                                <a-popover placement="rightTop">
                                  <template #content>
                                    <div>上架商品库存须大于0</div>
                                  </template>
                                  <QuestionCircleOutlined style="margin-left: 5px;color: #999999;" />
                                </a-popover>
                              </div>
                            </div>
                          </th>
                          <th>
                            <div style="display: flex;">
                              <div style="display: flex;margin: 0 auto;align-items: center;">
                                <div style="color: red;">*</div>
                                <div style="color: #999999;">原价</div>
                                <a-popover placement="rightTop">
                                  <template #content>
                                    <div>商品的指导价格</div>
                                  </template>
                                  <QuestionCircleOutlined style="margin-left: 5px;color: #999999;" />
                                </a-popover>
                              </div>
                            </div>
                          </th>
                          <th>
                            <div style="display: flex;">
                              <div style="display: flex;margin: 0 auto;align-items: center;">
                                <div style="color: red;">*</div>
                                <div style="color: #999999;">拼单价</div>
                                <a-popover placement="rightTop">
                                  <template #content>
                                    <div>用户拼单时价格,不可大于原价</div>
                                  </template>
                                  <QuestionCircleOutlined style="margin-left: 5px;color: #999999;" />
                                </a-popover>
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
                            <div style="color: #999999;">积分抵扣最大金额</div>
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
                            <tr class="b15 gridCol9">
                              <td>
                                <div style="display: flex;">
                                  <div class="itemImg" style="display: flex;margin: 0 auto;">
                                    <div v-if="item.size_image" style=" position: relative;margin-right: 4px;">
                                      <a-image :width="40" :src="item.size_image" :preview="{ src: item.size_image }" />
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div v-for="iss in item.name" :key="iss">{{iss}}</div>
                                </div>
                              </td>
                              <td>
                                <a-input disabled type="text" v-model:value="item.stock" placeholder="请输入库存" />
                              </td>
                              <td>
                                <a-input disabled type="text" v-model:value="item.old_price" placeholder="请输入原价" />
                              </td>
                              <td>
                                <a-input disabled type="text" v-model:value="item.price" placeholder="输入拼单价" />
                              </td>
                              <td>
                                <a-switch disabled v-model:checked="item.uper_status" checked-children="是"
                                  un-checked-children="否" />
                              </td>
                              <td>
                                <a-input disabled type="text" v-model:value="item.commission" placeholder="输入佣金" />
                              </td>
                              <td>
                                <a-input disabled type="text" v-model:value="item.integral_price"
                                  placeholder="积分抵扣最大金额" />
                              </td>
                              <td>
                                <a-switch disabled v-model:checked="item.status" checked-children="是"
                                  un-checked-children="否" />
                              </td>
                              <td>
                                <a-input disabled type="text" v-model:value="item.order" placeholder="请输入排序" />
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
                    <a-radio-group disabled v-model:value="post_params.goods_type" name="radioGroup">
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
                    <a-radio-group disabled v-model:value="post_params.is_used" name="radioGroup">
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
                    <a-radio-group disabled v-model:value="post_params.is_customized" name="radioGroup">
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
                    <a-radio-group disabled v-model:value="post_params.is_plan_salled" name="radioGroup">
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
                    <a-radio-group disabled v-model:value="post_params.need_send_time" name="radioGroup">
                      <a-radio value="a">当日发货</a-radio>
                      <a-radio value="b">24小时
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
                    <div style="display: flex;">
                      <a-radio-group disabled v-model:value="post_params.carriage_id" name="radioGroup">
                        <a-radio :value="item.id" v-for="(item,index) in allYfmb" :key="item.id">{{item.name}} <span
                            v-if="index==0" style="color: #ff7300;">推荐</span></a-radio>
                      </a-radio-group>
                    </div>
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

                <div class="b32">
                  <div style="display: flex;">
                    <div style="color: red;">*</div>
                    <div>承诺</div>
                  </div>
                  <div style="margin-left: 20px;">
                    <a-checkbox-group disabled style="display: grid;" v-model:value="cn_value" :options="cnOption"
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
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--导出-->
</template>

<style scoped>
  /*  */
  ::v-deep(.itemImg .ant-upload.ant-upload-select-picture-card) {
    width: 30px !important;
    height: 30px !important;
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


  .wcdiv {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .spbj {
    font-size: 18px;
  }

  .flex {
    display: flex;
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
    width: 60px;
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
    text-align: center;
  }

  .gridCol9 {
    grid-template-columns: repeat(9, minmax(0, 1fr));
  }

  .gridCol10 {
    grid-template-columns: repeat(10, minmax(0, 1fr));
  }

  .b15 {
    display: grid;
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