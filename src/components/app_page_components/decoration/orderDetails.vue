<script setup>
	import { inject, onBeforeMount, reactive, ref, watch, shallowRef, createVNode, onMounted, onBeforeUnmount } from "vue";
	import { FormComponents } from "../../form_components/form";
	import { TableComponents } from "../../table_components/table";
	import { Row, Col } from 'ant-design-vue';
	import { ClockCircleFilled, DownOutlined, CloseCircleOutlined, PlusOutlined, ExclamationCircleOutlined, AuditOutlined, SearchOutlined, ReloadOutlined, CloseCircleFilled, CommentOutlined, MessageFilled } from "@ant-design/icons-vue";
	import { message } from 'ant-design-vue';
	import { useRoute } from 'vue-router';
	import * as echarts from 'echarts'
	const route = useRoute();
	let props = defineProps(["pageData"]);
	const pageData = props.pageData;

	// console.log('pageData',pageData);

	let emit = defineEmits(["openChildPage", "closeChildPage", "djtzmk"]);
	const global = inject("global").value;

	// 复制店铺编号
	function copyCode(code) {
		navigator.clipboard.writeText(code).then(() => {
			message.success('复制成功')
		}).catch(err => {
			message.error('复制失败')
		});
	}
	// 分页
	const current = ref(1)

	const is_ptsj = ref('商家')

	setTimeout(() => {
		is_ptsj.value = localStorage.getItem('storeId') == 1 ? "平台" : '商家'
	}, 500);

	const value1 = ref('')
	const checkedOne = ref(false)
	const checkedTwo = ref(false)
	// 返回上一页
	function closeChildPage() {
		if (localStorage.getItem('is_shouhou')) {
			emit("closeChildPage", pageData.page_key);
		} else {
			emit("djtzmk", '购物商城', '订单管理');
		}
		// global.Modal.confirm({
		// 	title: global.findLanguage(
		// 		"确定要返回吗？该操作会导致未保存的数据丢失，请谨慎操作！"
		// 	),
		// 	okText: global.findLanguage("确定"),
		// 	cancelText: global.findLanguage("取消"),
		// 	okType: "primary",
		// 	onOk: function () {
		// 		// 
		// 		if (localStorage.getItem('is_shouhou')) {
		// 			emit("closeChildPage", pageData.page_key);
		// 		} else {
		// 			emit("djtzmk", '购物商城', '订单管理');
		// 		}
		// 	},
		// });
	}
	function sondjtzmk(str, strTwo, strThree) {
		emit("djtzmk", str, strTwo, strThree);
	}


	const userInfo = ref({})
	// 后台获取用户信息
	function webGetUserInfo() {
		// 后台获取用户信息
		global.axios.post('decoration/User/webGetUserInfo', {
			user_id: pageData.data.user_id
		}, global, true).then((res) => {
			// console.log('后台获取用户信息', res);
			userInfo.value = res
		})
	}
	webGetUserInfo()

	const orderDetails = ref({})//订单详情
	const orderListDetails = ref([])//订单详情列表

	// 后台获取订单详情
	function webGetOrderDetail() {
		// 后台获取订单详情
		global.axios.post('decoration/Order/webGetOrderDetail', {
			order_id: pageData.data.id,
		}, global, true).then((res) => {
			// console.log('后台获取订单详情', res);
			orderDetails.value = res
			// 获取电子面单
			global.axios.post('decoration/Order/getExpressList', {
				// store_id: localStorage.getItem('storeId'),
				order_id: pageData.data.id,
			}, global, true).then((resule) => {
				console.log('获取电子面单', resule);
				resule.list.map((item, index) => {
					// 深拷贝第0个对象
					orderListDetails.value[index] = JSON.parse(JSON.stringify(orderDetails.value));
					orderListDetails.value[index].dzmdurl = item.logistics_label;
					orderListDetails.value[index].dzmdurlID = item.id;
					orderListDetails.value[index].logistics_com = item.logistics_com
					orderListDetails.value[index].logistics_num = item.logistics_num
					orderListDetails.value[index].logistics_code = item.logistics_code
				});
			})
		})
	}
	webGetOrderDetail()
	import Print from './print.vue'

	// 地址*号
	function maskAddress(address) {
		if (!address) return '';
		const match = address.match(/^(.{2,3}省)?(.{2,3}市)?(.*)$/);
		if (!match) return '';
		const province = match[1] || '';
		const city = match[2] || '';
		const rest = match[3] || '';
		const masked = '*'.repeat(rest.length);
		return province + city + masked;
	}
	// 姓名*号
	function maskName(name) {
		if (!name) return '';
		if (name.length === 2) {
			return name[0] + '*';
		} else if (name.length > 2) {
			return name[0] + '*' + name.slice(2);
		} else {
			return '*'; // 只有1个字
		}
	}

	const columnsPup = [
		{
			"key": "action",
			"dataIndex": 'action',
			"title": "操作",
			"width": 100,
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
			"title": "物流名称",
			// "width": 60,
			"component": "Varchar"
		},
		{
			"key": "logistics_code",
			"dataIndex": 'logistics_code',
			"title": "公司编码",
			// "width": 60,
			"component": "Varchar"
		},
	]

	// 弹窗重新打印
	function cxPrintTwo(item) {
		console.log('item', item);
		// 手动打印需要回调
		global.axios.post(
			'decoration/Order/printExpress',
			{ id: item.id },
			global,
			true
		).then((resHd) => {
			console.log('手动打印回调');
			window.open(item.dzmdurl, '_blank');
		})
	}
	const wlInfo = ref({})
	const wlVis = ref(false)
	// 查看物流信息
	function _getLogistics(item) {
		global.axios
			.post('decoration/Order/getLogistics', {
				"logistics_num": item.logistics_num,
			}, global)
			.then((res) => {
				console.log('查看物流信息', res);
				wlInfo.value = res
				wlVis.value = true
			})
	}
</script>

<template>
	<!--搜索-->
	<div>
		<div>
			<!--搜索-->
			<div style="padding: 10px 30px;">
				<div style="display: flex;justify-content: space-between;align-items: center;">
					<div style="display: flex;align-items: center;">
						<img v-if="userInfo.head_image" :src="userInfo.head_image"
							style="width: 50px;height: 50px;border-radius: 50%;" alt="">
						<img v-else src="../../../../public/resource/image/userImg.png"
							style="width: 50px;height: 50px;border-radius: 50%;" alt="">
						<div style="margin-left: 20px;">
							<div style="font-size: 18px;font-weight: bold;">
								{{userInfo.nickname?userInfo.nickname:'默认昵称'}}</div>
							<div style="color: #4e5969;font-size: 12px;">
								<span>{{is_ptsj=='平台'?userInfo.mobile:(userInfo.mobile?.replace(/^(\d{3})\d{4}(\d{4})$/,
									'$1****$2') || '') }}</span>
							</div>
						</div>
					</div>
					<div class="a21">
						<div style="font-size: 17px;font-weight: bold;">订单详情页</div>
						<div class="a22" @click="closeChildPage()">返回</div>
					</div>
				</div>
			</div>
			<div style="height: 8px;background-color: #f5f5f5;"></div>
			<div style="display: flex;">
				<div style="width: 50%;padding: 10px 30px;">
					<div style="display: flex;justify-content: space-between;align-items: center;">
						<div
							style="font-size: 18px;border-left: 4px solid #0c96f1;padding-left: 10px;font-weight: bold;margin-top: 10px;">
							物流信息</div>
						<div style="margin-top: 10px;" v-if="orderDetails.logistics_state =='0'">
							预计到达时间: {{orderDetails.deliveryExpendTime}}</div>
					</div>
					<div style="padding: 20px 0px;">
						<div v-if="!orderListDetails.length">
							<a-empty />
						</div>
						<div v-else>
							<a-table :columns="columnsPup" :data-source="orderListDetails" :scroll="{ x: 520,y:300}">
								<template #bodyCell="{ column, record  }">
									<!-- 操作 -->
									<template v-if="column.dataIndex === 'action'">
										<div style="font-size: 12px;cursor: pointer;">
											<div @click="cxPrintTwo(record)" v-if="record.status!='a'&&record.status!='b'"
												style="color: #1890FF;">重新打印
											</div>
											<div @click="_getLogistics(record)" style="color: #1890FF;">查看物流</div>
										</div>
									</template>
								</template>
							</a-table>
						</div>
						
						<!-- <div v-for="(item,index) in orderDetails.logistics_detail" :key="index"
							style="position: relative;padding-bottom: 10px;"
							:style="{ 'border-left': index==orderDetails.logistics_detail.length-1 ? 'none' : '2px solid #dee5ec' }">
							<div style="position: absolute;width: 20px;height: 20px;border-radius: 50%;top: 0px;left: -11px;"
								:style="{ 'background-color': index==orderDetails.logistics_detail.length-1 ? '#0c96f1' : '#dee5ec' }">
							</div>
							<div style="padding: 0px 20px;font-weight: bold;">
								<div>物流状态 2020-10-10 12:12:12</div>
								<div style="color: #999999;">物流状态物流状态物流状态</div>
							</div>
						</div>
						<div v-if="!orderDetails.logistics_detail">
							<a-empty />
						</div> -->
					</div>
				</div>
				<div style="width: 8px;background-color: #f5f5f5;"></div>
				<div style="width: 50%;padding: 10px 30px;">
					<div
						style="font-size: 18px;border-left: 4px solid #0c96f1;padding-left: 10px;font-weight: bold;margin-top: 10px;">
						订单信息</div>
					<div
						style="display: grid;grid-template-columns: repeat(3,minmax(0,1fr));padding: 5px 20px 0px 40px;">
						<div style="display: flex;color: #4e5969;">
							<div style="width: 80px;">商家名称：</div>
							<div>
								{{is_ptsj=='平台'?orderDetails.store_name:maskName(orderDetails.store_name) }}
							</div>
						</div>
						<div style="display: flex;color: #4e5969;">
							<div style="width: 80px;">订单编号：</div>
							<div>{{orderDetails.id}}</div>
						</div>
						<div style="display: flex;color: #4e5969;">
							<div style="width: 80px;">下单时间：</div>
							<div>{{orderDetails.create_time}}</div>
						</div>
					</div>
					<div
						style="display: grid;grid-template-columns: repeat(3,minmax(0,1fr));padding: 5px 20px 0px 40px;">
						<div style="display: flex;color: #4e5969;">
							<div style="width: 80px;">商家电话：</div>
							<div style="color: black;">
								{{is_ptsj=='平台'?orderDetails.store_mobile:(orderDetails.store_mobile?.replace(/^(\d{3})\d{4}(\d{4})$/,
								'$1****$2') || '') }}
							</div>
						</div>
						<div style="display: flex;color: #4e5969;">
							<div style="width: 80px;">收货时间：</div>
							<div style="color: black;">{{orderDetails.over_time=='0'?'暂无':orderDetails.over_time}}</div>
						</div>
					</div>
					<div
						style="font-size: 18px;border-left: 4px solid #0c96f1;padding-left: 10px;font-weight: bold;margin-top: 10px;">
						收货信息</div>
					<div
						style="display: grid;grid-template-columns: repeat(3,minmax(0,1fr));padding: 5px 20px 0px 40px;">
						<div style="display: flex;color: #4e5969;">
							<div style="width: 80px;padding-left: 13px;">收货人：</div>
							<div>
								{{is_ptsj=='平台'?orderDetails.address_name:maskName(orderDetails.address_name) }}
							</div>
						</div>
						<div style="display: flex;color: #4e5969;">
							<div style="width: 80px;">联系电话：</div>
							<div>
								{{is_ptsj=='平台'?orderDetails.address_mobile:(orderDetails.address_mobile?.replace(/^(\d{3})\d{4}(\d{4})$/,
								'$1****$2') || '') }}
							</div>
						</div>
					</div>
					<div style="display: flex;color: #4e5969;padding: 5px 20px 0px 40px;">
						<div style="width: 80px;">收货地址：</div>
						<div style="width: 82%;color: black;">
							{{is_ptsj=='平台'?orderDetails.address:maskAddress(orderDetails.address) }}
						</div>
					</div>
					<div
						style="font-size: 18px;border-left: 4px solid #0c96f1;padding-left: 10px;font-weight: bold;margin-top: 10px;">
						支付信息</div>
					<div
						style="display: grid;grid-template-columns: repeat(3,minmax(0,1fr));padding: 5px 20px 0px 40px;">
						<div style="display: flex;color: #4e5969;">
							<div style="width: 80px;">支付状态：</div>
							<div v-if="orderDetails.status!=='a'">已支付</div>
							<div v-else>待支付</div>
						</div>
						<div style="display: flex;color: #4e5969;">
							<div style="width: 80px;">实付金额：</div>
							<div>{{orderDetails.pay_price}}</div>
						</div>
						<div style="display: flex;color: #4e5969;">
							<div style="width: 100px;margin-left: -13px;">订单总金额：</div>
							<div style="margin-left: -7px;">{{orderDetails.price}}</div>
						</div>
					</div>
					<div
						style="display: grid;grid-template-columns: repeat(3,minmax(0,1fr));padding: 5px 20px 0px 40px;">
						<div style="display: flex;color: #4e5969;">
							<div style="width: 80px;">优惠金额：</div>
							<div style="color: black;">{{orderDetails.not_pay_price}}</div>
						</div>
						<div style="display: flex;color: #4e5969;">
							<div style="width: 100px;margin-left: -13px;">订单服务费：</div>
							<div style="color: black;margin-left: -7px;">{{orderDetails.plate_price}}</div>
						</div>
						<div style="display: flex;color: #4e5969;">
							<div style="width: 80px;">支付时间：</div>
							<div style="color: black;">{{orderDetails.pay_time}}</div>
						</div>
					</div>
					<div
						style="display: grid;grid-template-columns: repeat(3,minmax(0,1fr));padding: 5px 20px 0px 40px;">
						<div style="display: flex;color: #4e5969;">
							<div style="width: 100px;margin-left: -28px;">商家预计收入：</div>
							<div style="color: black;margin-left: 7px;">{{orderDetails.store_price}}</div>
						</div>
					</div>
				</div>
			</div>
			<div style="height: 8px;background-color: #f5f5f5;"></div>
			<div style="padding: 10px 30px;">
				<div style="font-size: 18px;border-left: 4px solid #0c96f1;padding-left: 10px;font-weight: bold;">商品明细
				</div>
				<div style="margin-top: 10px;">
					<div class="a88" style="text-align: center;">
						<div class="w10_100">商品ID</div>
						<div class="w20_100">商品名称</div>
						<div class="w10_100">商品原价</div>
						<div class="w10_100">商品数量</div>
						<div class="w10_100">应付金额</div>
						<div class="w10_100">优惠金额</div>
						<div class="w10_100">实付金额</div>
						<div class="w10_100">售后金额</div>
						<div class="w10_100">订单状态</div>
					</div>
					<div v-if="orderDetails.goods_list">
						<div v-if="orderDetails.goods_list.length==0" style="padding: 10px;">
							<a-empty />
						</div>
					</div>
					<div v-for="item in orderDetails.goods_list" :key="item" class="a89"
						style="align-items: center;text-align: center;">
						<div class="w10_100">{{item.goods_id}}</div>
						<div class="w20_100">
							<div style="display: flex;">
								<div style="display: flex;align-items: center;padding:0px 20px;margin: 0 auto;">
									<img :src="item.cover_image" style="width: 40px;height: 40px;border-radius: 4px;"
										alt="">
									<div style="padding: 5px 10px;">
										<div>{{item.goods_name}}</div>
										<div style="color: #999999;">规格：{{item.size_name}}</div>
									</div>
								</div>
							</div>

						</div>
						<div class="w10_100">{{item.old_price}}</div>
						<div class="w10_100">X{{item.number}}</div>
						<div class="w10_100">
							<div>{{item.pay_price}}</div>
							<div style="color: #999999;">商品金额：{{item.price}}</div>
							<div style="color: #999999;">运费：{{orderDetails.carriage_price}}</div>
						</div>
						<div class="w10_100">{{orderDetails.not_pay_price}}</div>
						<div class="w10_100">{{item.pay_price}}</div>
						<div class="w10_100">{{item.refund_price?item.refund_price:'————'}}</div>
						<div class="w10_100">
							<span v-if="orderDetails.status=='a'">待支付</span>
							<span v-else-if="orderDetails.status=='b'">待拼成</span>
							<span v-else-if="orderDetails.status=='c'">待发货</span>
							<span v-else-if="orderDetails.status=='d'">待收货</span>
							<span v-else-if="orderDetails.status=='e'">已完成</span>
							<span v-else-if="orderDetails.status=='z'">拼团失败</span>
						</div>
					</div>
				</div>
			</div>
			<div style="height: 8px;background-color: #f5f5f5;"></div>
			<div style="padding: 20px;display: flex;" v-if="is_ptsj=='商家'">
				<!--  v-if="orderDetails.id" -->
				<!-- <div style="display: flex;margin: 0 auto;">
					<Print :orderListDetails="orderListDetails" @djtzmk="sondjtzmk" />
				</div> -->
			</div>
		</div>
		<!-- 物流信息 -->
		<a-drawer v-model:visible="wlVis" @close="wlVis=false" class="custom-class" title="物流信息" placement="right">
			<div>
				<div>物流公司：{{wlInfo.logistics_com}}</div>
				<div>物流单号: {{wlInfo.logistics_num}}</div>
				<div style="display: flex;">
					<div>物流详情：</div>
					<div v-if="wlInfo.logistics_detail">
						<div v-for="item in wlInfo.logistics_detail" :key="item">
							{{item}}
						</div>
					</div>
					<div v-else>
						暂无物流详情
					</div>
				</div>
			</div>
		</a-drawer>
	</div>
</template>

<style lang="less" scoped>
	.w30_100 {
		width: 30%;
		/* border: 1px solid red; */
	}

	.w25_100 {
		width: 25%;
		/* border: 1px solid red; */

	}

	.w20_100 {
		width: 20%;
		/* border: 1px solid red; */

	}

	.w15_100 {
		width: 15%;
		/* border: 1px solid red; */

	}

	.w10_100 {
		width: 10%;
		/* border: 1px solid red; */

	}

	.w5_100 {
		width: 5%;
		/* border: 1px solid red; */

	}

	::v-deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
		background-color: #f7f8f9;
		border: none;
		border-radius: 4px;
	}

	.a21 {
		display: flex;
		align-items: center;
	}

	.a22 {
		border-radius: 5px;
		background-color: #0c96f1;
		color: #fff;
		padding: 3px 20px;
		margin-left: 15px;
		font-size: 14px;
		cursor: pointer;
	}

	.a43 {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		/* border-bottom: 1px solid #f5f5f5; */
		padding: 10px 0px;
	}

	.a44 {
		display: flex;
		/* padding: 20px; */
		align-items: center;
		border-right: 1px solid #f5f5f5;
		margin-left: 20px;
	}

	.a45 {
		background-color: #f9f9f9;
		border-radius: 50%;
		margin-right: 20px;
		padding: 10px;
	}

	.a46 {
		font-size: 30px;
		color: #40a9ff;
	}

	.a47 {
		font-weight: bold;
		font-size: 24px;
	}

	.a80 {
		color: #666666;
		display: flex;
		justify-content: space-between;
		margin-top: 10px;
	}

	.a81 {
		display: flex;
		align-items: center;
	}

	.a82 {
		margin-left: 10px;
		background-color: #f7f8f9;
		width: 15vw;
	}

	.a83 {
		margin-left: 10px;
		background-color: #f7f8f9 !important;
		width: 15vw;
	}

	.a84 {
		display: flex;
		align-items: center;
		width: 15vw;
	}

	.a85 {
		padding: 5px 10px;
		background-color: #f7f8f9;
		border-radius: 4px;
		align-items: center;
		display: flex;
	}

	.a86 {
		padding: 5px 10px;
		background-color: #0c96f1;
		color: #fff;
		border-radius: 4px;
		margin-left: 20px;
		display: flex;
		align-items: center;
	}

	.a87 {
		height: 2px;
		margin: 10px 0px;
		background-color: #f7f8f9;
	}

	.a88 {
		padding: 10px 30px;
		display: flex;
		background-color: #f2f3f5;
		text-align: left;
		font-weight: bold;
	}

	.a89 {
		padding: 10px 30px;
		display: flex;
		text-align: left;
		border-bottom: 1px solid #f5f5f5;
	}

	.a90 {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 30px;
	}

	.a91 {
		display: flex;
		align-items: center;
	}

	.a92 {
		color: #666666;
		margin-right: 20px;
	}
</style>