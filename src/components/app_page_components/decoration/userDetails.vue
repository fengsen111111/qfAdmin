<script setup>
	import { inject, onBeforeMount, reactive, ref, watch, shallowRef, createVNode, onMounted, onBeforeUnmount } from "vue";
	import { FormComponents } from "../../form_components/form";
	import { TableComponents } from "../../table_components/table";
	import { Row, Col } from 'ant-design-vue';
	import { ClockCircleFilled, DownOutlined, CloseCircleOutlined, PlusOutlined, ExclamationCircleOutlined, AuditOutlined, SearchOutlined, ReloadOutlined,CloseCircleFilled,CommentOutlined,MessageFilled } from "@ant-design/icons-vue";
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
	// 分页
	const current = ref(1)

	const is_ptsj = ref('商家')
	function getCustomerRoomList() {
		// 获取自己的角色ID和聊天状态
		global.axios.post('decoration/CustomerService/getMyJoinerSign', {}, global, true).then((res_one) => {
			console.log('自己商家id和禁言状态', res_one);
			is_ptsj.value = res_one.joiner_sign == 1 ? "平台" : '商家'
		})
	}
	getCustomerRoomList()
	const value1 = ref('')
	const checkedOne = ref(false)
	const checkedTwo = ref(false)
</script>

<template>
	<!--搜索-->
	<div>
		<div style="padding: 0px 20px;">
			<!--搜索-->
			<div>
				<div style="display: flex;justify-content: space-between;align-items: center;">
					<div style="display: flex;align-items: center;">
						<img src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/coverImg/2025428/ev9v7kmhau77as4w7jbp9tvee3wdtkis.png"
							style="width: 50px;height: 50px;border-radius: 50%;" alt="">
						<div style="margin-left: 20px;">
							<div style="font-size: 18px;font-weight: bold;">张三成都软件开发·创业卷卷圈</div>
							<div style="color: #4e5969;font-size: 12px;">
								<span>QFID:1231312</span>
								<span style="margin-left: 40px;">18388118811</span>
							</div>
						</div>
					</div>
					<div class="a21">
						<div style="font-size: 17px;font-weight: bold;">用户详情页</div>
						<div class="a22">返回</div>
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
							<div>张三</div>
						</div>
						<div></div>
						<div style="display: flex;">
							<div style="width: 100px;text-align: right;margin-right: 20px;color: #4e5969;">注册日期：</div>
							<div>2020-02-12</div>
						</div>
						<div style="display: flex;">
							<div><MessageFilled style="color: #00d521;font-size: 17px;margin-right: 10px;" /></div>
							<div>聊天状态：</div>
							<div><a-switch v-model:checked="checkedOne" size="small" /></div>
						</div> 
						<div style="display: flex;">
							<div style="width: 100px;text-align: right;margin-right: 20px;color: #4e5969;">手机号：</div>
							<div>18288228374</div>
						</div>
						<div></div>
						<div style="display: flex;">
							<div style="width: 100px;text-align: right;margin-right: 20px;color: #4e5969;">推荐官状态：</div>
							<div>未开通</div>
						</div>
						<div style="display: flex;">
							<div><CloseCircleFilled style="color: #ff0000;font-size: 17px;margin-right: 10px;" /></div>
							<div>聊天状态：</div>
							<div><a-switch v-model:checked="checkedTwo" size="small" /></div>
						</div>
						<div style="display: flex;">
							<div style="width: 100px;text-align: right;margin-right: 20px;color: #4e5969;">商家状态：</div>
							<div>已开通</div>
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
									<div class="a47">{{Number(21313).toLocaleString()}}</div>
								</div>
							</div>
							<div class="a44">
								<div class="a45">
									<AuditOutlined class="a46" />
								</div>
								<div>
									<div>积分余额</div>
									<div class="a47">{{Number(21313).toLocaleString()}}</div>
								</div>
							</div>
							<div class="a44">
								<div class="a45">
									<AuditOutlined class="a46" />
								</div>
								<div>
									<div>总消费额</div>
									<div class="a47">{{Number(21313).toLocaleString()}}</div>
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
									<div class="a47">{{Number(21313).toLocaleString()}}</div>
								</div>
							</div>
							<div class="a44">
								<div class="a45">
									<AuditOutlined class="a46" />
								</div>
								<div>
									<div>总收益</div>
									<div class="a47">{{Number(21313).toLocaleString()}}</div>
								</div>
							</div>
							<div class="a44">
								<div class="a45">
									<AuditOutlined class="a46" />
								</div>
								<div>
									<div>收益余额</div>
									<div class="a47">{{Number(21313).toLocaleString()}}</div>
								</div>
							</div>
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
							<a-input placeholder="请输入订单编号" class="a82" style="border:none;border-radius: 4px;"></a-input>
						</div>
					</div>
					<div class="a81">
						<div>订单状态</div>
						<div>
							<a-select ref="select" v-model:value="value1" class="a83" >
								<a-select-option value="jack">Jack</a-select-option>
								<a-select-option value="lucy">Lucy</a-select-option>
								<a-select-option value="disabled" disabled>Disabled</a-select-option>
								<a-select-option value="Yiminghe">yiminghe</a-select-option>
							</a-select>
						</div>
					</div>
					<div class="a81">
						<div>流水时间</div>
						<div>
							<a-range-picker v-model:value="value1" class="a82" style="border:none;border-radius: 4px;" />
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
					<div v-for="item in [1,2,3,4,5,6,7,8,9]" :key="item" class="a89">
						<div class="w5_100" style="color: #40a9ff;">查看详情</div>
						<div class="w10_100">QW12313123123</div>
						<div class="w5_100">待支付</div>
						<div class="w5_100">653.22</div>
						<div class="w30_100">充电宝（5000ml红色）、夏季男性polo衫（卡其色）好货榜单top1...</div>
						<div class="w15_100">2001-11-11 12:12</div>
						<div class="w5_100">张三</div>
						<div class="w10_100">18481020022</div>
						<div class="w15_100">中央花园二七a懂7811B</div>
					</div>
					<div class="a90">
						<div></div>
						<div class="a91">
							<div class="a92">共 898 项数据</div>
							<a-pagination v-model:current="current" :total="5000" show-less-items :showSizeChanger="false" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.w30_100{
		width: 30%;
	}
	.w25_100{
		width: 25%;
	}
	.w20_100{
		width: 20%;
	}
	.w15_100{
		width: 15%;
	}
	.w10_100{
		width: 10%;
	}
	.w5_100{
		width: 5%;
	}
	::v-deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
		background-color: #f7f8f9;
		border:none;
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