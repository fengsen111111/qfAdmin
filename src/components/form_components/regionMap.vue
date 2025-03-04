<template>
	<div>
		<a-button type="primary" @click="handleOpen">打开地图</a-button>
		<a-modal :visible="visible" title="标题" width="700px" :footer="null" @cancel="cancel">
			<div id="container" ref="mapContainer" style="width: 100%; height: 400px;"></div>
			<div class="btnBottom">
				<a-button type="primary" @click="regionRender">绘制</a-button>
				<a-button type="primary" @click="newReader" class="ml20">重绘</a-button>
				<a-button type="primary" @click="handleOk" class="ml20">确定</a-button>
			</div>
			<div style="height: 40px;"></div>
		</a-modal>
	</div>
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import AMapLoader from '@amap/amap-jsapi-loader';
	import {
		bd09ToGcj02
	} from './zbzh'

	let lng_dq = 104.066285//经度  //默认位置，拒绝定位使用中线点 成都
	let lat_dq = 30.573532//纬度
	// 定位到当前位置新增代码  =======》开始
	if (window.navigator.geolocation) {
		window.navigator.geolocation.getCurrentPosition(
			function (position) {
				lng_dq = position.coords.longitude.toFixed(6);
				lat_dq = position.coords.latitude.toFixed(6);
				// console.log(`纬度: ${lat_dq}, 经度: ${lng_dq}`);
				const hxzb = bd09ToGcj02(lng_dq, lat_dq)
				// console.log('坐标', hxzb);
				if (props.structure.value.length) {
					const length = props.structure.value.length
					const arr = props.structure.value.map((item)=>{
						return item.split(',')
					})
					// 计算中心点位
					let str0 = 0
					let str1 = 0
					arr.map((item)=>{
						// console.log('item',item);
						str0 = str0 + Number(item[0])
						str1 = str1 + Number(item[1])
					})
					str0 = Number(str0/length).toFixed(6)
					str1 = Number(str1/length).toFixed(6)
					// console.log('str',str0,str1);
					// 设置中心点位置
					lng_dq = str0
					lat_dq = str1
					location.lng = str0
					location.lat = str1
				}else{
					location.lng = hxzb.gcj_lon
				    location.lat = hxzb.gcj_lat
				}
			},
			function (error) {
				if (props.structure.value.length) {
					const length = props.structure.value.length
					const arr = props.structure.value.map((item)=>{
						return item.split(',')
					})
					let str0 = 0
					let str1 = 0
					arr.map((item)=>{
						str0 = str0 + Number(item[0])
						str1 = str1 + Number(item[1])
					})
					str0 = Number(str0/length).toFixed(6)
					str1 = Number(str1/length).toFixed(6)
					// 设置中心点位置
					lng_dq = str0
					lat_dq = str1
					location.lng = str0
					location.lat = str1
				}

			},
			{
				enableHighAccuracy: true
			}
		);
	} else {
		alert('浏览器不支持地理定位')
	}
	// 定位到当前位置新增代码  =======》到此结束

	// 传递数据
	const props = defineProps(['structure'])
	// 打开弹框
	// ---------------- 页面单独参数------------------------------
	let visible = ref(false)
	const mapContainer = ref(null);
	// 实例地图
	const map = ref()
	// 绘制区域
	const polygon = ref()
	// ----------- 页面单独参数 ---------------------------------- 
	// 地图数据 location
	const location = ref({
		lng: 104.040356,
		lat: 30.565135,
		path: [],
	})
	// 
	const keyMap = ref()
	// ------报错就注释赋值这一成--------
	onBeforeMount(() => {
		if (props.structure.config) {
			// console.log('赋值地图',props.structure);
			const { label, gd_jsapi_ak } = props.structure.config
			const { path } = props.structure.value
			let path_edit = []
			props.structure.value.map((item) => {
				path_edit.push(item.split(','))
			})
			keyMap.value = gd_jsapi_ak //赋值key
			location.value = {
				lng: path_edit[0] ? path_edit[0][0] : 104.040356,
				lat: path_edit[0] ? path_edit[0][1] : 30.565135,
				path: path_edit ? path_edit : [],
			}
		}
	})
	// ------报错就注释赋值这一成--------
	function cancel() {
		console.log('取消');
		visible.value = false
	}
	function handleOk() {
		visible.value = false
		// console.log('数据',location.value);
	}
	function handleOpen() {
		visible.value = true
		location.value.lat = lat_dq
		location.value.lng = lng_dq
		// 初始化
		mapInit()
	}

	// 初始化
	function mapInit() {
		AMapLoader.load({
			key: keyMap.value, // 替换为你的API Key
			version: '2.0',
			plugins: ['AMap.Polygon']
		}).then((AMap) => {
			console.log('地图中心点', location.value.lng, location.value.lat);
			map.value = new AMap.Map(mapContainer.value, {
				zoom: 12, //缩放倍数
				center: [location.value.lng, location.value.lat], // 初始化中心点
			});
			// 1图标渲染
			// iconRender()  //暂不需要
			// 2区域渲染
			regionRender()
			// 3点击事件
			mapClick()
		}).catch(e => {
			console.error(e);
		});
	}

	// 图标渲染
	function iconRender() {
		// 1图标渲染
		const marker = new AMap.Marker({
			position: new AMap.LngLat(location.value.lng, location.value.lat),
			icon: 'https://img.picui.cn/free/2024/08/21/66c57b3882447.png', //自定义图标
			label: {
				content: location.value.label, // 显示的文字
				offset: new AMap.Pixel(-50, 40), // 文字标签偏移量
			},
		});
		map.value.add(marker);
	}
	// 区域渲染
	function regionRender() {
		// console.log('执行',location.value.path);
		polygon.value = new AMap.Polygon({
			path: location.value.path,
			strokeColor: "#3366FF", // 边界颜色
			strokeWeight: 2, // 边界宽度
			fillColor: "#3366FF", // 默认填充颜色
			fillOpacity: 0.1, // 填充透明度
			strokeStyle: "dashed", // 线样式为虚线
			strokeDasharray: [10, 10] // 虚线的样式（可选，定义虚线的长度和间隔）
		});
		map.value.add(polygon.value);
		// console.log('map.value',location.value);
		clearAllMarkers()
		// 赋值到value
		// console.log('location.value.path',location.value.path);
		let arr = []
		location.value.path.map((item, index) => {
			let str = item[0] + ',' + item[1]
			arr.push(str)
		})
		// 赋值回去
		props.structure.value = arr
		// 计算区域中心点
		if (location.value.path.length > 0) {
			let str0 = 0
			let str1 = 0
			location.value.path.map((item) => {
				str0 = str0 + Number(item[0])
				str1 = str1 + Number(item[1])
			})
			str0 = Number(str0 / location.value.path.length).toFixed(6)
			str1 = Number(str1 / location.value.path.length).toFixed(6)
			// console.log('str',str0,str1);
			location.value.lng = str0
			location.value.lat = str1
			lng_dq = str0
			lat_dq = str1
		}
	}
	// 存储标记的数组
	let markers = ref([]);
	// 点击事件
	function mapClick() {
		map.value.on('click', function (e) {
			const {
				lng,
				lat
			} = e.lnglat;
			console.log('点击位置', lng, lat);
			// 添加新标记点
			const marker = new AMap.Marker({
				position: new AMap.LngLat(lng, lat),
				// icon: '', //自定义图标
			});
			map.value.add(marker);
			location.value.path.push([lng, lat]) //添加到数据
			markers.value.push(marker); // 将新标记添加到数组
		});
	}
	// 重新绘制
	function newReader() {
		location.value.path = []
		map.value.remove(polygon.value); //删除区域
		mapInit()
	}
	// 删除所有标记
	function clearAllMarkers() {
		markers.value.forEach(marker => {
			map.value.remove(marker); // 从地图中移除
		});
		markers.value = []; // 清空标记数组
	}
</script>

<style>
	#container {
		width: 100%;
		height: 100%;
	}

	.btnBottom {
		float: right;
		margin-top: 20px;
	}

	.ml20 {
		margin-left: 20px;
	}
</style>