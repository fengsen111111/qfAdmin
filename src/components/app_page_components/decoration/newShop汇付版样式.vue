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

  let emit = defineEmits(["openChildPage", "closeChildPage",]);

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
    if (path.length > 0) {
      selClassify.value = path[0].label
    }
    if (path.length > 1) {
      selClassify.value = path[0].label + ' > ' + path[1].label
    }
    if (path.length > 2) {
      selClassify.value = path[0].label + ' > ' + path[1].label + ' > ' + path[2].label
    }
  }

  import QRCode from 'qrcode';

  let arrType = ref([])//缓存的分类
  arrType.value = localStorage.getItem('hcspfl') ? JSON.parse(localStorage.getItem('hcspfl')).slice(0, 4) : []
  // console.log('缓存的分类', arrType.value);

  const money_log_id = ref('')//支付日志id,查询支付结果

  const typeVis = ref(1)//1选分类 2 填商品信息


  // 发布该类商品
  function handFb() {
    global.axios
      .post('decoration/Store/getStoreInfo', {}, global)
      .then((res) => {
        console.log('结果', res.open_h_store_account);
        if (res.open_h_store_account == 'a') {
          message.error('请先前往app端商家管理，开通商家汇付')
        } else if (res.open_h_store_account == 'b') {
          message.error('请先前往app端商家管理，绑定提现卡')
        } else if (res.open_h_store_account == 'c') {
          // 已开通汇付，已绑定银行卡
          if (res.pay_deposit_money >= res.deposit_money) {
            console.log('已缴纳押金');
          } else {
            message.error('请先前往app端商家管理，缴纳商家保证金')
            return false
          }
          console.log('checkClassify.value.threeClassify', checkClassify.value.threeClassify);
          console.log('pageData.data', pageData.data);
          pageData.data = pageData.data ? pageData.data : {}
          pageData.data.typeId = checkClassify.value.threeClassify
          let arr = selClassify.value.split(' > ')
          console.log('arr', arr, checkClassify.value.threeClassify);
          if (arr.length != 3) {
            message.error('请选择三级分类！');
            return false
          }
          arrType.value.unshift(selClassify.value)
          arrType.value = [...new Set(arrType.value)];//数组去重
          localStorage.setItem('hcspfl', JSON.stringify(arrType.value))
          global.axios
            .post('decoration/Store/payTypePrices', {
              goods_type_ids: [checkClassify.value.threeClassify],
              trade_type: 'A_NATIVE',
            }, global)
            .then((res) => {
              console.log('结果', res);
              if (res.pay_info) {
                money_log_id.value = res.money_log_id
                // 支付数据转二维码
                QRCode.toDataURL(res.pay_info)
                  .then((url) => {
                    console.log('生成的二维码', url); // 将生成的二维码图片URL存储到状态中
                    qrCodeData.value = url
                  })
                  .catch((err) => {
                    console.error('生成二维码失败', err);
                  });
                isPay.value = true
              } else {
                // message.error('未生成支付数据')
                typeVis.value = 2
              }
            })
        } else if (res.open_h_store_account == 'd') {
          message.error('请耐心等待审核通过')
        }
      })
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
                  selClassify.value = path[0].label + ' > ' + path[1].label + ' > ' + path[2].label
                }
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
  const isPay = ref(false)//弹窗
  let qrCodeData = ref('')//存储生成的二维码数据URL
  function handOKCode() {
    console.log('确定');
    // 查询支付结果
    global.axios
      .post('decoration/Store/payTypePricesResult', {
        money_log_id: money_log_id.value
      }, global)
      .then((res) => {
        console.log('查询支付结果', res);
        // P支付中 S成功 F失败  
        if (res.result == 'P') {
          message.error('支付中')
        } else if (res.result == 'S') {
          message.success('支付成功')
          isPay.value = false
          setTimeout(() => {
            typeVis.value = 2
          }, 2000);
        } else if (res.result == 'F') {
          message.error('支付失败')
        } else {
          message.error('未知')
        }
      })
  }
</script>

<template>
  <!--搜索-->
  <a-spin :spinning="spinning">
    <div v-if="typeVis==1" style="padding: 20px;overflow: auto;height: 100%;">
      <div style="display: flex;align-items: center;margin-bottom: 20px;">
        <a-button v-show="pageData.hasOwnProperty('parent_page_key')" class="iconfont button-class"
          style="font-size: 18px !important; padding: 0 10px; float: left;margin-right: 20px;"
          @click="closeChildPage(pageData.page_key)">&#xe6d2;
        </a-button>
        <div style="font-size: 18px;">发布新商品</div>
      </div>
      <div
        style="display: flex;border: 1px solid #91d5ff;border-radius: 3px;padding:5px 10px;align-items: center;background-color: #F0F7FF;">
        <ExclamationCircleOutlined style="color: #91d5ff;margin-right: 10px;" />
        发布须知：准确选择类目有利于商品曝光，促进转化；若错放类目将会导致流量降权或下架整改、其他违规处理。 <span style="color: #1890FF
      " @click="handUrl('/ruleCenter?title=帮助中心')">查看发布攻略</span>
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
            <!-- <div v-if="isXn" style="color: #FF7300;"> 本类目为虚拟商品类目，请勿发布实物商品 </div> -->
          </div>
        </div>
      </div>
      <!-- 确认发布按钮 -->
      <div style="text-align: center;margin-top: 20px;">
        <a-button @click="handFb" type="primary">确认发布该类商品</a-button>
      </div>
    </div>
    <div v-else style="padding: 20px;overflow: auto;height: 100%;">
      <publishPage :pageData="pageData" @closeChildPageTwo="closeChildPageTwo" @closeChildPage="closeChildPage"
        @openChildPage="openChildPage" />
    </div>
    <!-- 支付弹框 -->
    <a-modal v-model:visible="isPay" :centered="true" @ok="handOKCode" :keyboard="false" title="支付二维码" ok-text="已支付"
      cancel-text="放弃" :maskClosable="false">
      <div class="container">
        <div class="pcHeader">
          <img class="logoImg"
            src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/shopImg/2025421/tjgvd9d3mr771js7f2o6hqqjsegs2p9b.png"
            alt="Logo" title="Logo" />
          <div class="headerTitle">收银台</div>
        </div>
        <div class="price">
          <span class="priceUnit">¥</span>
          <span class="priceNumber">11</span>
        </div>
        <!-- <div class="payTimeRemaining">
          <span class="payTxt">支付剩余时间</span>
          <span class="time">
            <span class="timeItem" id="pay_minute">05</span><span class="timeSplit">:</span><span class="timeItem"
              id="pay_second">00</span>
          </span>
        </div> -->
        <div class="payType">
          <ul class="payTab">
            <li class="payItem activePayItem" style="--theme: #0B5AFE" data-type="alipay">
              <img class="payIcon"
                src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/coverImg/2025421/1lbj3114n1mkb3mt71ak14ajhv5gc5nh.png" />
              <span class=" payTitle">支付宝</span>
            </li>
          </ul>
          <div class="payContent">
            <img :src="qrCodeData" alt="支付二维码" />
            <div class="conetentTxt"><span class="payDesc"><span id="payName">使用支付宝App扫码完成支付</span></span>
            </div>
          </div>
        </div>
      </div>
      <!-- <div style="padding: 20px;text-align: center;">
        <div>请打开支付宝扫描二维码！</div>
        <img :src="qrCodeData" alt="支付二维码" />
      </div> -->
    </a-modal>
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
    margin-bottom: 21px;
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
    margin-bottom: 55px;
  }
</style>