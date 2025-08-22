<script setup>
	import { inject, onBeforeMount, reactive, ref, watch } from "vue";
	import { ExclamationCircleOutlined, CloseCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";

	let props = defineProps(["pageData"]);
	const pageData = props.pageData;
	let emit = defineEmits(["openChildPage", "closeChildPage", "djtzmk"]);

	const global = inject("global").value;

	function closeChildPage(page_key) {
		global.Modal.confirm({
			title: global.findLanguage(
				"确定要返回吗？该操作会导致未保存的数据丢失，请谨慎操作！"
			),
			okText: global.findLanguage("确定"),
			cancelText: global.findLanguage("取消"),
			okType: "primary",
			onOk: function () {
				// console.log('返回按钮',pageData.page_key);
				emit("closeChildPage", '111111');
			},
		});
	}


	//重置
	function reset() {
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

	//提交
	function submit() {
		global.Modal.confirm({
			title: global.findLanguage("确定要提交吗？"),
			okText: global.findLanguage("确定"),
			cancelText: global.findLanguage("取消"),
			okType: "primary",
			onOk: function () {
				console.log('提交');
			},
		});
	}

	const shopObj = ref({})//店铺信息
	// 店铺信息
	function _shopInfo() {
		shopObj.value = {}
		global.axios.post('decoration/Store/webGetStoreInfo', {
			store_id: localStorage.getItem('storeId')
		}, global)
			.then(res => {
				shopObj.value = res
			})
	}
	_shopInfo()
	import { message } from 'ant-design-vue';
	const copyText = async () => {
		try {
			await navigator.clipboard.writeText(shopObj.value.id)
			message.success('复制成功')
		} catch (err) {
			message.error('复制失败')
			console.error(err)
		}
	}
	const type = ref('')//
	const visible = ref(false)
	const form = ref({
		store_name: '',//
		logo: '',//
		mobile: '',//
	})
	function editInfo(key) {
		type.value = key
		visible.value = true
	}
	function cancelVis() {
		form.value.store_name = ''
		form.value.logo = ''
		form.value.mobile = ''
		msgValue.value = ''
		visible.value = false
	}
	// logo上传
	function upload(options) {
		global.file.uploadFile(global, options.file, 'image', 'shopImg', true, complete)
	}
	// logo 回调
	function complete(response) {
		form.value.logo = response.url
	}
	// 删除logo
	function delImgLogo() {
		console.log('删除logo');
		form.value.logo = ''
	}
	function visOk() {
		if (!form.value[type.value]) {
			message.error('请检查填写')
			return false
		}
		if (msgValue.value) {
			message.error('验证不通过，请修改')
			return false
		}
		// 校验验证码
		global.axios.post('decoration/User/checkMobileCode', {
			mobile: shopObj.value.mobile,
			mobile_code: mobile_code.value
		}, global).then(res => {
			console.log('res', res);
			if (res.result == 'Y') {
				// message.success('验证码校验成功')
				let params = {}
				params[type.value] = form.value[type.value]
				global.axios.post('decoration/StoreMsgCheck/submitEditStoreMsg', params, global)
					.then(res => {
						shopObj.value = res
						message.success('提交成功')
						cancelVis()
						_shopInfo()
					})
			} else {
				message.error(res.message)
			}
		})


	}



	const danger_words = ref([])//铭感词列表
	// 敏感词
	function _getBaseTypes() {
		global.axios.post('decoration/Setting/getBaseTypes', {}, global).then(res => {
			console.log('敏感词', res);
			danger_words.value = res.danger_words
		})
	}
	_getBaseTypes()
	const msgValue = ref('')
	// 店铺名称变化
	function nameChange() {
		console.log('名称变化', form.value.store_name);
		const sensitiveWords = danger_words.value
		const hits = sensitiveWords.filter(word => form.value.store_name.includes(word));
		console.log('hits', hits);
		if (hits.length > 0 && hits[0] != '') {
			// 清空或纠正输入
			msgValue.value = `不得包含敏感词：${hits.join('、')}`//不重复就清空
			msgValue.value = msgValue.value.slice(0, msgValue.value.length - 1)
			return false
		} else {
			msgValue.value = ''
		}
		// 验证店铺名称是否重复 
		global.axios.post('decoration/Store/checkStoreName', {
			store_name: form.value.store_name,
		}, global)
			.then(res => {
				console.log('名称是否重复', res);
				msgValue.value = ''//不重复就清空
			})
			.catch(error => {
				console.log('error', error);
				msgValue.value = error.message
			})
	}
	// 手机号变化
	function mobileChange() {
		console.log('手机号变化', form.value.mobile);
		const regex = /^1[3-9]\d{9}$/;
		if (form.value.mobile && !regex.test(form.value.mobile)) {
			msgValue.value = '手机号格式错误'
			return false
		} else {
			msgValue.value = ''
		}
	}

	const mobile_code = ref('')//验证码
	const showDjs = ref(false)//显示倒计时
	const timeData = ref(60)//倒计时
	const timer = ref(null)//计时器 

	// 页面还要定时器，清除
	if (timer.value) {
		clearInterval(timer.value); //清除定时器
	}
	watch(() => [timeData.value], (newVal, oldVal) => {
		console.log('时间变化', newVal[0]); //
		if (newVal[0] == 0) {
			showDjs.value = false
			clearInterval(timer.value); //清除定时器
		}
	});
	// 发送验证码
	function sendCode() {
		console.log('发送验证码');
		global.axios.post('decoration/User/getMobileCode', {
			mobile: shopObj.value.mobile
		}, global).then(res => {
			console.log('验证码', res.code);
			mobile_code.value = res.code
			showDjs.value = true
			timeData.value = 60
			timer.value = setInterval(() => {
				timeData.value = timeData.value - 1
			}, 1000);
		})
	}
</script>

<template>
	<div class="table-header">
		<div>
			<a-button v-show="pageData.hasOwnProperty('parent_page_key')" class="iconfont button-class"
				style="font-size: 18px !important; padding: 0 10px; float: left"
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
		<div class="a20">
			<ExclamationCircleOutlined class="a21" />
			重要提示：(1)店铺logo、店铺名称会直接展示给买家，请认真填写。(2)提交修改后，当前沿用提交前店铺数据，审核通过后，自动生效。
		</div>
		<div
			style="width: 100%;border: 2px solid #f5f5f5;border-radius: 5px;margin-top: 10px;padding: 20px;font-size: 16px;">
			<div style="font-size: 18px;font-weight: bold;">基础信息</div>
			<a-row class="mt">
				<a-col :span="3">
					<div style="text-align: right;">店铺ID</div>
				</a-col>
				<a-col :span="15">
					<div class="flexml">
						<div>{{shopObj.id}}</div>
						<div class="cz" @click="copyText">复制</div>
					</div>
				</a-col>
			</a-row>
			<a-row class="mt">
				<a-col :span="3">
					<div style="text-align: right;">店铺名称</div>
				</a-col>
				<a-col :span="15">
					<div class="flexml">
						<div>{{shopObj.store_name}}</div>
						<div class="cz" @click="editInfo('store_name')">修改</div>
					</div>
				</a-col>
			</a-row>
			<a-row class="mt">
				<a-col :span="3">
					<div style="text-align: right;">开店时间</div>
				</a-col>
				<a-col :span="15">
					<div class="flexml">
						<div>{{shopObj.create_time}}</div>
					</div>
				</a-col>
			</a-row>
			<a-row class="mt">
				<a-col :span="3">
					<div style="text-align: right;">店铺类型</div>
				</a-col>
				<a-col :span="15">
					<div class="flexml">
						<!-- <div>{{shopObj.type}}</div> -->
						<!-- <div>个人点/个体工商户/企业店</div> -->
						 <div>{{shopObj.store_type=='a'?'个人店':shopObj.store_type=='b'?'个体工商户':shopObj.store_type=='c'?'企业店':''}}</div>
					</div>
				</a-col>
			</a-row>
			<a-row class="mt">
				<a-col :span="3">
					<div style="text-align: right;">店铺logo</div>
				</a-col>
				<a-col :span="15">
					<div class="flexml">
						<div>
							<a-image :width="90" :height="90" :src="shopObj.logo" :preview="{ src: shopObj.logo }" />
						</div>
						
						<div>
							<!-- <div style="margin-left: 10px;color: #ff0000;">宽：高 = 1：1</div> -->
							<div style="margin-left: 10px;color: #ff0000;">请上传80*80图片</div>
							<div class="cz" @click="editInfo('logo')">修改</div>
						</div>
					</div>
				</a-col>
			</a-row>
			<a-row class="mt">
				<a-col :span="3">
					<div style="text-align: right;">手机号</div>
				</a-col>
				<a-col :span="15">
					<div class="flexml">
						<div>
							<span v-for="(item,index) in shopObj.mobile" :key="index">
								{{(index==0||index==1||index==2||index==shopObj.mobile.length-1||index==shopObj.mobile.length-2||index==shopObj.mobile.length-3||index==shopObj.mobile.length-4)?item:'*'}}
							</span>
						</div>
						<div class="cz" @click="editInfo('mobile')">修改</div>
					</div>
				</a-col>
			</a-row>
		</div>
		<!--  -->
		<a-modal v-model:visible="visible" @cancel="cancelVis"
			:title="type=='store_name'?'店铺名称':type=='logo'?'店铺logo':type=='mobile'?'新手机号':'修改'" :footer="null">
			<div>
				<div class="a20">
					<ExclamationCircleOutlined class="a21" />
					重要提示：修改店铺信息，需要等待审核通过后生效。
				</div>
				<div style="margin-top: 20px;">
					<a-row>
						<a-col :span="4"
							style="margin-top: 5px;">{{type=='store_name'?'店铺名称':type=='logo'?'店铺logo':type=='mobile'?'手机号':''}}</a-col>
						<a-col :span="18">
							<div v-if="type=='store_name'">
								<a-input v-model:value="form.store_name" @change="nameChange" placeholder="请输入店铺名称" />
								<div style="color: #ff0000;font-size: 12px;">{{msgValue}}</div>
							</div>
							<div v-else-if="type=='logo'">
								<div style="display: flex;">
									<div v-if="form.logo"
										style="position: relative;display: flex;overflow: hidden;border-radius: 4px;">
										<a-image :width="90" :src="form.logo" :preview="{ src: form.logo }" />
										<div @click="delImgLogo()" class="imgClose" style="margin-left: 10px;">
											<CloseCircleOutlined />
										</div>
									</div>
									<a-upload v-else :customRequest="upload" :file-list="[]" list-type="text">
										<div
											style="width: 90px;height: 90px;border: 1px dashed #dbdbdb;border-radius: 4px;margin-right: 10px;text-align: center;">
											<PlusOutlined style="font-size: 30px;color: #999999;margin-top: 35%;" />
										</div>
									</a-upload>
									<!-- <div style="margin-left: 10px;color: #ff0000;">宽：高 = 1：1</div> -->
									<div style="margin-left: 10px;color: #ff0000;">请上传80*80图片</div>
								</div>
							</div>
							<div v-else-if="type=='mobile'">
								<a-input v-model:value="form.mobile" @change="mobileChange"
									@input="e => form.mobile = e.target.value.replace(/[^0-9]/g, '')" maxlength="11"
									placeholder="请输入手机号" />
								<div style="color: #ff0000;font-size: 12px;">{{msgValue}}</div>
							</div>
						</a-col>
					</a-row>
					<a-row style="margin-top: 10px;">
						<a-col :span="4" style="margin-top: 5px;">验证码</a-col>
						<a-col :span="18">
							<div>
								<a-input v-model:value="mobile_code"
									@input="e => mobile_code = e.target.value.replace(/[^0-9]/g, '')" maxlength="11"
									placeholder="请输入验证码" style="width: 150px;margin-right: 10px;" />
								<a-button @click="sendCode" v-if="!showDjs" style="font-size: 14px;">获取验证码</a-button>
								<a-button v-else>还剩{{timeData}}秒</a-button>
							</div>
						</a-col>
					</a-row>
				</div>
				<div style="margin-top: 40px;display: flex;">
					<div style="display: flex;margin: 0 auto;">
						<a-button @click="visOk" type="primary">确认</a-button>
						<a-button @click="cancelVis" style="margin-left: 20px;">取消</a-button>
					</div>
				</div>
			</div>
		</a-modal>
	</div>
</template>

<style scoped>
	.mt {
		margin-top: 20px;
	}

	.flexml {
		display: flex;
		margin-left: 40px;
	}

	.cz {
		margin-left: 10px;
		color: #1890FF;
		cursor: pointer;
	}

	.a20 {
		display: flex;
		border: 1px solid rgb(255, 218, 163);
		border-radius: 5px;
		padding: 5px 10px;
		align-items: center;
		background-color: #FFF6E6;
	}

	.a21 {
		color: #ff7300;
		margin-right: 10px;
	}

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