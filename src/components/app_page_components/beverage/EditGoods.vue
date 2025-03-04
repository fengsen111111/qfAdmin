<script setup>
	import {
		ref,
		inject,
		reactive,
		onMounted
	} from 'vue'
	import {
		getCurrentInstance
	} from "vue"
	import tabsOne from './components/tabsOne.vue'
	import tabsTwo from './components/tabsTwo.vue'
	// import tabsThree from './components/tabsThree.vue'

	const {
		proxy
	} = getCurrentInstance();

	let tabsOneRef = ref(null)
	let tabsTwoRef = ref(null)
	let spinning = ref(false) //加载状态

	const global = inject('global').value

	let activeKey = ref('1')
	let props = defineProps(["pageData"]);
	const pageData = props.pageData;
	console.log('props数据', props.pageData.data);

	const handleTj = () => {
		// console.log('提交数据', proxy.$refs.tabsOneRef.checkedList);
		const one = proxy.$refs.tabsOneRef.formState
		console.log('提交数据', proxy.$refs.tabsTwoRef.guigeList);
		const two = proxy.$refs.tabsTwoRef.guigeList
		let post_params = {
			// id:'',//商品ID //新增不要
			goods_type_id: one.goods_type_id, //商品分类ID
			name: one.name, //商品名称 
			introduce: one.introduce, //摘要  
			cover_image: one.cover_image,//封面图
			content: proxy.$refs.tabsOneRef.component_state.myValue, //详情  
			level_one: one.level_one, //一级规格ID  
			level_two: one.level_two, // 二级规格ID  
			level_changes: one.level_changes, //规格换算  
			attributes: one.attributes.map((item) => {
				return {
					goods_attribute_id: item.goods_attribute_id,
					value: item.value
				}
			}), //商品参数
			services: proxy.$refs.tabsOneRef.checkedList, //商品服务ID
			goods_tastes: two.map((iss) => {
				return {
					id: iss.id ? iss.id : '',
					name: iss.name,
					volume: iss.volume,
					cover_image: iss.cover_image,
					images: iss.images,
					order: iss.order,
					taste_size: iss.tastList.map((arr) => {
						return {
							id: arr.id ? arr.id : '',
							name: arr.name,
							has_number: arr.has_number,
							order: arr.order,
							show_pop: arr.show_pop ? 'Y' : 'N',
							show_list: arr.show_list ? 'Y' : 'N',
							ice_size: arr.ice_size ? 'Y' : 'N',
							is_rate: arr.is_rate ? 'Y' : 'N',
							price: arr.price,
							old_price: arr.old_price,
						}
					})
				}
			}), //商品口味 
		}
		// console.log('post_params', post_params);
		if (props.pageData.data.id) {
			// 有id就是编辑,把id添加进去
			post_params.id = props.pageData.data.id
			console.log('编辑数据', post_params);
		}

		addShop(post_params)
	}
	const addShop = (post_params) => {
		console.log('数据', post_params)
		// return false
		spinning.value = true
		global.axios
			.post('beverage/Goods/addGoods', post_params, global)
			.then((res) => {
				console.log('新增编辑商品', res);
				spinning.value = false
				global.Modal.confirm({
					title: global.findLanguage(
						"是否需要返回上一页？"
					),
					okText: global.findLanguage("确定"),
					cancelText: global.findLanguage("取消"),
					okType: "primary",
					onOk: function () {
						emit("closeChildPage", pageData.page_key);//编辑完成后返回上一页
					},
				});
			});
	}
	let emit = defineEmits(["openChildPage", "closeChildPage"]);
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
	function loading() {
		spinning.value = true
		setTimeout(() => {
			spinning.value = false
		}, 1000);
	}
	function reset() {
		global.Modal.confirm({
			title: global.findLanguage("该操作会导致未保存的数据丢失，请谨慎操作！"),
			okText: global.findLanguage("确定"),
			cancelText: global.findLanguage("取消"),
			okType: "primary",
			onOk: function () {
				console.log('重置');
				proxy.$refs.tabsOneRef._shopDetails()
				proxy.$refs.tabsTwoRef._shopDetailsTwo()
				loading()//加载
			},
		});
	}

</script>

<template>
	<div class="auto">
		<a-spin :spinning="spinning">
			<div class="wcdiv">
				<div style="display: flex;align-items: center;">
					<a-button v-show="pageData.hasOwnProperty('parent_page_key')" class="iconfont button-class"
						style="font-size: 18px !important; padding: 0 10px; float: left;margin-right: 20px;"
						@click="closeChildPage(pageData.page_key)">&#xe6d2;
					</a-button>
					<div class="spbj">商品编辑
					</div>
				</div>
				<div class="flex">
					<div class="tjBtn" @click="handleTj">提交</div>
					<div class="cz" @click="reset">重置</div>
				</div>
			</div>

			<tabsOne :shopId="props.pageData.data.id" ref="tabsOneRef" />
			<div class="jbxx">口味规格信息</div>
			<tabsTwo :shopId="props.pageData.data.id" ref="tabsTwoRef" />
		</a-spin>

	</div>
</template>


<style>
	.jbxx {
		background-color: #f5F5F5;
		padding: 10px 20px;
		width: 100%;
		margin-bottom: 20px;
		font-weight: bold;
	}

	.auto {
		overflow: auto;
		height: 100%;
	}

	.wcdiv {
		display: flex;
		justify-content: space-between;
		margin-bottom: 10px;
	}

	.spbj {
		color: #1890ff;
		font-weight: bold;
	}

	.cz {
		background-color: #f97425;
		color: white;
		padding: 5px 20px;
		border-radius: 5px
	}

	.flex {
		display: flex;
	}

	.tjBtn {
		margin-right: 20px;
		background-color: #0ccd00;
		color: white;
		padding: 5px 20px;
		border-radius: 5px;
	}

	.table_one {
		border-collapse: collapse;
		border: 1px solid rgb(140 140 140);
		font-family: sans-serif;
		font-size: 0.8rem;
		letter-spacing: 1px;
		text-align: center;
	}

	.table_two {
		border-collapse: collapse;
		border: 2px solid #1890ff;
		font-family: sans-serif;
		font-size: 0.8rem;
		letter-spacing: 1px;
		text-align: center;
	}

	.table_one th,
	td {
		border: 1px solid #e9e9e9;
		padding: 10px 60px;
	}

	.table_two th,
	td {
		border: 1px solid #e9e9e9;
		padding: 10px 20px;
	}

	td:last-of-type {
		text-align: center;
	}

	.ant-tabs-card>.ant-tabs-nav .ant-tabs-tab-active,
	.ant-tabs-card>div>.ant-tabs-nav .ant-tabs-tab-active {
		background: #1890ff !important;
		color: white !important;
	}


	.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
		text-shadow: 0 0 0.25px currentcolor;
		color: white !important;
	}

	.ant-tabs-tab {
		position: relative;
		display: inline-flex;
		align-items: center;
		padding: 12px 0;
		font-size: 14px;
		background: transparent;
		border: 0;
		outline: none;
		cursor: pointer;
		margin-right: 20px !important;
		background: white !important;
		font-weight: bold;
		border: 2px solid #f5f5f5 !important;
		border-radius: 10px 10px 0px 0px !important;
	}
</style>