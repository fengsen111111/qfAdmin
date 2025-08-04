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
		id: '',
		is_platform: localStorage.getItem("storeId") == '1' ? 'Y' : 'N',
		data_type: null,//	a 商品   b 作品  
		data_id: null,
		data_id_two: null,
		power_level_id: null,
		number: '',
		adcode: null,
		page_type: null,//a首页曝光  b社区曝光  c我的  需要注意商品只有a,c  作品只有a,b  
	});
	const formRef = ref(null);

	function reset() {
		console.log('重置');
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
	async function submit() {
		try {
			const values = await formRef.value.validateFields();
			console.log('values', values);
			global.Modal.confirm({
				title: global.findLanguage("确定要提交吗？"),
				okText: global.findLanguage("确定"),
				cancelText: global.findLanguage("取消"),
				okType: "primary",
				onOk: function () {
					global.axios
						.post('decoration/Power/editPower', {
							id: '',
							is_platform: localStorage.getItem("storeId") == '1' ? 'Y' : 'N',
							data_type: values.data_type,
							data_id: values.data_type == 'b' ? formState.data_id_two : formState.data_id,
							power_level_id: values.power_level_id,
							number: values.number,
							adcode: values.data_type == 'a' ? '0' : formState.adcode[formState.adcode.length-1],//省/市的adcode  全国就传0  
							page_type: values.page_type
						}, global)
						.then((res) => {
							// console.log('提交结果', res);
							_shopInfo()
							global.Modal.confirm({
								title: global.findLanguage(
									"是否需要返回上一页？"
								),
								okText: global.findLanguage("确定"),
								cancelText: global.findLanguage("取消"),
								okType: "primary",
								onOk: function () {
									emit("closeChildPage", pageData.page_key);
								},
							});
						});
				},
			});
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
			pageSize: 200,
			store_id: localStorage.getItem('storeId')
		}, global, true).then((res) => {
			console.log('获取自己商品列表', res.list);
			shopList.value = res.list
		})
	}
	//获取平台商品列表
	function _pcshopList() {
		global.axios.post('decoration/Goods/findTableRecords', {
			currentPage: 1,
			pageSize: 200,
			store_id: localStorage.getItem('storeId')
		}, global, true).then((res) => {
			console.log('获取平台商品列表', res.list);
			shopList.value = res.list.map((item) => {
				if (item.status == 'Y') {
					return item
				}
			})
		})
	}
	const twList = ref([]) //图文列表
	//获取平台图文列表
	function _twList() {
		global.axios.post('decoration/Article/findTableRecords', {
			currentPage: 1,
			pageSize: 200,
			store_id: localStorage.getItem('storeId')
		}, global, true).then((res) => {
			console.log('平台图文', res);
			twList.value = []
			res.list.map((item) => {
				if (item.check_status == 'b') {
					twList.value.push(item)
				}
			})
			console.log('获取平台图文列表', twList.value);
		})
	}
	if (formState.is_platform == 'Y') {
		console.log('平台');
		_pcshopList()
		_twList()
	} else {
		console.log('商家');
		_shopList()
	}
	// 热区跳转
	function rqtz(key1, key2, key3) {
		emit("djtzmk", key1, key2, key3);
	}
	const shopObj = ref({})//店铺信息
	// 店铺信息
	function _shopInfo() {
		shopObj.value = {}
		console.log('店铺信息');
		global.axios.post('decoration/Store/webGetStoreInfo', {
			store_id: localStorage.getItem('storeId')
		}, global)
			.then(res => {
				console.log('店铺数据', res);
				shopObj.value = res
			})
	}
	_shopInfo()

	const treeData = ref([])//行政区数据
	function getAreas() {
		global.axios
			.post('factory_system/Base/getAreas', {}, global)
			.then((res) => {
				treeData.value = removeThirdLevel(res.areas)
				treeData.value.unshift({
					adcode: "0",
					children: [],
					id: "0",
					label: "全国",
					value: "0",
				})
				// console.log('行政区数据1', treeData.value);
			});
	}
	getAreas()

	// 保留省市数据 去除区
	function removeThirdLevel(data) {
		return data.map(province => {
			const cleanedProvince = {
				id: province.id,
				value: province.adcode,
				label: province.label,
				adcode: province.adcode
			};
			if (province.children && Array.isArray(province.children)) {
				cleanedProvince.children = province.children.map(city => ({
					id: city.id,
					value: city.adcode,
					label: city.label,
					adcode: city.adcode
					// ❌ 不保留 city.children
				}));
			}
			return cleanedProvince;
		});
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
			<a-form :model="formState" name="basic" :label-col="{ span: 3 }" :wrapper-col="{ span: 6 }" ref="formRef">
				<a-form-item label="曝光类型" name="data_type" :rules="[{ required: true, message: '请选择!' }]">
					<a-select ref="select" @change="()=>{formState.page_type = null;formState.data_id=null;}"
						v-model:value="formState.data_type" placeholder="请选择!">
						<a-select-option key="a" value="a">商品</a-select-option>
						<a-select-option v-if="formState.is_platform=='Y'" key="b" value="b">作品</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="曝光位置" name="page_type" :rules="[{ required: true, message: '请选择!' }]">
					<a-select ref="select" v-model:value="formState.page_type" placeholder="请选择!">
						<a-select-option key="a" value="a">首页曝光</a-select-option>
						<a-select-option key="b" v-if="formState.data_type=='b'" value="b">社区曝光</a-select-option>
						<a-select-option key="c" v-else value="c">我的页面</a-select-option>
					</a-select>
				</a-form-item>

				<a-form-item label="曝光档次" name="power_level_id" :rules="[{ required: true, message: '请选择!' }]">
					<a-select ref="select" v-model:value="formState.power_level_id" placeholder="请选择!">
						<a-select-option v-for="item in bgdj" :key="item.id"
							:value="item.id">{{item.name}}</a-select-option>
					</a-select>
				</a-form-item>

				<a-form-item label="曝光次数" name="number" :rules="[{ required: true, message: '请输入曝光次数!' }]">
					<a-input v-model:value="formState.number" placeholder="请输入曝光次数!"
						@input="formState.number = $event.target.value.replace(/\D/g, '')" />
				</a-form-item>
				<!-- v-show="formState.data_type == 'b'" -->
				<a-form-item  label="曝光地区" name="adcode" :rules="[{ required: true, message: '请选择地区!' }]">
					<a-cascader v-model:value="formState.adcode" :change-on-select="true" :options="treeData" placeholder="请选择地区" />
				</a-form-item>
				<a-form-item v-show="formState.data_type=='b'" label="曝光作品" name="data_id_two">
					<a-select ref="select" v-model:value="formState.data_id_two" placeholder="请选择!">
						<a-select-option v-for="item in twList" :key="item.id"
							:value="item.id">{{item.title}}</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item v-show="formState.data_type=='a'" label="曝光商品" name="data_id">
					<a-select ref="select" v-model:value="formState.data_id" placeholder="请选择!">
						<a-select-option v-for="item in shopList" :key="item.id"
							:value="item.id">{{item.name}}</a-select-option>
					</a-select>
				</a-form-item>

				<div style="height: 20px;"></div>
			</a-form>
			<div style="height: 1px;background-color: #f5f5f5;"></div>
			<div style="height: 40px;"></div>

			<div style="margin-left: 8%;">
				<div>
					本次预计消耗：
					<span style="color: red;">
						<span v-if="!formState.power_level_id">计算中</span>
						<span v-else>
							<span v-for="item in bgdj" :key="item.id">
								<span v-if="item.id == formState.power_level_id">
									{{item.power*formState.number?item.power*formState.number+'曝光量':'计算中'}}
								</span>
							</span>
						</span>
					</span>
				</div>
				<div style="margin-left: 14px;" v-if="formState.is_platform == 'N'">
					<span>剩余曝光量：<span>{{shopObj.power}} </span> 曝光量</span>
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