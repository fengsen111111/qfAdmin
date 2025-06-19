<script setup>
	import { inject, onBeforeMount, reactive } from "vue";

	let props = defineProps(["pageData"]);
	const pageData = props.pageData;
	let emit = defineEmits(["openChildPage", "closeChildPage","djtzmk"]);

	const global = inject("global").value;

	function closeChildPage(page_key) {
		global.Modal.confirm({
			title: global.findLanguage(
				"确定要返回吗？该操作会导致未保存的数据丢失，请谨慎操作！"
			),
			okText: global.findLanguage("确定"),
			cancelText: global.findLanguage("取消"),
			okType: "primary",
			onOk: function () {
				console.log('返回按钮');
				emit("djtzmk",'商家信息','商家资料');
			},
		});
	}


	//重置
	function reset() {
		global.Modal.confirm({
			title: global.findLanguage("该操作会导致未保存的数据丢失，请谨慎操作！"),
			okText: global.findLanguage("确定"),
			cancelText: global.findLanguage("取消"),
			okType: "primary",
			onOk: function () {
				console.log('重置');
			},
		});
	}

	//提交
	function submit() {
		global.Modal.confirm({
			title: global.findLanguage("确定要提交吗？"),
			okText: global.findLanguage("确定"),
			cancelText: global.findLanguage("取消"),
			okType: "primary",
			onOk: function () {
				console.log('提交');
			},
		});
	}
</script>

<template>
	<div class="table-header">
		<div>
			<a-button v-show="pageData.hasOwnProperty('parent_page_key')" class="iconfont button-class"
				style="font-size: 18px !important; padding: 0 10px; float: left"
				@click="closeChildPage(pageData.page_key)">&#xe6d2;
			</a-button>
			<a-button class="button-class button-success" style="float: left" type="primary" @click="submit">
				{{ global.findLanguage("提交") }}
			</a-button>
			<a-button class="button-class button-warning" style="float: left" type="primary" @click="reset">
				{{ global.findLanguage("重置") }}
			</a-button>
		</div>
	</div>
	<div class="table">
		修改商家信息
	</div>
</template>

<style scoped>
	.table-header {
		height: 30px;
		line-height: 30px;
		margin-bottom: 10px;
		display: flex;
		justify-content: space-between;
	}

	.table {
		height: calc(100vh - 176px) !important;
		overflow-y: auto;
		border-bottom: 1px solid #f0f0f0;
		border-top: 1px solid #f0f0f0;
	}

	.button-class {
		margin-left: 5px;
		margin-right: 5px;
	}

	.warning {
		color: red;
		margin-top: -10px;
		margin-bottom: 2px;
		display: block;
	}
</style>