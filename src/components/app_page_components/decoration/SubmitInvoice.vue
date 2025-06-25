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

	// f商家服务费日志a
	function getStoreMoneyLogList() {
		global.axios
			.post('decoration/MoneyLog/getStoreMoneyLogList', {}, global)
			.then((res) => {
				console.log('f商家服务费日志a', res);
			});
	}
	getStoreMoneyLogList()
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
			21312312312
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