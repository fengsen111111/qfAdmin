<script setup>
	import { inject, onBeforeMount, reactive, ref, watch, shallowRef } from "vue";
	import { Row, Col } from 'ant-design-vue';
	import { ClockCircleFilled, DownOutlined, CloseCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";
	import { message } from 'ant-design-vue';
	const global = inject("global").value;
	const store_id = ref('')
	setTimeout(() => {
		store_id.value = localStorage.getItem('storeId')
	}, 500);
	const showYxq = ref(true)//是否显示有效期
	const fh_vis = ref(false)//新增编辑
	const formState = reactive({
		xx1: null,
		xx2: '',
		xx3: '',
		xx4: '',
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

	function delItem(item) {
		global.Modal.confirm({
			title: global.findLanguage(
				"确定要删除吗？"
			),
			okText: global.findLanguage("确定"),
			cancelText: global.findLanguage("取消"),
			okType: "primary",
			onOk: function () {
				console.log('确定');
				message.success('删除成功')
			},
		});
	}

	const columns = [
		{
			title: '快递公司',
			dataIndex: 'key1',
			key: 'key1',
		}, {
			title: '网点名称',
			dataIndex: 'key2',
			key: 'key2',
		}, {
			title: '发货地址',
			dataIndex: 'key3',
			key: 'key3',
		}, {
			title: '已使用单号',
			key: 'key4',
			dataIndex: 'key4',
		}, {
			title: '已取消单号',
			key: 'key5',
			dataIndex: 'key5',
		}, {
			title: '面单余额',
			key: 'key6',
			dataIndex: 'key6',
		}, {
			title: '操作',
			key: 'action',
			dataIndex: 'action',
		}];
	const data = [{
		key0: 0,
		key1: '中通快递',
		key2: '滁州天长,55020',
		key3: '安徽省#滁州市#天长市|null长兴科创园',
		key4: '810',
		key5: '9',
		key6: '47',
	}, {
		key0: 1,
		key1: '中通快递',
		key2: '滁州天长,55020',
		key3: '安徽省#滁州市#天长市|null长兴科创园',
		key4: '810',
		key5: '9',
		key6: '47',
	},];
</script>

<template>
	<!--搜索-->
	<div>
		<div style="padding: 20px;border-radius: 4px;">
			<div style="display: flex;align-items: center;font-size: 18px;font-weight: bold;">
				电子面单绑定
			</div>
			<div style="display: flex;align-items: center;margin: 20px 0;">
				<span>绑定电子面单账户：</span>
				<a-button type="primary" @click="fh_vis=true" style="margin-left: 10px;">菜鸟面单</a-button>
				<a-button type="primary" @click="fh_vis=true" style="margin-left: 10px;">网店面单</a-button>
				<a-button type="primary" @click="fh_vis=true" style="margin-left: 10px;">拼多多面单</a-button>
				<a-button type="primary" @click="fh_vis=true" style="margin-left: 10px;">抖音面单</a-button>
				<a-button type="primary" @click="fh_vis=true" style="margin-left: 10px;">快手面单</a-button>
				<a-button type="primary" @click="fh_vis=true" style="margin-left: 10px;">京东无界面单</a-button>
				<a-button type="primary" @click="fh_vis=true" style="margin-left: 10px;">微信物流助手</a-button>
				<a-button type="primary" @click="fh_vis=true" style="margin-left: 10px;">视频号面单</a-button>
				<a-button type="primary" @click="fh_vis=true" style="margin-left: 10px;">小红书面单</a-button>
				<a-button type="primary" @click="fh_vis=true" style="margin-left: 10px;">纸质面单</a-button>
			</div>
			<div style="display: flex;align-items: center;margin: 20px 0;">
				<div style="display: flex;align-items: center;">
					<span>快递公司：</span>
					<a-select ref="select" placeholder="请选择快递公司" v-model:value="value1" style="width: 200px">
						<a-select-option value="jack">中通快递</a-select-option>
						<a-select-option value="lucy">圆通快递</a-select-option>
					</a-select>
				</div>
				<div style="display: flex; align-items: center;margin-left: 20px;">
					<span>面单类型：</span>
					<a-select ref="select" placeholder="请选择面单类型" v-model:value="value1" style="width: 200px">
						<a-select-option value="jack">菜鸟面单</a-select-option>
						<a-select-option value="lucy">网店面单</a-select-option>
					</a-select>
				</div>
			</div>
			<div v-if="showYxq" style="background-color: #E6F7FF;padding: 10px;">
				<span style="color: #666666;">授权有效期：2025-12-12 20: 40: 32</span>
				<span @click="showYxq=false" style="color: #1890ff;margin-left: 10px;cursor: pointer;">删除</span>
			</div>
			<!-- 表格数据 -->
			<a-table :columns="columns" :data-source="data">
				<template #bodyCell="{ column, record  }">
					<template v-if="column.dataIndex === 'action'">
						<div style="cursor: pointer;">
							<span @click="delItem(record)" style="color: #1890ff;">删除</span>
						</div>
					</template>
				</template>
			</a-table>
			<!-- 添加网店面单 -->
			<a-modal v-model:visible="fh_vis" title="添加网店面单" @ok="handleOk">
				<a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 6 }"
					:wrapper-col="{ span: 16 }">
					<a-form-item label="快递公司" name="xx1" :rules="[{ required: true, message: '请输入快递公司' }]">
						<a-select ref="select" placeholder="请选择快递公司" v-model:value="formState.xx1">
							<a-select-option value="jack">中通快递</a-select-option>
							<a-select-option value="lucy">圆通快递</a-select-option>
						</a-select>
					</a-form-item>
					<a-form-item label="客户编码" name="xx2" :rules="[{ required: true, message: '请输入客户编码' }]">
						<a-input v-model:value="formState.xx2" placeholder="请输入客户编码" />
					</a-form-item>
					<a-form-item label="客户密码" name="xx3" :rules="[{ required: true, message: '请输入客户密码' }]">
						<a-input v-model:value="formState.xx3" placeholder="请输入客户密码" />
					</a-form-item>
					<a-form-item label="站点名称" name="xx4" :rules="[{ required: true, message: '请填写站点名称!' }]">
						<a-input v-model:value="formState.xx4" placeholder="请填写站点名称" />
					</a-form-item>
				</a-form>
			</a-modal>
		</div>
	</div>
</template>

<style lang="less" scoped>
</style>