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
	let emit = defineEmits(["openChildPage", "closeChildPage", "djtzmk"]);

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
	const formState = reactive({
		key1: '',
		key2: null,
		key3: '',
	});
	const formRef = ref(null);

	function reset() {
		console.log('重置');
	}
	async function submit() {
		try {
			const values = await formRef.value.validateFields();
			console.log('values', values);

		} catch (errorInfo) {
			console.log('Failed:', errorInfo);
		}
	}
	const bgdj = ref([])
	// 曝光等级
	function bgdjList() {
		global.axios
			.post('decoration/PowerLevel/getPowerLevelList', {
				type: 'goods',
			}, global)
			.then((res) => {
				console.log('结果', res.list);
				bgdj.value = res.list
			});
	}
	bgdjList()
	const shopList = ref([]) //商品列表
	//获取自己商品列表
	function _shopList() {
		global.axios.post('decoration/Goods/getGoodsList', {
			currentPage: 1,
			pageSize: 100,
			store_id: localStorage.getItem('storeId')
		}, global, true).then((res) => {
			console.log('获取自己商品列表', res.list);
			shopList.value = res.list
		})
	}
	_shopList()
	// 热区跳转
	function rqtz(key1, key2, key3) {
		emit("djtzmk", key1, key2, key3);
	}


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
			<div style="height: 40px;"></div>
			<a-form :model="formState" name="basic" :label-col="{ span: 2 }" :wrapper-col="{ span: 6 }" ref="formRef">
				<a-form-item label="曝光商品" name="key1" :rules="[{ required: true, message: '请选择!' }]">
					<a-select ref="select" v-model:value="formState.key1" placeholder="请选择!">
						<a-select-option v-for="item in shopList" :key="item.id"
							:value="item.id">{{item.name}}</a-select-option>
					</a-select>
				</a-form-item>

				<a-form-item label="曝光档次" name="key2" :rules="[{ required: true, message: '请选择!' }]">
					<a-select ref="select" v-model:value="formState.key2" placeholder="请选择!">
						<a-select-option v-for="item in bgdj" :key="item.id"
							:value="item.id">{{item.name}}</a-select-option>
					</a-select>
				</a-form-item>

				<a-form-item label="曝光次数" name="key3" :rules="[{ required: true, message: '请输入曝光次数!' }]">
					<a-input v-model:value="formState.key3" placeholder="请输入曝光次数!"
						@input="formState.key3 = $event.target.value.replace(/\D/g, '')" />
				</a-form-item>
				<div style="height: 20px;"></div>
			</a-form>
			<div style="height: 1px;background-color: #f5f5f5;"></div>
			<div style="height: 40px;"></div>

			<div style="margin-left: 8%;">
				<div>
					本次预计消耗：<span style="color: red;">
						<span v-for="item in bgdj" :key="item.id">
							<span
								v-if="item.id == formState.key2">{{item.power*formState.key3?item.power*formState.key3+' 曝光量':'计算中'}}</span>
						</span>
					</span>
				</div>
				<div style="margin-left: 14px;">
					<span>剩余曝光量：<span>999 </span> 曝光量</span>
					<a-button type="primary" @click="rqtz('商家信息','商家资料')" style="margin-left: 100px;">去充值</a-button>
				</div>
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