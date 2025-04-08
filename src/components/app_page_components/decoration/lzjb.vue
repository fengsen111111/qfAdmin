<script setup>
	import { inject, onBeforeMount, reactive, ref, watch, shallowRef } from "vue";
	import { Row, Col } from 'ant-design-vue';
	import { InfoCircleOutlined, CheckCircleOutlined, PlusOutlined, CloseCircleOutlined } from "@ant-design/icons-vue";

	let props = defineProps(["pageData"]);
	const pageData = props.pageData;
	let emit = defineEmits(["openChildPage", "closeChildPage"]);
	const global = inject("global").value;


	const state = reactive({
		selectedKeys: [],
		openKeys: [],
	});

	// 跳转其它路由
	function handUrl(url) {
		global.router.push(url)
	}

	import { useRoute } from 'vue-router';
	const route = useRoute();
	console.log('当前路径:', route.query.title);

	const options = ['员工', '商家']
	const checkedObj = ref([])
	const visible = ref(false)
	const visType = ref(1)
	function openVis(type) {
		// type==1员工 2商家
		visType.value = type
		visible.value = true
	}
	const jbType = ref('')//举报类型
	const jbContent = ref('')//举报内容

	const fjList = ref([])//附件内容

	// 文件上传
	function upload(options) {
		global.file.uploadFile(global, options.file, 'image', 'reportFile', true, complete)
	}
	// 文件 回调
	function complete(response) {
		fjList.value.push(response)
	}
	// 删除对应文件
	function delFile(index) {
		fjList.value.splice(index, 1)
	}
	const jbryList = ref([])//举报人员名单
	const tableOne = ref('')//举报人员姓名/举报公司名称／店铺名称
	const tableTwo = ref('')//员工所在部门/相关人员
	const tableThree = ref('')//商家联系方式
	// 点击弹窗确认
	function handleOk() {
		console.log('点击弹窗确认');
		jbryList.value.push({
			type:visType.value,//举报类型1人员2商家
			tableOne:tableOne.value,//参数1
			tableTwo:tableTwo.value,//参数2
			tableThree:tableThree.value,//参数3
		})
		tableOne.value = ''
		tableTwo.value = ''
		tableThree.value = ''
		console.log('jbryList',jbryList.value);
		
		visible.value = false
	}
	// 删除表格
	function delTable(index){
		jbryList.value.splice(index,1)
	}
</script>

<template>
	<!--搜索-->
	<div>
		<div style="background-color: #323242;height: 8vh;display: flex;">
			<div
				style="padding: 20px;height: 100%;width: 70vw;margin: 0 auto;display: flex;justify-content: space-between;align-items: center;">
				<div style="display: flex;">
					<img :src="global.adminLogo" alt="" style="width: auto;height: 45px;border-radius: 5px">
					<span style="font-size: 28px;margin-left: 5px;color: #fff;font-weight: bold;">廉政举报
					</span>
				</div>
				<div @click="handUrl('/')" style="color: #fff;">
					返回首页
				</div>
			</div>
		</div>
		<div style="display: flex;background: #f5f5f5;height: 92vh;">
			<div style="padding: 20px;overflow: auto;height: 100%;width: 50vw;margin: 0 auto;">
				<div style="box-shadow: 0px 0px 3px;">
					<div style="font-weight: bold;padding: 10px 30px;border-bottom: 1px solid #d9d9d9;">廉政举报</div>
					<div style="padding: 30px;">
						<div style="margin-left: 100px;">
							<div style="display: flex;">
								<div><span style="color: red;">*</span>举报对象</div>
								<div style="margin-left: 20px;">
									<a-checkbox-group v-model:value="checkedObj" :options="options" />
									<div v-if="checkedObj.length>0">
										<span @click="openVis(1)" v-if="checkedObj.includes('员工')"
											style="color: #2db7f5;">
											<PlusOutlined />员工
										</span>
										<span @click="openVis(2)" v-if="checkedObj.includes('商家')"
											style="color: #2db7f5;margin-left: 20px;">
											<PlusOutlined />商家
										</span>
									</div>
									<div>
										<table v-for="(item,index) in jbryList" :key="index"
											style="border-collapse: collapse;margin-top: 10px;border: 1px solid #f0f2f5;letter-spacing: 1px;text-align: center;">
											<tr v-if="item.type==1"
												style="display: grid;grid-template-columns: repeat(3, minmax(0, 1fr));text-align: center;">
												<th>
													<div style="color: #999999;">员工姓名／花名</div>
												</th>
												<th>
													<div style="color: #999999;">员工所在部门</div>
												</th>
												<th>
													<div style="color: #999999;">操作</div>
												</th>
											</tr>
											<tr v-else
												style="display: grid;grid-template-columns: repeat(4, minmax(0, 1fr));text-align: center;">
												<th>
													<div style="color: #999999;">公司名称／店铺名称</div>
												</th>
												<th>
													<div style="color: #999999;">相关人员</div>
												</th>
												<th>
													<div style="color: #999999;">联系方式</div>
												</th>
												<th>
													<div style="color: #999999;">操作</div>
												</th>
											</tr>
											<tr v-if="item.type==1"
												style="display: grid;grid-template-columns: repeat(3, minmax(0, 1fr));text-align: center;background-color: #fff;">
												<td>{{item.tableOne}}</td>
												<td>{{item.tableTwo}}</td>
												<td>
													<div @click="delTable(index)" style="color: red;margin-top: 5px;">删除</div>
												</td>
											</tr>
											<tr v-else
												style="display: grid;grid-template-columns: repeat(4, minmax(0, 1fr));text-align: center;background-color: #fff;">
												<td>{{item.tableOne}}</td>
												<td>{{item.tableTwo}}</td>
												<td>{{item.tableThree}}</td>
												<td>
													<div @click="delTable(index)" style="color: red;margin-top: 5px;">删除</div>
												</td>
											</tr>
										</table>
									</div>
								</div>
							</div>
							<div style="display: flex;align-items: center;margin-top: 20px;">
								<div><span style="color: red;">*</span>举报主题</div>
								<div style="margin-left: 20px;">
									<a-select ref="select" v-model:value="jbType" placeholder="请选择"
										style="width: 200px">
										<a-select-option value="1">索取、收受贿赂</a-select-option>
										<a-select-option value="2">违规收受礼品或款待</a-select-option>
										<a-select-option value="3">利用职权谋取私利</a-select-option>
										<a-select-option value="4">泄露公司保密信息</a-select-option>
									</a-select>
								</div>
							</div>
							<div style="display: flex;margin-top: 20px;">
								<div><span style="color: red;">*</span>举报内容</div>
								<div style="margin-left: 20px;">
									<a-textarea v-model:value="jbContent" :rows="4" style="width: 25vw;"
										placeholder="请输入举报内容" />
								</div>
							</div>
							<div style="display: flex;margin-top: 20px;">
								<div style="margin-left: 6px;">添加附件</div>
								<div style="margin-left: 20px;display: flex;">
									<a-button v-for="(item,index) in fjList" :key="item.url"
										style="margin-right: 10px;display: flex;align-items: center;">
										{{item.name}}
										<CloseCircleOutlined @click="delFile(index)" />
									</a-button>
									<div v-if="fjList.length<9">
										<a-upload :customRequest="upload" :file-list="[]" list-type="text">
											<a-button>上传附件</a-button>
										</a-upload>
										<div style="color: #999999;font-size: 12px;margin-top: 5px;">
											<div>最多上传9个文件，每个文件大小不超过10M</div>
											<div>可上传格式为jpg、png、jpeg、doc、xls、xlsx、docx、zip、rar等格式</div>
										</div>
									</div>
								</div>

							</div>
						</div>
					</div>
				</div>
				<div style="text-align: center;margin-top: 20px;">
					<a-button type="primary">提交</a-button>
				</div>
			</div>
		</div>
		
		<!-- 添加弹窗 -->
		<a-modal v-model:visible="visible" title="添加举报对象" @ok="handleOk">
			<div>
				<div v-if="visType==1">
					<div style="display: flex;align-items: center;">
						<div style="width: 100px;text-align: right">员工姓名／花名</div>
						<a-input v-model:value="tableOne" placeholder="请输入" style="width: 300px;margin-left: 10px;"></a-input>
					</div>
					<div style="display: flex;align-items: center;margin-top: 10px;">
						<div style="width: 100px;text-align: right;">员工所在部门</div>
						<a-input v-model:value="tableTwo" placeholder="请输入" style="width: 300px;margin-left: 10px;"></a-input>
					</div>
				</div>
				<div v-else>
					<div style="display: flex;align-items: center;">
						<div style="width: 100px;text-align: right">公司／店铺名称</div>
						<a-input v-model:value="tableOne" placeholder="请输入" style="width: 300px;margin-left: 10px;"></a-input>
					</div>
					<div style="display: flex;align-items: center;margin-top: 10px;">
						<div style="width: 100px;text-align: right;">相关人员</div>
						<a-input v-model:value="tableTwo" placeholder="请输入" style="width: 300px;margin-left: 10px;"></a-input>
					</div>
					<div style="display: flex;align-items: center;margin-top: 10px;">
						<div style="width: 100px;text-align: right;">联系方式</div>
						<a-input v-model:value="tableThree" placeholder="手机、邮箱、店铺链接或其它" style="width: 300px;margin-left: 10px;"></a-input>
					</div>
				</div>
			</div>
		</a-modal>
	</div>
</template>

<style lang="less" scoped>
	th,
	td {
		border: 1px solid #d9d9d9;
		padding: 8px 10px;
	}
</style>