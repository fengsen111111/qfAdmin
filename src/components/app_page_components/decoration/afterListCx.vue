<script setup>
	import { inject, onBeforeMount, reactive, ref, watch, shallowRef, computed } from "vue";
	import { Row, Col } from 'ant-design-vue';
	import { ClockCircleFilled, DownOutlined, CloseCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";
	import { message } from 'ant-design-vue';

	let props = defineProps(["pageData", "skeleton_state"]);

	let emit = defineEmits(["openChildPage", "closeChildPage", "djtzmk", 'goLookTD', 'toShopDetails', 'orderLook', 'editMobile']);

	// 打开子页面
	function openChildPage(pageData) {
		emit("openChildPage", pageData);
	}
	const pageData = props.pageData;

	console.log('pageData', pageData);

	const global = inject("global").value;
	const store_id = ref('')
	setTimeout(() => {
		store_id.value = localStorage.getItem('storeId')
	}, 500);
	const fh_vis = ref(false)//新增编辑
	const md_vis = ref(false)//新增编辑

	const spinning = ref(false)//加载
	const company_name = ref(null)//搜索项 快递公司code
	const partnerName = ref(null)//搜索项  电子面单账户名称

	const formState = reactive({
		number: null//生成数量
	});
	const formRef = ref(null);

	const columns = [
		{
			"key": "action",
			"dataIndex": 'action',
			"title": "操作",
			"width": 40,
			"component": "Buttons",
			"fixed": "left",
		},
		{
			"key": "order_id",
			"dataIndex": 'order_id',
			"title": "订单ID ",
			"width": 80,
			"component": "Varchar"
		},
		{
			"key": "get_goods",
			"dataIndex": 'get_goods',
			"title": "是否收货",
			"width": 40,
			"component": "Varchar"
		},
		{
			"key": "type",
			"dataIndex": 'type',
			"title": "售后方式",
			"width": 40,
			"component": "Varchar"
		},
		{
			"key": "reason",
			"dataIndex": 'reason',
			"title": "售后原因",
			"width": 60,
			"component": "Varchar"
		},
		{
			"key": "des",
			"dataIndex": 'des',
			"title": "售后描述",
			"width": 60,
			"component": "Textarea"
		},
		{
			"key": "images",
			"dataIndex": 'images',
			"title": "图片",
			"width": 40,
			"component": "Images"
		},
		{
			"key": "refund_price",
			"dataIndex": 'refund_price',
			"title": "售后金额",
			"width": 40,
			"component": "Varchar"
		},
		{
			"key": "status",
			"dataIndex": 'status',
			"title": "商家售后状态",
			"width": 50,
			"component": "Varchar"
		},
		{
			"key": "platform",
			"dataIndex": 'platform',
			"title": "平台售后状态",
			"width": 50,
			"component": "Varchar"
		},
		{
			"key": "goods_msg",
			"dataIndex": 'goods_msg',
			"title": "售后商品信息",
			"width": 50,
			"component": "Varchar"
		},
		{
			"key": "back_code",
			"dataIndex": 'back_code',
			"title": "退换货物流公司",
			"width": 60,
			"component": "Varchar"
		},
		{
			"key": "back_number",
			"dataIndex": 'back_number',
			"title": "退换货物流单号",
			"width": 60,
			"component": "Varchar"
		},
	]

	// 搜索项
	const searchConditions = ref([
		{
			"field": "order_id",
			"label": "订单编号",
			"value": "",
			"searchType": "=",
			"component": "Input"
		},
		{
			"field": "status",
			"label": "商家售后状态",
			"value": "",
			"searchType": "=",
			"component": "Select",
			"config": {
				"values": [
					{
						"value": "a",
						"label": "待处理"
					},
					{
						"value": "b",
						"label": "同意"
					},
					{
						"value": "c",
						"label": "拒绝"
					}
				]
			}
		},
		{
			"field": "platform",
			"label": "平台售后状态",
			"value": "",
			"searchType": "=",
			"component": "Select",
			"config": {
				"values": [
					{
						"value": "a",
						"label": "未介入"
					},
					{
						"value": "b",
						"label": "处理中"
					},
					{
						"value": "c",
						"label": "同意"
					},
					{
						"value": "d",
						"label": "拒绝"
					}
				]
			}
		},
		{
			"field": "des",
			"label": "售后原因",
			"value": "",
			"searchType": "=",
			"component": "Select",
			"config": {
				"values": [
					{
						"value": "商品质量问题",
						"label": "商品质量问题"
					},
					{
						"value": "其它原因",
						"label": "其它原因"
					},
					{
						"value": "有优惠卷未使用",
						"label": "有优惠卷未使用"
					},
					{
						"value": "收货地址，手机号填错了",
						"label": "收货地址，手机号填错了"
					},
					{
						"value": "商品款式选错了",
						"label": "商品款式选错了"
					},
					{
						"value": "看见了更便宜的商品",
						"label": "看见了更便宜的商品"
					},
					{
						"value": "不想要了",
						"label": "不想要了"
					}
				]
			}
		},
		{
			"field": "get_goods",
			"label": "是否收货",
			"value": "",
			"searchType": "=",
			"component": "Select",
			"config": {
				"values": [
					{
						"value": "a",
						"label": "未收货"
					},
					{
						"value": "b",
						"label": "已收货"
					}
				]
			}
		},
		{
			"field": "type",
			"label": "售后方式",
			"value": "",
			"searchType": "=",
			"component": "Select",
			"config": {
				"values": [
					{
						"value": "a",
						"label": "退货退款"
					},
					{
						"value": "b",
						"label": "换货"
					},
					{
						"value": "c",
						"label": "仅退款"
					},
					{
						"value": "d",
						"label": "补发"
					}
				]
			}
		},
		{
			"field": "store_id",
			"label": "商家",
			"value": "",
			"searchType": "=",
			"component": "Search",
			"config": {
				"valueUrl": "decoration\/Store\/findLabel?value=",
				"optionUrl": "decoration\/Store\/getRecords?key_word="
			}
		}
	],)

	const dataList = ref([])
	const dataListPup = ref([])
	//
	function _findTableRecords() {
		spinning.value = true
		global.axios
			.post('decoration/AfterSale/findTableRecords', {
				searchConditions: searchConditions.value,
				recycleStatus: false,
				sortConditions: []
			}, global)
			.then((res) => {
				spinning.value = false
				dataList.value = res.list
			})
	}
	_findTableRecords()

	// 重置
	function chongzhi() {
		searchConditions.value.map((item) => {
			item.value = ''
		})
		_findTableRecords()
	}
	//拉起循环监控页面展示状态（比如表单页返回列表页时需要刷新页面）
	function watchComponentShowStatus() {
		let int = setInterval(function () {
			if (pageData.open_status) {
				chongzhi();
				window.clearInterval(int);
			}
		}, 300);
	}

	// 打开子页面
	function openSon(item) {
		watchComponentShowStatus()
		openChildPage({
			type: 'orderDetails',
			url: '',
			data: {
				id: item.order_id,
				recycleStatus: false,
				user_id: item.user_id
			},
			parent_page_key: pageData.page_key,
		});
	}
	// 售后
	function openSonAfter(item) {
		watchComponentShowStatus()
		openChildPage({
			type: "FormPage",
			url: "decoration/AfterSale/getEditStructure",
			data: {
				id: item.id,
				recycleStatus: false
			},
			parent_page_key: pageData.page_key,
		});
	}
	// 换货
	function openSonSend(item) {
		pupType.value = 'Key'
		fh_vis.value = true
		itemObj.value = item
		// openChildPage({
		// 	type: 'orderDetails',
		// 	url: '',
		// 	data: {
		// 		id: item.id,
		// 		recycleStatus: false,
		// 		user_id: item.user_id
		// 	},
		// 	parent_page_key: pageData.page_key,
		// });
	}
	// 收货
	function openSonSh(item) {
		global.Modal.confirm({
			title: global.findLanguage(
				"确定已收到退货吗？"
			),
			okText: global.findLanguage("确定"),
			cancelText: global.findLanguage("取消"),
			okType: "primary",
			onOk: function () {
				global.axios
					.post('decoration/AfterSale/storeGetOrder', {
						id: item.id,
						recycleStatus: false
					}, global)
					.then((res) => {
						_findTableRecords()
					})
			},
		});
	}

	const itemObj = ref({})//打印快递单多份
	const orderListDetails = ref([])//订单详情
	const pupType = ref('Key') //弹窗类型 Keys 多选  Key 单个

	// 弹窗确定
	async function handOk() {
		try {
			const values = await formRef.value.validateFields();
			spinning.value = true
			setTimeout(() => {
				spinning.value = false
			}, 2000);
			orderListDetails.value = []//清空携带数据
			if (pupType.value == 'Key') {
				// 单个多快递单
				global.axios.post('decoration/Order/webGetOrderDetail', {
					order_id: itemObj.value.order_id,
				}, global, true).then((res) => {
					// orderListDetails.value = [res]
					// if (orderListDetails.value.length > 0) {
					// 	printSddy.value.setVisible(true)
					// }
					// console.log('生成电子面单', res);
					global.axios.post('decoration/Order/createExpress', {
						order_id: itemObj.value.order_id,
						after_sale_id: itemObj.value.id,//售后id
						number: 1,//生成数量
					}, global, true).then((res) => {
						global.axios.post('decoration/Order/getExpressList', {
							order_id: item,
							store_id: localStorage.getItem('storeId')
						}, global, true).then((resule) => {
							console.log('获取电子面单', resule);
							resule.list.map((iss, index) => {
								orderListDetails.value.push({
									...JSON.parse(JSON.stringify(res)),
									dzmdurl: iss.logistics_label,
									dzmdurlID: iss.id,
								})
							})
						})
					})
				})
			}
		} catch (errorInfo) {
			console.log('Failed:', errorInfo);
		}
	}

	import Print from './print.vue'

	// 上级跳转
	function sondjtzmk(str, strTwo, strThree) {
		emit("djtzmk", str, strTwo, strThree);
	}

	const printSddy = ref(null);

</script>

<template>
	<!--搜索-->
	<div>
		<div v-show="false">
			<Print ref="printSddy" :number="formState.number" :orderListDetails="orderListDetails"
				@djtzmk="sondjtzmk" />
		</div>
		<a-spin :spinning="spinning">
			<div style="padding: 0px 20px;border-radius: 4px;">
				<a-row>
					<a-col :span="6">
						<div style="display: flex; align-items: center;margin-bottom: 20px;">
							<span style="white-space: nowrap;">订单编号：</span>
							<a-input v-model:value="searchConditions[0].value" placeholder="请输入订单编号"
								style="width: 70%"></a-input>
						</div>
					</a-col>
					<a-col :span="6">
						<div style="display: flex;align-items: center;white-space:nowrap;">
							<span style="">商家售后状态：</span>
							<a-select ref="select" placeholder="请选择" v-model:value="searchConditions[1].value"
								style="width: 70%">
								<a-select-option value="a" key="a">待处理</a-select-option>
								<a-select-option value="b" key="b">同意</a-select-option>
								<a-select-option value="c" key="c">拒绝</a-select-option>
								<a-select-option value="d" key="d">待收货</a-select-option>
								<a-select-option value="e" key="e">已收货</a-select-option>
							</a-select>
						</div>
					</a-col>
					<a-col :span="6">
						<div style="display: flex;align-items: center;white-space:nowrap;">
							<span style="">平台售后状态：</span>
							<a-select ref="select" placeholder="请选择" v-model:value="searchConditions[2].value"
								style="width: 70%">
								<a-select-option value="a" key="a">未介入</a-select-option>
								<a-select-option value="b" key="b">处理中</a-select-option>
								<a-select-option value="c" key="c">同意</a-select-option>
								<a-select-option value="c" key="d">拒绝</a-select-option>
							</a-select>
						</div>
					</a-col>
					<a-col :span="6">
						<div style="display: flex;align-items: center;white-space:nowrap;">
							<span style="">售后原因：</span>
							<a-select ref="select" placeholder="请选择" v-model:value="searchConditions[3].value"
								style="width: 70%">
								<a-select-option value="商品质量问题" key="商品质量问题">商品质量问题</a-select-option>
								<a-select-option value="其它原因" key="其它原因">其它原因</a-select-option>
								<a-select-option value="有优惠卷未使用" key="有优惠卷未使用">有优惠卷未使用</a-select-option>
								<a-select-option value="收货地址，手机号填错了" key="收货地址，手机号填错了">收货地址，手机号填错了</a-select-option>
								<a-select-option value="商品款式选错了" key="商品款式选错了">商品款式选错了</a-select-option>
								<a-select-option value="看见了更便宜的商品" key="看见了更便宜的商品">看见了更便宜的商品</a-select-option>
								<a-select-option value="不想要了" key="不想要了">不想要了</a-select-option>
							</a-select>
						</div>
					</a-col>
					<a-col :span="6">
						<div style="display: flex;align-items: center;white-space:nowrap;">
							<span style="">是否收货：</span>
							<a-select ref="select" placeholder="请选择" v-model:value="searchConditions[4].value"
								style="width: 70%">
								<a-select-option value="a" key="a">未收货</a-select-option>
								<a-select-option value="b" key="b">已收货</a-select-option>
							</a-select>
						</div>
					</a-col>
					<a-col :span="6">
						<div style="display: flex;align-items: center;white-space:nowrap;">
							<span style="margin-left: 28px;">售后方式：</span>
							<a-select ref="select" placeholder="请选择" v-model:value="searchConditions[5].value"
								style="width: 70%">
								<a-select-option value="a" key="a">退货退款</a-select-option>
								<a-select-option value="b" key="b">换货</a-select-option>
								<a-select-option value="c" key="c">仅退款</a-select-option>
								<a-select-option value="d" key="d">补发</a-select-option>
							</a-select>
						</div>
					</a-col>
					<a-col :span="6">
						<a-button type="primary" style="margin-bottom: 20px;" @click="_findTableRecords()">搜索</a-button>
						<a-button style="margin-bottom: 20px;margin-left: 20px;" @click="chongzhi">重置</a-button>
					</a-col>
				</a-row>
				<div style="width: 100%;">
					<a-table :columns="columns" :data-source="dataList" :scroll="{ x: 1600,y: 640 }">
						<template #bodyCell="{ column, record  }">
							<!-- 操作 -->
							<template v-if="column.dataIndex === 'action'">
								<div style="font-size: 12px;cursor: pointer;">
									<div @click="openSon(record)" style="color: #1890FF;">订单详情</div>
									<div @click="openSonAfter(record)" v-if="record.handle_status=='Y'"
										style="color: #ff0000;">售后</div>
									<div @click="openSonSh(record)" v-if="record.status=='d'" style="color: #52C41A;">收货</div>
									<div v-if="record.status=='b'||record.platform=='c'">
										<div @click="openSonSend(record)" v-if="record.type=='b'||record.type=='d'"
											style="color: green;">换货</div>
									</div>
								</div>
							</template>
							<!-- 商家售后状态 -->
							<template v-if="column.dataIndex === 'status'">
								<div v-if="record.status=='a'">待处理</div>
								<div v-else-if="record.status=='b'">同意</div>
								<div v-else-if="record.status=='c'">拒绝</div>
								<div v-else-if="record.status=='d'">待收货</div>
								<div v-else-if="record.status=='e'">已收货</div>
								<div v-else>{{record.status}}</div>
							</template>
							<!-- 平台售后状态 -->
							<template v-if="column.dataIndex === 'platform'">
								<div v-if="record.platform=='a'">未介入</div>
								<div v-else-if="record.platform=='b'">处理中</div>
								<div v-else-if="record.platform=='c'">同意</div>
								<div v-else-if="record.platform=='d'">拒绝</div>
								<div v-else>{{record.platform}}</div>
							</template>
							<!-- 是否收货 -->
							<template v-if="column.dataIndex === 'get_goods'">
								<div v-if="record.get_goods=='a'">未收货</div>
								<div v-else-if="record.get_goods=='b'">已收货</div>
								<div v-else>{{record.get_goods}}</div>
							</template>
							<!-- 售后方式 -->
							<template v-if="column.dataIndex === 'type'">
								<div v-if="record.type=='a'">退货退款</div>
								<div v-else-if="record.type=='b'">换货</div>
								<div v-else-if="record.type=='c'">仅退款</div>
								<div v-else-if="record.type=='d'">补发</div>
								<div v-else>{{record.type}}</div>
							</template>
						</template>
					</a-table>
				</div>
			</div>
			<!-- 批量打印 -->
			<a-modal v-model:visible="fh_vis" :title="pupType=='Key'?'打印多份快递单':'批量打印'"
				@cancel="fh_vis=false;selectedRowKeys=[];formRef.resetFields();" @ok="handOk()">
				<a-spin :spinning="spinning">
					<a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 6 }"
						:wrapper-col="{ span: 16 }">
						<a-form-item label="生成数量" name="number" :rules="[{ required: true, message: '请填写生成数量' }]">
							<a-input v-model:value="formState.number" placeholder="请填写生成数量" />
						</a-form-item>
					</a-form>
				</a-spin>
			</a-modal>
		</a-spin>
	</div>
</template>

<style scoped>
</style>