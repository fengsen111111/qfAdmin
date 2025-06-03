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
		global.Modal.confirm({
			title: global.findLanguage(
				"确定要返回吗？该操作会导致未保存的数据丢失，请谨慎操作！"
			),
			okText: global.findLanguage("确定"),
			cancelText: global.findLanguage("取消"),
			okType: "primary",
			onOk: function () {
				// 
				if (localStorage.getItem('is_shouhou')) {
					emit("closeChildPage", pageData.page_key);
				} else {
					emit("djtzmk", '购物商城', '订单管理');
				}
			},
		});
	}


	const userInfo = ref({})
	// 后台获取用户信息
	function webGetUserInfo() {
		// 后台获取用户信息
		global.axios.post('decoration/User/webGetUserInfo', {
			user_id: pageData.data.user_id
		}, global, true).then((res) => {
			console.log('后台获取用户信息', res);
			userInfo.value = res
		})
	}
	webGetUserInfo()

	const orderDetails = ref({})//订单详情

	// 后台获取订单详情
	function webGetOrderDetail() {
		// 后台获取订单详情
		global.axios.post('decoration/Order/webGetOrderDetail', {
			order_id: pageData.data.id,
		}, global, true).then((res) => {
			console.log('后台获取订单详情', res);
			orderDetails.value = res
		})
	}
	webGetOrderDetail()
	import Print from './print.vue'

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
								<span>{{is_ptsj=='平台'?userInfo.mobile:(userInfo.mobile?.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2') || '') }}</span>
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
				<div style="width: 35%;padding: 10px 30px;">
					<div
						style="font-size: 18px;border-left: 4px solid #0c96f1;padding-left: 10px;font-weight: bold;margin-top: 10px;">
						物流信息</div>
					<div style="padding: 20px;">
						<div v-for="(item,index) in orderDetails.logistics_detail" :key="index"
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
						</div>
					</div>
				</div>
				<div style="width: 8px;background-color: #f5f5f5;"></div>
				<div style="width: 65%;padding: 10px 30px;">
					<div
						style="font-size: 18px;border-left: 4px solid #0c96f1;padding-left: 10px;font-weight: bold;margin-top: 10px;">
						订单信息</div>
					<div
						style="display: grid;grid-template-columns: repeat(3,minmax(0,1fr));padding: 5px 20px 0px 40px;">
						<div style="display: flex;color: #4e5969;">
							<div style="width: 80px;">商家名称：</div>
							<div>{{orderDetails.store_name}}</div>
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
								{{is_ptsj=='平台'?orderDetails.store_mobile:(orderDetails.store_mobile?.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2') || '') }}
							</div>
						</div>
						<!-- <div style="display: flex;color: #4e5969;">
							<div style="width: 80px;">订单类型：</div>
							<div style="color: black;">拼团订单/积分订单</div>
						</div> -->
						<div style="display: flex;color: #4e5969;">
							<div style="width: 80px;">收货时间：</div>
							<div style="color: black;">{{orderDetails.over_time=='0'?'暂无':orderDetails.over_time}}</div>
						</div>
					</div>
					<!-- <div style="display: flex;color: #4e5969;padding: 5px 20px 0px 40px;">
						<div style="width: 80px;">用户备注：</div>
						<div style="width: 82%;color: black;">
							用户备注用户备注用户备注用户备注用户备注用户用户备注用户备注用户备注用户用户备注用户备注用户备注用户用户备注用户备注用户备注用户备注用户备注用户备注用户备注用户备注用户备注用户备注用户备注用户备注用户备注用户备注用户备注用户备注
						</div>
					</div> -->
					<div
						style="font-size: 18px;border-left: 4px solid #0c96f1;padding-left: 10px;font-weight: bold;margin-top: 10px;">
						收货信息</div>
					<div
						style="display: grid;grid-template-columns: repeat(3,minmax(0,1fr));padding: 5px 20px 0px 40px;">
						<div style="display: flex;color: #4e5969;">
							<div style="width: 80px;padding-left: 13px;">收货人：</div>
							<div>{{orderDetails.address_name}}</div>
						</div>
						<div style="display: flex;color: #4e5969;">
							<div style="width: 80px;">联系电话：</div>
							<div>
								{{is_ptsj=='平台'?orderDetails.address_mobile:(orderDetails.address_mobile?.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2') || '') }}
							</div>
						</div>
					</div>
					<div style="display: flex;color: #4e5969;padding: 5px 20px 0px 40px;">
						<div style="width: 80px;">收货地址：</div>
						<div style="width: 82%;color: black;">{{orderDetails.address}}</div>
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
						<!-- <div style="display: flex;color: #4e5969;">
							<div style="width: 80px;">支付方式：</div>
							<div>余额支付/支付宝支付/微信支付</div>
						</div> -->
					</div>
				</div>

			</div>
			<div style="height: 8px;background-color: #f5f5f5;"></div>
			<div style="padding: 10px 30px;">
				<div style="font-size: 18px;border-left: 4px solid #0c96f1;padding-left: 10px;font-weight: bold;">商品明细
				</div>
				<div style="margin-top: 10px;">
					<div class="a88" style="text-align: center;">
						<div class="w20_100" style="text-align: left;">商品名称</div>
						<div class="w10_100">商品原价</div>
						<div class="w10_100">商品数量</div>
						<div class="w20_100">应付金额</div>
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
						<div class="w20_100" style="display: flex;align-items: center;text-align: left;">
							<img :src="item.cover_image" style="width: 40px;height: 40px;border-radius: 4px;" alt="">
							<div style="padding: 5px 10px;">
								<div>{{item.goods_name}}</div>
								<div style="color: #999999;">规格：{{item.size_name}}</div>
							</div>
						</div>
						<div class="w10_100">{{item.old_price}}</div>
						<div class="w10_100">X{{item.number}}</div>
						<div class="w20_100">
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
			<div style="padding: 20px;display: flex;">
				<div style="display: flex;margin: 0 auto;">
					<div
						style="border: 1px solid #ff0000;background-color: #fbeaea;border-radius: 6px;padding: 9px 18px;color: #ff0000;margin-right: 10px;">
						退款</div>
					<Print :details=orderDetails />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.w30_100 {
		width: 30%;
	}

	.w25_100 {
		width: 25%;
	}

	.w20_100 {
		width: 20%;
	}

	.w15_100 {
		width: 15%;
	}

	.w10_100 {
		width: 10%;
	}

	.w5_100 {
		width: 5%;
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