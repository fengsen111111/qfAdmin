<script setup>
	import { inject, onBeforeMount, reactive, ref, watch, shallowRef, createVNode, onMounted, onBeforeUnmount } from "vue";
	import { FormComponents } from "../../form_components/form";
	import { TableComponents } from "../../table_components/table";
	import { Row, Col } from 'ant-design-vue';
	import { ClockCircleFilled, DownOutlined, CloseCircleOutlined, PlusOutlined, ExclamationCircleOutlined, AuditOutlined, SearchOutlined, ReloadOutlined, CloseOutlined } from "@ant-design/icons-vue";
	import { message } from 'ant-design-vue';
	import { useRoute } from 'vue-router';
	import * as echarts from 'echarts'
	const route = useRoute();
	let props = defineProps(["pageData"]);
	const pageData = props.pageData;
	let emit = defineEmits(["openChildPage", "closeChildPage"]);
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
				})
		})
		// 
	}
	_shopInfo()

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
				dataType.value = res.list
				const flattened = flattenCategories(dataType.value);
				renderTable(flattened);
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
				const flattened = flattenCategories(dataType.value);
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
			<div style="font-size: 18px;">
				店铺信息
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
						<div class="a22">
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
							<!-- <div class="a30">
								<div class="a31">店铺主体:
								</div>
								<div class="a32" v-if="shopObj.license_image">
									<img :src="shopObj.license_image[0]" alt="" class="a36">
								</div>
							</div> -->
							<div v-if="shopObj.type=='a'" class="a33">
								<div class="a34">店铺地址:</div>
								<div class="a35">{{shopObj.address}}</div>
							</div>
						</div>
						<div style="text-align: center;" v-if="shopObj.logo">
							<img :src="shopObj.logo" alt="" class="a36">
							<div class="a37">店铺logo</div>
						</div>
					</div>
					<div class="a38">认证商品类目</div>
					<div style="margin-top: 20px;">
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
							<div class="a39">
								<div style="color: #666666;">共 898 项数据</div>
								<a-pagination v-model:current="current" :total="5000" show-less-items />
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
										<AuditOutlined class="a46" />
									</div>
									<div>
										<div>商品总数</div>
										<div class="a47">{{Number(21313).toLocaleString()}}</div>
									</div>
								</div>
								<div class="a44">
									<div class="a45">
										<AuditOutlined class="a46" />
									</div>
									<div>
										<div>今日营业额</div>
										<div class="a47">{{Number(21313).toLocaleString()}}</div>
									</div>
								</div>
								<div class="a44">
									<div class="a45">
										<AuditOutlined class="a46" />
									</div>
									<div>
										<div>本月营业额</div>
										<div class="a47">{{Number(21313).toLocaleString()}}</div>
									</div>
								</div>
								<div class="a52">
									<div class="a53">
										<AuditOutlined class="a46" />
									</div>
									<div>
										<div>押金余额</div>
										<div class="a47">{{Number(21313).toLocaleString()}}</div>
									</div>
								</div>
							</div>
							<div class="a43">
								<div class="a44">
									<div class="a45">
										<AuditOutlined class="a46" />
									</div>
									<div>
										<div>总订单数</div>
										<div class="a47">{{Number(21313).toLocaleString()}}</div>
									</div>
								</div>
								<div class="a44">
									<div class="a45">
										<AuditOutlined class="a46" />
									</div>
									<div>
										<div>今日订单数</div>
										<div class="a47">{{Number(21313).toLocaleString()}}</div>
									</div>
								</div>
								<div class="a44">
									<div class="a45">
										<AuditOutlined class="a46" />
									</div>
									<div>
										<div>本月订单数</div>
										<div class="a47">{{Number(21313).toLocaleString()}}</div>
									</div>
								</div>
								<div class="a52">
									<div class="a45">
										<AuditOutlined class="a46" />
									</div>
									<div>
										<div>曝光量余额</div>
										<div class="a47">{{Number(21313).toLocaleString()}}</div>
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
								<div class="a61" v-for="item in [1,2,3,4,5,6,7,8,9,10]" :key="item">
									<div style="display: flex;">
										<div style="width: 30px;">NO.{{item}}</div>
										<div style="margin-left: 20px;">商家沙琪玛</div>
									</div>
									<div>{{Number(21313).toLocaleString()}}万</div>
								</div>
							</div>
							<div class="a62"></div>
							<div class="a58">
								<div class="a59">
									<div style="font-size: 17px;"><b>投流商品</b></div>
									<div class="a60">查看更多</div>
								</div>
								<div class="a61" v-for="item in [1,2,3,4,5,6,7,8,9,10]" :key="item">
									<div>商家沙琪玛</div>
									<div>一级投流</div>
									<div>5000曝光量</div>
								</div>
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
						</div>
						<div style="display: flex;">
							<!-- <div class="a68">
								<div style="margin-right: 20px;">
									<img src="../../../../public/resource/image/yj.png" class="a69" alt="">
								</div>
								<div class="a70">{{Number(2131312321).toLocaleString()}}</div>
							</div> -->
							<div style="display: flex;">
								<div class="a71">
									<div style="display: flex;">
										<div class="a68">
											<div style="margin-right: 20px;">
												<img src="../../../../public/resource/image/yj.png" class="a69" alt="">
											</div>
											<div class="a72">{{Number(2131312321).toLocaleString()}}</div>
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
								<div style="padding: 20px;cursor: pointer;">
									<div class="a77">充值</div>
									<div class="a78">提现</div>
								</div>
							</div>
						</div>
					</div>
					<div class="a79">资金流水日志</div>
					<div class="a80">
						<div class="a81">
							<div>订单编号</div>
							<div>
								<a-input placeholder="请输入订单编号" class="a82"></a-input>
							</div>
						</div>
						<div class="a81">
							<div>流水类型</div>
							<div>
								<a-select ref="select" v-model:value="value1" class="a83">
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
								<a-range-picker v-model:value="value1" class="a82" />
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
								<a-pagination v-model:current="current" :total="5000" show-less-items />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	::v-deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
		background-color: #f7f8f9;
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
		font-size: 17px;
		align-items: center;
	}

	.a25 {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		width: 80%;
		margin-top: 10px;
	}

	.a26 {
		width: 100px;
		color: #666666;
		text-align: right;
		font-weight: bold;
	}

	.a27 {
		display: flex;
		margin-top: 5px;
	}

	.a28 {
		font-weight: bold;
		margin-left: 30px;
	}

	.a29 {
		font-weight: bold;
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
		margin-top: 10px;
		font-weight: bold;
	}

	.a34 {
		width: 100px;
		color: #666666;
		text-align: right;
	}

	.a35 {
		font-weight: bold;
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
		margin: 20px 0px 20px 80px
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