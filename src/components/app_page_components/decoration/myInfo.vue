<script setup>
	import { inject, onBeforeMount, reactive, ref, watch, shallowRef } from "vue";
	import { FormComponents } from "../../form_components/form";
	import { TableComponents } from "../../table_components/table";
	import { Row, Col } from 'ant-design-vue';
	import { ClockCircleFilled, DownOutlined } from "@ant-design/icons-vue";
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
			currentPage:1,
			pageSize:20
		}, global)
			.then(res => {
				console.log('店铺数据',res);
				shopObj.value = res.list[0]
			})
	}
	_shopInfo()
</script>

<template>
	<!--搜索-->
	<div>
		<div style="font-size: 18px;">
			店铺信息
		</div>
		<div>审核中状态</div>
		<div>
			<div style="border: 1px solid #f0f2f5;;padding: 20px;margin-top: 20px;">
				<div style="display: flex;align-items: center;">
					<ClockCircleFilled style="color: orange;font-size: 16px;" />
					<div style="margin-left: 5px;font-size: 16px;">店铺信息审核中，预计在<span style="color: orange;font-weight: bold;">2-3个工作日</span>审核完成</div>
				</div>
				<div style="font-size: 12px;">
					<div style="margin-top: 15px;">提交时间：{{shopObj.create_time}}</div>
					<div style="margin-top: 15px;display: flex;align-items: center;">
						<span>审核进度：</span>
						<div style="width: 200px;height: 12px;border-radius: 20px;background-color: #0c96f1;"></div>
					</div>
					<div style="display: flex;margin-top: 15px;">
						<div >店铺信息：</div>
						<div style="width: 94%;display: grid;grid-template-columns: repeat(3, minmax(0, 1fr));background-color: #f0f2f5;padding: 10px;">
							<span style="margin-left: 40px;"><span style="margin-right: 30px;">店铺编号</span> {{shopObj.id}}</span>
							<span style="margin-left: 40px;"><span style="margin-right: 30px;">店铺名称</span> {{shopObj.store_name}}</span>
							<span style="margin-left: 40px;"><span style="margin-right: 30px;">店铺类型</span> {{shopObj.type=='b'?'个人店铺':'实体店铺'}}</span>
						</div>
					</div>
				</div>
				<div>
					<a-button style="display: flex;align-items: center;padding: 0px 10px;margin-top: 15px;">
						<span>更多</span>
						<DownOutlined style="font-size: 10px;" />
					</a-button>
				</div>
			</div>
			<div style="margin-top: 40px;">
				<img style="width: 100%;height: auto;"
					src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025424/5njwtnlml419mj9la4lbvidvelv2fq85.png"
					alt="">
			</div>
		</div>

		<div>审核通过</div>
		<div>
			<a-alert message="重要提示：店铺名称、店铺logo会直接展示给买家，请认真填写。" type="warning" show-icon style="margin: 10px 0px;padding: 5px 10px !important;margin-top: 10px;" />
			<div style="border: 1px solid #f0f2f5;;padding: 20px;margin-top: 20px;">
				<div style="font-size: 16px;">基础信息</div>
				<div style="display: flex;margin-top: 20px;">
					<div style="width: 200px;color: #999999;text-align: right;">店铺编号</div>
					<div style="margin-left: 20px;">213123123</div>
				</div>
				<div style="display: flex;margin-top: 20px;">
					<div style="width: 200px;color: #999999;text-align: right;">店铺名称</div>
					<div style="margin-left: 20px;">菲特俱乐部43</div>
				</div>
				<div style="display: flex;margin-top: 20px;">
					<div style="width: 200px;color: #999999;text-align: right;">开店时间</div>
					<div style="margin-left: 20px;">2023-01-28</div>
				</div>
				<div style="display: flex;margin-top: 20px;">
					<div style="width: 200px;color: #999999;text-align: right;">店铺认证</div>
					<div style="margin-left: 20px;">个体工商户</div>
				</div>
				<div style="display: flex;margin-top: 20px;">
					<div style="width: 200px;color: #999999;text-align: right;">主营类目</div>
					<div style="margin-left: 20px;">普通商品</div>
				</div>
				<div style="display: flex;margin-top: 20px;">
					<div style="width: 200px;color: #999999;text-align: right;">店铺logo</div>
					<div style="margin-left: 20px;">logo</div>
				</div>
				<div style="display: flex;margin-top: 20px;">
					<div style="width: 200px;color: #999999;text-align: right;">店铺简介</div>
					<div style="margin-left: 20px;">添加简介</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
</style>