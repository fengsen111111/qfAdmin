<script setup>
	import { inject, onBeforeMount, reactive, ref, watch, shallowRef } from "vue";
	import { Row, Col } from 'ant-design-vue';
	import { ClockCircleFilled, DownOutlined, CloseCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";

	import { message } from 'ant-design-vue';
	import { useRoute } from 'vue-router';
	const route = useRoute();
	let props = defineProps(["pageData"]);
	const pageData = props.pageData;
	const global = inject("global").value;

	let emit = defineEmits(["openChildPage", "closeChildPage", "toShopDetails", "djtzmk"]);

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
	// 商家提交开票
	function _submitInvoice(item) {
		global.axios
			.post('decoration/Invoices/submitInvoice', {
				type: 'other',//all全部 other部分  
				money_log_ids: item.id,//选中的要开票的服务日志ID type为全部时传空
			}, global)
			.then((res) => {
				console.log('商家提交开票', res);
			});
	}
	// 全部开票
	function allKp(){
		global.axios
			.post('decoration/Invoices/submitInvoice', {
				type: 'all',//all全部 other部分  
				money_log_ids: "",//选中的要开票的服务日志ID type为全部时传空
			}, global)
			.then((res) => {
				console.log('商家提交开票', res);
			});
	}
    const page = ref(1)
    const limit = ref(10)
	// 商家服务费日志
	function getStoreMoneyLogList() {
		global.axios
			.post('decoration/MoneyLog/getStoreMoneyLogList', {
				currentPage:page.value,
				perPage:limit.value,
			}, global)
			.then((res) => {
				console.log('商家服务费日志', res);
				dataSource.value = res.list
			});
	}
	getStoreMoneyLogList()

	const dataSource = ref([
		// {
		// 	id: '1',
		// 	create_time: '2022-12-12 12:12:12',
		// 	type: 'j',
		// 	trans_amt: '10.00',
		// 	has_invoice: 'Y',
		// },
		// {
		// 	id: '2',
		// 	create_time: '2022-12-12 12:12:12',
		// 	type: 'q',
		// 	trans_amt: '10.00',
		// 	has_invoice: 'N',
		// },
	])

	const columns = [
		{
			title: '操作',
			dataIndex: 'action',
			key: 'action',
		},
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
		},
		{
			title: '类型',
			dataIndex: 'type',
			key: 'type',
		},
		{
			title: '是否可以开发票',
			dataIndex: 'has_invoice',
			key: 'has_invoice',
		},
		{
			title: '发生时间',
			dataIndex: 'create_time',
			key: 'create_time',
		},
		{
			title: '金额',
			dataIndex: 'trans_amt',
			key: 'trans_amt',
		},
	]
</script>

<template>
	<!--搜索-->
	<div>
		<div class="a2">
			<a-button v-show="pageData.hasOwnProperty('parent_page_key')" class="iconfont button-class a3"
				@click="closeChildPage(pageData.page_key)">&#xe6d2;
			</a-button>
			<div style="font-size: 18px;">发票</div>
		</div>
		<div>
			<a-popconfirm title="确定要执行操作吗?" @confirm="allKp" >
				<a-button class="editable-add-btn" style="margin-bottom: 8px">全部开票</a-button>
			</a-popconfirm>
			<a-table :dataSource="dataSource" :columns="columns">
				<template #bodyCell="{ column, record }">
					<template v-if="column.key == 'type'">
						<span v-if="record.type=='j'">购买曝光量</span>
						<span v-else-if="record.type=='q'">订单服务费</span>
					</template>
					<template v-else-if="column.key == 'has_invoice'">
						<span v-if="record.has_invoice=='Y'" style="color: green;">可以</span>
						<span v-else-if="record.has_invoice=='N'" style="color: red;">不可以</span>
					</template>
					<template v-else-if="column.key == 'action'">
						<a-popconfirm title="确定要执行操作吗?" @confirm="_submitInvoice(record)">
							<span v-if="record.has_invoice=='Y'" style="cursor: pointer;color: #1890FF;">开票</span>
						</a-popconfirm>

					</template>
				</template>
			</a-table>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.a2 {
		display: flex;
		align-items: center;
		margin-bottom: 20px;
	}

	.a3 {
		font-size: 18px !important;
		padding: 0 10px;
		float: left;
		margin-right: 20px;
	}
</style>