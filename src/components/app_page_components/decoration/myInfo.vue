<script setup>
	import { inject, onBeforeMount, reactive, ref, watch, shallowRef } from "vue";
	import { FormComponents } from "../../form_components/form";
	import { TableComponents } from "../../table_components/table";
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
	let emit = defineEmits(["openChildPage", "closeChildPage"]);
	const global = inject("global").value;

	const shopObj = ref({})//店铺信息
	// 店铺信息
	function _shopInfo() {
		console.log('店铺信息');
		global.axios.post('decoration/Store/findTableRecords', {
			currentPage: 1,
			pageSize: 20
		}, global)
			.then(res => {
				console.log('店铺数据', res.list[0]);
				shopObj.value = res.list[0]
				logo.value = shopObj.value.logo
				// a待审核 b 已通过 c已拒绝
				shType.value = res.list[0].check_status
			})
	}
	_shopInfo()

	const shType = ref('a')//a待审核 b 已通过 c已拒绝

	// 前往学习中心
	function toXXzx() {
		global.router.push('/ruleCenter?title=学习中心')
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

</script>

<template>
	<!--搜索-->
	<div>
		<div style="font-size: 18px;">
			店铺信息
		</div>
		<div style="display: flex;">
			审核状态：<div @click="shType='a'">审核中</div>
			<div @click="shType='b'" style="margin-left:20px">通过</div>
		</div>
		<!-- <div>审核中状态</div> -->
		<div v-if="shType=='a'||shType=='c'">
			<div style="border: 1px solid #f0f2f5;;padding: 20px;margin-top: 20px;border-radius: 4px;">
				<div style="display: flex;align-items: center;">
					<ClockCircleFilled style="color: orange;font-size: 16px;" />
					<div v-if="shType=='a'" style="margin-left: 5px;font-size: 16px;">店铺信息审核中，预计在<span
							style="color: orange;font-weight: bold;">2-3个工作日</span>审核完成</div>
					<div v-if="shType=='c'" style="margin-left: 5px;font-size: 16px;">店铺信息审核失败，<span
							style="color: red;font-weight: bold;">拒绝入驻：拒绝原因（没返回字段给我）</span></div>
				</div>
				<div style="font-size: 12px;">
					<div style="margin-top: 15px;">提交时间：{{shopObj.create_time}}</div>
					<div style="margin-top: 15px;display: flex;align-items: center;">
						<span>审核进度：</span>
						<div v-if="shType=='a'" style="width: 200px;height: 12px;border-radius: 20px;background-color: #0c96f1;"></div>
						<div v-if="shType=='c'" style="width: 200px;height: 12px;border-radius: 20px;background-color: #ff0000;"></div>
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
									<span style="font-size: 12px;color: #40a9ff;">取消入驻</span>
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
			<a-alert message="重要提示：店铺名称、店铺logo会直接展示给买家，请认真填写。" type="warning" show-icon
				style="margin: 10px 0px;padding: 5px 10px !important;margin-top: 10px;border-radius: 4px;" />
			<div style="border: 1px solid #f0f2f5;;padding: 20px;margin-top: 20px;border-radius: 4px;">
				<div style="font-size: 16px;">基础信息</div>
				<div style="display: flex;margin-top: 20px;">
					<div style="width: 200px;color: #999999;text-align: right;">店铺编号</div>
					<div style="margin-left: 20px;">{{shopObj.id}}</div>
					<div @click="copyCode(shopObj.id)" style="margin-left: 20px;color: #2266aa;cursor: pointer;">复制
					</div>
				</div>
				<div style="display: flex;margin-top: 20px;">
					<div style="width: 200px;color: #999999;text-align: right;">店铺名称</div>
					<div style="margin-left: 20px;">{{shopObj.store_name}}</div>
					<div @click="visible_shop_name=true" style="margin-left: 20px;color: #2266aa;cursor: pointer;">修改
					</div>
					<!-- 修改弹窗 -->
					<a-modal v-model:visible="visible_shop_name" title="修改店铺名称" @ok="visible_shop_name=false"
						width="650px">
						<div>
							<a-alert message="请谨慎修改店铺名，命名规则可查看学习中心" type="warning" show-icon
								style="margin: 10px 0px;padding: 5px 10px !important;" />
							<div style="display: flex;align-items: center;">
								<span style="color: #00000099;">店铺名称：</span>
								<a-input v-model:value="value" placeholder="" style="margin: 0 10px;width: 310px;">
									<template #suffix>
										<span style="color: #00000099;">0/30</span>
									</template>
								</a-input>
								<span style="color: #00000099;">当前自然年剩余修改次数：1次</span>
							</div>
							<div style="height: 20px;"></div>
						</div>
					</a-modal>
				</div>
				<div style="display: flex;margin-top: 20px;">
					<div style="width: 200px;color: #999999;text-align: right;">开店时间</div>
					<div style="margin-left: 20px;">{{shopObj.create_time}}</div>
				</div>
				<div style="display: flex;margin-top: 20px;">
					<div style="width: 200px;color: #999999;text-align: right;">店铺类型</div>
					<div style="margin-left: 20px;">{{shopObj.type=='a'?'实体店铺':'个人店铺'}}</div>
				</div>
				<div style="display: flex;margin-top: 20px;">
					<div style="width: 200px;color: #999999;text-align: right;">主营类目</div>
					<div style="margin-left: 20px;">普通商品</div>
					<div @click="toXXzx" style="margin-left: 20px;color: #2266aa;cursor: pointer;">学习中心</div>
				</div>
				<div style="display: flex;margin-top: 20px;">
					<div style="width: 200px;color: #999999;text-align: right;">店铺logo</div>
					<div style="margin-left: 20px;display: flex;align-items: end;">
						<!-- <a-image :width="90"
							src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025425/16tmf4tq815658ti3u1nnsb8gg812aie.jpg"
							:preview="{ src: 'https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025425/16tmf4tq815658ti3u1nnsb8gg812aie.jpg' }" /> -->
						<div v-if="logo" style="position: relative;display: flex;overflow: hidden;border-radius: 4px;">
							<a-image :width="90" :src="logo" :preview="{ src: logo }" />
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
						<div @click="visible_logo=true" style="margin-left: 20px;color: #2266aa;cursor: pointer;">
							店铺logo上传规则</div>
					</div>
					<!-- logo上传规则 -->
					<a-modal v-model:visible="visible_logo" title="logo上传规则" @ok="visible_logo=false">
						<div style="font-size: 12px;">
							<div style="color: #ff0000;">尺寸要求：</div>
							<div style="color: #00000099;">1、300px*300px</div>
							<div style="color: #ff0000;">根据国家和平台相关规定，店铺logo不得包含以下信息：</div>
							<div style="color: #00000099;">1、有损于国家、社会公共利益的内容</div>
							<div style="color: #00000099;">2、国际组织的名称、国旗、国徽、军旗等相同或相近内容</div>
							<div style="color: #00000099;">3、政治敏感内容，包括但不限于：国家领导人姓名、党政名称</div>
							<div style="color: #00000099;">4、封建文化糟粕、消极政治影响、或违背少数民族习俗、带有歧视的内容</div>
							<div style="color: #00000099;">5、色情、暴力或者可能引起不适或误解的内容，如隔壁老王、啪啪等</div>
							<div style="color: #00000099;">6、夸大宣传、可能误导公众的内容</div>
							<div style="color: #00000099;">7、其他法律、行政法规定禁止的内容</div>
							<div style="color: #00000099;">8、动态图标</div>
							<div style="color: #00000099;">9、知名人物肖像</div>
							<div style="color: #00000099;">10、他人持有的商标（仅适用于个人店铺和普通企业店铺）</div>
							<div style="color: #00000099;">11、其他电商平台的名称或标识</div>
							<div style="color: #00000099;">12、“圈风”的名称或标识</div>
							<div style="color: #00000099;">13、与“圈风”近似的词以及与圈风平台logo近似的标识</div>
							<div style="color: #00000099;">14、电话号码即时通讯工具账号或其他联系信息(QQ号码、微信号等)</div>
							<div style="color: #00000099;">情节严重者一经发现将被关闭店铺基本信息修改权限</div>
						</div>
					</a-modal>
				</div>
			</div>
			<div style="border: 1px solid #f0f2f5;;padding: 20px;margin-top: 20px;border-radius: 4px;">
				<div style="font-size: 16px;">联系方式</div>
				<div style="display: flex;margin-top: 20px;">
					<div style="width: 200px;color: #999999;text-align: right;">入住人姓名</div>
					<div style="margin-left: 20px;">{{shopObj.name}}</div>
				</div>
				<div style="display: flex;margin-top: 20px;">
					<div style="width: 200px;color: #999999;text-align: right;">入住人手机号</div>
					<div style="margin-left: 20px;" class="phone-mask">{{shopObj.mobile}}</div>
				</div>
				<!-- shopObj.type=='a' 实体店铺才有 -->
				<div style="display: flex;margin-top: 20px;">
					<div style="width: 200px;color: #999999;text-align: right;">入住地址</div>
					<div style="margin-left: 20px;">{{ shopObj.type=='a'?shopObj.location:'当前店铺类型为个人店铺，无具体地址'}}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
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