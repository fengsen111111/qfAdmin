<script setup>
	import {
		inject,
		onBeforeMount,
		reactive,
		ref,
		watch,
	} from "vue";
	import {
		message
	} from 'ant-design-vue';

	import {
		ExclamationCircleOutlined,
		CheckCircleOutlined,
		CloseCircleOutlined
	} from "@ant-design/icons-vue";

	let props = defineProps(["pageData"]);
	const pageData = props.pageData;

	const global = inject("global").value;


</script>

<template>
	<!--搜索-->
	<div>
		<div class="table-header">
			<div>
				<a-button class="iconfont button-class" style="font-size: 18px !important; padding: 0 10px; float: left"
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
			<div>数据ID</div>
			<div>曝光档次</div>
			<div>曝光次数</div>
			<hr>
			<div>
				本次预计消耗：100曝光量
			</div>
			<div>
				剩余曝光量：9999   去充值
			</div>
		</div>
	</div>
	<!--导出-->
</template>

<style lang="less" scoped>
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
		margin-right: 10px;
	}

	.warning {
		color: red;
		margin-top: -10px;
		margin-bottom: 2px;
		display: block;
	}
</style>