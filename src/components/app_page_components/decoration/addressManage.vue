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

	// -------------------电子面单
	const fh_vis = ref(false)//电子面单发货地址新增编辑
	const formState = reactive({
		address: '',
		addressDeta: '',
	});
	const formRef = ref(null);
	// 弹框确认按钮
	async function handleOk() {
		try {
			const values = await formRef.value.validateFields();
			console.log('Success:', values);
		} catch (errorInfo) {
			console.log('Failed:', errorInfo);
		}
	}
	function delAddress(item){
		global.Modal.confirm({
          title: global.findLanguage(
            "确定要删除吗？"
          ),
          okText: global.findLanguage("确定"),
          cancelText: global.findLanguage("取消"),
          okType: "primary",
          onOk: function () {
            console.log('确定');
          },
        });
	}
	// -------------------end电子面单
	// -------------------退货地址
	const fh_visTh = ref(false)//退货地址新增编辑
	const formStateTh = reactive({
		key1: '',
		key2: '',
		key3: '',
		key4: '',
	});
	const formRefTh = ref(null);
	// 退货地址弹框确认按钮
	async function handleOkTh() {
		try {
			const values = await formRefTh.value.validateFields();
			console.log('Success:', values);
		} catch (errorInfo) {
			console.log('Failed:', errorInfo);
		}
	}
	function delTh(item){
		global.Modal.confirm({
          title: global.findLanguage(
            "确定要删除吗？"
          ),
          okText: global.findLanguage("确定"),
          cancelText: global.findLanguage("取消"),
          okType: "primary",
          onOk: function () {
            console.log('确定');
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
						<th scope="col">编辑</th>
					</tr>
					<tr>
						<td>中国 福建省福州市鼓楼区</td>
						<td>撒大苏打撒</td>
						<td style="color: #0c96f1;display: flex;align-items: center;">
							<div @click="delAddress('1')">删除</div>
							<div style="color: #666666;margin: 0 5px;">|</div>
							<div>编辑</div>
						</td>
					</tr>
					<tr>
						<td>中国 福建省福州市鼓楼区</td>
						<td>撒大苏打撒大苏打撒撒大苏打撒撒大苏打撒撒大苏打撒撒大苏打撒撒</td>
						<td style="color: #0c96f1;display: flex;align-items: center;cursor: pointer;">
							<div @click="delAddress('2')">删除</div>
							<div style="color: #666666;margin: 0 5px;">|</div>
							<div>编辑</div>
						</td>
					</tr>
				</table>
				<!-- 新增编辑弹窗 -->
				<a-modal v-model:visible="fh_vis" title="电子面单发货地址" @ok="handleOk">
					<a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 6 }"
						:wrapper-col="{ span: 16 }">
						<a-form-item label="选择地区" name="address" :rules="[{ required: true, message: '请选择地区!' }]">
							<a-cascader v-model:value="formState.address" :options="treeData" placeholder="请选择地区" />
						</a-form-item>
						<a-form-item label="详细地址" name="addressDeta" :rules="[{ required: true, message: '请填写详细地址!' }]">
							<a-input v-model:value="formState.addressDeta" placeholder="请填写详细地址"  />
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
						<th scope="col">编辑</th>
					</tr>
					<tr>
						<td>张三</td>
						<td>18481020570</td>
						<td>中国 福建省福州市鼓楼区</td>
						<td>撒大苏打撒大苏打撒撒大苏打撒撒大苏打撒撒大苏打撒撒大苏打撒撒</td>
						<td style="color: #0c96f1;display: flex;align-items: center;cursor: pointer;">
							<div @click="delTh('1')">删除</div>
							<div style="color: #666666;margin: 0 5px;">|</div>
							<div>编辑</div>
						</td>
					</tr>
					<tr>
						<td>张三</td>
						<td>18481020570</td>
						<td>中国 福建省福州市鼓楼区</td>
						<td>撒大苏打撒大苏打撒撒大苏打撒撒大苏打撒撒大苏打撒撒大苏打撒撒</td>
						<td style="color: #0c96f1;display: flex;align-items: center;">
							<div>删除</div>
							<div style="color: #666666;margin: 0 5px;">|</div>
							<div>编辑</div>
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
							<a-input v-model:value="formState.key4" placeholder="请填写详细地址" />
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