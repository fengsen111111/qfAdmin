<script setup>
	import { inject, onBeforeMount, reactive, ref, watch, shallowRef, createVNode, onMounted, onBeforeUnmount } from "vue";
	import { FormComponents } from "../../form_components/form";
	import { TableComponents } from "../../table_components/table";
	import { Row, Col } from 'ant-design-vue';
	import { ClockCircleFilled, DownOutlined, CloseCircleOutlined, PlusOutlined, ExclamationCircleOutlined, AuditOutlined, SearchOutlined, ReloadOutlined, CloseOutlined } from "@ant-design/icons-vue";
	import { message } from 'ant-design-vue';
	import { useRoute } from 'vue-router';
	import dayjs from 'dayjs'
	import * as echarts from 'echarts'
	const route = useRoute();
	let props = defineProps(["pageData"]);
	const pageData = props.pageData;
	let emit = defineEmits(["openChildPage", "closeChildPage", "djtzmk"]);
	const global = inject("global").value;

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
				logo.value = res.logo
				// a待审核 b 已通过 c已拒绝
				shType.value = res.check_status
				if (shType.value == 'c') {
					global.axios.post('decoration/Store/getSubmitEntryApplyMsg', {
						mobile: shopObj.value.mobile,
					}, global).then(res => {
						console.log('商家入驻信息', res);
						check_remark.value = res.check_remark
					})
				}
			})
	}

	const shType = ref('a')//a待审核 b 已通过 c已拒绝
	const check_remark = ref('')//拒绝原因
	// 重新入驻
	function cxrz() {
		global.router.push('/openShop?type=' + shopObj.value.type + '&mobile=' + shopObj.value.mobile + '&password=' + shopObj.value.password)
	}

	const logo = ref('')//店铺logo
	// 删除logo
	function delImgLogo() {
		console.log('删除logo');
		logo.value = ''
	}
	// logo上传
	function upload(options) {
		global.file.uploadFile(global, options.file, 'image', 'shopImg', true, complete)
	}
	// logo 回调
	function complete(response) {
		logo.value = response.url
	}

	// 取消入驻
	function cancelRz() {
		global.Modal.confirm({
			title: global.findLanguage("确定要取消入驻吗？"),
			okText: global.findLanguage("确定"),
			cancelText: global.findLanguage("取消"),
			icon: createVNode(ExclamationCircleOutlined),
			onOk() {
				global.axios.post('decoration/Store/unEntryApply ', {}, global)
					.then(res => {
						console.log('取消入驻', res.data);
						localStorage.setItem("Authorization", "");
						global.router.push("/login");
					})
			},
			onCancel() {
				console.log('点击取消');
			},
		});

	}

	// 分页
	const current = ref(1)
	// 分页变化
	function pagChange(e) {
		zjrzParams.value.page = e
		webGetStoreMoneyLog()
	}

	const titleType = ref('资金日志')

	// 删除温馨提示
	function closeWarning() {
		const el = document.querySelector('.a73');
		if (el) el.remove();
	}

	const is_ptsj = ref('商家')
	const store_id = ref('')//商家id
	function getCustomerRoomList() {
		// 获取自己的角色ID和聊天状态
		store_id.value = localStorage.getItem('storeId')
		is_ptsj.value = localStorage.getItem('storeId') == 1 ? "平台" : '商家'
	}
	getCustomerRoomList()
	_shopInfo()

	import QRCode from 'qrcode';
	const isPay = ref(false)//支付弹窗
	const qrCodeData = ref('')//支付二维码
	const pay_Obj = ref({})//支付信息
	// 支付保证金
	function payBzj() {
		cz_type.value = 'bzj'
		if (timer.value) {
			clearInterval(timer.value);
			timer.value = null;
			totalSeconds.value = 5 * 60; // 5 分钟
			minute.value = '05';
			second.value = '00';
		}
		global.axios.post('decoration/Store/createStoreEnsureMoney', {
			store_id: store_id.value,
			trade_type: 'A_NATIVE',
			password: ''
		}, global)
			.then((res) => {
				console.log('结果', res);
				pay_Obj.value = res
				if (res.pay_info) {
					QRCode.toDataURL(res.pay_info)
						.then((url) => {
							console.log('生成的二维码', url); // 将生成的二维码图片URL存储到状态中
							qrCodeData.value = url
						})
						.catch((err) => {
							console.error('生成二维码失败', err);
						});
					isPay.value = true
					timer.value = setInterval(updateTime, 1000);
				}
			})
	}
	let timer = ref(null);
	const totalSeconds = ref(5 * 60); // 5 分钟
	const minute = ref('05');
	const second = ref('00');
	const codeGq = ref(false);//二维码没失效
	// 支付倒计时
	const updateTime = () => {
		codeGq.value = false
		const mins = Math.floor(totalSeconds.value / 60);
		const secs = totalSeconds.value % 60;
		minute.value = String(mins).padStart(2, '0');
		second.value = String(secs).padStart(2, '0');
		// if (totalSeconds.value <290) {
		// 	codeGq.value = true
		// }
		if (totalSeconds.value > 0) {
			totalSeconds.value--;
		} else {
			clearInterval(timer.value);
			// 倒计时结束后的处理逻辑
			console.log('倒计时结束');
			// qrCodeData.value = ''
			codeGq.value = true
			// isPay.value = false//
		}
	};

	// 刷新二维码
	function sxewm() {
		console.log('当前二维码类型', cz_type.value);
		// cz_type    bzj 保证金 bgl 曝光量 flbzj 分类保证金 sjcz 商家充值
		// allcz_type  1曝光量2商家充值3商家提现
		if (cz_type.value == 'bzj') {
			payBzj()
		} else if (cz_type.value == 'bgl') {
			bglOk()
		} else if (cz_type.value == 'flbzj') {
			handTypeOk()
		} else if (cz_type.value == 'sjcz') {
			bglOk()
		}
	}
	const dateFormat = ref('YYYY/MM/DD')

	// 查询支付结果
	function handOKCode() {
		// 查询支付结果
		global.axios
			.post('decoration/Store/payTypePricesResult', {
				money_log_id: pay_Obj.value.money_log_id
			}, global)
			.then((res) => {
				console.log('查询支付结果', res);
				// P支付中 S成功 F失败  
				if (res.result == 'P') {
					message.error('支付中')
				} else if (res.result == 'S') {
					message.success('支付成功')
					isPay.value = false
					bgl_vis.value = false //曝光量充值
					_shopInfo()
				} else if (res.result == 'F') {
					message.error('支付失败')
				} else {
					message.error('未知')
				}
			})
	}

	const bgl_vis = ref(false)//曝光量充值
	const czje = ref('')//充值金额
	const txpassword = ref('')//提现密码
	const jbpz = ref({})//基本配置
	// 曝光量兑换比例
	function getSetting() {
		global.axios
			.post('decoration/Setting/getSetting', {}, global)
			.then((res) => {
				console.log('基本配置', res);
				jbpz.value = res
			})
	}
	getSetting()
	const cz_type = ref('')// bzj 保证金 bgl 曝光量 flbzj 分类保证金 sjcz 商家充值
	// 曝光量充值
	function bglOk() {
		if (!czje.value) {
			message.error('请输入充值金额')
			return false
		}
		if (timer.value) {
			clearInterval(timer.value);
			timer.value = null;
			totalSeconds.value = 5 * 60; // 5 分钟
			minute.value = '05';
			second.value = '00';
		}
		pay_Obj.value = {}
		// 曝光量
		if (allcz_type.value == 1) {
			cz_type.value = 'bgl'
			bgl_vis.value = false//关闭弹窗
			global.axios
				.post('decoration/PowerLevel/buyPower', {
					handle_type: 'store',
					price: czje.value,
					trade_type: 'A_NATIVE',
					password: ''
				}, global)
				.then((res) => {
					console.log('生成曝光量支付数据', res);
					pay_Obj.value = res
					if (res.pay_info) {
						QRCode.toDataURL(res.pay_info)
							.then((url) => {
								console.log('生成的二维码', url); // 将生成的二维码图片URL存储到状态中
								qrCodeData.value = url
							})
							.catch((err) => {
								console.error('生成二维码失败', err);
							});
						isPay.value = true
						timer.value = setInterval(updateTime, 1000);
					}
				})
		} else if (allcz_type.value == 2) {
			// 充值
			cz_type.value = 'sjcz'
			bgl_vis.value = false//关闭弹窗
			global.axios
				.post('decoration/User/charge', {
					target_type: 'store',
					price: czje.value,
					trade_type: 'A_NATIVE',
					password: ''
				}, global)
				.then((res) => {
					console.log('生成商家充值支付数据', res);
					pay_Obj.value = res
					if (res.pay_info) {
						QRCode.toDataURL(res.pay_info)
							.then((url) => {
								console.log('生成的二维码', url); // 将生成的二维码图片URL存储到状态中
								qrCodeData.value = url
							})
							.catch((err) => {
								console.error('生成二维码失败', err);
							});
						isPay.value = true
						timer.value = setInterval(updateTime, 1000);
					}
				})
		} else if (allcz_type.value == 3) {
			if (!txpassword.value) {
				message.error('请输入提现密码')
				return false
			}
			// 提现
			global.axios
				.post('decoration/Withdrawal/submitWithdrawal', {
					handler_type: 'store',
					money: czje.value,
					password: txpassword.value
				}, global)
				.then((res) => {
					console.log('提现结果', res);
				})
		}
	}
	
	const allcz_type = ref('1')//1曝光量2商家充值3商家提现
	function czvisopen(index) {
		allcz_type.value = index
		console.log('充值');
		bgl_vis.value = true
	}
	// 关闭三个类型的弹框
	function handCancel() {
		czje.value = '' //充值，提现金额
		txpassword.value = ''//提现密码
		bgl_vis.value = false
	}
	const zjxqtj = ref({})//资金详情统计
	// 后台获取商家资金统计
	function webGetStoreMoneySta() {
		global.axios
			.post('decoration/Store/webGetStoreMoneySta', {
				store_id: store_id.value,
			}, global)
			.then((res) => {
				console.log('后台获取商家资金统计', res);
				zjxqtj.value = res
			})
	}
	const zjrzParams = ref({
		order_id: '',
		type: '',
		time: [],
		page: 1,
		limit: 10
	})
	// 重置
	function chongz() {
		zjrzParams.value.order_id = ''
		zjrzParams.value.type = ''
		zjrzParams.value.time = []
		zjrzParams.value.page = 1
		zjrzParams.value.limit = 10
		webGetStoreMoneyLog()
	}
	// 查询
	function chaxun() {
		webGetStoreMoneyLog()
	}
	const zjrzCount = ref(0)//资金记录总条数
	const zjrzList = ref([])//资金记录数据
	// 后台获取商家资金日志
	function webGetStoreMoneyLog() {
		global.axios
			.post('decoration/Store/webGetStoreMoneyLog', {
				store_id: store_id.value,
				order_id: zjrzParams.value.order_id,
				type: zjrzParams.value.type,
				start_time: zjrzParams.value.time.map(date => Math.floor(new Date(date).getTime() / 1000))[0],
				end_time: zjrzParams.value.time.map(date => Math.floor(new Date(date).getTime() / 1000))[1],
				currentPage: zjrzParams.value.page,
				perPage: zjrzParams.value.limit,

			}, global)
			.then((res) => {
				console.log('后台获取商家资金日志', res);
				zjrzCount.value = res.count
				zjrzList.value = res.list
			})
	}
	setTimeout(() => {
		if (global.adminMsg.id == -1) {
			return false //超管登录
		}
		webGetStoreMoneySta()
		webGetStoreMoneyLog()
	}, 1500);


	// 热区跳转
	function rqtz(key1, key2, key3) {
		localStorage.setItem('rqtz_store_id', shopObj.value.id)
		emit("djtzmk", key1, key2, key3);
	}
</script>

<template>
	<!--搜索-->
	<div>
		<!-- <div>审核中状态</div> -->
		<div v-if="is_ptsj == '商家'">
			<div v-if="shType=='a'||shType=='c'">
				<div style="display: flex;align-items: center;">
					<div style="font-size: 18px;">
						店铺信息
					</div>
				</div>
				<div class="a1">
					<div class="a2">
						<ClockCircleFilled class="a3" />
						<div v-if="shType=='a'" class="a4">店铺信息审核中，预计在<span class="a5">2-3个工作日</span>审核完成</div>
						<div v-if="shType=='c'" class="a6">店铺信息审核失败，<span class="a7">拒绝入驻原因：{{check_remark}}</span>
						</div>
					</div>
					<div style="font-size: 12px;">
						<div style="margin-top: 15px;">提交时间：{{shopObj.create_time}}</div>
						<div class="a8">
							<span>审核进度：</span>
							<div v-if="shType=='a'" class="a9"></div>
							<div v-if="shType=='c'" class="a10"></div>
						</div>
						<div class="a11">
							<div>店铺信息：</div>
							<div class="a12">
								<span style="margin-left: 40px;"><span style="margin-right: 30px;">店铺编号</span>
									{{shopObj.id}}</span>
								<span style="margin-left: 40px;"><span style="margin-right: 30px;">店铺名称</span>
									{{shopObj.store_name}}</span>
								<span style="margin-left: 40px;">
									<span style="margin-right: 30px;">店铺类型</span>
									<span v-if="shopObj.type=='a'">本地商家</span>
									<span v-if="shopObj.type=='b'">网店商家</span>
									<span v-if="shopObj.type=='c'">个体工商户</span>
									<span v-if="shopObj.type=='d'">企业店</span>
								</span>
							</div>
						</div>
					</div>
					<div v-if="is_ptsj == '商家'">
						<a-dropdown>
							<a-button class="a13">
								<span>更多</span>
								<DownOutlined style="font-size: 10px;" />
							</a-button>
							<template #overlay>
								<a-menu>
									<a-menu-item>
										<span @click="cancelRz()" class="a14">取消入驻</span>
									</a-menu-item>
									<a-menu-item v-if="shType=='c'">
										<span @click="cxrz" class="a14">重新入驻</span>
									</a-menu-item>
								</a-menu>
							</template>
						</a-dropdown>

					</div>
				</div>
				<div style="margin-top: 40px;">
					<img class="a15"
						src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025424/5njwtnlml419mj9la4lbvidvelv2fq85.png"
						alt="">
				</div>
			</div>
		</div>
		<!-- <div>审核通过</div> -->
		<div v-if="shType=='b'||is_ptsj == '平台'">
			<!--搜索-->
			<div style="padding: 20px;">
				<div class="a16">
					<div class="a17">
						<div class="a20" :class="titleType=='资金日志'?'a18Check':''" @click="titleType='资金日志'">资金日志</div>
					</div>
					<div class="a21">
						<div>店铺详情页</div>
					</div>
				</div>
				<!-- 资金日志 -->
				<div>
					<div class="a63">
						<div class="a64">货款账户</div>
						<div style="padding: 10px 0px;">保证金账户</div>
					</div>
					<div class="a65">
						<div class="a66">
							<div style="display: flex;">
								<div class="a67">总货款：
								</div>
								<div>{{Number(zjxqtj.all_order_money).toLocaleString()}}</div>
							</div>
							<div style="display: flex;">
								<div class="a67">可提现货款：
								</div>
								<div>{{Number(zjxqtj.can_withdrawal_money).toLocaleString()}}</div>
							</div>
							<div style="display: flex;">
								<div class="a67">待结算货款：
								</div>
								<div>{{Number(zjxqtj.wait_over_money).toLocaleString()}}</div>
							</div>
							<div style="display: flex;">
								<div class="a67">已提现货款：
								</div>
								<div>{{Number(zjxqtj.withdrawal_money).toLocaleString()}}</div>
							</div>
							<div style="display: flex;">
								<div class="a67">已结算货款：
								</div>
								<div>{{Number(zjxqtj.over_money).toLocaleString()}}</div>
							</div>
							<div style="display: flex;">
								<div class="a67">剩余曝光量：
								</div>
								<div style="display: flex;">
									<div>{{shopObj.power}}</div>
									<div @click="czvisopen(1)"
										style="cursor: pointer;color: #0c96f1;margin-left: 10px;">点击充值</div>
								</div>
							</div>
						</div>
						<!-- 充值 -->
						<a-modal v-model:visible="bgl_vis"
							:title="allcz_type==1?'曝光量充值':allcz_type==2?'商家充值':allcz_type==3?'商家提现':'充值'" @ok="bglOk"
							@cancel="handCancel">
							<div>
								<div style="display: flex;">
									<div style="display: flex;margin: 0 auto;">
										<div style="margin-top: 5px;">充值金额：</div>
										<div>
											<a-input prefix="￥" suffix="RMB" v-model:value="czje"
												style="width: 300px;" />
											<!-- 曝光量 -->
											<div v-if="allcz_type==1">
												<div style="color: #ff0000;" v-if="!czje">1RMB={{jbpz.charge_power}}曝光量
												</div>
												<div style="color: #ff0000;" v-else>
													{{czje}}RMB={{czje*jbpz.charge_power}}曝光量
												</div>
											</div>
										</div>
									</div>
								</div>
								<div style="display: flex;margin-top: 10px;">
									<div v-if="allcz_type==3" style="display: flex;margin: 0 auto;">
										<div style="margin-top: 5px;">提现密码：</div>
										<a-input v-model:value="txpassword" style="width: 300px;" />
									</div>
								</div>
							</div>
						</a-modal>
						<div style="display: flex;align-items: center;">
							<div v-if="is_ptsj=='平台'" style="margin: 0 auto;">
								<div class="a68">
									<div style="margin-right: 20px;">
										<img src="../../../../public/resource/image/yj.png" class="a69" alt="">
									</div>
									<div class="a70">{{Number(zjxqtj.store_money).toLocaleString()}}</div>
								</div>
								<div style="display: flex;">
									<div>商家保证金：{{Number(shopObj.pay_deposit_money).toLocaleString()}}</div>
									<div style="margin-left: 10px;">
										分类保证金：{{Number(shopObj.payed_type_prices).toLocaleString()}}</div>
								</div>
							</div>
							<div v-else style="display: flex;margin: 0 auto;">
								<div class="a71">
									<div style="display: flex;">
										<div class="a68b">
											<div style="margin-right: 20px;">
												<img src="../../../../public/resource/image/yj.png" class="a69" alt="">
											</div>
											<div v-if="shopObj.pay_deposit_money>shopObj.deposit_money" class="a72">
												{{Number(zjxqtj.store_money).toLocaleString()}}</div>
											<div v-else @click="payBzj()"
												style="font-size: 25px;color: #0c96f1;cursor: pointer;">缴纳保证金</div>
										</div>
										<div class="a73">
											<div class="a74">
												<div class="a75">
													<ExclamationCircleOutlined class="a76" />
													<div>温馨提示</div>
												</div>
												<CloseOutlined @click="closeWarning" />
											</div>
											<div>当前押金过低请前往充值！</div>
										</div>
									</div>
									<div style="display: flex;">
										<div>商家保证金：{{Number(shopObj.pay_deposit_money).toLocaleString()}}</div>
										<div style="margin-left: 10px;">
											分类保证金：{{Number(shopObj.payed_type_prices).toLocaleString()}}</div>
									</div>
									<div style="color: #ff0000;">当货款余额充足时，押金不足时将使用货款自动补齐押金.</div>
								</div>
								<div style="padding: 20px;cursor: pointer;" v-if="shopObj.open_h_store_account=='c'">
									<div class="a77" @click="czvisopen(2)">充值</div>
									<div class="a78" @click="czvisopen(3)">提现</div>
								</div>
								<div v-else style="padding: 20px;cursor: pointer;">
									<div class="a77Cancel" @click="()=>{message.error('请开通商家汇付并绑定提现银行卡')}">充值</div>
									<div class="a77Cancel" @click="()=>{message.error('请开通商家汇付并绑定提现银行卡')}">提现</div>
								</div>
							</div>
						</div>
					</div>
					<div class="a79">资金流水日志</div>
					<div class="a80">
						<div class="a81">
							<div>订单编号</div>
							<div>
								<a-input placeholder="请输入订单编号" class="a82" v-model:value="zjrzParams.order_id"
									style="border:none;border-radius: 4px;"></a-input>
							</div>
						</div>
						<div class="a81">
							<div>流水类型</div>
							<div>
								<a-select ref="select" v-model:value="zjrzParams.type"
									class="a83 custom-select-wrapper">
									<a-select-option value="b">商家余额充值</a-select-option>
									<a-select-option value="c">商家基础保证金</a-select-option>
									<a-select-option value="d">商家分类保证金</a-select-option>
									<a-select-option value="f">普通商品订单</a-select-option>
									<a-select-option value="g">积分商品订单</a-select-option>
									<a-select-option value="h">红包</a-select-option>
									<a-select-option value="i">商家罚金</a-select-option>
									<a-select-option value="j">购买曝光量</a-select-option>
									<a-select-option value="k">提现</a-select-option>
									<a-select-option value="l">退店</a-select-option>
								</a-select>
							</div>
						</div>
						<div class="a81">
							<div>流水时间</div>
							<div>
								<a-range-picker v-model:value="zjrzParams.time" class="a82" :format="'YYYY/MM/DD'"
									:value-format="'YYYY/MM/DD'" style="border:none;border-radius: 4px;" />
							</div>
						</div>
						<div class="a84">
							<div class="a85" @click="chongz()">
								<ReloadOutlined style="margin-right: 10px;" />
								重置
							</div>
							<div class="a86" @click="chaxun()">
								<SearchOutlined style="margin-right: 10px;" />
								查询
							</div>
						</div>
					</div>
					<div class="a87"></div>
					<div>
						<div class="a88">
							<div>订单编号</div>
							<div>流水类型</div>
							<div>金额</div>
							<div>流水时间</div>
						</div>
						<div v-for="item in zjrzList" :key="item.id" class="a89">
							<div>
								<span v-if="item.type=='f'||item.type=='g'">{{item.order_id}}</span>
								<span v-else></span>
							</div>
							<div>
								<span v-if="item.type=='b'">商家余额充值</span>
								<span v-else-if="item.type=='c'">商家基础保证金</span>
								<span v-else-if="item.type=='d'">商家分类保证金</span>
								<span v-else-if="item.type=='f'">普通商品订单</span>
								<span v-else-if="item.type=='g'">积分商品订单</span>
								<span v-else-if="item.type=='h'">红包</span>
								<span v-else-if="item.type=='i'">商家罚金</span>
								<span v-else-if="item.type=='j'">购买曝光量</span>
								<span v-else-if="item.type=='k'">提现</span>
								<span v-else-if="item.type=='l'">退店</span>
							</div>
							<div>
								<span v-if="item.trans_amt !=0">
									{{item.in_or_out=='in'?'+':'-'}}
								</span>
								<span>{{Number(item.trans_amt).toLocaleString()}}</span>
							</div>
							<div>{{item.create_time}}</div>
						</div>
						<div v-if="zjrzList.length==0" style="padding: 10px;">
							<a-empty />
						</div>
						<div class="a90" v-if="zjrzList.length>0">
							<div></div>
							<div class="a91">
								<div class="a92">共 {{zjrzCount}} 项数据</div>
								<a-pagination v-model:current="current" :total="zjrzCount" show-less-items
									@change="pagChange" :showSizeChanger="false" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- 支付弹框 -->
		<a-modal v-model:visible="isPay" :centered="true" @ok="handOKCode" :keyboard="false" ok-text="已支付"
			cancel-text="放弃" :maskClosable="false">
			<div class="container">
				<div class="pcHeader">
					<img class="logoImg"
						src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/shopImg/2025421/tjgvd9d3mr771js7f2o6hqqjsegs2p9b.png"
						alt="Logo" title="Logo" />
					<div class="headerTitle">收银台</div>
				</div>
				<div class="price">
					<span class="priceUnit">¥</span>
					<span class="priceNumber" v-if="cz_type=='bzj'">{{shopObj.deposit_money}}</span><!-- 保证金 -->
					<span class="priceNumber" v-else-if="cz_type=='bgl'">{{czje}}</span><!-- 曝光量 -->
					<span class="priceNumber" v-else-if="cz_type=='flbzj'">{{pay_Obj.trans_amt}}</span><!-- 分类保证金 -->
					<span class="priceNumber" v-else-if="cz_type=='sjcz'">{{czje}}</span><!-- 商家充值 -->
				</div>
				<div class="payTimeRemaining">
					<span class="payTxt">支付剩余时间</span>
					<span class="time">
						<span class="time">
							<span class="timeItem">{{ minute }}</span>
							<span class="timeSplit">:</span>
							<span class="timeItem">{{ second }}</span>
						</span>
					</span>
				</div>
				<div class="payType">
					<ul class="payTab">
						<li class="payItem activePayItem" style="--theme: #0B5AFE" data-type="alipay">
							<img class="payIcon"
								src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/coverImg/2025421/1lbj3114n1mkb3mt71ak14ajhv5gc5nh.png" />
							<span class=" payTitle">支付宝</span>
						</li>
					</ul>
					<div class="payContent">
						<img :src="qrCodeData" alt="支付二维码" :style="{opacity: codeGq?'0.1':'1'}" />
						<div v-if="codeGq" style="position: relative;top: -100px;color: #000000;">
							二维码已失效
							<div style="color: #ff0000;cursor: pointer;" @click="sxewm">刷新</div>
						</div>
						<div class="conetentTxt"><span class="payDesc"><span id="payName">使用支付宝App扫码完成支付</span></span>
						</div>
					</div>
				</div>
			</div>
		</a-modal>
		<!--  -->
	</div>
</template>

<style lang="less" scoped>
	.cancel_btn {
		font-size: 18px !important;
		padding: 0 10px;
		float: left;
		margin-right: 20px;
	}

	/*  */
	.container {
		width: 100%;
		max-width: 1080px;
		height: 100%;
		max-height: 720px;
		position: relative;
		text-align: center;
		border-radius: 4px;
		box-sizing: border-box;
		font-size: 14px;
	}

	.pcHeader {
		margin-left: 24px;
		align-items: center;
		display: flex;
		flex-direction: row;
	}

	.logoImg {
		object-fit: contain;
		height: 30px;
		margin-right: 10px;
		max-width: 160px;
	}

	.headerTitle {
		font-size: 18px;
		font-weight: 500;
		color: #050505;
	}

	.price {
		font-size: 30px;
		font-weight: 700;
		margin-bottom: 10px;
		font-family: DINAlternate, DINAlternate-Bold;
		color: #333333;
	}

	.priceUnit {
		font-size: 20px;
		font-weight: 400;
		margin-right: 4px;
	}

	.priceNumber {
		font-size: 24px;
		font-weight: 500;
		margin-left: 4px;
	}

	.payTimeRemaining {
		margin-bottom: 6px;
	}

	.payTxt {
		color: #999;
		margin-right: 11px;
	}

	.time {
		font-weight: 400;
		font-size: 14px;
		color: #000000;
	}

	.timeItem {
		background: rgba(0, 0, 0, 0.04);
		border-radius: 2px;
		padding: 2px;
	}

	.timeSplit {
		margin: 0 4px;
	}

	.payTab {
		margin-top: 20px;
		display: flex;
		border-bottom: 1px solid #e9e6e6;
	}

	.payItem {
		padding: 10px 20px;
		background: #ffffff;
		font-size: 14px;
		display: flex;
		align-items: center;
		cursor: pointer;
		position: relative;
		margin-right: 20px;
		box-sizing: border-box;
	}

	.payItem:last-of-type {
		margin-right: 0;
	}

	.payIcon {
		height: 20px;
		object-fit: contain;
		margin-right: 10px;
	}

	.activePayItem {
		border-radius: 6px 6px 0px 0px;
		border: 1px solid #e9e6e6;
		border-bottom: none;
	}

	.payItem:first-of-type::after {
		position: absolute;
		content: '推荐';
		right: -18px;
		top: -11px;
		width: 36px;
		height: 22px;
		text-align: center;
		line-height: 22px;
		border-radius: 10px 0 10px 0;
		background: #E74E4E;
		color: #ffffff;
		z-index: 999;
		font-size: 12px;
	}

	.activePayItem::before {
		position: absolute;
		content: '';
		right: 0;
		bottom: -1px;
		width: 100%;
		height: 3px;
		background: #ffffff;
		z-index: 999;
	}

	.payContent {
		display: flex;
		width: 100%;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.conetentTxt {
		text-align: center;
		font-weight: 400;
		color: #000000;
		/* margin-bottom: 55px; */
	}

	/*  */
	::v-deep(.custom-select-wrapper.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
		background-color: #f7f8f9;
		border: none;
		border-radius: 4px;
	}

	.table {
		border-collapse: collapse;
		border: 1px solid #e9e9e9;
		font-family: sans-serif;
		font-size: 0.8rem;
		letter-spacing: 1px;
		text-align: center;
		border-radius: 4px;
		width: 80vw;
	}

	.table th,
	td {
		border: 1px solid #e9e9e9;
		padding: 10px 20px !important;
	}

	td:last-of-type {
		text-align: center;
	}

	.phone-mask {
		position: relative;
		font-family: monospace;
	}

	.phone-mask::before {
		content: '****';
		position: absolute;
		left: 3ch;
		/* 每个字符宽度是一个ch单位，这里偏移前三位 */
		width: 4ch;
		background-color: white;
		/* 或背景色相同 */
		color: black;
		/* 可调为背景同色来“隐藏” */
	}

	.imgClose {
		width: 15px;
		height: 15px;
		position: absolute;
		right: 5px;
		top: 4px;
		color: #fff;
	}

	.a1 {
		border: 1px solid #f0f2f5;
		;
		padding: 20px;
		margin-top: 20px;
		border-radius: 4px;
	}

	.a2 {
		display: flex;
		align-items: center;
	}

	.a3 {
		color: orange;
		font-size: 16px;
	}

	.a4 {
		margin-left: 5px;
		font-size: 16px;
	}

	.a5 {
		color: orange;
		font-weight: bold;
	}

	.a6 {
		margin-left: 5px;
		font-size: 16px;
	}

	.a7 {
		color: red;
		font-weight: bold;
	}

	.a8 {
		margin-top: 15px;
		display: flex;
		align-items: center;
	}

	.a9 {
		width: 200px;
		height: 12px;
		border-radius: 20px;
		background-color: #0c96f1;
	}

	.a10 {
		width: 200px;
		height: 12px;
		border-radius: 20px;
		background-color: #ff0000;
	}

	.a11 {
		display: flex;
		margin-top: 15px;
	}

	.a12 {
		width: 94%;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		background-color: #f0f2f5;
		padding: 10px;
	}

	.a13 {
		display: flex;
		align-items: center;
		padding: 0px 10px;
		margin-top: 15px;
	}

	.a14 {
		font-size: 12px;
		color: #40a9ff;
	}

	.a15 {
		width: 100%;
		height: auto;
	}

	.a16 {
		display: flex;
		justify-content: space-between;
		font-size: 18px;
		font-weight: bold;
		align-items: center;
		border-bottom: 1px solid #f5f5f5;
	}

	.a17 {
		display: flex;
		cursor: pointer;
	}

	.a18 {
		padding: 5px 20px;
		border-radius: 15px 0px 0px 0px;
		border: 1px solid #f5f5f5;
	}

	.a18Check {
		background-color: #0c96f1;
		color: #fff;
	}

	.a19 {
		padding: 5px 20px;
		border: 1px solid #f5f5f5;
	}

	.a20 {
		padding: 5px 20px;
		border-radius: 10px 10px 0px 0px;
		border: 1px solid #f5f5f5;
	}

	.a21 {
		display: flex;
		align-items: center;
	}

	.a22 {
		border-radius: 5px;
		background-color: #0c96f1;
		color: #fff;
		padding: 3px 20px;
		margin-left: 15px;
		font-size: 14px;
		cursor: pointer;
	}

	.a22B {
		border-radius: 5px;
		background-color: #ff0000;
		color: #fff;
		padding: 3px 20px;
		margin-left: 15px;
		font-size: 14px;
		cursor: pointer;
	}

	.a23 {
		font-size: 18px;
		font-weight: bold;
	}

	.a24 {
		display: flex;
		/* font-size: 17px; */
		align-items: center;
	}

	.a25 {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		width: 80%;
		margin-top: 10px;
	}

	.a26 {
		width: 120px;
		color: #666666;
		text-align: right;
		/* font-weight: bold; */
	}

	.a27 {
		display: flex;
		margin-top: 5px;
	}

	.a28 {
		/* font-weight: bold; */
		margin-left: 30px;
	}

	.a29 {
		/* font-weight: bold; */
		margin-left: 30px;
	}

	.a30 {
		display: flex;
		margin-top: 10px;
	}

	.a31 {
		width: 100px;
		color: #666666;
		text-align: right;
		font-weight: bold;
	}

	.a32 {
		font-weight: bold;
		margin-left: 30px;
	}

	.a33 {
		display: flex;
		margin-top: 5px;
		/* font-weight: bold; */
	}

	.a34 {
		width: 120px;
		color: #666666;
		text-align: right;
	}

	.a35 {
		/* font-weight: bold; */
		margin-left: 30px;
	}

	.a36 {
		width: 70px;
		height: 70px;
		border-radius: 4px;
	}

	.a37 {
		font-weight: bold;
		color: #666666;
	}

	.a38 {
		font-size: 18px;
		font-weight: bold;
		margin-top: 20px;
	}

	.a39 {
		display: flex;
		margin-top: -1px;
		justify-content: space-between;
		align-items: center;
		width: 80vw;
		padding: 10px;
		border: 1px solid #e9e9e9;
	}

	.a40 {
		height: 10px;
		background-color: #f5f5f5;
		margin-top: 10px
	}

	.a41 {
		width: 80%;
		padding: 20px;
	}

	.a42 {
		border: 1px solid #f5f5f5;
		margin-top: 10px
	}

	.a43 {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		border-bottom: 1px solid #f5f5f5;
		padding: 10px 0px;
		cursor: pointer;
	}

	.a44 {
		display: flex;
		padding: 20px;
		align-items: center;
		border-right: 1px solid #f5f5f5;
		margin-left: 20px;
	}

	.a45 {
		background-color: #f9f9f9;
		border-radius: 50%;
		margin-right: 20px;
		padding: 10px;
	}

	.a46 {
		font-size: 30px;
		color: #40a9ff;
	}

	.a47 {
		font-weight: bold;
		font-size: 30px;
	}

	/* .a48{display: flex;padding: 20px;align-items: center;border-right: 1px solid #f5f5f5;margin-left: 20px;}
	.a49{background-color: #f9f9f9;border-radius: 50%;margin-right: 20px;padding: 10px;}
	.a50{font-size: 30px;color: #40a9ff;}
	.a51{font-weight: bold;font-size: 30px;} */
	.a52 {
		display: flex;
		padding: 20px;
		align-items: center;
		margin-left: 20px;
	}

	.a52b {
		display: flex;
		padding: 20px 0px;
		align-items: center;
		margin-left: 20px;
	}

	.a53 {
		background-color: #f9f9f9;
		border-radius: 50%;
		margin-right: 20px;
		padding: 10px;
	}

	.a54 {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 20px 0px;
		padding: 0px 20px;
		font-size: 17px;
	}

	.a55 {
		color: #999999;
		font-size: 14px;
	}

	.a56 {
		width: 76vw;
		height: 400px;
		position: relative;
		left: -4vw;
		top: -5vh;
	}

	.a57 {
		width: 10px;
		background-color: #f5f5f5;
	}

	.a58 {
		border-radius: 4px;
		padding: 10px 20px;
	}

	.a59 {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.a60 {
		color: #40a9ff;
		cursor: pointer;
	}

	.a61 {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #f5f5f5;
		padding: 5px 0px;
	}

	.a62 {
		height: 10px;
		background-color: #f5f5f5;
	}

	.a63 {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		text-align: center;
		border-bottom: 1px solid #f5f5f5;
	}

	.a64 {
		border-right: 1px solid #f5f5f5;
		padding: 10px 0px;
	}

	.a65 {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		border-bottom: 1px solid #f5f5f5;
	}

	.a66 {
		border-right: 1px solid #f5f5f5;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		padding: 20px;
	}

	.a67 {
		color: #666666;
		margin-right: 20px;
		width: 100px;
		text-align: right;
	}

	.a68 {
		align-items: center;
		display: flex;
		margin: 0 auto;
	}

	.a68b {
		align-items: center;
		display: flex;
		/* margin: 0 auto; */
	}

	.a69 {
		width: 50px;
		height: 50px;
	}

	.a70 {
		font-weight: bold;
		font-size: 30px;
		color: #4e5969;
	}

	.a71 {
		margin: 20px 0px 20px 5vw
	}

	.a72 {
		font-weight: bold;
		font-size: 25px;
		color: #4e5969;
	}

	.a73 {
		border: 1px solid #f5f5f5;
		border-radius: 4px;
		padding: 5px 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-left: 10px;
	}

	.a74 {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.a75 {
		display: flex;
		align-items: center;
	}

	.a76 {
		color: #ff0000;
		margin-right: 10px;
	}

	.a77 {
		background-color: #00d521;
		color: #fff;
		padding: 5px 20px;
		border-radius: 10px;
	}

	.a77Cancel {
		background-color: #f5f5f5;
		color: #999999;
		padding: 5px 20px;
		border-radius: 10px;
		margin-bottom: 5px;
	}

	.a78 {
		background-color: #e8c402;
		color: #fff;
		padding: 5px 20px;
		border-radius: 10px;
		margin-top: 10px;
	}

	.a79 {
		font-weight: bold;
		margin-top: 10px;
		font-size: 17px;
	}

	.a80 {
		color: #666666;
		display: flex;
		justify-content: space-between;
		margin-top: 10px;
	}

	.a81 {
		display: flex;
		align-items: center;
	}

	.a82 {
		margin-left: 10px;
		background-color: #f7f8f9;
		width: 15vw;
	}

	.a83 {
		margin-left: 10px;
		background-color: #f7f8f9 !important;
		width: 15vw;
	}

	.a84 {
		display: flex;
		align-items: center;
		width: 15vw;
	}

	.a85 {
		padding: 5px 10px;
		background-color: #f7f8f9;
		border-radius: 4px;
		align-items: center;
		display: flex;
	}

	.a86 {
		padding: 5px 10px;
		background-color: #40a9ff;
		color: #fff;
		border-radius: 4px;
		margin-left: 20px;
		display: flex;
		align-items: center;
	}

	.a87 {
		height: 2px;
		margin: 10px 0px;
		background-color: #f7f8f9;
	}

	.a88 {
		padding: 10px 30px;
		display: grid;
		background-color: #f2f3f5;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		text-align: left;
	}

	.a89 {
		padding: 10px 30px;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		text-align: left;
		border-bottom: 1px solid #f5f5f5;
	}

	.a90 {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 30px;
	}

	.a91 {
		display: flex;
		align-items: center;
	}

	.a92 {
		color: #666666;
		margin-right: 20px;
	}
</style>