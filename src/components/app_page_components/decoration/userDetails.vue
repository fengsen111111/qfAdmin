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
	let emit = defineEmits(["openChildPage", "closeChildPage"]);
	const global = inject("global").value;

	// 复制店铺编号
	function copyCode(code) {
		navigator.clipboard.writeText(code).then(() => {
			message.success('复制成功')
		}).catch(err => {
			message.error('复制失败')
		});
	}


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
				emit("closeChildPage", pageData.page_key);
			},
		});
	}

	const userInfo = ref({})
	// 后台获取用户信息
	function webGetUserInfo() {
		// 后台获取用户信息
		global.axios.post('decoration/User/webGetUserInfo', {
			user_id: pageData.data.id
		}, global, true).then((res) => {
			console.log('后台获取用户信息', res);
			res.chat_status = res.chat_status == 'Y' ? true : false
			res.status = res.status == 'Y' ? false : true
			userInfo.value = res
		})
	}
	webGetUserInfo()

	// 订单搜索项
	const order_sux = ref({
		status: '',
		time: [],
		id: '',
	})
	const orderList = ref([])//订单数据
	const order_count = ref('')//订单总数
	const current = ref(1)// 分页
	// 后台获取用户订单列表
	function webGetUserOrderList() {
		// 后台获取用户订单列表
		global.axios.post('decoration/Order/webGetUserOrderList', {
			user_id: pageData.data.id,
			id: order_sux.value.id,
			status: order_sux.value.status,
			start_time: '',
			end_time: '',
			currentPage: current.value,
			perPage: 10,
		}, global, true).then((res) => {
			console.log('后台获取用户订单列表', res);
			orderList.value = res.list
			order_count.value = res.count
		})
	}
	webGetUserOrderList()
</script>

<template>
	<!--搜索-->
	<div>
		<div style="padding: 0px 20px;">
			<!--搜索-->
			<div>
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
								<!-- <span>QFID:{{userInfo.id}}</span> -->
								<!-- <span style="margin-left: 40px;">{{userInfo.mobile}}</span> -->
								<span>{{userInfo.mobile}}</span>
							</div>
						</div>
					</div>
					<div class="a21">
						<div style="font-size: 17px;font-weight: bold;">用户详情页</div>
						<div class="a22" @click="closeChildPage()">返回</div>
					</div>
				</div>
				<div style="background-color: #f5f5f5;height: 1px;margin-top: 10px;"></div>
				<div style="display:flex;text-align: center;">
					<div style="border-right: 1px solid #f5f5f5;padding: 10px;width: 45%;">用户信息</div>
					<div style="padding: 10px;width: 55%;">用户数据</div>
				</div>
				<div style="background-color: #f5f5f5;height: 1px;"></div>
				<div style="display: flex">
					<div
						style="width: 45%;display: grid;grid-template-columns: repeat(2, minmax(0, 1fr));border-right: 1px solid #f5f5f5;padding: 10px 0px;">
						<div style="display: flex;">
							<div style="width: 100px;text-align: right;margin-right: 20px;color: #4e5969;">真实姓名：</div>
							<div>{{userInfo.auth_name}}</div>
						</div>
						<div></div>
						<div style="display: flex;">
							<div style="width: 100px;text-align: right;margin-right: 20px;color: #4e5969;">注册日期：</div>
							<div>{{userInfo.create_time}}</div>
						</div>
						<div style="display: flex;">
							<div>
								<MessageFilled style="color: #00d521;font-size: 17px;margin-right: 10px;" />
							</div>
							<div>聊天状态：</div>
							<div><a-switch v-model:checked="userInfo.chat_status" size="small" /></div>
						</div>
						<div style="display: flex;">
							<div style="width: 100px;text-align: right;margin-right: 20px;color: #4e5969;">手机号：</div>
							<div>{{userInfo.mobile}}</div>
						</div>
						<div></div>
						<div style="display: flex;">
							<div style="width: 100px;text-align: right;margin-right: 20px;color: #4e5969;">推荐官状态：</div>
							<div v-if="userInfo.sharer_status=='a'">未开通</div>
							<div v-else-if="userInfo.sharer_status=='b'">申请开通中</div>
							<div v-else-if="userInfo.sharer_status=='c'">已开通，未缴纳保证金</div>
							<div v-else-if="userInfo.sharer_status=='d'">已开通</div>
							<div v-else-if="userInfo.sharer_status=='e'">状态异常</div>
							<div v-else-if="userInfo.sharer_status=='z'">审核拒绝</div>
						</div>
						<div style="display: flex;">
							<div>
								<CloseCircleFilled style="color: #ff0000;font-size: 17px;margin-right: 10px;" />
							</div>
							<div>拉黑状态：</div>
							<div><a-switch v-model:checked="userInfo.status" size="small" /></div>
						</div>
						<div style="display: flex;">
							<div style="width: 100px;text-align: right;margin-right: 20px;color: #4e5969;">商家状态：</div>
							<div v-if="userInfo.store_status=='a'">未开通</div>
							<div v-else-if="userInfo.store_status=='b'">申请开通中</div>
							<div v-else-if="userInfo.store_status=='c'">已开通</div>
							<div v-else-if="userInfo.store_status=='d'">状态异常</div>
							<div v-else-if="userInfo.store_status=='e'">已退店</div>
							<div v-else-if="userInfo.store_status=='z'">审核拒绝</div>
						</div>
					</div>
					<div style="width: 55%;">
						<div class="a43">
							<div class="a44">
								<div class="a45">
									<AuditOutlined class="a46" />
								</div>
								<div>
									<div>钱包余额</div>
									<div class="a47">{{Number(userInfo.avl_bal||0).toLocaleString()}}</div>
								</div>
							</div>
							<div class="a44">
								<div class="a45">
									<AuditOutlined class="a46" />
								</div>
								<div>
									<div>积分余额</div>
									<div class="a47">{{Number(userInfo.integral||0).toLocaleString()}}</div>
								</div>
							</div>
							<div class="a44">
								<div class="a45">
									<AuditOutlined class="a46" />
								</div>
								<div>
									<div>总消费额</div>
									<div class="a47">{{Number(userInfo.all_order_money||0).toLocaleString()}}</div>
								</div>
							</div>
						</div>
						<div class="a43">
							<div class="a44">
								<div class="a45">
									<AuditOutlined class="a46" />
								</div>
								<div>
									<div>总订单数</div>
									<div class="a47">{{Number(userInfo.order_number||0).toLocaleString()}}</div>
								</div>
							</div>
							<div class="a44">
								<div class="a45">
									<AuditOutlined class="a46" />
								</div>
								<div>
									<div>总收益</div>
									<div class="a47">{{Number(userInfo.all_get_money||0).toLocaleString()}}</div>
								</div>
							</div>
							<!-- <div class="a44">
								<div class="a45">
									<AuditOutlined class="a46" />
								</div>
								<div>
									<div>收益余额</div>
									<div class="a47">{{Number(11111).toLocaleString()}}</div>
								</div>
							</div> -->
						</div>
					</div>
				</div>
				<div style="background-color: #f5f5f5;height: 1px;"></div>
				<!-- 店铺数据 -->
				<div style="font-size: 17px;font-weight: bold;padding: 10px 0px;">订单记录</div>
				<div class="a80">
					<div class="a81">
						<div>订单编号</div>
						<div>
							<a-input placeholder="请输入订单编号" v-model:value="order_sux.id" class="a82"
								style="border:none;border-radius: 4px;"></a-input>
						</div>
					</div>
					<div class="a81">
						<div>订单状态</div>
						<div>
							<a-select ref="select" v-model:value="order_sux.status" class="a83">
								<a-select-option value="a">待支付</a-select-option>
								<a-select-option value="b">待拼成</a-select-option>
								<a-select-option value="c">待发货</a-select-option>
								<a-select-option value="d">待收货</a-select-option>
								<a-select-option value="e">已完成</a-select-option>
								<a-select-option value="z">拼团失败</a-select-option>
							</a-select>
						</div>
					</div>
					<div class="a81">
						<div>流水时间</div>
						<div>
							<a-range-picker v-model:value="order_sux.time" class="a82"
								style="border:none;border-radius: 4px;" />
						</div>
					</div>
					<div class="a84">
						<div class="a85">
							<ReloadOutlined style="margin-right: 10px;" />
							重置
						</div>
						<div class="a86">
							<SearchOutlined style="margin-right: 10px;" />
							查询
						</div>
					</div>
				</div>
				<div class="a87"></div>
				<div style="">
					<div class="a88">
						<div class="w5_100">操作</div>
						<div class="w10_100">订单编号</div>
						<div class="w5_100">订单状态</div>
						<div class="w5_100">实付金额</div>
						<div class="w30_100">商品信息</div>
						<div class="w15_100">下单时间</div>
						<div class="w5_100">收货人</div>
						<div class="w10_100">手机号</div>
						<div class="w15_100">地址</div>
					</div>
					<div v-for="item in orderList" :key="item.id" class="a89">
						<div class="w5_100" style="color: #40a9ff;">查看详情</div>
						<div class="w10_100">{{item.id}}</div>
						<div class="w5_100">
							<span v-if="item.status=='a'">待支付</span>
							<span v-else-if="item.status=='b'">待拼成</span>
							<span v-else-if="item.status=='c'">待发货</span>
							<span v-else-if="item.status=='d'">待收货</span>
							<span v-else-if="item.status=='e'">已完成</span>
							<span v-else-if="item.status=='z'">拼团失败</span>
						</div>
						<div class="w5_100">{{item.pay_price}}</div>
						<div class="w30_100">
							<span v-for="iss in item.goods_list"
								:key="item.goods_id">{{iss.name}}（{{item.size_name}}）、</span>
						</div>
						<div class="w15_100">{{item.create_time}}</div>
						<div class="w5_100">{{item.address_name}}</div>
						<div class="w10_100">{{item.address_mobile}}</div>
						<div class="w15_100">{{item.address}}</div>
					</div>
					<div v-if="orderList.length==0"
						style="border-left: 1px solid #e9e9e9;border-right: 1px solid #e9e9e9;padding: 10px;">
						<a-empty />
					</div>
					<div class="a90">
						<div></div>
						<div class="a91">
							<div class="a92">共 {{order_count}} 项数据</div>
							<a-pagination v-model:current="current" :total="order_count" show-less-items
								:showSizeChanger="false" />
						</div>
					</div>
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
		margin-top: -1px;
		border: 1px solid #e9e9e9;
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