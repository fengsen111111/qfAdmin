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

	const current = ref(0) //进度

	const checkedList = ref(['生意不佳', '没时间经营'])

	const value = ref();

	const phoneDis = ref(true) //禁用

	const is_checked = ref(false)

	function onChange(e) {
		console.log('e', e.target.checked);
		is_checked.value = e.target.checked
	}

	const visible = ref(false)
	// 下一步
	function handTo() {
		if (!is_checked.value) {
			message.warning('请先阅读并同意圈风退店协议！')
			return false
		}
		if (checkedList.value.length == 0) {
			message.warning('请选择退店原因！')
			return false
		}
		_checkMobileCode()
		// visible.value = true
	}
	// 校验验证码
	function _checkMobileCode() {
		global.axios.post('decoration/User/checkMobileCode', {
			mobile: shopObj.value.mobile,
			mobile_code: mobile_code.value
		}, global).then(res => {
			console.log('res', res);
			if (res.result !== 'N') {
				message.success('验证码校验成功')
				setTimeout(() => {
					visible.value = true
				}, 2000);
			} else {
				message.error(res.message)
			}
		})
	}

	const store_id = ref('')
	// 商家id
	function getStoreID() {
		global.axios
			.post('decoration/Store/getStoreID', {}, global)
			.then((res) => {
				console.log('商家id', res.store_id);
				store_id.value = res.store_id
				_webGetStoreInfo()//获取商家信息
				getOutMsg()//查看当前退店详情
			});
	}
	getStoreID()

	const shopObj = ref({})
	// 获取商家信息
	function _webGetStoreInfo() {
		global.axios.post('decoration/Store/webGetStoreInfo', {
			store_id: store_id.value
		}, global)
			.then(res => {
				// console.log('店铺数据', res.mobile);
				shopObj.value = res
			})
	}

	function handleOk() {
		console.log('确认提交', checkedList.value);
		let str = ''
		checkedList.value.map((item) => {
			str = str + item + ';'
		})
		console.log('退店原因', str);
		str = str + qtyy.value + ';'
		global.axios
			.post('decoration/Store/submitOutApply', {
				store_id: store_id.value,
				reason: str
			}, global)
			.then((res) => {
				console.log('提交退店', res);
				visible.value = false
				message.success('操作成功')
				getOutMsg()
			});
	}

	const shopStatus = ref({})
	// 查看当前店铺状态
	function getOutMsg() {
		global.axios
			.post('decoration/Store/getOutMsg', {
				store_id: store_id.value
			}, global)
			.then((res) => {
				shopStatus.value = res
				deadline.value = new Date(res.create_time.replace(/-/g, '/')).getTime() + 1000 * 60 * 60 * 24 * 30;
				console.log('查看当前店铺状态', res);
				// 进程 a未申请 b公示中 c材料审核中 d待商家确认退店 e待退款  f已退款 
				if (res.out_process == 'a') {
					current.value = 0
				} else if (res.out_process == 'b') {
					current.value = 1
				} else if (res.out_process == 'c') {
					current.value = 2
				} else if (res.out_process == 'd') {
					current.value = 3
				} else if (res.out_process == 'e') {
					current.value = 4
				} else if (res.out_process == 'f') {
					current.value = 5
				}
			});
	}

	// 倒计时
	const deadline = ref(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 30)

	const tz_visible = ref(false) //退店公告弹窗

	let emit = defineEmits(["goLookTD", "editMobile"])

	const qtyy = ref('')//退店其他原因
	// 查看退店
	function lookTD() {
		emit("goLookTD");
	}
	// 修改手机号
	function editPhone() {
		emit("editMobile");
	}
	// 确认退店
	function outShopOk() {
		global.axios
			.post('decoration/Store/submitOutApply2', {
				store_id: store_id.value
			}, global)
			.then((res) => {
				console.log('撤销退店', res);
				getOutMsg()
			});
	}
	// 返回上一页
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

	const td_visible = ref(false)
	const td_content = ref('')

	// 退店协议
	function tdFunc() {
		global.axios
			.post('decoration/Setting/getRichTextContent', {
				type: 'store_out_rule'
			}, global)
			.then((res) => {
				console.log('退店协议', res);
				td_visible.value = true
				td_content.value = res
			});
	}

	function qftdlcsm() {
		// message.error('功能暂未开通')
		global.router.push('/ruleCenter?title=学习中心')
	}

	// 取消退店
	function _closeOutApply() {
		if (shopStatus.value.out_process == 'a' || !shopStatus.value.out_process) {
			message.error('当前未申请退店')
			return false
		}
		global.axios
			.post('decoration/Store/closeOutApply', {
				store_id: store_id.value
			}, global)
			.then((res) => {
				message.success('操作成功')
				getOutMsg()
				current.value = 0
			});
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
	<!--搜索-->
	<div>
		<!-- <div @click="current++">{{current}}</div> -->
		<div style="padding: 20px;">
			<div class="wcdiv">
				<div style="display: flex;align-items: center;">
					<a-button v-show="pageData.hasOwnProperty('parent_page_key')" class="iconfont button-class"
						style="font-size: 18px !important; padding: 0 10px; float: left;margin-right: 20px;"
						@click="closeChildPage(pageData.page_key)">&#xe6d2;
					</a-button>
					<div style="font-size: 18px;">退店</div>
				</div>
			</div>
			<div style="text-align: center;padding: 30px 50px;">
				<a-steps :current="current" size="small">
					<a-step title="验证身份" />
					<a-step title="申请退店" />
					<a-step title="材料审核" />
					<a-step title="确认账户" />
					<a-step title="银行退款" />
					<a-step title="退款成功" />
				</a-steps>
			</div>
			<div style="text-align: center;padding: 30px;">
				<!-- 验证身份 -->
				<div v-if="current==0">
					<div style="font-size: 16px;">请验证店铺绑定手机号并填写退店原因</div>
					<div style="color: #ff7300;margin-top: 10px;">您的贷款余额，保证金，广告账户余额，均将在退店审核成功后全部退还至绑定银行卡，无需额外缴纳保证金</div>
					<div style="color: #ff7300;">申请退店后所有状态为「推广中」的商品推广，流量将暂停；不支持新建推广、报名活动。不再下发广告红包。撤销退店后，申请退店期间的广告红包不会补发。
					</div>
					<div>
						<div style="display: flex;width: 100%;">
							<div style="margin: 5px auto;">
								<div style="display: flex;margin-top: 20px;">
									<div style="width: 30%;display: flex;justify-content: space-between;">
										<div></div>
										<div style="display: flex;">
											<div style="color: red;">*</div>
											<div>退店主要原因</div>
										</div>
									</div>
									<div style="width: 760px;margin-left: 10px;">
										<a-checkbox-group v-model:value="checkedList">
											<a-checkbox value="生意不佳" name="type">生意不佳</a-checkbox>
											<a-checkbox value="没时间经营" name="type">没时间经营</a-checkbox>
											<a-checkbox value="售后退款问题" name="type">售后退款问题</a-checkbox>
											<a-checkbox value="想更换主营类目" name="type">想更换主营类目</a-checkbox>
											<a-checkbox value="平台判定导流" name="type">平台判定导流</a-checkbox>
											<a-checkbox value="不善于经营" name="type">不善于经营</a-checkbox>
											<a-checkbox value="货源问题" name="type">货源问题</a-checkbox>
											<a-checkbox value="资金链断裂" name="type">资金链断裂</a-checkbox>
											<a-checkbox value="不接受协议新规" name="type">不接受协议新规</a-checkbox>
										</a-checkbox-group>
									</div>
								</div>
								<div style="display: flex;margin-top: 20px;align-items: center;">
									<div style="width: 30%;display: flex;justify-content: space-between;">
										<div></div>
										<div style="display: flex;">
											<div>其它退店原因</div>
										</div>
									</div>
									<div
										style="margin-left: 10px;width: 760px;float: left;display: flex;align-items: center;">
										<a-input v-model:value="qtyy" placeholder="请输入其它退店原因" />
									</div>
								</div>
								<div style="display: flex;margin-top: 20px;align-items: center;">
									<div style="width: 25%;display: flex;justify-content: space-between;">
										<div></div>
										<div style="display: flex;">
											<div style="color: red;">*</div>
											<div>主账号绑定手机号</div>
										</div>
									</div>
									<div style="margin-left: 10px;display: flex;align-items: center;">
										<a-input v-model:value="shopObj.mobile" disabled
											style="width: 200px;"></a-input>
										<span @click="editPhone"
											style="color: #1890FF;margin-left: 10px;cursor: pointer;">修改手机号</span>
									</div>
								</div>
								<div style="display: flex;margin-top: 20px;align-items: center;">
									<div style="width: 25%;display: flex;justify-content: space-between;">
										<div></div>
										<div style="display: flex;">
											<div style="color: red;">*</div>
											<div>短信验证码</div>
										</div>
									</div>
									<div style="margin-left: 10px;display: flex;align-items: center;">
										<a-input placeholder="请输入" v-model:value="mobile_code"
											style="width: 100px;margin-right: 10px;"></a-input>
										<a-button @click="sendCode" v-if="!showDjs">获取验证码</a-button>
										<a-button v-else>还剩{{timeData}}秒</a-button>
									</div>
								</div>
								<div style="margin-top: 20px;display: flex;">
									<div style="margin: 0 auto;display: flex;">
										<a-checkbox v-model:checked="is_checked" @change="onChange" />
										<div style="margin-left: 10px;">我已阅读并同意</div>
										<div @click="tdFunc" style="color: #1890FF;">《圈风退店协议》</div>
									</div>
									<a-drawer v-model:visible="td_visible" class="custom-class" title="圈风退店协议"
										placement="right">
										<div>
											<span v-html="td_content"></span>
										</div>
									</a-drawer>
								</div>
								<div style="margin-top: 20px;display: flex;">
									<div style="margin: 0 auto;">
										<a-button @click="handTo" type="primary">下一步</a-button>
										<!-- <a-button v-if="shopStatus.out_process != 'a'&& shopStatus.out_process" @click="_closeOutApply" type="primary" danger
											style="margin-left: 20px;">取消退店</a-button> -->
									</div>
								</div>
								<!-- 弹框 -->
								<a-modal v-model:visible="visible" width="750px">
									<div style="padding: 0 50px;">
										<div style="text-align: center;">
											<ExclamationCircleOutlined style="color: #ff7300;font-size: 50px;" />
										</div>
										<div style="text-align: center;margin-top: 10px;">
											<div style="color: #ff7300;">尊敬的商家，您好:</div>
											<div style="color: #ff7300;">当您进入这个页面，意味着您正在申请退出圈风店铺，请注意以下提示信息:</div>
										</div>
										<div style="display: flex;align-items: center;margin-top: 20px;">
											<div
												style="width: 10px;height: 10px;border-radius: 10px;background-color: #ff7300;margin-right: 5px;">
											</div>
											<div>若您当前还存在上架商品，请在退店处理环节中进行商品下架;</div>
										</div>
										<div style="display: flex;align-items: center;">
											<div
												style="width: 10px;height: 10px;border-radius: 10px;background-color: #ff7300;margin-right: 5px;">
											</div>
											<div>若您当前还存在未完成或售后订单，请在退店处理环节尽快处理完成;</div>
										</div>
										<div style="display: flex;align-items: center;">
											<div
												style="width: 10px;height: 10px;border-radius: 10px;background-color: #ff7300;margin-right: 5px;">
											</div>
											<div>在申请退店后需进行30天的退店公示，店铺首页会有退店公告展示;</div>
										</div>
										<div style="display: flex;align-items: center;">
											<div
												style="width: 10px;height: 10px;border-radius: 10px;background-color: #ff7300;margin-right: 5px;">
											</div>
											<div>在退店环节中如有任何疑问可参考<span @click="qftdlcsm"
													style="color: #1890FF;">《圈风退店流程说明及常见问题》</span>;
											</div>
										</div>
										<div style="font-size: 16px;">
											为保障您的资金安全与基本权益，请在申请退店前再次确认:
										</div>
										<div style="margin-left: 20px;color: red;">
											<div style="margin-top: 5px;">1、已统计店铺最终剩余可退还资金金额</div>
											<div style="margin-top: 5px;">2、所有商品订单已处理完毕</div>
											<div style="margin-top: 5px;">3、所有商品已下架，不可见</div>
										</div>
									</div>
									<template #footer>
										<div style="display: flex;">
											<div style="margin: 0 auto;display: flex;">
												<a-button type="primary" @click="handleOk">确认提交</a-button>
												<a-button @click="()=>{visible=false}">取消</a-button>
											</div>
										</div>
									</template>
								</a-modal>
							</div>
						</div>
					</div>
				</div>
				<!-- 申请退店 -->
				<div v-else-if="current==1">
					<div style="text-align: center;">
						<ExclamationCircleOutlined style="color: #ff7300;font-size: 50px;" />
						<div style="font-weight: bold;margin-top: 20px;">请在申请退店前处理完以下事项</div>
						<div style="color: #999999;margin-top: 10px;">完成退店处理事项后将自动发起退店申请，退店申请发起成功后，将于30个工作日内退店审核完毕并打款
						</div>
						<div style="display: flex;margin-top: 10px;">
							<table style="margin: 0 auto;">
								<thead>
									<tr>
										<th>退店条件</th>
										<th>待处理事项</th>
										<th>建议操作</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>
											<div style="display: flex;align-items: center;">
												<CheckCircleOutlined v-if="shopStatus.status=='N'"
													style="color: green;margin-right: 5px;" />
												<CloseCircleOutlined v-else style="color: red;margin-right: 5px;" />
												店铺无异常
											</div>
										</td>
										<td>无</td>
										<td>无</td>
									</tr>
									<tr>
										<td rowspan="1">
											<div style="display: flex;align-items: center;">
												<CheckCircleOutlined v-if="shopStatus.prices=='N'"
													style="color: green;margin-right: 5px;" />
												<CloseCircleOutlined v-else style="color: red;margin-right: 5px;" />
												资金无异常
											</div>
										</td>
										<td>无</td>
										<td>无</td>
									</tr>
									<tr>
										<td>
											<div style="display: flex;align-items: center;">
												<CheckCircleOutlined v-if="shopStatus.goods=='N'"
													style="color: green;margin-right: 5px;" />
												<CloseCircleOutlined v-else style="color: red;margin-right: 5px;" />
												商品已处理
											</div>
										</td>
										<td>无</td>
										<td>无</td>
									</tr>
									<tr>
										<td>
											<div style="display: flex;align-items: center;">
												<CheckCircleOutlined v-if="shopStatus.order=='N'"
													style="color: green;margin-right: 5px;" />
												<CloseCircleOutlined v-else style="color: red;margin-right: 5px;" />
												订单已完成
											</div>
										</td>
										<td>无</td>
										<td>无</td>
									</tr>
									<tr>
										<td>
											<div style="display: flex;align-items: center;">
												<CheckCircleOutlined v-if="shopStatus.after_sale=='N'"
													style="color: green;margin-right: 5px;" />
												<CloseCircleOutlined v-else style="color: red;margin-right: 5px;" />
												售后已完成
											</div>
										</td>
										<td>无</td>
										<td>无</td>
									</tr>
									<tr>
										<td>
											<div style="display: flex;align-items: center;">
												<!-- <CheckCircleOutlined v-if="shopStatus.notice=='N'"
													style="color: green;margin-right: 5px;" />
												<CloseCircleOutlined v-else style="color: red;margin-right: 5px;" /> -->
												<CloseCircleOutlined style="color: red;margin-right: 5px;" />
												退店已公告
											</div>
										</td>
										<td>退店公示未满30天</td>
										<td>
											<div style="display: flex;">
												<!-- shopStatus.notice_time -->
												<!-- <div v-if="shopStatus.notice=='N'"  style="color: #1890FF;" @click="()=>{tz_visible=true}">开启公示</div> -->
												<div><a-statistic-countdown title="倒计时" :value="deadline"
														format="D 天 H 时 m 分 s 秒" style="font-size: 16px;" /></div>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
							<!-- 弹窗 -->
							<a-modal v-model:visible="tz_visible" title="是否确认开启退店公示？">
								<div style="color: #999999;">
									<div>
										&nbsp;&nbsp;据2019年1月1日开始施行的《中华人民共和国电子商务法》第二章第十六条要求:电子商务经营者自行终止从事电子商务的，应当提前三十日在首页显著位置持续公示有关信息。
									</div>
									<div>&nbsp;&nbsp;退店需提前30日进行公示，开启退店公示后，店铺首页显著位置会公示“本店铺将关闭”标志，持续30天。</div>
								</div>
								<template #footer>
									<div style="display: flex;">
										<div style="margin: 0 auto;display: flex;">
											<a-button type="primary">确认开启</a-button>
											<a-button @click="()=>{tz_visible=false}">取消</a-button>
										</div>
									</div>
								</template>
							</a-modal>
						</div>
						<div style="display: flex;margin-top: 20px;">
							<div style="margin: 0 auto;">
								<a-button @click="_closeOutApply">撤销退店申请</a-button>
							</div>
						</div>
					</div>
				</div>
				<!-- 材料审核 -->
				<div v-else-if="current==2">
					<div style="text-align: center;">
						<ExclamationCircleOutlined style="color: #ff7300;font-size: 50px;" />
						<div style="font-weight: bold;margin-top: 20px;">材料审核中，请耐心等待！</div>
					</div>
				</div>
				<!-- 确认退店 -->
				<div v-else-if="current==3">
					<div style="text-align: center;">
						<ExclamationCircleOutlined style="color: #ff7300;font-size: 50px;" />
						<div style="font-weight: bold;margin-top: 20px;">材料已通过，请确认是否退店！</div>
						<div style="display: flex;margin-top: 20px;">
							<div style="margin: 0 auto;">
								<a-button @click="_closeOutApply">撤销退店申请</a-button>
								<a-button @click="outShopOk" danger style="margin-left: 20px;">确认退店</a-button>
							</div>
						</div>
					</div>
				</div>
				<!-- 银行退款 -->
				<div v-else-if="current==4">
					<div style="text-align: center;">
						<ExclamationCircleOutlined style="color: #ff7300;font-size: 50px;" />
						<div style="font-weight: bold;margin-top: 20px;">银行退款中，请耐心等待！</div>
					</div>
				</div>
				<!-- 退款成功 -->
				<div v-else-if="current==5">
					<div style="text-align: center;">
						<ExclamationCircleOutlined style="color: #ff7300;font-size: 50px;" />
						<div style="font-weight: bold;margin-top: 20px;">银行退款完成！</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<!--导出-->
</template>

<style lang="less" scoped>
	table {
		text-align: left;
		border-collapse: collapse;
		border: none;
		font-family: sans-serif;
		font-size: 0.8rem;
		letter-spacing: 1px;
	}

	caption {
		caption-side: bottom;
		padding: 10px;
		font-weight: bold;
	}

	thead,
	tfoot {
		background-color: #f4f5f9;
	}

	th,
	td {
		border: 1px solid #d4d6d6;
		padding: 8px 12px;
		width: 300px;
	}

	:deep(.ant-statistic-content) {
		color: rgba(0, 0, 0, 0.85);
		font-size: 16px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
	}

	:deep(.ant-checkbox-group) {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	/* :deep(.ant-radio-group) {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
  } */
	:deep(.ant-checkbox-wrapper + .ant-checkbox-wrapper) {
		margin-left: 0px;
	}

	/* :deep(.ant-radio-wrapper) {
    border: 1px solid #d9d9d9 !important;
    margin-bottom: 10px;
    padding: 0px 5px;
    white-space:nowrap;
    border-radius: 4px;
  } */

	/* :deep(.ant-checkbox+span) {
    padding-right: 0px;
    padding-left: 8px;
  }

  :deep(.ant-checkbox-wrapper) {
    border: 1px solid #d9d9d9 !important;
    margin-bottom: 10px;
    padding: 0px 5px;
  } */

	:deep(.ant-steps-item-icon) {
		width: 18px !important;
		height: 18px !important;
		font-size: 12px !important;
		line-height: 17px !important;
		margin: 3px 3px 0 0 !important;
	}

	:deep(.ant-steps-item-icon > .anticon) {
		font-size: 12px !important;
	}
</style>