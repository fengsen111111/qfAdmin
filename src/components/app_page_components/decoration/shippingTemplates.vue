<script setup>
  import { inject, onBeforeMount, reactive, ref, watch, shallowRef } from "vue";
  import { Row, Col } from 'ant-design-vue';
  import { InfoCircleOutlined, CheckCircleOutlined, PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons-vue";

  let props = defineProps(["pageData"]);
  const pageData = props.pageData;
  let emit = defineEmits(["openChildPage", "closeChildPage"]);

  const global = inject("global").value;

  const typeVal = ref()//行政区数据绑定
  const treeData = ref([])//行政区数据
  function getAreas() {
    global.axios
      .post('factory_system/Base/getAreas', {}, global)
      .then((res) => {
        // console.log('行政区数据',res);
        treeData.value = res.areas
        // 默认全选
        checkedList.value = []
        res.areas.map((item) => {
          checkedList.value.push(item.value)
        })
      });
  }
  getAreas()
  function onChange(val, label) {
    console.log('选择了行政区', val, label);
  }
  const checkedList = ref([])

  // 全选
  function handAll() {
    console.log('checkedList', checkedList.value);
    if (checkedList.value.length == treeData.value.length) {
      console.log('已全选就全不选');
      checkedList.value = []
    } else {
      checkedList.value = []
      treeData.value.map((item) => {
        checkedList.value.push(item.value)
      })
    }
  }
  // 包邮地区、不包邮地区
  const bbydq = ref([])//不包邮地区
  function bydq() {
    console.log('包邮地区', checkedList.value);
    // 找出未被选择的地区
    const unselectedRegions = treeData.value.filter(region => !checkedList.value.includes(region.value));
    console.log('不包邮地区', unselectedRegions)
    unselectedRegions.map((item) => {
      item.cause = '',
        item.is_disabled = false
    })
    bbydq.value = unselectedRegions
  }

  const checkedXy = ref(true)//协议勾选

  const jffs = ref(1)//计费方式 1按件计费 2按重量计费

  const zdqyyf = ref([])//指定区域邮费
  // 点击设置指定区域运费
  function setZdqqyf(index, item) {
    // 禁用下拉项
    bbydq.value[index].is_disabled = true
    console.log('设置指定区域运费', index, item);
    zdqyyf.value = zdqyyf.value ? zdqyyf.value : []
    zdqyyf.value.push({
      adcode: item.adcode,
      is_disabled: item.is_disabled,
      label: item.label,
      value: item.value,
      initNumber: 1,//千克或者数量
      initMoney: 28,//元
      addNumber: 1,//超出部分千克或者数量
      addMoney: 28,//超出部分收费元
      checked: false,//指定条件包邮选框
      checkNumber: 1,//指定条件件或元
      checkType: 1,//指定条件分类 1件 2元
    })
    console.log('指定的区域', zdqyyf.value);
  }

  // 删除指定区域
  function delZdqq(item) {
    // console.log('删除指定区域',item);
    bbydq.value.map((iss) => {
      if (iss.value == item.value) {
        console.log('没找到');
        iss.is_disabled = false//解除禁用
      }
    })
    // 删除对应的买家付费
    zdqyyf.value.map((iss, index) => {
      if (iss.value == item.value) {
        console.log('没找到');
        zdqyyf.value.splice(index, 1)//删除对应
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
</script>

<template>
  <!--搜索 class="flex"-->
  <div >
    <div class="a1">
      <div style="display: flex;align-items: center;">
        <a-button v-show="pageData.hasOwnProperty('parent_page_key')" class="iconfont button-class"
          style="font-size: 18px !important; padding: 0 10px; float: left;margin-right: 20px;"
          @click="closeChildPage(pageData.page_key)">&#xe6d2;
        </a-button>
        <div class="a2">运费模板</div>
      </div>
      <div class="a3">
        <div class="a4">模板基础信息</div>
        <div class="a5">
          <div class="a6">
            <div class="flex">
              <span class="a7">*</span>
              <span>模板名称</span>
            </div>
            <div class="a8">
              <a-input placeholder="请输入模板名称" class="a9"></a-input>
            </div>
          </div>
          <div class="a10">
            <div class="flex">
              <span class="a11">*</span>
              <span>发货地</span>
            </div>
            <div class="a12">
              <div class="a13">发货地与您的实际发货地不符，可能会导致物流投诉</div>
              <a-tree-select @change="onChange" v-model:value="typeVal" show-search style="width: 400px;"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" placeholder="请输入关键词搜索发货地" allow-clear
                tree-default-expand-all :tree-data="treeData" tree-node-filter-prop="label">
                <template #title="{ value: val, label }">
                  <b v-if="val === 'parent 1-1'" style="color: #08c">sss</b>
                  <template v-else>{{ label }}</template>
                </template>
              </a-tree-select>
            </div>
          </div>
        </div>
      </div>
      <!-- 包邮区域 -->
      <div class="a14">
        <div class="a15">
          包邮区域
          <a-popover placement="rightTop">
            <template #content>
              <div>当买家收货地址为包邮区域时，您将承担所有运费，买家无需承担运费。</div>
            </template>
            <ExclamationCircleOutlined class="a16" />
          </a-popover>
        </div>
        <div class="a17">
          <div class="a18">
            <span @click="handAll" class="a19">全选</span>
            <span>已选<span class="a20"> {{checkedList.length}} </span>个区域</span>
          </div>
          <div class="a21">
            <a-checkbox-group @change="bydq()" v-model:value="checkedList" :options="treeData" />
          </div>
          <div class="a22">
            <a-checkbox v-model:checked="checkedXy"></a-checkbox>
            <span class="a23">使用顺丰包邮,并同意<span class="a24">《顺丰包邮服务条款》</span></span>
            <a-popover placement="rightTop">
              <template #content>
                <div>1、支持顺丰包邮商品可在平台获得更多流量曝光。</div>
                <div>2、使用顺丰包邮发货时则以顺丰快递资费为准。</div>
              </template>
              <ExclamationCircleOutlined class="a25" />
            </a-popover>
          </div>
          <div v-if="checkedXy" class="a26">
            <div>顺丰可配送区域：<span class="a27">共30个省312个市2682个区县</span></div>
            <div>若商品支持顺丰包邮，如商家未履行承诺，需向消费者赔付 <span class="a28">15</span> 元违约金。</div>
          </div>
        </div>
        <div class="a29">
          买家付运费区域
          <a-popover placement="rightTop">
            <template #content>
              <div> 当买家收货地址为买家付运费区域时，买家需要按照您设定的运费规则承担运费。</div>
            </template>
            <ExclamationCircleOutlined class="a30" />
          </a-popover>
        </div>
        <div class="a31">
          <div v-if="zdqyyf.length!==0">
            <div class="flex">
              <div>计费方式</div>
              <div class="a32">
                <a-radio-group v-model:value="jffs" name="radioGroupJffs">
                  <a-radio value="1">按件数计费</a-radio>
                  <a-radio value="2">
                    <a-popover placement="rightTop">
                      <template #content>
                        <div> 选择按重计费方式，在新增和编辑商品时需设置重量</div>
                      </template>
                      按重量计费
                      <ExclamationCircleOutlined class="a33" />
                    </a-popover>
                  </a-radio>
                </a-radio-group>
                <div class="a34">如订单中存在多种运费模板，系统会选取其中最优的模板计算运费，并按商品件数均分到各子单。</div>
              </div>
            </div>
            <a-alert class="a35"
              message="您已选择配送港澳台地区，受海关、物流、当地政策的限制，部分商品是无法出关或在大陆地区以外无法进行购买，请关注禁运清单及相关法律法规，避免错误设置运费模板，造成损失。" type="warning"
              show-icon />
          </div>
          <div v-if="zdqyyf.length">
            <div v-for="item in zdqyyf" :key="item.value" class="a36">
              <div class="flex">
                <div class="ellipsisOne" aria-colspan="a37">
                  {{item.label}}
                </div>
                <div>
                  <div class="flex">
                    <div class="a38">
                      <a-input-number :min="1" v-model:value="item.initNumber" class="a39" />
                      <span>{{jffs==1?'件':'千克'}}内</span>
                      <a-input-number :min="1" v-model:value="item.initMoney" class="a39" />
                      <span>元</span>
                    </div>
                    <div class="a40">
                      <span>每增加</span>
                      <a-input-number :min="1" v-model:value="item.addNumber" class="a39" />
                      <span>{{jffs==1?'件':'千克'}}，增加运费</span>
                      <a-input-number :min="1" v-model:value="item.addMoney" class="a39" />
                      <span>元</span>
                    </div>
                  </div>
                  <div class="a41">
                    <a-checkbox v-model:checked="item.checked"></a-checkbox>
                    <span class="a42">指定条件包邮</span>
                    <div class="a43">
                      <div class="a44">
                        <span>满</span>
                        <a-input-number :min="1" v-model:value="item.checkNumber" class="a45" />
                        <a-select ref="select" v-model:value="item.checkType" class="a46">
                          <a-select-option :value="1">件</a-select-option>
                          <a-select-option :value="2">元</a-select-option>
                        </a-select>
                        <span>包邮</span>
                        <span v-if="item.checkType==2" class="a47">({{item.checkNumber}}元是指用券前的商品价格)</span>
                      </div>
                      <a-popover placement="rightTop">
                        <template #content>
                          <div> 如订单中商品存在多种运费模板，系统将按最优的运费模板优先计算是否包邮。</div>
                        </template>
                        <ExclamationCircleOutlined class="a48" />
                      </a-popover>
                    </div>
                  </div>
                </div>
              </div>
              <div @click="delZdqq(item)" class="a49">删除</div>
            </div>
          </div>
          <!-- <a-button style="margin-top: 20px;">设置指定区域运费</a-button> -->
          <div class="a50">
            <a-dropdown placement="bottom">
              <a-button>设置指定区域运费</a-button>
              <template #overlay>
                <a-menu v-if="bbydq.length">
                  <!-- disabled 禁用 -->
                  <a-menu-item v-for="(item,index) in bbydq" :key="item.value" :disabled="item.is_disabled"
                    @click="setZdqqyf(index,item)">{{item.label}}</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
        <div class="a51">
          不配送区域
          <a-popover placement="rightTop">
            <template #content>
              <div> 1、不配送区域的买家将极有可能无法搜索和查看该运费模板绑定的商品；</div>
              <div> 2、收货地址为不配送区域的买家将无法购买该运费模板绑定的商品；</div>
            </template>
            <ExclamationCircleOutlined class="a52" />
          </a-popover>
        </div>
        <div class="a53">
          <div v-for="item in bbydq" :key="item.value">
            <div v-if="!item.is_disabled" class="a54">
              <div class="a55">
                <div>{{item.label}}</div>
                <!-- <div style="color: #1890FF;">删除</div> -->
              </div>
              <div class="a56"
                :style="{ 'background-color': item.cause ? '#fff' : '#FFF6F7' }">
                <div>不配送原因</div>
                <div class="a57">
                  <a-radio-group v-model:value="item.cause" name="radioGroup">
                    <a-radio value="1">因距离远导致的运费上升</a-radio>
                    <a-radio value="2">因商品重量大导致的运费上升</a-radio>
                    <a-radio value="3">合作快递不配送该区域</a-radio>
                    <a-radio value="4">合作快递该区域服务差</a-radio>
                  </a-radio-group>
                </div>
              </div>
            </div>
          </div>
          <div v-if="bbydq.length==0">
            <a-empty />
          </div>
        </div>
        <!-- 操作 -->
        <div class="a58">
          <div class="a59">
            <a-button type="primary">提交</a-button>
            <a-button class="a60">取消</a-button>
          </div>
        </div>
      </div>
      <div class="a61"></div>
    </div>
  </div>
  <!--导出-->
</template>

<style lang="less" scoped>
  .ellipsisOne {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    /* 限制最多显示 3 行 */
    overflow: hidden;
    max-height: 100px;
    /* 适当调整高度 */
    word-break: break-word;
  }

  ::v-deep(.ant-checkbox-group) {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  ::v-deep(.ant-checkbox-group-item) {
    box-sizing: border-box;
    margin-bottom: 5px;
  }

  .a1 {
    padding: 20px;
    overflow: auto;
    height: 88vh;
    width: 83vw;
    /* margin: 0 auto; */
  }

  .a2 {
    font-size: 18px;
    margin-bottom: 20px;
  }

  .a3 {
    background-color: #fff;
    padding: 20px;
    border: 2px solid #f5f5f5;
    border-radius: 5px;
  }

  .a4 {
    border-left: 3px solid #1890FF;
    padding-left: 10px;
    font-size: 16px;
  }

  .a5 {
    background-color: #f7f8fa;
    padding: 20px;
    margin-top: 20px;
  }

  .a6 {
    display: flex;
    align-items: center;
  }

  .flex {
    display: flex;
  }

  .a7 {
    color: red;
  }

  .a8 {
    margin-left: 10px
  }

  .a9 {
    width: 400px
  }

  .a10 {
    display: flex;
    margin-top: 20px;
    padding-left: 15px;
  }

  .a11 {
    color: red;
  }

  .a12 {
    margin-left: 10px
  }

  .a13 {
    color: #999999;
  }

  .a14 {
    background-color: #fff;
    padding: 20px;
    border: 2px solid #f5f5f5;
    border-radius: 5px;
    margin-top: 20px;
  }

  .a15 {
    border-left: 3px solid #1890FF;
    padding-left: 10px;
    font-size: 16px;
  }

  .a16 {
    color: #999999;
    font-size: 14px;
  }

  .a17 {
    background-color: #f7f8fa;
    padding: 20px;
    margin-top: 20px;
  }

  .a18 {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .a19 {
    color: #1890FF;
  }

  .a20 {
    color: #1890FF;
  }

  .a21 {
    margin-top: 20px;
  }

  .a22 {
    margin-top: 20px;
    display: flex;
    align-items: center;
  }

  .a23 {
    margin-left: 10px;
  }

  .a24 {
    color: #1890FF;
  }

  .a25 {
    color: #999999;
    font-size: 14px;
  }

  .a26 {
    padding-left: 27px;
  }

  .a27 {
    color: #1890FF;
    font-size: 18px;
    font-weight: bold;
  }

  .a28 {
    color: red;
  }

  .a29 {
    border-left: 3px solid #1890FF;
    padding-left: 10px;
    font-size: 16px;
    margin-top: 20px;
  }

  .a30 {
    color: #999999;
    font-size: 14px;
  }

  .a31 {
    background-color: #f7f8fa;
    padding: 20px;
    margin-top: 20px;
  }

  .a32 {
    margin-left: 20px;
  }

  .a33 {
    color: #999999;
    font-size: 14px;
    margin-left: 5px;
  }

  .a34 {
    color: #999999;
  }

  .a35 {
    align-items: baseline;
    margin-top: 20px;
  }

  .a36 {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    background: #fff;
    padding: 20px;
  }

  .a37 {
    background-color: #f0f7ff;
    width: 80px;
    height: 80px;
    text-align: center;
    line-height: 80px;
  }

  .a38 {
    display: flex;
    align-items: center;
    margin-left: 20px;
  }

  .a39 {
    width: 70px;
    margin: 0px 5px;
  }

  .a40 {
    display: flex;
    align-items: center;
    margin-left: 40px;
  }

  .a41 {
    margin-left: 26px;
    margin-top: 15px;
    display: flex;
    align-items: center;
  }

  .a42 {
    margin-left: 10px;
  }

  .a43 {
    margin-left: 5px;
    display: flex;
    align-items: center;
  }

  .a44 {
    display: flex;
    align-items: center;
  }

  .a45 {
    width: 70px;
    margin: 0px 5px;
  }

  .a46 {
    width: 70px;
    margin: 0 5px;
  }

  .a47 {
    margin-left: 10px;
  }

  .a48 {
    color: #999999;
    font-size: 14px;
    margin-left: 5px;
  }

  .a49 {
    color: #1890FF;
  }

  .a50 {
    margin-top: 20px;
  }

  .a51 {
    border-left: 3px solid #1890FF;
    padding-left: 10px;
    font-size: 16px;
    margin-top: 20px;
  }

  .a52 {
    color: #999999;
    font-size: 14px;
  }

  .a53 {
    background-color: #f7f8fa;
    padding: 20px;
    margin-top: 20px;
  }

  .a54 {
    background-color: #fff;
    margin-bottom: 10px;
    border: 1px solid #ebebeb;
  }

  .a55 {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #ebebeb;
  }

  .a56 {
    display: flex;padding: 20px;color: #999999;
  }

  .a57 {
    margin-left: 20px;
  }

  .a58 {
    display: flex;margin-top: 20px;
  }

  .a59 {
    display: flex;margin: 0 auto;
  }

  .a60 {
    margin-left: 20px;
  }

  .a61 {
    height: 400px;
  }
</style>