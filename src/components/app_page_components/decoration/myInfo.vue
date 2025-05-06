<script setup>
	import { inject, onBeforeMount, reactive, ref, watch, shallowRef, createVNode } from "vue";
	import { FormComponents } from "../../form_components/form";
	import { TableComponents } from "../../table_components/table";
	import { Row, Col } from 'ant-design-vue';
	import { ClockCircleFilled, DownOutlined, CloseCircleOutlined, PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons-vue";
	import { message } from 'ant-design-vue';
	import { useRoute } from 'vue-router';
	const route = useRoute();
	let props = defineProps(["pageData"]);
	const pageData = props.pageData;
	let emit = defineEmits(["openChildPage", "closeChildPage"]);
	const global = inject("global").value;

	const shopObj = ref({})//店铺信息
	// 店铺信息
	function _shopInfo() {
		console.log('店铺信息');
		// decoration/Store/webGetStoreInfo
		global.axios.post('decoration/Store/findTableRecords', {}, global)
			.then(res => {
				console.log('店铺数据', res.list);
				shopObj.value = res.list[0]
				logo.value = shopObj.value.logo
				// a待审核 b 已通过 c已拒绝
				shType.value = res.list[0].check_status
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

	const logo = ref('https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025425/16tmf4tq815658ti3u1nnsb8gg812aie.jpg')//店铺logo
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
		{ key: 'user_id', name: '店铺编号' },
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
	getGoodsTypeList()

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


</script>

<template>
	<!--搜索-->
	<div>

		<div style="display: flex;">
			审核状态：<div @click="shType='a'">审核中</div>
			<div @click="shType='b'" style="margin-left:20px">通过</div>
		</div>
		<!-- <div>审核中状态</div> -->
		<div v-if="shType=='a'||shType=='c'">
			<div style="font-size: 18px;">
				店铺信息
			</div>
			<div style="border: 1px solid #f0f2f5;;padding: 20px;margin-top: 20px;border-radius: 4px;">
				<div style="display: flex;align-items: center;">
					<ClockCircleFilled style="color: orange;font-size: 16px;" />
					<div v-if="shType=='a'" style="margin-left: 5px;font-size: 16px;">店铺信息审核中，预计在<span
							style="color: orange;font-weight: bold;">2-3个工作日</span>审核完成</div>
					<div v-if="shType=='c'" style="margin-left: 5px;font-size: 16px;">店铺信息审核失败，<span
							style="color: red;font-weight: bold;">拒绝入驻原因：{{check_remark}}</span></div>
				</div>
				<div style="font-size: 12px;">
					<div style="margin-top: 15px;">提交时间：{{shopObj.create_time}}</div>
					<div style="margin-top: 15px;display: flex;align-items: center;">
						<span>审核进度：</span>
						<div v-if="shType=='a'"
							style="width: 200px;height: 12px;border-radius: 20px;background-color: #0c96f1;"></div>
						<div v-if="shType=='c'"
							style="width: 200px;height: 12px;border-radius: 20px;background-color: #ff0000;"></div>
					</div>
					<div style="display: flex;margin-top: 15px;">
						<div>店铺信息：</div>
						<div
							style="width: 94%;display: grid;grid-template-columns: repeat(3, minmax(0, 1fr));background-color: #f0f2f5;padding: 10px;">
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
						<a-button style="display: flex;align-items: center;padding: 0px 10px;margin-top: 15px;">
							<span>更多</span>
							<DownOutlined style="font-size: 10px;" />
						</a-button>
						<template #overlay>
							<a-menu>
								<a-menu-item>
									<span @click="cancelRz()" style="font-size: 12px;color: #40a9ff;">取消入驻</span>
								</a-menu-item>
								<a-menu-item v-if="shType=='c'">
									<span @click="cxrz" style="font-size: 12px;color: #40a9ff;">重新入驻</span>
								</a-menu-item>
							</a-menu>
						</template>
					</a-dropdown>

				</div>
			</div>
			<div style="margin-top: 40px;">
				<img style="width: 100%;height: auto;"
					src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025424/5njwtnlml419mj9la4lbvidvelv2fq85.png"
					alt="">
			</div>
		</div>

		<!-- <div>审核通过</div> -->
		<div v-else>
			<!--搜索-->
			<div style="padding: 20px;">
				<div
					style="display: flex;justify-content: space-between;font-size: 18px;font-weight: bold;align-items: center;border-bottom: 1px solid #f5f5f5;">
					<div style="display: flex;cursor: pointer;">
						<div
							style="padding:5px 20px;border-radius: 15px 0px 0px 0px;border: 1px solid #f5f5f5;background-color: #0c96f1;color: #fff;">
							店铺信息</div>
						<div style="padding:5px 20px;border: 1px solid #f5f5f5;">店铺数据</div>
						<div style="padding:5px 20px;border-radius: 0px 15px 0px 0px;border: 1px solid #f5f5f5;">资金日志
						</div>
					</div>
					<div style="display: flex;align-items: center;">
						<div>店铺详情页</div>
						<div
							style="border-radius: 5px;background-color: #0c96f1;color: #fff;padding: 3px 20px;margin-left: 15px;font-size: 14px;">
							返回</div>
					</div>
				</div>
				<!-- 店铺信息 -->
				<div style="">
					<div style="font-size: 18px;font-weight: bold;margin-top: 20px;">店铺信息</div>
					<div style="display: flex;font-size: 14px;align-items: center;">
						<div
							style="display: grid;grid-template-columns: repeat(3, minmax(0, 1fr));width: 80%;margin-top: 10px;">
							<template v-for="item in infoArr" :key="item">
								<div style="display: flex;margin-top: 5px;">
									<div style="width: 100px;color: #666666;text-align: right;font-weight: bold;">
										{{item.name}}:</div>
									<div style="font-weight: bold;margin-left: 30px;" v-if="item.key=='type'">
										{{shopObj[item.key]=='a'?'本地商家':'网店商家'}}</div>
									<div style="font-weight: bold;margin-left: 30px;" v-else>
										{{shopObj[item.key]?shopObj[item.key]:'无'}}</div>
								</div>
							</template>
							<div style="display: flex;margin-top: 10px;">
								<div style="width: 100px;color: #666666;text-align: right;font-weight: bold;">店铺主体:
								</div>
								<div style="font-weight: bold;margin-left: 30px;" v-if="shopObj.license_image">
									四川某某科技有限责任公司
								</div>
							</div>
							<div v-if="shopObj.type=='a'" style="display: flex;margin-top: 10px;font-weight: bold;">
								<div style="width: 100px;color: #666666;text-align: right;">店铺地址:</div>
								<div style="font-weight: bold;margin-left: 30px;"></div>
							</div>
						</div>
						<div style="text-align: center;" v-if="shopObj.license_image">
							<img :src="shopObj.license_image[0]" alt=""
								style="width: 70px;height: 70px;border-radius: 4px;">
							<div style="font-weight: bold;color: #666666;">店铺logo</div>
						</div>
					</div>
					<div style="font-size: 18px;font-weight: bold;margin-top: 20px;">认证商品类目</div>
					<div style="margin-top: 20px;">
						<div>
							<table class="table" border="1">
								<tr style="font-weight: bold;font-size: 18px;">
									<th scope="col">一级分类</th>
									<th scope="col">二级分类</th>
									<th scope="col">三级分类</th>
									<th scope="col">商品</th>
								</tr>
								<!-- 渲染数据行 -->
								<!-- 动态插入 -->
							</table>
							<div
								style="display: flex;margin-top: -1px; justify-content: space-between;align-items: center;width: 80vw;padding: 10px;border: 1px solid #e9e9e9;">
								<div style="color: #666666;">共 898 项数据</div>
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
</style>