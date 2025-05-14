<script setup>
	import { inject, onBeforeMount, reactive, ref, watch, shallowRef } from "vue";
	import { Row, Col } from 'ant-design-vue';
	import { ClockCircleFilled, DownOutlined, CloseCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";
	import Map from './map.vue'
	import AMapLoader from '@amap/amap-jsapi-loader';
	import { bd09ToGcj02 } from './zbzh'
	import { message } from 'ant-design-vue';
	import { useRoute } from 'vue-router';
	const route = useRoute();
	let props = defineProps(["pageData"]);
	const pageData = props.pageData;
	const global = inject("global").value;

	// console.log('pageData',pageData);
	const store_id = ref('')
	function getCustomerRoomList() {
		// 获取自己的角色ID和聊天状态
		global.axios.post('decoration/CustomerService/getMyJoinerSign', {}, global, true).then((res_one) => {
			console.log('自己商家id和禁言状态', res_one);
			store_id.value = res_one.joiner_sign
			lookData()
		})
	}
	getCustomerRoomList()

	const dzmdfhdz = ref([])//电子面单发货地址
	const thdz = ref([])//退货地址
	function lookData() {
		global.axios
			.post('decoration/StoreAddress/getStoreAddressList', {
				store_id: store_id.value
			}, global)
			.then((res) => {
				// console.log('当前数据', res.list);
				dzmdfhdz.value = []
				thdz.value = []
				res.list.map((item) => {
					item.status = item.status=='Y'?true:false
					if (item.type == 'a') {
						dzmdfhdz.value.push(item)
					} else {
						thdz.value.push(item)
					}
				})
			});
	}



	// -------------------电子面单
	const fh_vis = ref(false)//电子面单发货地址新增编辑
	const formState = reactive({
		xx1: '',
		xx2: '',
	});
	const dzmd_obj = {}
	const formRef = ref(null);
	// 编辑
	function editFhdz(item){
		dzmd_obj.value = item
		formState.xx1 = ''
		formState.xx2 = item.address
		fh_vis.value = true
	}
	// 弹框确认按钮
	async function handleOk() {
		try {
			const values = await formRef.value.validateFields();
			console.log('Success:', values);
			global.axios
				.post('decoration/StoreAddress/editStoreAddress', {
					id: dzmd_obj.value.id,//ID  修改时必传  
					delete_status: 'N',//Y 已删除  N未删除(删除时传这个id和这个参数)  
					sender_name: '',//发货人
					sender_mobile: '',//发货电话
					address: values.xx2,//发货地址
					type: 'a',//类型  a发货地址  b退货地址
					status: 'Y',//启用状态  Y启用  N禁用(启用禁用时传这个id和这个参数) 
				}, global)
				.then((res) => {
					console.log('新增结果', res);
					message.success('操作成功')
					fh_vis.value = false
					dzmd_obj.value = {}
					lookData()
				});
		} catch (errorInfo) {
			console.log('Failed:', errorInfo);
		}
	}
	function delAddress(item) {
		let obj = item
		global.Modal.confirm({
			title: global.findLanguage(
				"确定要删除吗？"
			),
			okText: global.findLanguage("确定"),
			cancelText: global.findLanguage("取消"),
			okType: "primary",
			onOk: function () {
				console.log('确定');
				global.axios
					.post('decoration/StoreAddress/editStoreAddress', {
						id: obj.id,//ID  修改时必传  
						delete_status: 'Y',//Y 已删除  N未删除(删除时传这个id和这个参数)  
					}, global)
					.then((res) => {
						message.success('删除成功')
						lookData()
					});
			},
		});
	}
	// 修改状态
	function onChange(item){
		// console.log('item',item);
		global.axios
				.post('decoration/StoreAddress/editStoreAddress', {
					id: item.id,//ID  修改时必传  
					status: item.status?'Y':'N',//启用状态  Y启用  N禁用(启用禁用时传这个id和这个参数) 
					type:item.type
				}, global)
				.then((res) => {
					message.success('操作成功')
					lookData()
				});
	}
	// -------------------end电子面单
	// -------------------退货地址
	const fh_visTh = ref(false)//退货地址新增编辑
	const formStateTh = reactive({
		key1: '',//收件人
		key2: '',//电话
		key3: '',//地区
		key4: '',//详细地址
	});
	const formRefTh = ref(null);
	const thdz_obj = {}
	// 编辑
	function editThdz(item){
		thdz_obj.value = item
		formStateTh.key1 = item.sender_name
		formStateTh.key2 = item.sender_mobile
		formStateTh.key3 = ''
		formStateTh.key4 = item.address
		fh_visTh.value = true
	}
	// 退货地址弹框确认按钮
	async function handleOkTh() {
		try {
			const values = await formRefTh.value.validateFields();
			console.log('Success:', values);
			global.axios
				.post('decoration/StoreAddress/editStoreAddress', {
					id: '',//ID  修改时必传  
					delete_status: 'N',//Y 已删除  N未删除(删除时传这个id和这个参数)  
					sender_name: values.key1,//发货人
					sender_mobile: values.key2,//发货电话
					address: values.key4,//发货地址
					type: 'b',//类型  a发货地址  b退货地址
					status: 'Y',//启用状态  Y启用  N禁用(启用禁用时传这个id和这个参数) 
				}, global)
				.then((res) => {
					console.log('新增结果', res);
					message.success('操作成功')
					fh_visTh.value = false
					thdz_obj.value = {}
					lookData()
				});
		} catch (errorInfo) {
			console.log('Failed:', errorInfo);
		}
	}
	function delTh(item) {
		let obj = item
		global.Modal.confirm({
			title: global.findLanguage(
				"确定要删除吗？"
			),
			okText: global.findLanguage("确定"),
			cancelText: global.findLanguage("取消"),
			okType: "primary",
			onOk: function () {
				console.log('确定');
				global.axios
					.post('decoration/StoreAddress/editStoreAddress', {
						id: obj.id,//ID  修改时必传  
						delete_status: 'Y',//Y 已删除  N未删除(删除时传这个id和这个参数)  
					    type:item.type
					}, global)
					.then((res) => {
						message.success('删除成功')
						lookData()
					});
			},
		});
	}
	// -------------------end退货地址
	const treeData = ref([])
	function getAreas() {
		global.axios
			.post('factory_system/Base/getAreas', {}, global)
			.then((res) => {
				treeData.value = res.areas
			});
	}
	getAreas()
	// 查询对应地区的1、2、3级路径（如省、市、区）
	function findPathById(data, targetId, path = []) {
		for (const item of data) {
			const newPath = [...path, item]; // 当前路径增加当前节点
			if (item.id === targetId) {
				return newPath;
			}
			if (item.children) {
				const found = findPathById(item.children, targetId, newPath);
				if (found) return found;
			}
		}
		return null;
	}
</script>

<template>
	<!--搜索-->
	<div>
		<div style="border: 1px solid #f0f2f5;;padding: 20px;margin-top: 20px;border-radius: 4px;">
			<div style="display: flex;align-items: center;border-left: 2px solid #0c96f1;padding-left: 10px;">
				电子面单发货地址
			</div>
			<a-button @click="fh_vis=true" type="primary"
				style="margin: 10px 0px;padding: 0px 20px !important;">新建</a-button>
			<div>
				<table class="table_two">
					<tr class="bg83colwhite">
						<th scope="col">所在地区</th>
						<th scope="col">详细地址</th>
						<th scope="col">状态</th>
						<th scope="col">编辑</th>
					</tr>
					<tr v-for="item in dzmdfhdz" :key="item.id">
						<td>中国 福建省福州市鼓楼区</td>
						<td>{{item.address}}</td>
						<td><a-switch v-model:checked="item.status" @change="onChange(item)" /></td>
						<td style="color: #0c96f1;display: flex;align-items: center;cursor: pointer;">
							<div @click="delAddress(item)">删除</div>
							<div style="color: #666666;margin: 0 5px;">|</div>
							<div @click="editFhdz(item)">编辑</div>
						</td>
					</tr>
				</table>
				<!-- 新增编辑弹窗 -->
				<a-modal v-model:visible="fh_vis" title="电子面单发货地址" @ok="handleOk">
					<a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 6 }"
						:wrapper-col="{ span: 16 }">
						<a-form-item label="选择地区" name="xx1" :rules="[{ required: true, message: '请选择地区!' }]">
							<a-cascader v-model:value="formState.xx1" :options="treeData" placeholder="请选择地区" />
						</a-form-item>
						<a-form-item label="详细地址" name="xx2" :rules="[{ required: true, message: '请填写详细地址!' }]">
							<a-input v-model:value="formState.xx2" placeholder="请填写详细地址" />
						</a-form-item>
					</a-form>
				</a-modal>
			</div>
		</div>
		<div style="border: 1px solid #f0f2f5;;padding: 20px;margin-top: 20px;border-radius: 4px;">
			<div style="display: flex;align-items: center;border-left: 2px solid #0c96f1;padding-left: 10px;">
				退货地址
			</div>
			<a-button @click="fh_visTh=true" type="primary"
				style="margin: 10px 0px;padding: 0px 20px !important;">新建</a-button>
			<div>
				<table class="table_two">
					<tr class="bg83colwhite">
						<th scope="col">收件人</th>
						<th scope="col">手机号</th>
						<th scope="col">所在地区</th>
						<th scope="col">详细地址</th>
						<th scope="col">状态</th>
						<th scope="col">编辑</th>
					</tr>
					<tr v-for="item in thdz" :key="item.id">
						<td>{{item.sender_name}}</td>
						<td>{{item.sender_mobile}}</td>
						<td>中国 福建省福州市鼓楼区</td>
						<td>{{item.address}}</td>
						<td><a-switch v-model:checked="item.status" @change="onChange(item)" /></td>
						<td style="color: #0c96f1;display: flex;align-items: center;cursor: pointer;">
							<div @click="delTh(item)">删除</div>
							<div style="color: #666666;margin: 0 5px;">|</div>
							<div @click="editThdz(item)">编辑</div>
						</td>
					</tr>
				</table>
				<!-- 新增编辑弹窗 -->
				<a-modal v-model:visible="fh_visTh" title="退货地址" @ok="handleOkTh">
					<a-form ref="formRefTh" :model="formStateTh" name="basic" :label-col="{ span: 6 }"
						:wrapper-col="{ span: 16 }">
						<a-form-item label="收件人" name="key1" :rules="[{ required: true, message: '请输入收件人' }]">
							<a-input v-model:value="formStateTh.key1" placeholder="请输入收件人" />
						</a-form-item>
						<a-form-item label="手机号" name="key2" :rules="[{ required: true, message: '请填写手机号!' }]">
							<a-input v-model:value="formStateTh.key2" placeholder="请填写手机号" />
						</a-form-item>
						<a-form-item label="选择地区" name="key3" :rules="[{ required: true, message: '请选择地区!' }]">
							<a-cascader v-model:value="formStateTh.key3" :options="treeData" placeholder="请选择地区" />
						</a-form-item>
						<a-form-item label="详细地址" name="key4" :rules="[{ required: true, message: '请填写详细地址!' }]">
							<a-input v-model:value="formStateTh.key4" placeholder="请填写详细地址" />
						</a-form-item>
					</a-form>
				</a-modal>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.table_two {
		border-collapse: collapse;
		border: 1px solid #ebebeb;
		border-radius: 4px;
		font-size: 14px;
		letter-spacing: 1px;
		text-align: left;
	}

	.table_two tr:nth-child(odd) {
		background-color: #f7f8fa;
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
</style>