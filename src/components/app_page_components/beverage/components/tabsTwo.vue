<script setup>
	import {
		ref,
		inject,
		reactive
	} from 'vue'
	const global = inject('global').value
	import { message } from 'ant-design-vue';
	import { CloseCircleOutlined } from '@ant-design/icons-vue'

	const props = defineProps({
		shopId: {
			type: String,
		}
	});
	console.log('props传值id', props.shopId);

	const _shopDetailsTwo = () => {
		global.axios
			.post('beverage/Goods/getGoods', {
				id: props.shopId
			}, global)
			.then((res) => {
				// console.log('商品数据', res);
				guigeList.value = []
				res.goods_tastes.map((item) => {
					guigeList.value.push({
						id: item.id,
						name: item.name,
						volume: item.volume,
						cover_image: item.cover_image,
						images: item.images,
						order: item.order, //新增口味排序
						// is_mrkw: item.is_mrkw, //新增是否默认
						// tastList: item.taste_size //规格list
						tastList: item.taste_size.map((iss) => {
							return {
								id: iss.id,
								name: iss.name, //口味规格名称  
								has_number: iss.has_number, //包含二级规格数量
								order: iss.order, // 排序
								show_pop: iss.show_pop == 'Y' ? true : false, //首页推荐
								show_list: iss.show_list == 'Y' ? true : false, //首页推荐
								ice_size: iss.ice_size == 'Y' ? true : false, //支持冰冻
								is_rate: iss.is_rate == 'Y' ? true : false, //	 支持折扣
								price: iss.price, //二级规格售卖单价  
								old_price: iss.old_price, //二级规格售卖价
							}
						})
					})
				})
			});
	}
	if (props.shopId) {
		// 编辑商品
		_shopDetailsTwo()
	}

	let dangqianIndex = ref(0)
	const changeIndex = (index) => {
		console.log('当前点击的口味下标', index);
		dangqianIndex.value = index
	}
	// 上传
	function upload(options) {
		console.log('option', options);
		global.file.uploadFile(global, options.file, 'image', 'shopImg', true, complete)
	}
	// 封面图
	function complete(response) {
		console.log('guigeList.value[dangqianIndex.value]', guigeList.value[dangqianIndex.value]);
		guigeList.value[dangqianIndex.value].cover_image = response.url
	}

	function remove(index) {
		console.log('删除');
		guigeList.value[index].cover_image = ''
	}

	let uploadQueue = []; // 保存要上传的文件
	let isUploading = false; //用于指示上传进度的标志
	function uploadList(options) {
		uploadQueue.push(options);
		if (!isUploading) {
			processQueue();
		}
	}
	async function processQueue() {
		isUploading = true;
		while (uploadQueue.length > 0) {
			const currentOptions = uploadQueue.shift(); // 从队列中删除第一个文件
			try {
				// 等待当前文件上传
				await uploadFileWrapper(global, currentOptions.file, 'image', 'shopImg', true, completeList);
				console.log('上传成功');
			} catch (error) {
				console.log('上传失败');
			}
		}
		isUploading = false; // 队列处理完成时重置标志
	}
	function uploadFileWrapper(global, file, type, category, flag, callback) {
		return new Promise((resolve, reject) => {
			global.file.uploadFile(global, file, type, category, flag, (err, result) => {
				if (err) reject(err);
				else resolve(result);
				// console.log('err',err);
				// console.log('result',result);
				completeList(err)
			});
		});
	}

	// 相册
	function completeList(response) {
		guigeList.value[dangqianIndex.value].images.push(response.url)
	}
	function removeList(index, index_two) {
		console.log('删除', index, index_two);
		guigeList.value[index].images.splice(index_two, 1)
	}
	let formStateTwo = ref({}) //口味规格信息所有数据
	let guigeList = ref([])
	let addName = ref('') //新增口味名称
	const handleAddKouWei = () => {
		if (!addName.value) {
			message.error('请输入口味');
			return false
		}
		guigeList.value.push({
			id: '',
			name: addName.value,
			order: 1, //新增口味排序 默认给1
			// is_mrkw: false, //新增是否默认
			volume: 500,//二级规格容量
			cover_image: '',//
			images: [],
			tastList: [] //规格list
		})
		addName.value = '' //新增结束置空
	}
	let kwggmc = ref('')
	// 添加规格
	const handRuleAdd = (index) => {
		console.log('kwggmc', kwggmc.value);
		if (!kwggmc.value) {
			message.error('请输入规格');
			return false
		}
		guigeList.value[index].tastList.push({
			id: '',
			name: kwggmc.value, //口味规格名称  
			has_number: '', //包含二级规格数量
			order: '', // 排序
			show_pop: '', // 是否首页弹窗展示
			show_list: '', //首页推荐
			ice_size: '', //支持冰冻
			is_rate: '', //	 支持折扣
			price: '', //二级规格售卖单价  
			old_price: '', //二级规格售卖价
		})
		kwggmc.value = ''//清空当前口味规格名称  
	}
	// 删除口味规格
	const handleDelTable = (index) => {
		guigeList.value[index].tastList = []
	}
	const handleDelTableItem = (index, tast_index) => {
		guigeList.value[index].tastList.splice(tast_index, 1)
	}
	// 删除口味
	const handleDel = (index) => {
		guigeList.value.splice(index, 1)
		console.log('guigeList.value', guigeList.value);
	}
	// 是否默认切换
	const mrChange = (mr_index) => {
		// console.log(mr_index);
		// console.log(guigeList.value[mr_index]);
		guigeList.value.map((item, index) => {
			if (mr_index !== index) {
				item.is_mrkw = false
			}
		})
	}
	const isNameKw = ref(false)
	// 修改口味名称
	function handEditName() {
		isNameKw.value = !isNameKw.value
	}
	// 暴露出去
	defineExpose({
		guigeList,
		_shopDetailsTwo
	})
</script>


<template>
	<div class="auto">
		<a-form :model="formStateTwo" :label-col="{style: {width: '120px'}}" :wrapper-col="{sapn:14}">
			<a-row>
				<a-col :span="13">
					<a-form-item label="添加口味">
						<div class="tjkw">
							<a-input v-model:value="addName" style="width: 300px" placeholder="请输入添加口味" />
							<div class="xzkw" @click="handleAddKouWei">
								新增口味</div>
						</div>
					</a-form-item>
				</a-col>
				<a-col :span="24">
					<a-form-item label="添加规格">
						<div v-for="(item,index) in guigeList" :key="index" class="mb20">
							<div class="flexCenter">
								<div class="klw">
									<div v-if="!isNameKw">{{item.name}}</div>
									<a-input style="width: 120px;" v-else v-model:value="item.name" placeholder="请输入" />
									<div style="margin-left: 10px;">
										<CloseCircleOutlined @click="handleDel(index)" />
									</div>
								</div>
								<div class="zjgg" @click="handEditName()">
									修改口味名称</div>
								<div style="display: flex;margin-right: 10px;">
									<div class="pxSolt">口味排序</div>
									<div class="">
										<a-input v-model:value="item.order" onkeyup="value=value.replace(/[^\d]/g,'')"
											style="width: 35px;border-radius:  0px 5px 5px 0px;" class=" col67f"
											placeholder="" />
									</div>
								</div>
								<div style="display: flex;margin-right: 10px;">
									<div class="pxSolt">二级规格容量</div>
									<div class="">
										<a-input v-model:value="item.volume" onkeyup="value=value.replace(/[^\d]/g,'')"
											style="width: 70px;border-radius:  0px 5px 5px 0px;" class=" col67f"
											placeholder="" />
									</div>
								</div>
								<div v-if="item.tastList" class="flex">
									<div class="itemGuige" v-for="(tast,tast_index) in item.tastList" :key="tast_index">
										<div style="align-items: center;display: flex;">{{tast.name}}
											<div style="margin-left: 10px;">
												<CloseCircleOutlined @click="handleDelTableItem(index,tast_index)" />
											</div>
										</div>
									</div>
								</div>

								<a-input style="width: 150px;margin-right: 10px;" v-model:value="kwggmc"
									placeholder="输入商品规格容量" />
								<div class="zjgg" @click="handRuleAdd(index)">
									添加规格</div>

								<!-- <a-radio v-model:checked="item.is_mrkw" @change="mrChange(index)">是否为商品默认口味</a-radio> -->
								<!-- 	<div class="scgg" @click="handleDelTable(index)">
									删除当前口味下所有规格</div> -->
							</div> 
							<div class="flexTop">
								<div class="flex">
									<div class="relative">
										<img v-if="item.cover_image" :src="item.cover_image" class="imgAll" />
										<div v-else>
											<img src="https://beverage-upload.oss-cn-chengdu.aliyuncs.com/shopImg/2025218/f2p8e9plgw8oigtotgmj4isg6w4brepj.png"
												class="imgAll" alt="">
										</div>
										<div v-if="item.cover_image" @click="remove(index)" class="imgClose"
											style="margin-left: 10px;">
											<CloseCircleOutlined />
										</div>
									</div>
									<div class="bold">
										<div>规格封面图</div>
										<div class="flexR10">建议尺寸 <div class="colred">340X340</div>
										</div>
										<div class="xztp">
											<a-upload :customRequest="upload" @change="changeIndex(index)"
												:file-list="[]" list-type="text">
												选择图片
											</a-upload>
										</div>
									</div>
								</div>
								<div class="flexL20">
									<div class="relative" v-for="(iss,index_two) in item.images" :key="index_two">
										<img :src="iss" class="imgAll" alt="">
										<div @click="removeList(index,index_two)" class="imgClose"
											style="margin-left: 10px;">
											<CloseCircleOutlined />
										</div>
									</div>
									<div v-if="item.images">
										<div v-if="item.images.length<4">
											<img src="https://beverage-upload.oss-cn-chengdu.aliyuncs.com/shopImg/2025218/f2p8e9plgw8oigtotgmj4isg6w4brepj.png"
												class="imgAll" alt="">
										</div>
									</div>
									<div v-else>
										<img src="https://beverage-upload.oss-cn-chengdu.aliyuncs.com/shopImg/2025218/f2p8e9plgw8oigtotgmj4isg6w4brepj.png"
											class="imgAll" alt="">
									</div>
									<div class="bold">
										<div>规格相册</div>
										<div class="flexR10">建议尺寸 <div class="colred">340X340</div>
										</div>
										<div class="xztp">
											<a-upload :multiple="true" :customRequest="uploadList"
												@change="changeIndex(index)" :file-list="[]" list-type="text">
												选择图片
											</a-upload>
										</div>
									</div>
								</div>
							</div>
						</div>
					</a-form-item>
				</a-col>
				<a-col :span="24">
					<a-form-item label="价格管理">
						<table class="table_two">
							<tr class="bg83colwhite">
								<th scope="col">口味名称</th>
								<th scope="col">口味规格名称</th>
								<th scope="col">包含二级规格数量</th>
								<th scope="col">排序</th>
								<th scope="col">是否首页弹窗展示</th>
								<th scope="col">首页推荐</th>
								<th scope="col">支持冰冻</th>
								<th scope="col">支持折扣</th>
								<th scope="col">二级规格售卖单价</th>
								<th scope="col">二级规格售卖原价 </th>
							</tr>
							<template v-for="(itt,indexGG) in guigeList" :key="indexGG">
								<tr v-for="(item,indexGGTwo) in itt.tastList" :key="indexGGTwo">
									<template v-if="indexGGTwo==0">
										<td :rowspan="itt.tastList.length">
											{{itt.name}}
										</td>
									</template>
									<td>
										<a-input v-model:value="item.name" class="w90 col67f" placeholder="口味规格名称" />
									</td>
									<td><a-input v-model:value="item.has_number"
											onkeyup="value=value.replace(/[^\d]/g,'')" class="w90 col67f"
											placeholder="包含二级单位数量" /></td>
									<td><a-input v-model:value="item.order" onkeyup="value=value.replace(/[^\d]/g,'')"
											class="w90" placeholder="排序" /></td>
									<td>
										<!-- <a-input v-model:value="item.show_pop" class="w90 col67f" placeholder="是否首页弹窗展示" /> -->
										<a-switch v-model:checked="item.show_pop" checked-children="是"
											un-checked-children="否" />
									</td>
									<td>
										<!-- <a-input v-model:value="item.show_list" class="w90 col67f" placeholder="首页推荐" /> -->
										<a-switch v-model:checked="item.show_list" checked-children="是"
											un-checked-children="否" />
									</td>
									<td>
										<!-- <a-input v-model:value="item.ice_size" class="w90" placeholder="支持冰冻" /> -->
										<a-switch v-model:checked="item.ice_size" checked-children="是"
											un-checked-children="否" />
									</td>
									<td>
										<!-- <a-input v-model:value="item.is_rate" class="w90 col67f" placeholder="支持折扣" /> -->
										<a-switch v-model:checked="item.is_rate" checked-children="是"
											un-checked-children="否" />
									</td>
									<td><a-input v-model:value="item.price" class="w90 col67f" placeholder="二级规格售卖单价" />
									</td>
									<td><a-input v-model:value="item.old_price" class="w90 colred"
											placeholder="二级规格售卖原价" /></td>
								</tr>
							</template>

						</table>
					</a-form-item>
				</a-col>
			</a-row>
		</a-form>
	</div>
</template>


<style>
	.auto {
		overflow: auto;
		height: 100%;
	}

	/* 口味信息 */

	.tjkw {
		display: flex;
		height: 32px;
		align-items: center;
	}

	.xzkw {
		padding: 5px;
		background-color: #1890ff;
		color: white;
		border-radius: 5px;
		margin-right: 10px;
	}

	.mb20 {
		margin-bottom: 20px;
	}

	.flexCenter {
		display: flex;
		height: 32px;
		align-items: center;
	}

	.klw {
		padding: 5px;
		background-color: #83c2ff;
		color: white;
		border-radius: 5px;
		margin-right: 10px;
		display: flex;
		align-items: center;
	}

	.pxSolt {
		padding: 5px;
		background-color: #83c2ff;
		color: white;
		border-radius: 5px 0px 0px 5px;
	}

	.pxSoltNum {
		border: 2px solid #f5F5F5;
		padding: 5px 10px;
		border-radius: 0px 5px 5px 0px;
	}

	.itemGuige {
		display: flex;
		background-color: #f5F5F5;
		padding: 5px;
		border-radius: 5px;
		margin-right: 10px;
		align-items: center;
	}

	.zjgg {
		padding: 5px;
		background-color: #1890ff;
		color: white;
		border-radius: 5px;
		margin-right: 10px;
	}

	.scgg {
		padding: 5px;
		background-color: red;
		color: white;
		border-radius: 5px;
		margin-right: 10px;
	}

	.flexTop {
		display: flex;
		margin-top: 10px;
	}

	.flex {
		display: flex;
	}

	.relative {
		position: relative;
	}

	.imgAll {
		margin-right: 10px;
		width: 80px;
		;
		height: 80px;
		;
		border-radius: 10px;
	}

	.imgClose {
		width: 15px;
		height: 15px;
		position: absolute;
		right: 15px;
		top: 5px;
	}

	.bold {
		font-weight: bold;
	}

	.flexR10 {
		display: flex;
		margin-right: 10px;
	}

	.colred {
		color: red;
	}

	.xztp {
		background-color: #f5f5f5;
		border-radius: 5px;
		padding: 5px;
		width: 80px;
		text-align: center;
		margin-top: 5px;
	}

	.flexL20 {
		display: flex;
		margin-left: 20px;
	}

	.bg83colwhite {
		background-color: #83c2ff;
		color: white;
	}

	.w90 {
		width: 90px;
	}

	.col67f {
		color: #67f77e;
	}

	/* 口味信息 */
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