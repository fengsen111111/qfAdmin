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
	const fh_vis = ref(false)//新增编辑

	const spinning = ref(false)//加载
	const company_name = ref(null)//搜索项 快递公司code
	const partnerName = ref(null)//搜索项  电子面单账户名称

	const formState = reactive({
		store_id: localStorage.getItem('storeId'),
		add_type: null,
		company_code: null,
		company_name: null,
		parterId: '',
		partnerKey: '',
		partnerSecret: '',
		partnerName: '',
		net: '',
		code: '',
		checkMan: '',
		sender_name: '',
		sender_mobile: '',
		sender_address: '',
	});
	const formRef = ref(null);
	// 弹框确认按钮
	async function handleOk() {
		try {
			const values = await formRef.value.validateFields();
			console.log('Success:', formState);
			spinning.value = true
			setTimeout(() => {
				spinning.value = false
			}, 2000);
			global.axios
				.post('decoration/Express/submitExpress', formState, global)
				.then((res) => {
					spinning.value = false
					handCancel()//关闭弹窗
					_getExpressList()
				})
		} catch (errorInfo) {
			console.log('Failed:', errorInfo);
		}
	}
	// 关闭弹窗
	function handCancel() {
		formRef.value.resetFields();
		fh_vis.value = false
	}

	// 删除面单
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
				spinning.value = true
				global.axios
					.post('decoration/Express/deleteTableRecord', {
						id: item.id
					}, global)
					.then((res) => {
						spinning.value = false
						console.log('删除', res);
						message.success('删除成功')
						_getExpressList()
					})
			},
		});
	}

	const columns = [
		{
			title: '操作',
			key: 'action',
			dataIndex: 'action',
			width: 120
		},
		// {
		// 	title: '快递ID',
		// 	dataIndex: 'id',
		// 	key: 'id',
		// },
		{
			title: '是否默认',
			key: 'status',
			dataIndex: 'status',
			width: 120
		},
		{
			title: '快递公司信息',
			key: 'company',
			dataIndex: 'company',
		},
		// {
		// 	title: '快递公司编码',
		// 	dataIndex: 'company_code',
		// 	key: 'company_code',
		// }, {
		// 	title: '快递公司名称',
		// 	dataIndex: 'company_name',
		// 	key: 'company_name',
		// }, 
		{
			title: '网点名称/网点编号',
			key: 'net',
			dataIndex: 'net',
		},
		{
			title: '电子面单信息',
			key: 'dzmdInfo',
			dataIndex: 'dzmdInfo',
		},
		// {
		// 	title: '电子面单客户账户名称',
		// 	key: 'partnerName',
		// 	dataIndex: 'partnerName',
		// }, {
		// 	title: '电子面单账户号码',
		// 	dataIndex: 'parterId',
		// 	key: 'parterId',
		// }, {
		// 	title: '电子面单账户密码',
		// 	key: 'partnerKey',
		// 	dataIndex: 'partnerKey',
		// }, {
		// 	title: '电子面单密钥',
		// 	key: 'partnerSecret',
		// 	dataIndex: 'partnerSecret',
		// }, {
		// 	title: '电子面单承载编号',
		// 	key: 'code',
		// 	dataIndex: 'code',
		// }, {
		// 	title: '电子面单承载快递员名',
		// 	key: 'checkMan',
		// 	dataIndex: 'checkMan',
		// }, 
		{
			title: '发货人信息',
			key: 'fhrInfo',
			dataIndex: 'fhrInfo',
		},

		// {
		// 	title: '发货人',
		// 	key: 'sender_name',
		// 	dataIndex: 'sender_name',
		// }, {
		// 	title: '发货电话',
		// 	key: 'sender_mobile',
		// 	dataIndex: 'sender_mobile',
		// }, {
		// 	title: '发货地址',
		// 	key: 'sender_address',
		// 	dataIndex: 'sender_address',
		// 	width: 120
		// }, 
		{
			title: '第三方授权链接',
			key: 'url',
			dataIndex: 'url',
		},];
	const dataList = ref([])
	//商家后台获取门店地址列表
	function _getExpressList() {
		spinning.value = true
		global.axios
			.post('decoration/Express/getExpressList', {
				store_id: localStorage.getItem('storeId'),
				company_name: company_name.value,
				partnerName: partnerName.value
			}, global)
			.then((res) => {
				spinning.value = false
				dataList.value = res.list
			})
	}
	_getExpressList()

	const wlList = ref([
		{
			"name": "安能快运",
			"code": "annengwuliu"
		},
		{
			"name": "德邦快递",
			"code": "debangkuaidi"
		},
		{
			"name": "德邦物流",
			"code": "debangwuliu"
		},
		{
			"name": "EMS",
			"code": "ems"
		},
		{
			"name": "京东快递",
			"code": "jd"
		},
		{
			"name": "跨越速运",
			"code": "kuayue"
		},
		{
			"name": "申通快递",
			"code": "shentong"
		},
		{
			"name": "顺丰（丰密面单）",
			"code": "shunfeng"
		},
		{
			"name": "顺丰快运",
			"code": "shunfengkuaiyun"
		},
		{
			"name": "优速快递",
			"code": "youshuwuliu"
		},
		{
			"name": "邮政快递包裹",
			"code": "youzhengguonei"
		},
		{
			"name": "圆通速递",
			"code": "yuantong"
		},
		{
			"name": "圆通国际",
			"code": "yuantongguoji"
		},
		{
			"name": "韵达快递",
			"code": "yunda"
		},
		{
			"name": "中通快递",
			"code": "zhongtong"
		},
		{
			"name": "中通快运",
			"code": "zhongtongkuaiyun"
		},
		{
			"name": "圆通承诺达",
			"code": "ytchengnuoda"
		},
		{
			"name": "极兔速递",
			"code": "jtexpress"
		},
		{
			"name": "汇森速运",
			"code": "huisenky"
		},
		{
			"name": "顺心捷达",
			"code": "sxjdfreight"
		},
		{
			"name": "壹米滴答",
			"code": "yimidida"
		},
		{
			"name": "京东快运",
			"code": "jingdongkuaiyun"
		},
		{
			"name": "韵达点通达",
			"code": "yundadiantongda"
		},
		{
			"name": "韵达快运",
			"code": "yundakuaiyun"
		},
	])
	//物流公司
	// function _transportList() {
	// 	global.axios
	// 		.post('decoration/Setting/transportList', {}, global)
	// 		.then((res) => {
	// 			// console.log('物流公司', res);
	// 			wlList.value = res
	// 		})
	// }
	// _transportList()
	// 默认
	function _handleStatus(item) {
		spinning.value = true
		global.axios
			.post('decoration/Express/handleStatus', {
				id: item.id
			}, global)
			.then((res) => {
				spinning.value = false
				console.log('默认', res);
				_getExpressList()
			})
	}
	// 三方授权地址展开收起
	const urlIs = ref(false)

	const expandedKeys = ref([])

	// 等待数据加载完成后设置默认展开的行（例如全部 ID）
	watch(dataList, (val) => {
		expandedKeys.value = val.map(item => item.id)
	})

	// 跳转开通网页
	function openUrl() {
		window.open('https://b.kuaidi100.com/page/epCompany', '_blank');
	}

	const showDrawer = ref(false)//抽屉开关
	const textDrawer = ref('')
	function getRichTextContent() {
		global.axios
			.post('decoration/Setting/getRichTextContent', {
				type: 'open_third_express_des'
			}, global)
			.then((res) => {
				console.log('默认抽屉内容', res);
				textDrawer.value = res
			})
	}
	getRichTextContent()

</script>

<template>
	<!--搜索-->
	<div>
		<div style="padding: 20px;border-radius: 4px;">
			<div style="display: flex;align-items: center;font-size: 18px;font-weight: bold;">
				电子面单绑定
			</div>
			<div style="display: flex;align-items: center;margin: 20px 0;">
				<span style="white-space: nowrap;">绑定电子面单账户：</span>
				<a-button type="primary" @click="fh_vis=true;formState.net='taobao'"
					style="margin-left: 10px;">淘宝面单</a-button>
				<a-button type="primary" @click="fh_vis=true;formState.net='cainiao'"
					style="margin-left: 10px;">菜鸟面单</a-button>
			</div>
			<div style="display: flex;align-items: center;margin: 20px 0;">
				<div style="display: flex;align-items: center;">
					<span>快递公司：</span>
					<a-select ref="select" placeholder="请选择快递公司" v-model:value="company_name" style="width: 200px">
						<a-select-option :value="item.name" v-for="item in wlList"
							:key="item.name">{{item.name}}</a-select-option>
					</a-select>
				</div>
				<div style="display: flex; align-items: center;margin-left: 20px;">
					<span style="white-space: nowrap;">电子面单账户名称：</span>
					<a-input v-model:value="partnerName" placeholder="请输入电子面单账户名称"></a-input>
				</div>
				<a-button type="primary" style="margin-left: 20px;" @click="_getExpressList()">搜索</a-button>
				<a-button style="margin-left: 20px;" @click="company_code = null;partnerName=null">重置</a-button>
			</div>
			<!-- 表格数据 -->
			<div style="width: 100%;">
				<a-spin :spinning="spinning">
					<a-table :columns="columns" :data-source="dataList" :scroll="{ x: 1600,y: 570 }"
						:expandedRowKeys="expandedKeys" rowKey="id">
						<template #bodyCell="{ column, record  }">
							<!-- 操作 -->
							<template v-if="column.dataIndex === 'action'">
								<div style="cursor: pointer;width: 120px;">
									<!-- 第三方链接授权 -->
									<div v-if="!record.tbNet">
										<span @click="delItem(record)" style="color: red;">删除</span>
										<span v-if="record.status=='N'">
											<span v-if="record.children">
												<span v-if="record.children.length==0" @click="_handleStatus(record)"
													style="color: #1890ff;margin-left: 10px;">默认</span>
											</span>
										</span>
									</div>
									<div v-else>
										<span v-if="record.status=='N'" @click="_handleStatus(record)"
											style="color: #1890ff;margin-left: 23px;">默认</span>
									</div>
								</div>
							</template>
							<!-- 状态 -->
							<template v-if="column.dataIndex === 'status'">
								<div v-if="record.children">
									<div v-if="!record.children.length">
										<a-tag :color="record.status=='Y'?'green':'red'">
											{{record.status=='Y'?'默认':'禁用'}}
										</a-tag>
									</div>
								</div>
								<div v-else>
									<a-tag :color="record.status=='Y'?'green':'red'">
										{{record.status=='Y'?'默认':'禁用'}}
									</a-tag>
								</div>
							</template>
							<!-- 快递公司信息 -->
							<template v-if="column.dataIndex === 'company'">
								<div>
									<div v-if="record.company_name">名称：{{record.company_name}}</div>
									<div v-if="record.company_code">编码：{{record.company_code}}</div>
								</div>
							</template>

							<template v-if="column.dataIndex === 'net'||column.dataIndex === 'tbNet'">
								<div>{{record.partnerKey}}{{record.tbNet}}</div>
							</template>
							<!-- 三方授权链接 -->
							<template v-if="column.dataIndex === 'url'">
								<div style="cursor: pointer;" v-if="record.url && record.url!='已完成授权'">
									<span>{{urlIs?record.url:record.url.slice(0,10)+'......'}}</span>
									<span style="color: #1890ff;" @click="urlIs = !urlIs">{{urlIs?'收起':'展开'}}</span>
								</div>
							</template>
							<!-- 电子面单信息 -->
							<template v-if="column.dataIndex === 'dzmdInfo'">
								<div v-if="record.children">
									<div>
										<div>账户名称：{{record.partnerName}}</div>
										<div>账户号码：{{record.parterId}}</div>
										<div>账户密码：{{record.partnerKey}}</div>
										<div>密钥：{{record.partnerSecret}}</div>
										<div>承载编号：{{record.code}}</div>
										<div>承载快递员名：{{record.checkMan}}</div>
									</div>
								</div>
								<div v-else></div>
							</template>
							<!-- 发货人信息 -->
							<template v-if="column.dataIndex === 'fhrInfo'">
								<div v-if="record.children">
									<div>
										<div>发货人：{{record.sender_name}}</div>
										<div>发货电话：{{record.sender_mobile}}</div>
										<div>发货地址：{{record.sender_address}}</div>
									</div>
								</div>
								<div v-else></div>
							</template>
						</template>
					</a-table>
				</a-spin>
			</div>
			<!-- 添加网点面单 -->
			<a-modal v-model:visible="fh_vis" title="添加网点面单" style="width: 600px;" :footer="null">
				<a-spin :spinning="spinning">
					<a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 8 }"
						:wrapper-col="{ span: 16 }">
						<a-form-item label="添加方式" name="add_type" :rules="[{ required: true, message: '请选择添加方式' }]">
							<a-select ref="select" placeholder="请选择添加方式" v-model:value="formState.add_type">
								<a-select-option value="handle">直接添加</a-select-option>
								<a-select-option value="third">第三方授权</a-select-option>
							</a-select>
						</a-form-item>
						<!-- 淘宝：taobao，菜鸟：cainiao -->
						<a-form-item label="网点名称" name="net"
							:rules="[{ required: true, message: '请填写网点名称!' }]">
							<!-- <a-input v-model:value="formState.net" placeholder="请填写网点名称" /> -->
							<a-select ref="select" placeholder="请选择添加方式" v-model:value="formState.net">
								<a-select-option value="taobao">淘宝面单</a-select-option>
								<a-select-option value="cainiao">菜鸟面单</a-select-option>
							</a-select>
						</a-form-item>
						<a-form-item label="发货人" name="sender_name" :rules="[{ required: true, message: '请填写发货人!' }]">
							<a-input v-model:value="formState.sender_name" placeholder="请填写发货人" />
						</a-form-item>
						<a-form-item label="发货电话" name="sender_mobile"
							:rules="[{ required: true, message: '请填写发货电话!' }]">
							<a-input v-model:value="formState.sender_mobile" placeholder="请填写发货电话" />
						</a-form-item>
						<a-form-item label="发货地址" name="sender_address"
							:rules="[{ required: true, message: '请填写发货地址!' }]">
							<a-input v-model:value="formState.sender_address" placeholder="请填写发货地址" />
						</a-form-item>
						<a-form-item label="快递公司名称" name="company_name">
							<a-input v-model:value="formState.company_name"
								:rules="[{ required: true, message: '请填写快递公司名称' }]" placeholder="请填写快递公司名称" />
						</a-form-item>
						<div v-show="formState.add_type=='handle'">
							<!-- :rules="[{ required: true, message: '请输入快递公司' }]" -->
							<a-form-item label="快递公司编码" name="company_name">
								<a-select ref="select" placeholder="请选择快递公司" v-model:value="formState.company_code">
									<a-select-option :value="item.code" v-for="item in wlList"
										:key="item.code">{{item.name}}</a-select-option>
								</a-select>
							</a-form-item>
							<!-- :rules="[{ required: true, message: '请输入电子面单账户号码' }]" -->
							<a-form-item label="电子面单账户号码" name="parterId">
								<a-input v-model:value="formState.parterId" placeholder="请输入电子面单账户号码" />
							</a-form-item>
							<!-- :rules="[{ required: true, message: '请输入电子面单账户密码' }]" -->
							<a-form-item label="电子面单账户密码" name="partnerKey">
								<a-input v-model:value="formState.partnerKey" placeholder="请输入电子面单账户密码" />
							</a-form-item>
							<!-- :rules="[{ required: true, message: '请填写电子面单密钥!' }]" -->
							<a-form-item label="电子面单密钥" name="partnerSecret">
								<a-input v-model:value="formState.partnerSecret" placeholder="请填写电子面单密钥" />
							</a-form-item>
							<!-- :rules="[{ required: true, message: '请填写电子面单客户账户名称!' }]" -->
							<a-form-item label="电子面单客户账户名称" name="partnerName">
								<a-input v-model:value="formState.partnerName" placeholder="请填写电子面单客户账户名称" />
							</a-form-item>
							<!-- :rules="[{ required: true, message: '请填写电子面单承载编号!' }]" -->
							<a-form-item label="电子面单承载编号" name="code">
								<a-input v-model:value="formState.code" placeholder="请填写电子面单承载编号" />
							</a-form-item>
							<!-- :rules="[{ required: true, message: '请填写电子面单承载快递员名!' }]" -->
							<a-form-item label="电子面单承载快递员名" name="checkMan">
								<a-input v-model:value="formState.checkMan" placeholder="请填写电子面单承载快递员名" />
							</a-form-item>
						</div>
					</a-form>
					<div style="height: 20px;"></div>
					<div style="display: flex;">
						<div style="display: flex;margin: 0 auto;">
							<div style="display: flex;">
								<a-button @click="showDrawer = true"
									style="background-color: #FF9933;color: #fff;">开通介绍</a-button>
								<a-button @click="openUrl"
									style="margin-left: 10px;color: #0099CC;border: 1px solid #0099CC;">开通</a-button>
							</div>
							<div style="display: flex;margin-left: 10px;">
								<a-button style="margin-right: 10px;" @click="handCancel">取消</a-button>
								<a-button type="primary" @click="handleOk">确定</a-button>
							</div>
						</div>
					</div>
				</a-spin>
			</a-modal>
		</div>
		<a-drawer v-model:visible="showDrawer" class="custom-class" title="开通介绍" placement="right">
			<div>
				<div v-html="textDrawer"></div>
				<!-- <p>Some contents...</p> -->
			</div>
		</a-drawer>
	</div>
</template>

<style scoped>
	::v-deep(.ant-table-row-indent + .ant-table-row-expand-icon) {
		display: none !important;
	}
</style>