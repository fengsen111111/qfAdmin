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
		<div>
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
						<div>店铺详情页</div>
						<div class="a22">返回</div>
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