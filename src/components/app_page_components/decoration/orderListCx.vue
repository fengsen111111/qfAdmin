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
			"width": 160,
			"component": "Buttons",
			"fixed": "left",
		},
		{
			"key": "id",
			"dataIndex": 'id',
			"title": "订单号",
			"width": 180,
			"component": "Varchar"
		},
		{
			"key": "status",
			"dataIndex": 'status',
			"title": "状态",
			"width": 120,
			"component": "Varchar",
			"config": {
				"values": [
					{
						"value": "a",
						"title": "待支付"
					},
					{
						"value": "b",
						"title": "待拼成"
					},
					{
						"value": "c",
						"title": "待发货"
					},
					{
						"value": "d",
						"title": "待收货"
					},
					{
						"value": "e",
						"title": "已完成"
					}
				]
			}
		},
		{
			"key": "create_time",
			"dataIndex": 'create_time',
			"title": "下单时间",
			"width": 160,
			"component": "Varchar"
		},
		{
			"key": "store_name",
			"dataIndex": 'store_name',
			"title": "商家",
			"width": 140,
			"component": "Varchar"
		},
		{
			"key": "address_name",
			"dataIndex": 'address_name',
			"title": "收货人",
			"width": 120,
			"component": "Varchar"
		},
		{
			"key": "address_mobile",
			"dataIndex": 'address_mobile',
			"title": "收货电话",
			"width": 120,
			"component": "Varchar"
		},
		{
			"key": "address",
			"dataIndex": 'address',
			"title": "收货地址",
			"width": 160,
			"component": "Varchar"
		},
		// {
		// 	"key": "logistics_code",
		// 	"dataIndex": 'logistics_code',
		// 	"title": "物流信息",
		// 	"width": 150,
		// 	"component": "Varchar",
		// 	"config": {}
		// },
		{
			"key": "dzmd",
			"dataIndex": 'dzmd',
			"title": "电子面单",
			"width": 150,
			"component": "Varchar",
			"config": {}
		},
		{
			"key": "remark",
			"dataIndex": 'remark',
			"title": "用户备注",
			"width": 120,
			"component": "Textarea"
		},
		{
			"key": "store_remark",
			"dataIndex": 'store_remark',
			"title": "商家备注",
			"width": 250,
			"component": "Input",
			"config": {
				"requestUrl": "decoration\/Order\/editTableValue"
			}
		}
	]

	const columnsPup = [
		{
			"key": "action",
			"dataIndex": 'action',
			"title": "操作",
			// "width": 60,
			"component": "Buttons",
			"fixed": "left",
		},
		{
			"key": "id",
			"dataIndex": 'id',
			"title": "电子面单ID ",
			// "width": 60,
			"component": "Varchar"
		},
		{
			"key": "logistics_num",
			"dataIndex": 'logistics_num',
			"title": "物流单号",
			// "width": 60,
			"component": "Varchar"
		},
		{
			"key": "logistics_com",
			"dataIndex": 'logistics_com',
			"title": "物流公司名称",
			// "width": 60,
			"component": "Varchar"
		},
		{
			"key": "logistics_code",
			"dataIndex": 'logistics_code',
			"title": "物流公司编码",
			// "width": 60,
			"component": "Varchar"
		},
		{
			"key": "logistics_label",
			"dataIndex": 'logistics_label',
			"title": "电子面单链接",
			// "width": 60,
			"component": "Varchar"
		},
		{
			"key": "logistics_time",
			"dataIndex": 'logistics_time',
			"title": "更新时间",
			// "width": 60,
			"component": "Varchar"
		},
	]

	// 搜索项
	const searchConditions = ref([
		{
			"field": "id",
			"label": "订单编号",
			"value": "",
			"searchType": "=",
			"component": "Input"
		},
		{
			"field": "status",
			"label": "状态",
			"value": "",
			"searchType": "=",
			"component": "Select",
			"config": {
				"values": [
					{
						"value": "a",
						"label": "待支付"
					},
					{
						"value": "b",
						"label": "待拼成"
					},
					{
						"value": "c",
						"label": "待发货"
					},
					{
						"value": "d",
						"label": "待收货"
					},
					{
						"value": "e",
						"label": "已完成"
					}
				]
			}
		},
		{
			"field": "create_time",
			"label": "下单时间 起",
			"value": "",
			"searchType": ">=",
			"component": "Date",
			"config": {
				"valueFormat": "YYYY-MM-DD HH:mm:ss"
			}
		},
		{
			"field": "create_time",
			"label": "下单时间 止",
			"value": "",
			"searchType": "<=",
			"component": "Date",
			"config": {
				"valueFormat": "YYYY-MM-DD HH:mm:ss"
			}
		},
		{
			"field": "address_name",
			"label": "收货人",
			"value": "",
			"searchType": "like",
			"component": "Input"
		},
		{
			"field": "address_mobile",
			"label": "收货电话",
			"value": "",
			"searchType": "=",
			"component": "Input"
		},
		{
			"field": "logistics_num",
			"label": "快递单号",
			"value": "",
			"searchType": "=",
			"component": "Input"
		},
		{
			"field": "store_id",
			"label": "商家",
			"value": "",
			"searchType": "=",
			"component": "Search",
			"config": {
				"valueUrl": "decoration/Store/findLabel?value=",
				"optionUrl": "decoration/Store/getRecords?key_word="
			}
		}
	],)

	const dataList = ref([])
	const dataListPup = ref([])
	//
	function _findTableRecords() {
		spinning.value = true
		global.axios
			.post('decoration/Order/findTableRecords', {
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


	function onBlur(item) {
		// 失去焦点，商家修改商家备注
		global.axios
			.post('decoration/Order/editTableValue', {
				"change_field": "store_remark",
				"change_value": item.store_remark,
				"id": item.id,
			}, global)
			.then((res) => {
				_findTableRecords()
			})
	}

	const selectedRowKeys = ref([])
	const rowSelection = computed(() => ({
		selectedRowKeys: selectedRowKeys.value,
		onChange: (selectedKeys) => {
			selectedRowKeys.value = selectedKeys
			console.log('选中行的 key:', selectedKeys)
		},
		getCheckboxProps: (record) => ({
			disabled: record.status === 'a' || record.status === 'b',
			// 可以给禁用的复选框加个提示
			title: (record.status === 'a' || record.status === 'b') ? '该状态行不可勾选' : '',
		}),
	}))

	// 查看物流信息
	function _getLogistics(item) {
		global.axios
			.post('decoration/Order/getLogistics', {
				"logistics_num": item.logistics_num,
			}, global)
			.then((res) => {
				console.log('查看物流信息', res);
			})
	}
	// 重置
	function chongzhi() {
		searchConditions.value.map((item) => {
			item.value = ''
		})
		_findTableRecords()
	}

	// 打开子页面
	function openSon(item) {
		openChildPage({
			type: 'orderDetails',
			url: '',
			data: {
				id: item.id,
				recycleStatus: false,
				user_id: item.user_id
			},
			parent_page_key: pageData.page_key,
		});
	}

	const pupType = ref('Keys') //弹窗类型 Keys 多选  Key 单个
	// 批量打印
	function handePl() {
		console.log('selectedRowKeys', selectedRowKeys.value);
		fh_vis.value = true
		pupType.value = 'Keys'
	}

	// 获取电子面单
	function _getExpressList(item) {
		md_vis.value = true
		global.axios
			.post('decoration/Order/getLogistics', {
				"store_id": localStorage.getItem('storeId'),
				"order_id": item.id,
			}, global)
			.then((res) => {
				console.log('获取电子面单', res);
				dataListPup.value = res.list
			})
	}

	const itemObj = ref({})//打印快递单多份
	const orderListDetails = ref([])//订单详情

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
				// 获取订单详情
				global.axios.post('decoration/Order/webGetOrderDetail', {
					order_id: itemObj.value.id,
				}, global, true).then((res) => {
					orderListDetails.value = [res]
					return false
					// 生成电子面单
					global.axios.post('decoration/Order/createExpress', {
						order_id: itemObj.value.id,
						after_sale_id: '',//售后id
						number: formState.number,//生成数量
					}, global, true).then((res) => {
						console.log('生成电子面单', res);
						orderListDetails.value[0].dzmdurl = res
						if (orderListDetails.value.length > 0) {
							printSddy.value.setVisible(true)
						}
					})

				})
			} else {
				selectedRowKeys.value.map((item) => {
					global.axios.post('decoration/Order/webGetOrderDetail', {
						order_id: item,
					}, global, true).then((res) => {
						orderListDetails.value.push(res)
						return false
						// 生成电子面单
						global.axios.post('decoration/Order/createExpress', {
							order_id: itemObj.value.id,
							after_sale_id: '',//售后id
							number: formState.number,//生成数量
						}, global, true).then((res) => {
							console.log('生成电子面单', res);
							orderListDetails.value[orderListDetails.value.length-1].dzmdurl = res
						})
					})
				})
				setTimeout(() => {
					if (orderListDetails.value.length > 0) {
						printSddy.value.setVisible(true)
					}
				}, 2000);
				// 多个
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

	function cxPrint(item) {
		// global.axios.post('decoration/Order/createExpress', {
		// 	order_id: item.id,
		// 	number: 1
		// }, global, true).then((res) => {
		// 	console.log('生成电子面单', res);
		// 	global.axios.post('decoration/Order/getExpressList', {
		// 		order_id: item.id,
		// 		store_id: localStorage.getItem('storeId')
		// 	}, global, true).then((resule) => {
		// 		console.log('获取电子面单', resule);
		// 	})
		// })
		global.axios.post('decoration/Order/getExpressList', {
			order_id: item.id,
			store_id: localStorage.getItem('storeId')
		}, global, true).then((resule) => {
			console.log('获取电子面单', resule);
		})
		// console.log('重新打印');
		// window.open('https://api.kuaidi100.com/label/getImage/20250820/BD0502BBCEBF4CACB738E23A6C530426', '_blank');
	}

</script>

<template>
	<!--搜索-->
	<div>
		<div v-show="false">
			<Print ref="printSddy" :orderListDetails="orderListDetails" @djtzmk="sondjtzmk" />
		</div>
		<a-spin :spinning="spinning">
			<div style="padding: 0px 20px;border-radius: 4px;">
				<a-row>
					<a-col :span="6">
						<div style="display: flex; align-items: center;margin-bottom: 20px;">
							<span style="white-space: nowrap;">订单编号：</span>
							<a-input v-model:value="searchConditions[0].value" placeholder="请输入订单编号"
								style="width: 80%"></a-input>
						</div>
					</a-col>
					<a-col :span="6">
						<div style="display: flex;align-items: center;white-space:nowrap;">
							<span style="">订单状态：</span>
							<a-select ref="select" placeholder="请选择" v-model:value="searchConditions[1].value"
								style="width: 80%">
								<a-select-option value="a" key="a">待支付</a-select-option>
								<a-select-option value="b" key="b">待拼成</a-select-option>
								<a-select-option value="c" key="c">待发货</a-select-option>
								<a-select-option value="d" key="d">待收货</a-select-option>
								<a-select-option value="e" key="e">已完成</a-select-option>
							</a-select>
						</div>
					</a-col>
					<a-col :span="6">
						<div style="display: flex; align-items: center;margin-bottom: 20px;">
							<span style="white-space: nowrap;">开始时间：</span>
							<a-date-picker v-model:value="searchConditions[2].value" placeholder="请选择开始时间"
								:show-time="true" valueFormat="YYYY-MM-DD" style="width: 80%" />
						</div>
					</a-col>
					<a-col :span="6">
						<div style="display: flex; align-items: center;margin-bottom: 20px;">
							<span style="white-space: nowrap;">结束时间：</span>
							<a-date-picker v-model:value="searchConditions[3].value" placeholder="请选择结束时间"
								:show-time="true" valueFormat="YYYY-MM-DD" style="width: 80%" />
						</div>
					</a-col>
					<a-col :span="6">
						<div style="display: flex; align-items: center;margin-bottom: 20px;">
							<span style="white-space: nowrap;">收货人名：</span>
							<a-input v-model:value="searchConditions[4].value" placeholder="请输入收货人名"
								style="width: 80%"></a-input>
						</div>
					</a-col>
					<a-col :span="6">
						<div style="display: flex; align-items: center;margin-bottom: 20px;">
							<span style="white-space: nowrap;">收货电话：</span>
							<a-input v-model:value="searchConditions[5].value" placeholder="请输入收货电话"
								style="width: 80%"></a-input>
						</div>
					</a-col>
					<a-col :span="6">
						<div style="display: flex; align-items: center;margin-bottom: 20px;">
							<span style="white-space: nowrap;">快递单号：</span>
							<a-input v-model:value="searchConditions[6].value" placeholder="请输入快递单号"
								style="width: 80%"></a-input>
						</div>
					</a-col>
					<a-col :span="6">
						<a-button type="primary" style="margin-bottom: 20px;" @click="_findTableRecords()">搜索</a-button>
						<a-button style="margin-bottom: 20px;margin-left: 20px;" @click="chongzhi">重置</a-button>
					</a-col>
				</a-row>
				<!-- 表格数据 -->
				<a-button @click="handePl" :disabled="!selectedRowKeys.length" type="primary"
					style="margin-bottom: 20px;">批量打印</a-button>
				<div style="width: 100%;">
					<a-table :row-selection="rowSelection" :row-key="record => record.id" :columns="columns"
						:data-source="dataList" :scroll="{ x: 1600,y: 590 }">
						<template #bodyCell="{ column, record  }">
							<!-- 操作 -->
							<template v-if="column.dataIndex === 'action'">
								<div style="font-size: 12px;cursor: pointer;">
									<div @click="cxPrint(record)" v-if="record.status!='a'&&record.status!='b'"
										style="color: #1890FF;">重新打印
									</div>
									<div @click="openSon(record)" style="color: #1890FF;">订单详情</div>
									<!-- v-if="record.status=='c'" -->
									<div v-if="record.status!='a'&&record.status!='b'" style="color: #1890FF;"
										@click="itemObj=record;fh_vis=true;pupType='Key'">打印快递单|多份</div>
								</div>
							</template>
							<!-- 状态 -->
							<template v-if="column.dataIndex === 'status'">
								<div v-if="record.status=='a'">待支付</div>
								<div v-else-if="record.status=='b'">待拼成</div>
								<div v-else-if="record.status=='c'">待发货</div>
								<div v-else-if="record.status=='d'">待收货</div>
								<div v-else-if="record.status=='e'">已完成</div>
								<div v-else>{{record.status}}</div>
							</template>
							<!-- 物流公司 -->
							<template v-if="column.dataIndex === 'logistics_code'">
								<div v-if="record.status != 'a'&&record.status != 'b'">
									<div>物流公司：{{record.logistics_com}}</div>
									<div>物流单号：{{record.logistics_num}}</div>
									<div style="display: flex;cursor: pointer;">物流进度：
										<!-- <div @click="_getLogistics(record)" -->
										<div @click="_getExpressList(record)" style="margin: 0 auto;color: #1890FF;">查看
										</div>
									</div>
								</div>
							</template>
							<!-- 电子面单 -->
							<template v-if="column.dataIndex === 'dzmd'">
								<div v-if="record.status != 'a'&&record.status != 'b'">
									<div style="cursor: pointer;">
										<div @click="_getExpressList(record)" style="margin: 0 auto;color: #1890FF;">查看
										</div>
									</div>
								</div>
							</template>
							<!-- 商家备注 -->
							<template v-if="column.dataIndex === 'store_remark'">
								<a-input v-model:value="record.store_remark" @blur="onBlur(record)"></a-input>
							</template>
						</template>
					</a-table>
				</div>
			</div>
		</a-spin>
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
		<!-- 电子面单 -->
		<a-modal v-model:visible="md_vis" title="电子面单" @cancel="md_vis=false;" @ok="md_vis=false;" width="1000px">
			<a-spin :spinning="spinning">
				<a-table :columns="columnsPup" :data-source="dataListPup" :scroll="{ x: 920}">
					<template #bodyCell="{ column, record  }">
						<!-- 操作 -->
						<template v-if="column.dataIndex === 'action'">
							<div style="font-size: 12px;cursor: pointer;">
								<div @click="cxPrint(record)" v-if="record.status!='a'&&record.status!='b'"
									style="color: #1890FF;">重新打印
								</div>
								<div @click="_getLogistics(record)" style="color: #1890FF;">查看物流</div>
							</div>
						</template>
					</template>
				</a-table>
			</a-spin>
		</a-modal>
	</div>
</template>

<style scoped>
	::v-deep(.ant-table-row-indent + .ant-table-row-expand-icon) {
		display: none !important;
	}
</style>