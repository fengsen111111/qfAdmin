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
		console.log('店铺信息');
		global.axios.post('decoration/CustomerService/getMyJoinerSign', {}, global, true).then((res_one) => {
			console.log('自己的商家id', res_one);
			global.axios.post('decoration/Store/webGetStoreInfo', {
				store_id: res_one.joiner_sign
			}, global)
				.then(res => {
					console.log('店铺数据', res);
					shopObj.value = res
					logo.value = res.logo
					// a待审核 b 已通过 c已拒绝
					shType.value = res.check_status
					if (shType.value == 'b') {
						getGoodsTypeList()
					}
					if (shType.value == 'c') {
						global.axios.post('decoration/Store/getSubmitEntryApplyMsg', {
							mobile: shopObj.value.mobile,
						}, global).then(res => {
							console.log('商家入驻信息', res);
							check_remark.value = res.check_remark
						})
					}

					// 生成分类表格数据
					const flattened = flattenCategories(shopObj.value.goods_types);
					renderTable(flattened);
				})
		})
		// 
	}
	function _shopInfoPc() {
		global.axios.post('decoration/Store/webGetStoreInfo', {
			store_id: pageData.data.id
		}, global)
			.then(res => {
				console.log('店铺数据', res);
				shopObj.value = res
				logo.value = res.logo
				// a待审核 b 已通过 c已拒绝
				shType.value = res.check_status
				if (shType.value == 'b') {
					getGoodsTypeList()
				}
				if (shType.value == 'c') {
					global.axios.post('decoration/Store/getSubmitEntryApplyMsg', {
						mobile: shopObj.value.mobile,
					}, global).then(res => {
						console.log('商家入驻信息', res);
						check_remark.value = res.check_remark
					})
				}

				// 生成分类表格数据
				const flattened = flattenCategories(shopObj.value.goods_types);
				renderTable(flattened);
			})
	}
	console.log('pageData', pageData.data);
	if (pageData.data) {
		_shopInfoPc()
	} else {
		_shopInfo()
	}

	const shType = ref('a')//a待审核 b 已通过 c已拒绝
	const check_remark = ref('')//拒绝原因
	// 前往学习中心
	function toXXzx() {
		global.router.push('/ruleCenter?title=学习中心')
	}
	// 重新入驻
	function cxrz() {
		global.router.push('/openShop?type=' + shopObj.value.type + '&mobile=' + shopObj.value.mobile + '&password=' + shopObj.value.password)
	}

	// 复制店铺编号
	function copyCode(code) {
		navigator.clipboard.writeText(code).then(() => {
			message.success('复制成功')
		}).catch(err => {
			message.error('复制失败')
		});
	}

	const visible_logo = ref(false)//logo修改规则开关
	const visible_shop_name = ref(false)//店铺名字修改开关

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

	const infoArr = ref([
		{ key: 'id', name: '店铺编号' },
		{ key: 'create_time', name: '开店时间' },
		{ key: 'mobile', name: '手机号' },
		{ key: 'store_name', name: '店铺名称' },
		{ key: 'type', name: '店铺类型' },
		{ key: 'name', name: '联系人' },
		// { key: '', name: '店铺主体' },
		// { key: 'address', name: '地址' },
	])


	const dataType = ref([])
	function getGoodsTypeList() {
		global.axios
			.post('decoration/GoodsType/getGoodsTypeList', {}, global)
			.then((res) => {
				console.log('商品分类列表', res.list);
				// dataType.value = res.list
				// const flattened = flattenCategories(dataType.value);
				// renderTable(flattened);
				dataType.value = res.list.map((item) => {
					return {
						value: item.id,
						label: item.name,
						children: item.children.length == 0 ? [] : item.children.map((iss) => {
							return {
								value: iss.id,
								label: iss.name,
								children: iss.children.length == 0 ? [] : iss.children.map((y) => {
									return {
										value: y.id,
										label: y.name,
									}
								})
							}
						})
					}
				})
			});
	}
	// 已通过
	if (shType.value == 'b') {
		getGoodsTypeList()
	}

	// 平铺多级结构为数组路径
	function flattenCategories(list, path = [], result = []) {
		list.forEach(item => {
			const newPath = [...path, item];
			if (item.children && item.children.length) {
				flattenCategories(item.children, newPath, result);
			} else {
				result.push(newPath);
			}
		});
		return result;
	}

	// 计算每列的 rowspan
	function calculateRowspan(data, levelCount) {
		const rowspanMap = Array.from({ length: levelCount }, () => new Map());

		data.forEach((row, rowIndex) => {
			row.forEach((col, colIndex) => {
				const key = col.id;
				if (!rowspanMap[colIndex].has(key)) {
					// 从当前行往下看还有多少重复项
					let count = 1;
					for (let i = rowIndex + 1; i < data.length; i++) {
						if (data[i][colIndex]?.id === key) count++;
						else break;
					}
					rowspanMap[colIndex].set(key, { rowIndex, count });
				}
			});
		});
		return rowspanMap;
	}

	// 渲染到 HTML 表格
	function renderTable(data) {
		const table = document.querySelector(".table");
		// ✅ 只清除旧的 <tbody>，保留 <thead>
		const oldTbody = table.querySelector("tbody");
		if (oldTbody) {
			table.removeChild(oldTbody);
		}
		const tbody = document.createElement("tbody");
		const levelCount = Math.max(...data.map(row => row.length));
		const rowspanMap = calculateRowspan(data, levelCount);
		data.forEach((row, rowIndex) => {
			const tr = document.createElement("tr");
			row.forEach((col, colIndex) => {
				const { id, name } = col;
				const map = rowspanMap[colIndex].get(id);
				if (map.rowIndex === rowIndex) {
					const td = document.createElement("td");
					td.textContent = name;
					if (map.count > 1) {
						td.setAttribute("rowspan", map.count);
					}
					tr.appendChild(td);
				}
			});
			// 若某级为空，补空td
			for (let i = row.length; i < levelCount; i++) {
				tr.appendChild(document.createElement("td"));
			}
			tbody.appendChild(tr);
		});
		table.appendChild(tbody);
	}

	// 分页
	const current = ref(1)

	const titleType = ref('店铺信息')

	// 图表
	const chartRef = ref(null)
	let chartInstance = null
	function ech() {
		chartInstance = echarts.init(chartRef.value)
		const option = {
			tooltip: {
				trigger: 'axis',
				formatter: function (params) {
					const data = params[0];
					return `${data.axisValue}<br/>营业额: ${data.data} 元`;
				},
				axisPointer: {
					type: 'line'
				}
			},
			xAxis: {
				type: 'category',
				data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
			},
			yAxis: {
				type: 'value'
			},
			series: [
				{
					data: [820, 932, 901, 934, 1290, 1330, 732, 1320, 1420, 1020, 1320, 1432],
					type: 'line',
					smooth: true,
					lineStyle: {
						width: 3,
						color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
							{ offset: 0, color: '#58d2fc' },
							{ offset: 1, color: '#7348fb' }
						])
					},
					itemStyle: {
						color: '#4080FF' // 拐点颜色
					},
					areaStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: '#e3f0ff' },
							{ offset: 1, color: '#fff' }
						])
					}
				}
			],
		}
		chartInstance.setOption(option)
	}
	setTimeout(() => {
		ech()
		window.addEventListener('resize', () => {
			chartInstance && chartInstance.resize();
		});
	}, 1000);

	watch(() => titleType.value, (newVal, oldVal) => {
		if (newVal == '店铺信息') {
			setTimeout(() => {
				const flattened = flattenCategories(shopObj.value.goods_types);
				renderTable(flattened);
			}, 1000);
		} else if (newVal == '店铺数据') {
			setTimeout(() => {
				ech()
				window.addEventListener('resize', () => {
					chartInstance && chartInstance.resize();
				});
			}, 1000);
		}
	});

	// 删除温馨提示
	function closeWarning() {
		const el = document.querySelector('.a73');
		if (el) el.remove();
	}

	const is_ptsj = ref('商家')
	const store_id = ref('')//商家id
	function getCustomerRoomList() {
		// 获取自己的角色ID和聊天状态
		global.axios.post('decoration/CustomerService/getMyJoinerSign', {}, global, true).then((res_one) => {
			console.log('自己商家id和禁言状态', res_one);
			store_id.value = res_one.joiner_sign
			is_ptsj.value = res_one.joiner_sign == 1 ? "平台" : '商家'
			if (is_ptsj.value == '商家') {
				getGoodsSaledNumberTopList()// 获取商品销量排行列表
				getGoodsPowerTopList()// 获取商品投流排行列表
			}
		})
	}
	getCustomerRoomList()

	const spxlphlist = ref([])//商品销量排行列表
	const sptlphlist = ref([])//商品投流排行列表
	// 获取商品销量排行列表
	function getGoodsSaledNumberTopList() {
		global.axios.post('decoration/Setting/getGoodsSaledNumberTopList', {
			currentPage: 1,
			perPage: 10
		}, global, true).then((res) => {
			console.log('获取商品销量排行列表', res);
			spxlphlist.value = res.list
		})
	}
	// 获取商品投流排行列表
	function getGoodsPowerTopList() {
		global.axios.post('decoration/Setting/getGoodsPowerTopList', {
			currentPage: 1,
			perPage: 10
		}, global, true).then((res) => {
			console.log('获取商品投流排行列表', res);
			sptlphlist.value = res.list
		})
	}

	// 商家汇付sta
	const treeData = ref([])
	function getAreas() {
		global.axios
			.post('factory_system/Base/getAreas', {}, global)
			.then((res) => {
				console.log('地址数据',res);
				treeData.value = res.areas
			});
	}
	getAreas()

	const hf_vis = ref(false)
	const formState = reactive({
		reg_name: '', //企业名称 
		license_code: '',//营业执照编号
		license_begin_date: '',//营业执照有效期起始日期
		license_validity_type: '0',//营业执照有效期  1长期有效  0非长期有效
		license_end_date: '',//营业执照有效期结束日期 非长期有效必填 
		// reg_prov_id: '',//注册地址(省)
		// reg_area_id: '',//注册地址(市)
		// reg_district_id: '',//注册地址(区)
		regAddress: '',//注册地址
		reg_detail: '',//注册地址(详细信息) 
		legal_name: '',//法人姓名
		legal_cert_np: '',//法人身份证号码
		legal_cert_begin_date: '',//身份证有效期开始时间  
		legal_cert_validity_type: '0',//身份证有效期  1长期有效  0非长期有效 
		legal_cert_end_date: '',//身份证有效期结束时间 非长期有效必填  
		contract_name: '',//联系人姓名 
		contract_mobile: '',//联系人手机号  
	});
	const formRef = ref();//表单绑定
	// 提交汇付
	function handHfOk() {
		console.log('汇付点击确定');
		formRef.value
			.validateFields()
			.then(values => {
				console.log('验证成功', values);
				// 执行提交逻辑
				let params = values
				params.reg_prov_id = params.regAddress[0]
				params.reg_area_id = params.regAddress[1]
				params.reg_district_id = params.regAddress[2]
				delete params.regAddress //删除注册地址，这个是自己的字段
				params.license_begin_date = params.license_begin_date.format('YYYYMMDD')
				if (params.license_end_date) {
					params.license_end_date = params.license_end_date.format('YYYYMMDD')
				}
				params.legal_cert_begin_date = params.legal_cert_begin_date.format('YYYYMMDD')
				if (params.legal_cert_end_date) {
					params.legal_cert_end_date = params.legal_cert_end_date.format('YYYYMMDD')
				}
				console.log('处理后的params', params);
				// return false
				global.axios.post('decoration/Store/openStoreHAccount', params, global, true).then((res) => {
					console.log('res汇付开通结果', res);
					message.success('操作成功')
					hf_vis.value = false
					_shopInfo()
				})
			})
			.catch(err => {
				console.log('验证失败', err);
			});
	}
	// 商家汇付end

	// 商家银行卡sta
	const bankCodes = [
		{ value: '01040000', text: "中国银行" },
		{ value: '01030000', text: "中国农业银行" },
		{ value: '01020000', text: "中国工商银行" },
		{ value: '01050000', text: "中国建设银行" },
		{ value: '03010000', text: "交通银行" },
		{ value: '04030000', text: "中国邮政储蓄银行" },
		{ value: '03040000', text: "华夏银行" },
		{ value: '03080000', text: "招商银行" },
		{ value: '03100000', text: "上海浦东发展银行" },
		{ value: '03160000', text: "浙商银行" },
		{ value: '03060000', text: "广发银行" },
		{ value: '03130012', text: "天津银行" },
		{ value: '31346100', text: "济宁银行" },
		{ value: '03050000', text: "中国民生银行" },
	]
	const bank_vis = ref(false)
	const formStateBank = reactive({
		type: 'store', //store商家 user用户 
		card_name: '',//卡户名
		card_no: '',//卡号 商家对公，个人对私
		regAddress: '',//银行所在地址
		// prov_id: '',//银行所在(省)
		// area_id: '',//银行所在(市)
		bank_code: '',//银行号 商家绑定对公银行卡时必填
		branch_code: '',//支行联行号 商家绑定对公银行卡时必填
		cert_no: '',//持卡人身份证号码 用户绑定对私银行卡时必填 
		legal_cert_validity_type: '0',//持卡人身份证有效期  1长期有效  0非长期有效；用户绑定对私银行卡时必填
		legal_cert_begin_date: '',//持卡人身份证有效期开始时间 用户绑定对私银行卡时必填
		legal_cert_end_date: '',//持卡人身份证有效期结束时间 非长期有效必填；用户绑定对私银行卡时必填  
	});
	const formRefBank = ref();//表单绑定
	// 提交商家银行卡
	function handBankOk() {
		console.log('商家银行卡点击确定');
		formRefBank.value
			.validateFields()
			.then(values => {
				console.log('验证成功', values);
				// 执行提交逻辑
				let params = values
				params.prov_id = params.regAddress[0]
				params.reg_area_id = params.regAddress[1]
				delete params.regAddress //删除注册地址，这个是自己的字段
				params.legal_cert_begin_date = params.legal_cert_begin_date.format('YYYYMMDD')
				if (params.legal_cert_end_date) {
					params.legal_cert_end_date = params.legal_cert_end_date.format('YYYYMMDD')
				}
				console.log('处理后的params', params);
				global.axios.post('decoration/Setting/bindHBank', params, global, true).then((res) => {
					console.log('res绑定商家提现银行卡', res);
					message.success('操作成功')
					bank_vis.value = false
					_shopInfo()
				})
			})
			.catch(err => {
				console.log('验证失败', err);
			});
	}
	function xzlhh() {
		const link = document.createElement('a');
		link.href =
			'https://cloudpnrcdn.oss-cn-shanghai.aliyuncs.com/opps/api/prod/download_file/bank/%E9%93%B6%E8%A1%8C%E6%94%AF%E8%A1%8C%E7%BC%96%E7%A0%81.xlsx';
		link.download = '银行支行编码.xlsx';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
	// 商家银行卡end

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
	// 支付倒计时
	const updateTime = () => {
		const mins = Math.floor(totalSeconds.value / 60);
		const secs = totalSeconds.value % 60;
		minute.value = String(mins).padStart(2, '0');
		second.value = String(secs).padStart(2, '0');
		if (totalSeconds.value > 0) {
			totalSeconds.value--;
		} else {
			clearInterval(timer.value);
			// 倒计时结束后的处理逻辑
			console.log('倒计时结束');
			qrCodeData.value = ''
			isPay.value = false//
		}
	};
	const dateFormat = ref('YYYY/MM/DD')

	// 查询支付结果
	function handOKCode() {
		// if (cz_type.value = 'bzj') {
		// 	_shopInfo()
		// 	isPay.value = false
		// 	bgl_vis.value = false //曝光量充值
		// 	message.success('支付成功')
		// 	return false
		// }
		// console.log('确定');
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
	// 返回上一页
	function closeChildPage() {
		global.Modal.confirm({
			title: global.findLanguage(
				"确定要返回吗？该操作会导致未保存的数据丢失，请谨慎操作！"
			),
			okText: global.findLanguage("确定"),
			cancelText: global.findLanguage("取消"),
			okType: "primary",
			onOk: function () {
				// emit("closeChildPage", pageData.page_key);
				// 返回商家列表页
				emit("djtzmk", '用户管理', '商家管理');
			},
		});
	}

	const add_type_vis = ref(false)//添加分类弹窗
	const typeVal = ref([])//已选分类

	// 添加分类
	function addFlbzj() {
		add_type_vis.value = true
	}
	// 添加分类确定
	function handTypeOk() {
		console.log('121', yx_type.value);
		let arr = []
		yx_type.value.map((item) => {
			arr.push(item.value)
		})
		global.axios
			.post('decoration/Store/payTypePrices', {
				goods_type_ids: arr,
				trade_type: 'A_NATIVE',
			}, global)
			.then((res) => {
				console.log('分类保证金缴纳情况', res);
				pay_Obj.value = res
				if (res.pay_info) {
					pay_Obj.value.trans_amt = Number(pay_Obj.value.trans_amt).toFixed(2)
					cz_type.value = 'flbzj'
					if (timer.value) {
						clearInterval(timer.value);
						timer.value = null;
						totalSeconds.value = 5 * 60; // 5 分钟
						minute.value = '05';
						second.value = '00';
					}
					// 支付数据转二维码
					// console.log('分类生成', pay_Obj.value.pay_info);
					QRCode.toDataURL(pay_Obj.value.pay_info)
						.then((url) => {
							console.log('生成的二维码', url); // 将生成的二维码图片URL存储到状态中
							qrCodeData.value = url
							timer.value = setInterval(updateTime, 1000);
						})
						.catch((err) => {
							console.error('生成二维码失败', err);
						});
					add_type_vis.value = false
					isPay.value = true
				} else {
					// console.log('已缴纳');
					message.success('当前分类已无需缴纳')
				}
			})
	}
	const yx_type = ref([])//已选分类数据三级
	// 处理数剧
	function onChange(val, label) {
		yx_type.value = findCategoryPath(dataType.value, val);
	}
	function findCategoryPath(data, val, path = []) {
		for (const category of data) {
			if (category.value === val) {
				return [...path, category]; // 找到目标，返回路径
			}
			if (category.children && category.children.length > 0) {
				const result = findCategoryPath(category.children, val, [...path, category]);
				if (result) return result;
			}
		}
		return null; // 未找到
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
</script>

<template>
	<!--搜索-->
	<div>
		<!-- <div style="display: flex;">
			审核状态：<div @click="shType='a'">审核中</div>
			<div @click="shType='b'" style="margin-left:20px">通过</div>
			<div @click="shType='c'" style="margin-left:20px">拒绝</div>
		</div> -->
		<!-- <div>审核中状态</div> -->
		<div v-if="shType=='a'||shType=='c'">
			<div style="display: flex;align-items: center;">
				<a-button v-show="pageData.hasOwnProperty('parent_page_key')" class="iconfont button-class"
					style="font-size: 18px !important; padding: 0 10px; float: left;margin-right: 20px;"
					@click="closeChildPage()">&#xe6d2;
				</a-button>
				<div style="font-size: 18px;">
					店铺信息
				</div>
			</div>
			<div class="a1">
				<div class="a2">
					<ClockCircleFilled class="a3" />
					<div v-if="shType=='a'" class="a4">店铺信息审核中，预计在<span class="a5">2-3个工作日</span>审核完成</div>
					<div v-if="shType=='c'" class="a6">店铺信息审核失败，<span class="a7">拒绝入驻原因：{{check_remark}}</span></div>
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
							<span style="margin-left: 40px;"><span style="margin-right: 30px;">店铺类型</span>
								{{shopObj.type=='b'?'个人店铺':'实体店铺'}}</span>
						</div>
					</div>
				</div>
				<div>
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

		<!-- <div>审核通过</div> -->
		<div v-else>
			<!--搜索-->
			<div style="padding: 20px;">
				<div class="a16">
					<div class="a17">
						<div class="a18" :class="titleType=='店铺信息'?'a18Check':''" @click="titleType='店铺信息'">店铺信息</div>
						<div class="a19" :class="titleType=='店铺数据'?'a18Check':''" @click="titleType='店铺数据'">店铺数据</div>
						<div class="a20" :class="titleType=='资金日志'?'a18Check':''" @click="titleType='资金日志'">资金日志</div>
					</div>
					<div class="a21">
						<div>店铺详情页</div>
						<div class="a22" @click="closeChildPage()">
							返回</div>
					</div>
				</div>
				<!-- 店铺信息 -->
				<div v-if="titleType=='店铺信息'">
					<div class="a23" style="margin-top: 10px;">店铺信息</div>
					<div class="a24">
						<div class="a25">
							<template v-for="item in infoArr" :key="item">
								<div class="a27">
									<div class="a26">
										{{item.name}}:</div>
									<div class="a28" v-if="item.key=='type'">
										{{shopObj[item.key]=='a'?'本地商家':'网店商家'}}</div>
									<div class="a29" v-else>
										{{shopObj[item.key]?shopObj[item.key]:'无'}}</div>
								</div>
							</template>
							<div v-if="shopObj.type=='a'" class="a33">
								<div class="a34">店铺地址:</div>
								<div class="a35">{{shopObj.address}}</div>
							</div>

							<div class="a33">
								<div class="a34">商家汇付:</div>
								<div class="a35" v-if="shopObj.open_h_store_account=='a'" @click="hf_vis= true"
									style="cursor: pointer;color: #0c96f1;">点击开通</div>
								<div class="a35" v-else-if="shopObj.open_h_store_account=='c'"
									style="cursor: pointer;color: #0c96f1;">已开通</div>
								<div class="a35" v-else style="cursor: pointer;color: #0c96f1;">开通中</div>
							</div>
							<div class="a33">
								<div class="a34">商家提现银行卡:</div>
								<div class="a35"
									v-if="shopObj.open_h_store_account=='b'||shopObj.open_h_store_account=='a'"
									@click="bank_vis= true" style="cursor: pointer;color: #0c96f1;">点击绑定</div>
								<div class="a35" v-else-if="shopObj.open_h_store_account=='c'"
									style="cursor: pointer;color: #0c96f1;">已绑定</div>
								<div class="a35" v-else style="cursor: pointer;color: #0c96f1;">
									审核中</div>
							</div>
							<div v-if="shopObj.type=='a'" class="a33">
								<div class="a34">店铺主体:</div>
								<div class="a35"><img :src="shopObj.logo" alt="" class="a36"></div>
							</div>
						</div>
						<div style="text-align: center;" v-if="shopObj.logo">
							<img :src="shopObj.logo" alt="" class="a36">
							<div class="a37">店铺logo</div>
						</div>
					</div>
					<!-- 开通汇付 -->
					<a-modal v-model:visible="hf_vis" title="开通商家汇付" width="1000px" @ok="handHfOk">
						<div>
							<a-form :model="formState" ref="formRef" name="basic" :label-col="{ span: 10 }"
								:wrapper-col="{ span: 14 }">
								<a-row>
									<a-col :span="12">
										<a-form-item label="企业名称" name="reg_name"
											:rules="[{ required: true, message: '请输入企业名称' }]">
											<a-input v-model:value="formState.reg_name" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="营业执照编号" name="license_code"
											:rules="[{ required: true, message: '请输入营业执照编号' }]">
											<a-input v-model:value="formState.license_code" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="营业执照有效期" name="license_validity_type"
											:rules="[{ required: true, message: '请输入营业执照有效期' }]">
											<a-radio-group v-model:value="formState.license_validity_type"
												name="radioGroup">
												<a-radio value="1">长期有效</a-radio>
												<a-radio value="0">非长期有效</a-radio>
											</a-radio-group>
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="营业执照有效期起始日期" name="license_begin_date"
											:rules="[{ required: true, message: '请输入营业执照有效期起始日期' }]">
											<a-date-picker :format="dateFormat"
												v-model:value="formState.license_begin_date" style="width: 100%;" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="营业执照有效期结束日期" name="license_end_date">
											<a-date-picker :format="dateFormat"
												v-model:value="formState.license_end_date" style="width: 100%;" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="注册地址" name="regAddress"
											:rules="[{ required: true, message: '请输入注册地址' }]">
											<a-cascader v-model:value="formState.regAddress" :options="treeData" :field-names="{ label: 'label', value: 'adcode', children: 'children' }"
												placeholder="请输入注册地址" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="注册地址(详细信息)" name="reg_detail"
											:rules="[{ required: true, message: '请输入注册地址(详细信息)' }]">
											<a-input v-model:value="formState.reg_detail" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="法人姓名" name="legal_name"
											:rules="[{ required: true, message: '请输入法人姓名' }]">
											<a-input v-model:value="formState.legal_name" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="法人身份证号码" name="legal_cert_np"
											:rules="[{ required: true, message: '请输入法人身份证号码' }]">
											<a-input v-model:value="formState.legal_cert_np" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="身份证有效期" name="legal_cert_validity_type"
											:rules="[{ required: true, message: '请输入身份证有效期' }]">
											<a-radio-group v-model:value="formState.legal_cert_validity_type"
												name="radioGroup">
												<a-radio value="1">长期有效</a-radio>
												<a-radio value="0">非长期有效</a-radio>
											</a-radio-group>
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="身份证有效期开始时间" name="legal_cert_begin_date"
											:rules="[{ required: true, message: '请输入身份证有效期开始时间' }]">
											<a-date-picker :format="dateFormat"
												v-model:value="formState.legal_cert_begin_date" style="width: 100%;" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="身份证有效期结束时间" name="legal_cert_end_date">
											<a-date-picker :format="dateFormat"
												v-model:value="formState.legal_cert_end_date" style="width: 100%;" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="联系人姓名" name="contract_name"
											:rules="[{ required: true, message: '请输入联系人姓名' }]">
											<a-input v-model:value="formState.contract_name" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="联系人手机号" name="contract_mobile"
											:rules="[{ required: true, message: '请输入联系人手机号' }]">
											<a-input v-model:value="formState.contract_mobile" />
										</a-form-item>
									</a-col>
								</a-row>
							</a-form>
						</div>
					</a-modal>
					<!-- 绑定商家银行卡 -->
					<a-modal v-model:visible="bank_vis" title="绑定商家提现银行卡" width="1000px" @ok="handBankOk">
						<div>
							<a-form :model="formStateBank" ref="formRefBank" name="basic" :label-col="{ span: 10 }"
								:wrapper-col="{ span: 14 }">
								<a-row>
									<a-col :span="12">
										<a-form-item label="卡户名" name="card_name"
											:rules="[{ required: true, message: '请输入卡户名' }]">
											<a-input v-model:value="formStateBank.card_name" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="商家对公卡号" name="card_no"
											:rules="[{ required: true, message: '请输入商家对公卡号' }]">
											<a-input v-model:value="formStateBank.card_no" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="银行所在地址" name="regAddress"
											:rules="[{ required: true, message: '请输入银行所在地址' }]">
											<a-cascader v-model:value="formStateBank.regAddress" :options="treeData" :field-names="{ label: 'label', value: 'adcode', children: 'children' }"
												placeholder="请输入银行所在地址" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="银行号" name="bank_code"
											:rules="[{ required: true, message: '请输入银行号' }]">
											<a-select ref="select" v-model:value="formStateBank.bank_code"
												style="width: 100%">
												<a-select-option :value="item.value" v-for="item in bankCodes"
													:key="item.value">{{item.text}}</a-select-option>
											</a-select>
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="支行联行号" name="branch_code"
											:rules="[{ required: true, message: '请输入支行联行号' }]">
											<div style="display: flex;align-items: center;">
												<a-input v-model:value="formStateBank.branch_code" />
												<div @click="xzlhh()"
													style="margin-left: 10px;color: #0c96f1;white-space: nowrap;cursor: pointer;">
													查询</div>
											</div>
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="持卡人身份证号码" name="cert_no"
											:rules="[{ required: true, message: '请输入持卡人身份证号码' }]">
											<a-input v-model:value="formStateBank.cert_no" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="身份证有效期" name="legal_cert_validity_type"
											:rules="[{ required: true, message: '请输入身份证有效期' }]">
											<a-radio-group v-model:value="formStateBank.legal_cert_validity_type"
												name="radioGroup">
												<a-radio value="1">长期有效</a-radio>
												<a-radio value="0">非长期有效</a-radio>
											</a-radio-group>
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="身份证有效期开始时间" name="legal_cert_begin_date"
											:rules="[{ required: true, message: '请输入身份证有效期开始时间' }]">
											<a-date-picker :format="dateFormat"
												v-model:value="formStateBank.legal_cert_begin_date"
												style="width: 100%;" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="身份证有效期结束时间" name="legal_cert_end_date">
											<a-date-picker :format="dateFormat"
												v-model:value="formStateBank.legal_cert_end_date"
												style="width: 100%;" />
										</a-form-item>
									</a-col>
								</a-row>
							</a-form>
						</div>
					</a-modal>
					<div class="a38">认证商品类目</div>
					<div style="margin-top: 10px;">
						<div style="margin-bottom: 10px;cursor: pointer;">
							<a-button type="primary" @click="addFlbzj">添加分类</a-button>
						</div>
						<!-- 添加分类 -->
						<a-modal v-model:visible="add_type_vis" title="添加分类" @ok="handTypeOk">
							<div style="display: flex;">
								<div style="display: flex;margin: 0 auto;">
									<div style="margin-top: 5px;">商品分类：</div>
									<div>
										<a-tree-select @change="onChange" v-model:value="typeVal" show-search
											style="width: 350px;"
											:dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
											placeholder="请输入关键词搜索分类" allow-clear tree-default-expand-all
											:tree-data="dataType" tree-node-filter-prop="label">
											<template #title="{ value: val, label }">
												<b v-if="val === 'parent 1-1'" style="color: #08c">sss</b>
												<template v-else>{{ label }}</template>
											</template>
										</a-tree-select>
									</div>
								</div>
							</div>
						</a-modal>
						<div>
							<table class="table" border="1">
								<thead>
									<tr style="font-weight: bold;font-size: 18px;">
										<th scope="col">一级分类</th>
										<th scope="col">二级分类</th>
										<th scope="col">三级分类</th>
										<th scope="col">商品</th>
									</tr>
								</thead>
								<!-- 渲染数据行 -->
								<!-- 动态插入 -->
							</table>
							<div v-if="shopObj.goods_types.length==0"
								style="border-left: 1px solid #e9e9e9;border-right: 1px solid #e9e9e9;padding: 10px;width: 80vw;">
								<a-empty />
							</div>
							<div class="a39" v-if="shopObj.goods_types">
								<div style="color: #666666;">共 {{shopObj.goods_types.length}} 项数据</div>
								<a-pagination v-model:current="current" :total="shopObj.goods_types.length"
									show-less-items :showSizeChanger="false" />
							</div>
						</div>
					</div>
				</div>
				<!-- 店铺数据 -->
				<div v-if="titleType=='店铺数据'">
					<div class="a40"></div>
					<div style="display: flex">
						<div class="a41">
							<div class="a23">基础数据</div>
							<div class="a42"></div>
							<div class="a43">
								<div class="a44">
									<div class="a45">
										<img src="../../../../public/resource/image/home/home1.png"
											style="width: 24px;height: 24px;position: relative;top:0px;" alt="">
									</div>
									<div>
										<div>商品总数</div>
										<div class="a47">{{Number(shopObj.goods_number).toLocaleString()}}</div>
									</div>
								</div>
								<div class="a44">
									<div class="a45">
										<img src="../../../../public/resource/image/home/icon2.png"
											style="width: 24px;height: 24px;position: relative;top:0px;" alt="">
									</div>
									<div>
										<div>今日营业额</div>
										<div class="a47">{{Number(shopObj.today_money).toLocaleString()}}</div>
									</div>
								</div>
								<div class="a44">
									<div class="a45">
										<img src="../../../../public/resource/image/home/icon3.png"
											style="width: 24px;height: 24px;position: relative;top:0px;" alt="">
									</div>
									<div>
										<div>本月营业额</div>
										<div class="a47">{{Number(shopObj.month_money).toLocaleString()}}</div>
									</div>
								</div>
								<div class="a52">
									<div class="a53">
										<img src="../../../../public/resource/image/home/icon4.png"
											style="width: 24px;height: 24px;position: relative;top:0px;" alt="">
									</div>
									<div>
										<div>押金余额</div>
										<div class="a47">{{Number(shopObj.pay_deposit_money).toLocaleString()}}</div>
									</div>
								</div>
							</div>
							<div class="a43">
								<div class="a44">
									<div class="a45">
										<img src="../../../../public/resource/image/home/icon5.png"
											style="width: 24px;height: 24px;position: relative;top:0px;" alt="">
									</div>
									<div>
										<div>总订单数</div>
										<div class="a47">{{Number(shopObj.all_order_number).toLocaleString()}}</div>
									</div>
								</div>
								<div class="a44">
									<div class="a45">
										<img src="../../../../public/resource/image/home/icon6.png"
											style="width: 24px;height: 24px;position: relative;top:0px;" alt="">
									</div>
									<div>
										<div>今日订单数</div>
										<div class="a47">{{Number(shopObj.today_order_number).toLocaleString()}}</div>
									</div>
								</div>
								<div class="a44">
									<div class="a45">
										<img src="../../../../public/resource/image/home/icon7.png"
											style="width: 24px;height: 24px;position: relative;top:0px;" alt="">
									</div>
									<div>
										<div>本月订单数</div>
										<div class="a47">{{Number(shopObj.month_order_number).toLocaleString()}}</div>
									</div>
								</div>
								<div class="a52">
									<div class="a45">
										<img src="../../../../public/resource/image/home/icon8.png"
											style="width: 24px;height: 24px;position: relative;top:0px;" alt="">
									</div>
									<div>
										<div>曝光量余额</div>
										<div class="a47">{{Number(shopObj.power).toLocaleString()}}</div>
									</div>
								</div>
							</div>
							<div class="a54">
								<div>
									<b>营业额数据</b>
									<span class="a55">（本年）</span>
								</div>
								<div style="margin-right: 100px;">
									<b>总营业额：{{Number(21313).toLocaleString()}}</b>
								</div>
							</div>
							<div style="width: 100%;">
								<div ref="chartRef" class="a56"></div>
							</div>
						</div>
						<div class="a57"></div>
						<!-- 统计 -->
						<div style="width: 20%;">
							<div class="a58">
								<div class="a59">
									<div style="font-size: 17px;"><b>商品销量Top10</b></div>
									<div class="a60">查看更多</div>
								</div>
								<div class="a61" v-for="(item,index) in spxlphlist" :key="item.id">
									<div style="display: flex;">
										<div style="width: 30px;">NO.{{index+1}}</div>
										<div style="margin-left: 20px;">{{item.name}}</div>
									</div>
									<div>{{Number(item.saled_number).toLocaleString()}}</div>
								</div>
							</div>
							<div class="a62"></div>
							<div class="a58">
								<div class="a59">
									<div style="font-size: 17px;"><b>投流商品</b></div>
									<div class="a60">查看更多</div>
								</div>
								<div class="a61" v-for="item in sptlphlist" :key="item.id">
									<div>{{item.name}}</div>
									<div>{{item.power_level_name}}</div>
									<div>{{item.power}}曝光量</div>
								</div>
								<a-empty v-if="sptlphlist.length==0" style="margin-top: 20%;" />
							</div>
						</div>
					</div>

				</div>
				<!-- 资金日志 -->
				<div v-if="titleType=='资金日志'">
					<div class="a63">
						<div class="a64">货款账户</div>
						<div style="padding: 10px 0px;">押金账户</div>
					</div>
					<div class="a65">
						<div class="a66">
							<div style="display: flex;">
								<div class="a67">总货款：
								</div>
								<div>{{Number(2131312321).toLocaleString()}}</div>
							</div>
							<div style="display: flex;">
								<div class="a67">可提现货款：
								</div>
								<div>{{Number(2131312321).toLocaleString()}}</div>
							</div>
							<div style="display: flex;">
								<div class="a67">待结算货款：
								</div>
								<div>{{Number(2131312321).toLocaleString()}}</div>
							</div>
							<div style="display: flex;">
								<div class="a67">已提现货款：
								</div>
								<div>{{Number(2131312321).toLocaleString()}}</div>
							</div>
							<div style="display: flex;">
								<div class="a67">已结算货款：
								</div>
								<div>{{Number(2131312321).toLocaleString()}}</div>
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


						<div style="display: flex;">
							<div class="a68" v-if="is_ptsj=='平台'">
								<div style="margin-right: 20px;">
									<img src="../../../../public/resource/image/yj.png" class="a69" alt="">
								</div>
								<div class="a70">{{Number(2131312321).toLocaleString()}}</div>
							</div>
							<div v-else style="display: flex;">
								<div class="a71">
									<div style="display: flex;">
										<div class="a68">
											<div style="margin-right: 20px;">
												<img src="../../../../public/resource/image/yj.png" class="a69" alt="">
											</div>
											<div v-if="shopObj.pay_deposit_money>shopObj.deposit_money" class="a72">
												{{Number(shopObj.pay_deposit_money).toLocaleString()}}</div>
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
									<div style="color: #ff0000;">当货款余额充足时，押金不足时将使用货款自动补齐押金.</div>
								</div>
								<div style="padding: 20px;cursor: pointer;" v-if="shopObj.open_h_store_account=='c'">
									<div class="a77" @click="czvisopen(2)">充值</div>
									<div class="a78" @click="czvisopen(3)">提现</div>
								</div>
								<div v-else  style="padding: 20px;cursor: pointer;">
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
								<a-input placeholder="请输入订单编号" class="a82"
									style="border:none;border-radius: 4px;"></a-input>
							</div>
						</div>
						<div class="a81">
							<div>流水类型</div>
							<div>
								<a-select ref="select" v-model:value="value1" class="a83 custom-select-wrapper">
									<a-select-option value="jack">Jack</a-select-option>
									<a-select-option value="lucy">Lucy</a-select-option>
									<a-select-option value="disabled" disabled>Disabled</a-select-option>
									<a-select-option value="Yiminghe">yiminghe</a-select-option>
								</a-select>
							</div>
						</div>
						<div class="a81">
							<div>流水时间</div>
							<div>
								<a-range-picker v-model:value="value1" class="a82"
									style="border:none;border-radius: 4px;" />
							</div>
						</div>
						<div class="a84">
							<div class="a85">
								<ReloadOutlined style="margin-right: 10px;" />
								重置
							</div>
							<div class="a86">
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
						<div v-for="item in [1,2,3,4,5,6,7,8,9,10]" :key="item" class="a89">
							<div>QW12313123123</div>
							<div>订单收款</div>
							<div>{{Number(2131312321).toLocaleString()}}</div>
							<div>2001-11-11 12:12:12</div>
						</div>
						<div class="a90">
							<div></div>
							<div class="a91">
								<div class="a92">共 898 项数据</div>
								<a-pagination v-model:current="current" :total="5000" show-less-items
									:showSizeChanger="false" />
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
						<!-- <span class="timeItem" id="pay_minute">05</span><span class="timeSplit">:</span><span
							class="timeItem" id="pay_second">00</span> -->
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
						<img :src="qrCodeData" alt="支付二维码" />
						<div class="conetentTxt"><span class="payDesc"><span id="payName">使用支付宝App扫码完成支付</span></span>
						</div>
					</div>
				</div>
			</div>
		</a-modal>
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
		border-radius: 0px 15px 0px 0px;
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