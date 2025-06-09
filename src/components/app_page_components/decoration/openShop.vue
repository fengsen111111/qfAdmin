<script setup>
	import { inject, onBeforeMount, reactive, ref, watch, shallowRef } from "vue";
	import { FormComponents } from "../../form_components/form";
	import { TableComponents } from "../../table_components/table";
	import { Row, Col } from 'ant-design-vue';
	import { InfoCircleOutlined, CheckCircleOutlined, PlusOutlined, CloseCircleOutlined, LeftOutlined, CheckCircleFilled, ExclamationCircleFilled, SafetyCertificateFilled } from "@ant-design/icons-vue";
	import Map from './map.vue'
	import AMapLoader from '@amap/amap-jsapi-loader';
	import { bd09ToGcj02 } from './zbzh'


	let props = defineProps(["pageData"]);
	const pageData = props.pageData;

	let emit = defineEmits(["openChildPage", "closeChildPage"]);

	const global = inject("global").value;

	const store_name = ref('')// 店铺名称
	const logo = ref('')// 店铺门头照/LOGO  
	const type = ref('b')//商家类型 a本地商家 b网店商家  
	const id_card_images = ref([])// 身份证照片  
	const license_image = ref('')//营业执照  
	const id_card_number = ref('')//身份证号
	const id_card_times = ref([])//身份有效时间
	const name = ref('')// 用户姓名  
	const mobile = ref('')// 手机号   
	const admin_login_password = ref('')//后台登录密码  
	const address = ref('')//店铺地址  
	const location = ref('')//店铺地址坐标   
	const id = ref('')//商家id
	import { message } from 'ant-design-vue';

	import { useRoute } from 'vue-router';
	const route = useRoute();
	admin_login_password.value = route.query.password
	mobile.value = route.query.mobile

	const check_remark = ref('')//拒绝理由

	// 商家入驻信息
	function getSubmitEntryApplyMsg() {
		global.axios.post('decoration/Store/getSubmitEntryApplyMsg', {
			mobile: mobile.value,
		}, global).then(res => {
			console.log('商家入驻信息', res);
			if (res.id) {
				id.value = res.id
				store_name.value = res.store_name
				logo.value = res.logo
				type.value = res.type
				id_card_images.value = res.id_card_images ? res.id_card_images : []
				license_image.value = res.license_image
				id_card_number.value = res.id_card_number
				// id_card_times.value = res.id_card_times
				id_card_times.value = res.id_card_times.map(timestamp => {
					const date = new Date(timestamp * 1000); // 转为毫秒
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始
					const day = String(date.getDate()).padStart(2, '0');
					return `${year}/${month}/${day}`;
				});
				name.value = res.name
				mobile.value = res.mobile
				admin_login_password.value = res.password
				address.value = res.address
				location.value = res.location
				check_remark.value = res.check_remark
			}
		})
	}
	// console.log('当前页面路由信息',route.path);
	if (route.path == '/') {
		// 平台添加新商家,不需要获取入驻信息
	} else {
		getSubmitEntryApplyMsg()
	}

	const isMap = ref(false)//是否打开地图
	watch(() => isMap, val => {
		console.log('地图', val.value);
		if (val.value) {
			// initMap()
			if (component_state.lat & component_state.lng) {
				console.log('都有值');
				initMap()
			} else {
				if (window.navigator.geolocation) {
					window.navigator.geolocation.getCurrentPosition(
						function (position) {
							const hxzb = bd09ToGcj02(position.coords.longitude.toFixed(6), position.coords.latitude.toFixed(6))
							component_state.lng = hxzb.gcj_lon
							component_state.lat = hxzb.gcj_lat
							initMap()
						},
						function (error) {
							alert(`获取位置失败: ${error.message}`)
						},
						{
							enableHighAccuracy: true
						}
					);
				} else {
					alert('浏览器不支持地理定位')
				}
			}
		}
	}, { deep: true });

	// 默认经纬度
	const component_state = reactive({
		lng: '104.066285',
		lat: '30.573532',
		marker: {}
	})
	let myMap = shallowRef(null);
	// 初始化
	function initMap() {
		AMapLoader.load({
			key: '15769e138ff2a58797ef751857b12e6e',//替换成key
			version: "2.0",
			plugins: ['AMap.Polygon']
		}).then((AMap) => {
			myMap = new AMap.Map("container_map", {
				viewMode: "2D",
				zoom: 16,
				resizeEnable: true,
				center: [component_state.lng, component_state.lat]
			});
			addMarker(component_state.lng, component_state.lat)
			myMap.on('click', function (e) {
				component_state.lng = e.lnglat.getLng()
				component_state.lat = e.lnglat.getLat()
				addMarker(e.lnglat.getLng(), e.lnglat.getLat())
			});
			AMap.plugin(['AMap.PlaceSearch', 'AMap.AutoComplete'], function () {
				let auto = new AMap.AutoComplete({
					input: "keyword"
				});
				let placeSearch = new AMap.PlaceSearch({
					map: myMap
				});  //构造地点查询类
				auto.on("select", select);//注册监听，当选中某条记录时会触发
				let allAddress;
				function select(e) {
					allAddress = e.poi.district;
					placeSearch.setCity(e.poi.adcode);
					placeSearch.search(e.poi.name, function (status, result) {
						//清除所有点标记
						myMap.clearMap();
						let pois = result.poiList.pois;
						//生成点标记（覆盖物）
						for (let i = 0; i < pois.length; i++) {
							let poi = pois[i];
							let marker = new AMap.Marker({
								map: myMap,
								icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b' + (i + 1) + '.png',
								position: poi.location,
								title: poi.name,
								clickable: true,
								animation: "AMAP_ANIMATION_DROP",
								extData: {
									id: i + 1,
									name: poi.name,
									address: allAddress + poi.address,
									type: poi.type,
									location: poi.location
								}
							});
							//设置点标记点击事件
							marker.on("click", checkPoint);
							myMap.add(marker);
						}
						myMap.setFitView();
					});
				}
			});
		})
	}
	function checkPoint(e) {
		component_state.lng = e.lnglat.lng
		component_state.lat = e.lnglat.lat
	}

	function addMarker(Lng, Lat) {
		console.log('经纬度', Lng, Lat);
		myMap.clearMap();
		let marker = new AMap.Marker({
			icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
			position: [Lng, Lat],
			anchor: 'bottom-center'
		});
		myMap.add(marker);
	}

	// logo上传
	function upload(options) {
		global.file.uploadFile(global, options.file, 'image', 'shopImg', true, complete)
	}
	// logo 回调
	function complete(response) {
		logo.value = response.url
	}
	// 删除logo
	function delImgLogo() {
		console.log('删除logo');
		logo.value = ''
	}

	// 身份证上传
	function uploadSfz(options) {
		global.file.uploadFile(global, options.file, 'image', 'idImg', true, completeSfz)
	}
	//  身份证 回调
	function completeSfz(response) {
		id_card_images.value[0] = response.url
	}
	// 身份证上传  2
	function uploadSfzTwo(options) {
		global.file.uploadFile(global, options.file, 'image', 'idImg', true, completeSfzTwo)
	}
	//  身份证 回调  2
	function completeSfzTwo(response) {
		id_card_images.value[1] = response.url
	}
	// 删除身份证
	function delImgSfz(index) {
		console.log('删除身份证');
		id_card_images.value[index] = ''
	}

	// 营业执照上传
	function uploadYyzz(options) {
		global.file.uploadFile(global, options.file, 'image', 'yyzzImg', true, completeYyzz)
	}

	//  营业执照 回调
	function completeYyzz(response) {
		license_image.value = response.url
	}

	// 删除营业执照
	function delImgYyzz() {
		console.log('删除营业执照');
		license_image.value = ''
	}

	const value1 = ref()
	function handUrl(url) {
		global.router.push(url)
	}

	// 关闭地图
	function closeMap() {
		location.value = component_state.lng + ',' + component_state.lat  //回填经纬度
		isMap.value = false
	}
	const spinning = ref(false)

	const xygx = ref(false)

	// 提交入驻申请
	function _submitEntryApply() {
		if (!xygx.value) {
			message.error('请阅读并勾选协议')
			return false
		}
		if (!store_name.value) {
			message.error('请输入店铺名称')
			msgValue.value = '店铺名称不可为空'
			return false
		} else {
			if (msgValue.value) {
				return false
			}
		}
		if (!logo.value) {
			message.error('请上传门店logo')
			return false
		}
		// if (!id_card_images.value || id_card_images.value.length != 2) {
		// 	message.error('请检查身份证照片信息')
		// 	return false
		// }
		if (!id_card_images.value[0]) {
			message.error('请检查身份证照片信息')
			return false
		}
		if (!id_card_images.value[1]) {
			message.error('请检查身份证照片信息')
			return false
		}
		// 本地商家需要营业执照
		if (type.value == 'a' || type.value == 'c' || type.value == 'd') {
			if (!license_image.value) {
				message.error('请上传营业执照')
				return false
			}
		}

		if (!name.value) {
			message.error('请输入负责人姓名')
			return false
		}
		if (!id_card_number.value) {
			message.error('请输入身份证号')
			return false
		} else {
			const regex = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
			if (id_card_number.value && !regex.test(id_card_number.value)) {
				message.error('身份证格式错误')
				return false
			}
		}
		// console.log('id_card_times.value',id_card_times.value.length);
		if (id_card_times.value.length > 1) {
			// 
		} else {
			message.error('请选择身份证有效期')
			return false
		}
		if (!mobile.value) {
			message.error('请输入手机号')
			return false
		} else {
			const regex = /^1[3-9]\d{9}$/;
			if (mobile.value && !regex.test(mobile.value)) {
				message.error('手机号格式错误')
				return false
			}
		}
		// if (!admin_login_password.value) {
		// 	message.error('请输入后台登陆密码')
		// 	return false
		// } 
		const result = validatePassword(admin_login_password.value)
		if (!result.valid) {
			console.log('密码不合法：', result.msg, pasYz.value);
			message.error('密码不合法')
			return false
		} else {
			console.log('通过校验');
		}
		// spinning.value = true
		global.axios
			.post('decoration/Store/submitEntryApply', {
				"check_status": 'b',
				"id": id.value,
				"user_id": '',
				"type": type.value,
				"name": name.value,
				"mobile": mobile.value,
				"id_card_number": id_card_number.value,
				// "id_card_times":id_card_times.value,
				"id_card_times": id_card_times.value.map(date => Math.floor(new Date(date).getTime() / 1000)),
				"id_card_images": id_card_images.value,
				"store_name": store_name.value,
				"license_image": license_image.value,
				"address": address.value,
				"location": location.value,
				"logo": logo.value,
				"admin_login_password": admin_login_password.value
			}, global)
			.then((res) => {
				// spinning.value = false
				console.log('申请入驻', res);
				resule_vis.value = true
				// global.Modal.confirm({
				// 	title: global.findLanguage(
				// 		"保存成功，点击确定返回上一页！"
				// 	),
				// 	okText: global.findLanguage("确定"),
				// 	cancelText: global.findLanguage("取消"),
				// 	okType: "primary",
				// 	onOk: function () {
				// 		handUrl('/login')
				// 	},
				// });

			})
	}

	const visible_dr = ref(false)
	const drTitle = ref('')
	const drFwb = ref('')

	function handOpen(type) {
		drTitle.value = type == 'store_entry_introduce' ? '商家入驻介绍' : type == 'store_privacy_rule' ? '商家隐私协议' : type == 'store_rule' ? '商家服务协议' : '标题'
		global.axios
			.post('decoration/Setting/getRichTextContent', {
				type: type
			}, global)
			.then((res) => {
				console.log('协议内容', res);
				visible_dr.value = true
				drFwb.value = res
			})
	}

	const shopRzType = ref('a')//商户类型 a本地商家 b网店商家 c个体工商户  d企业店
	const buzhou_type = ref(1)//1选择类型 2填写信息

	if (route.query.type) {
		shopRzType.value = route.query.type
		buzhou_type.value = 2
	}

	// 下一步
	function toxyb() {
		if(!huifu_Type.value){
			message.error('请选择您的汇付类型！')
			return false
		}
		// 切换店铺信息页面
		type.value = shopRzType.value
		buzhou_type.value = 2
	}

	const errMsg = ref('')//错误信息

	const resule_vis = ref(false)//提交结果弹框

	// 提交后弹窗确定 前往首页
	function toHome() {
		console.log('等待数据');
		// 账号密码登陆
		global.axios.post('factory_system/Base/login', {
			account: mobile.value,
			password: admin_login_password.value
		}, global)
			.then(res => {
				console.log('登陆成功');
				localStorage.setItem('Authorization', res.token);
				global.router.push("/")
			})
	}


	let pasYz = ref({
		rule_a: false,//规则1
		rule_b: false,//规则2
		rule_c: false,//规则3
		level: 0//安全等级
	})//密码验证情况
	// 密码变化
	function pasChange() {
		popoverVisible.value = true
		const result = validatePassword(admin_login_password.value)
		if (!result.valid) {
			console.log('密码不合法：', result.msg, pasYz.value);
		} else {
			console.log('通过校验');
		}
	}
	setTimeout(() => {
		pasChange()
	}, 500);
	// 校验密码
	function validatePassword(pwd) {
		let passedCount = 0; // 统计通过的规则数
		// 1. 长度校验
		if (pwd.length >= 8 && pwd.length <= 20) {
			pasYz.value.rule_a = true;
			passedCount++;
		} else {
			pasYz.value.rule_a = false;
		}
		// 2. 字符合法性（不含空格、中文）
		const allowedChars = /^[A-Za-z0-9~!@#$%^&*()_+\-=`[\]{}|;:'",.<>/?]+$/;
		if (allowedChars.test(pwd)) {
			pasYz.value.rule_b = true;
			passedCount++;
		} else {
			pasYz.value.rule_b = false;
		}
		// 3. 至少包含三种类型字符
		let count = 0;
		if (/[A-Z]/.test(pwd)) count++;       // 大写
		if (/[a-z]/.test(pwd)) count++;       // 小写
		if (/[0-9]/.test(pwd)) count++;       // 数字
		// 只计算“合法符号”
		const symbolRegex = /[~!@#$%^&*()_+\-=`[\]{}|;:'",.<>/?]/;
		if (symbolRegex.test(pwd)) count++; // 合法符号
		if (count >= 3) {
			pasYz.value.rule_c = true;
			passedCount++;
		} else {
			pasYz.value.rule_c = false;
		}
		// 设置最终安全等级
		pasYz.value.level = passedCount;
		// 返回最终结果
		if (passedCount === 3) {
			return { valid: true, msg: '密码合法' };
		} else {
			return { valid: false, msg: '密码未满足所有规则' };
		}
	}

	// 敏感词
	function _getBaseTypes() {
		global.axios.post('decoration/Setting/getBaseTypes', {}, global).then(res => {
			console.log('敏感词', res);
		})
	}
	_getBaseTypes()

	const msgValue = ref('')
	// 店铺名称变化
	function nameChange() {
		console.log('名称变化', store_name.value);
		// 自定义敏感关键词列表（可根据实际需求扩展）
		const sensitiveWords = [
			'马云', '习近平', '马化腾', '王健林', '雷军', // 名人
			'北京', '上海', '深圳', '广州', '香港',     // 地名
			'苹果', '华为', '微信', '支付宝', '抖音',   // 品牌
			'国家', '中央', '公安', '法院', '政府'      // 敏感机关词
		];
		const hits = sensitiveWords.filter(word => store_name.value.includes(word));
		if (hits.length > 0) {
			// 清空或纠正输入
			msgValue.value = `不得包含敏感词：${hits.join('、')}`//不重复就清空
			return false
		}

		// 验证店铺名称是否重复
		global.axios.post('decoration/Store/checkStoreName', {
			store_name: store_name.value,
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
	const popoverVisible = ref(false)

	const huifu_Type = ref('')//store商家 user用户  汇付类型

</script>

<template>
	<!--搜索-->
	<a-spin :spinning="spinning">
		<div>
			<div v-if="route.path!='/'" style="background-color: #323242;height: 8vh;display: flex;">
				<div
					style="padding: 20px;height: 100%;width: 67vw;margin: 0 auto;display: flex;justify-content: space-between;align-items: center;">
					<div style="display: flex;">
						<img :src="global.adminLogo" alt="" style="width: auto;height: 45px;border-radius: 5px">
						<span style="font-size: 28px;margin-left: 5px;color: #fff;font-weight: bold;">{{global.appName}}
						</span>
					</div>
					<!-- <div @click="handUrl('/login')" style="color: #fff;">
						返回登录
					</div> -->
					<div @click="handUrl('/')" style="color: #fff;">
						返回首页
					</div>
				</div>
			</div>
			<!-- 选择类型 -->
			<div v-if="buzhou_type==1"
				style="display: flex;background: #f5f5f5;height: 92vh;color: #00000099;width: 100%">
				<div style="overflow: auto;height: 100%;width: 100%">
					<div style="font-size: 30px;text-align: center;font-weight: bold;color: #fff;width: 100%;
					background-image: url('https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/setting/2025423/49s45fl2dh6w7juja6ulkr5thnenwprf.jpg');
					background-size: 100% 100%;padding-top: 40px;height: 200px;">
						请选择您的店铺类型
					</div>
					<div style="border-radius: 5px;width: 67vw;padding: 0px 20px;margin: 0 auto;
					position: relative; top: -91px;
					">
						<div
							style="background-color: #fff;width: 411px;border-top: 1px solid #1890FF;padding: 20px;border-radius: 10px 10px 0px 0px;">
							<div style="color: #407CFF;font-size: 18px;">普通入驻</div>
							<div>针对本地商家和网店商家</div>
						</div>
						<!-- 分类 -->
						<div style="display: flex;">
							<div style="background-color: #fff;padding: 20px;">
								<div style="display: flex;align-items: baseline;">
									<span style="font-size: 16px;margin-right: 3px;color: #000000CC;">个人店</span>
									<span style="font-size: 12px;">（适合个人入驻，提供身份证等即可开店）</span>
								</div>
								<div @click="()=>{shopRzType='a'}"
									:style="{ 'border': shopRzType=='a' ? '1px solid #407CFF' : '1px solid #e5e5e5' }"
									style="display: flex;align-items: center;padding: 20px;width: 583px;border-radius: 4px;margin-top: 10px;">
									<a-radio :checked="true" v-if="shopRzType=='a'"></a-radio>
									<a-radio :checked="false" v-else></a-radio>
									<div style="margin-left: 10px;">
										<div>本地商家</div>
										<div>有营业执照，想以个体工商户身份开店</div>
									</div>
								</div>
								<div @click="()=>{shopRzType='b'}"
									:style="{ 'border': shopRzType=='b' ? '1px solid #407CFF' : '1px solid #e5e5e5' }"
									style="display: flex;align-items: center;padding: 20px;width: 583px;border-radius: 4px;margin-top: 10px;">
									<a-radio :checked="true" v-if="shopRzType=='b'"></a-radio>
									<a-radio :checked="false" v-else></a-radio>
									<div style="margin-left: 10px;">
										<div>网店商家</div>
										<div>无营业执照，想以个人身份开店</div>
									</div>
								</div>

								<div @click="()=>{shopRzType='c'}"
									:style="{ 'border': shopRzType=='c' ? '1px solid #407CFF' : '1px solid #e5e5e5' }"
									style="display: flex;align-items: center;padding: 20px;width: 583px;border-radius: 4px;margin-top: 10px;">
									<a-radio :checked="true" v-if="shopRzType=='c'"></a-radio>
									<a-radio :checked="false" v-else></a-radio>
									<div style="margin-left: 10px;">
										<div>个体工商户</div>
										<div>可以提交个体工商户营业执照</div>
									</div>
								</div>
								<div style="display: flex;align-items: baseline;margin-top: 20px;">
									<span style="font-size: 16px;margin-right: 3px;color: #000000CC;">企业店</span>
									<span style="font-size: 12px;">（适合企业入驻，可以提交企业工商户营业执照）</span>
								</div>
								<div @click="()=>{shopRzType='d'}"
									:style="{ 'border': shopRzType=='d' ? '1px solid #407CFF' : '1px solid #e5e5e5' }"
									style="display: flex;align-items: center;padding: 20px;width: 583px;border-radius: 4px;margin-top: 10px;">
									<a-radio :checked="true" v-if="shopRzType=='d'"></a-radio>
									<a-radio :checked="false" v-else></a-radio>
									<div style="margin-left: 10px;">
										<div>企业店</div>
										<div>可以提交企业工商户营业执照</div>
									</div>
								</div>


							</div>
							<!-- 汇付 -->
							<div style="background-color: #fff;padding: 20px;">
								<div style="display: flex;align-items: baseline;">
									<span style="font-size: 16px;margin-right: 3px;color: #000000CC;">选择汇付类型</span>
									<span style="font-size: 12px;">（若您拥有对公账户，请开通商家汇付，若您没有对公账户，请开通个人汇付）</span>
								</div>
								<span style="font-size: 12px;color: #ff0000;">注意：开通的汇付影响到您以后的提现相关，请谨慎选择！</span>
								<div @click="()=>{huifu_Type='store'}"
									:style="{ 'border': huifu_Type=='store' ? '1px solid #407CFF' : '1px solid #e5e5e5' }"
									style="display: flex;align-items: center;padding: 20px;width: 583px;border-radius: 4px;margin-top: 10px;">
									<a-radio :checked="true" v-if="huifu_Type=='store'"></a-radio>
									<a-radio :checked="false" v-else></a-radio>
									<div style="margin-left: 10px;">
										<div>商家汇付</div>
										<div>有对公账户，请开通商家汇付</div>
									</div>
								</div>
								<div @click="()=>{huifu_Type='user'}"
									:style="{ 'border': huifu_Type=='user' ? '1px solid #407CFF' : '1px solid #e5e5e5' }"
									style="display: flex;align-items: center;padding: 20px;width: 583px;border-radius: 4px;margin-top: 10px;">
									<a-radio :checked="true" v-if="huifu_Type=='user'"></a-radio>
									<a-radio :checked="false" v-else></a-radio>
									<div style="margin-left: 10px;">
										<div>个人汇付</div>
										<div>没有对公账户，请开通个人汇付</div>
									</div>
								</div>
							</div>
						</div>
						<!-- 下一步 -->
						<div style="text-align: center;padding:20px 0px;background: #fff;width: 1246px;">
							<a-button @click="toxyb" type="primary"
								style="font-size: 15px !important;padding: 8px 40px;" size="large">下一步</a-button>
						</div>
					</div>
				</div>
			</div>
			<!-- 填写店铺信息 -->
			<div v-else-if="buzhou_type==2" style="display: flex;background: #f5f5f5;height: 92vh;">
				<div style="padding: 20px;overflow: auto;height: 100%;width: 67vw;margin: 0 auto;">
					<div style="font-size: 18px;margin-bottom: 20px;">店铺信息</div>
					<a-row>
						<a-col :xl="24" :xxl="15">
							<div
								style="background-color: #fff;padding: 20px;border: 2px solid #f5f5f5;border-radius: 5px;">
								<div style="border-left: 2px solid #1890FF;padding-left: 10px;font-size: 16px;">店铺基本信息
								</div>
								<div
									style="display: flex;margin: 15px 0px 15px 100px;align-items: center;position: relative;">
									<div style="display: flex;white-space:nowrap;">
										<span style="color: red;">*</span>
										<span>店铺名称</span>
									</div>
									<a-input @change="nameChange" v-model:value="store_name"
										style="margin-left: 10px;width: 300px;" show-count :maxlength="30" />
									<div style="position: absolute;top: 35px;left:72px;color: red;font-size: 10px;">
										{{msgValue}}</div>
									<a-popover title="规范" placement="rightTop">
										<template #content>
											<div>不得与已经开通的店铺名称重复</div>
											<div>不得包含容易造成消费者混淆的信息:包含知名人士、地名的品牌</div>
										</template>
										<div
											style="color: #1890FF;margin-left: 10px;white-space:nowrap;cursor: pointer;">
											查看规范</div>
									</a-popover>
								</div>
								<div style="display: flex;margin: 25px 0px 10px 100px;">
									<div style="display: flex;white-space:nowrap;">
										<span style="color: red;">*</span>
										<span>门店logo</span>
									</div>
									<div>
										<div style="margin-left: 10px;display: flex;">
											<div v-if="logo"
												style="position: relative;display: flex;overflow: hidden;border-radius: 4px;">
												<a-image :width="90" :src="logo" :preview="{ src: logo }" />
												<div @click="delImgLogo()" class="imgClose" style="margin-left: 10px;">
													<CloseCircleOutlined />
												</div>
											</div>
											<a-upload v-else :customRequest="upload" :file-list="[]" list-type="text">
												<div
													style="width: 90px;height: 90px;border: 1px dashed #dbdbdb;border-radius: 4px;margin-right: 10px;text-align: center;">
													<PlusOutlined
														style="font-size: 30px;color: #999999;margin-top: 35%;" />
												</div>
											</a-upload>
										</div>
										<div style="margin-left: 10px;color: #ff0000;">宽 : 高 = 1 : 1</div>
									</div>

								</div>
								<!--  -->
								<div style="border-left: 2px solid #1890FF;padding-left: 10px;font-size: 16px;">开店人基本信息
								</div>
								<div style="display: flex;margin: 10px 0px 15px 100px">
									<div style="display: flex;">
										<span style="color: red;">*</span>
										<span>商家类型</span>
									</div>
									<div style="margin-left: 10px;">
										<a-radio-group v-model:value="type" name="radioGroup">
											<a-radio value="a" v-if="type=='a'">本地商家</a-radio>
											<a-radio value="b" v-else-if="type=='b'">网店商家</a-radio>
											<a-radio value="c" v-else-if="type=='c'">个体工商户</a-radio>
											<a-radio value="d" v-else-if="type=='d'">企业店</a-radio>
										</a-radio-group>
									</div>
									<a-popover v-if="type=='a'" title="规范" placement="rightTop">
										<template #content>
											<div>商家类型为本地商家需要录入详细地址</div>
											<div>商家类型为本地商家需要录入具体定位</div>
										</template>
										<span style="color: #1890FF;margin-left: 10px;">查看规范</span>
									</a-popover>
								</div>
								<!-- 本地商家 个体工商户 企业店 -->
								<div v-if="type=='a'||type=='c'||type=='d'" style="cursor: pointer;">
									<div style="display: flex;margin: 15px 0px 15px 105px;align-items: center;">
										<div style="display: flex;white-space:nowrap;">
											<span>详细地址</span>
										</div>
										<a-input v-model:value="address" style="margin-left: 10px;width: 300px;" />
									</div>
									<div style="display: flex;margin: 15px 0px 15px 133px;align-items: center;">
										<div style="display: flex;white-space:nowrap;">
											<span>坐标</span>
										</div>
										<div @click="isMap = true" style="margin-left: 10px;">{{location}}</div>
										<a-popover title="提示" placement="rightTop">
											<template #content>
												<div>点击经纬度选择您的店铺地址</div>
											</template>
											<span style="color: #1890FF;margin-left: 10px;"
												@click="isMap = true">点击选择</span>
										</a-popover>
										<a-modal v-model:visible="isMap" :centered="true" :closable="false"
											:footer="null" :keyboard="false" :maskClosable="false"
											width="650px">搜索<input id="keyword"
												style="width: 200px;margin-left: 10px;" />
											<span
												style="color: red;font-size: 13px;margin-left: 10px;">录入信息越多，搜索结果越准确</span>
											<div id="container_map" class="map"></div>
											<div slot="footer" class="dialog-footer">
												<span style="margin-right: 30px">
													经度<a-input v-model:value="component_state.lng" allow-clear
														style="width: 150px;margin-top: 10px;margin-left: 10px;" />
													纬度<a-input v-model:value="component_state.lat" allow-clear
														style="width: 150px;margin-top: 10px;margin-left: 10px;" />
												</span>
												<a-button style="right: 10px" @click="closeMap">关闭</a-button>
											</div>
										</a-modal>
									</div>
								</div>
								<div style="display: flex;margin: 15px 0px 15px 100px;">
									<div style="display: flex;white-space:nowrap;">
										<span style="color: red;">*</span>
										<span>身份证像</span>
									</div>
									<div>
										<div style="display: flex;">
											<div style="margin-left: 10px;display: flex;">
												<div v-if="id_card_images[0]"
													style="position: relative;margin-right: 10px;border-radius: 4px;overflow: hidden;display: flex;height: 90px;width: 90px;">
													<a-image :width="90" :src="id_card_images[0]"
														:preview="{ src: item }" />
													<div @click="delImgSfz(0)" class="imgClose"
														style="margin-left: 10px;">
														<CloseCircleOutlined />
													</div>
												</div>
												<a-upload v-else :customRequest="uploadSfz" :file-list="[]"
													list-type="text">
													<div
														style="width: 90px;height: 90px;border: 1px dashed #dbdbdb;margin-right: 10px;text-align: center;border-radius: 4px;">
														<div style="height: 15px;"></div>
														<img src="/public/resource/image/sfzzm.png"
															style="width: 60px;height: 40px;" alt="">
														<div style="color: #999999;font-size: 10px;margin-top: 5px;">
															上传人面像</div>
													</div>
												</a-upload>
											</div>
											<div style="margin-left: 10px;display: flex;">
												<div v-if="id_card_images[1]"
													style="position: relative;margin-right: 10px;border-radius: 4px;overflow: hidden;display: flex;height: 90px;width: 90px;">
													<a-image :width="90" :src="id_card_images[1]"
														:preview="{ src: item }" />
													<div @click="delImgSfz(1)" class="imgClose"
														style="margin-left: 10px;">
														<CloseCircleOutlined />
													</div>
												</div>
												<a-upload v-else :customRequest="uploadSfzTwo" :file-list="[]"
													list-type="text">
													<div
														style="width: 90px;height: 90px;border: 1px dashed #dbdbdb;margin-right: 10px;text-align: center;border-radius: 4px;">
														<div style="height: 15px;"></div>
														<img src="/public/resource/image/sfzfm.png"
															style="width: 60px;height: 40px;" alt="">
														<div style="color: #999999;font-size: 10px;margin-top: 5px;">
															上传国徽像</div>
													</div>
												</a-upload>
											</div>
											<div v-if="type=='a'||type=='c'||type=='d'"
												style="display: flex;margin-left: 20px;">
												<div style="display: flex;white-space:nowrap;">
													<span style="color: red;">*</span>
													<span>营业执照</span>
												</div>
												<div style="margin-left: 10px;display: flex;">
													<div v-if="license_image"
														style="position: relative;display: flex;overflow: hidden;border-radius: 4px;">
														<a-image :width="90" :src="license_image"
															:preview="{ src: license_image }" />
														<div @click="delImgYyzz()" class="imgClose"
															style="margin-left: 10px;">
															<CloseCircleOutlined />
														</div>
													</div>
													<a-upload v-else :customRequest="uploadYyzz" :file-list="[]"
														list-type="text">
														<div
															style="width: 90px;height: 90px;border: 1px dashed #dbdbdb;border-radius: 4px;margin-right: 10px;text-align: center;">
															<div style="height: 15px;"></div>
															<img src="/public/resource/image/yyzz.png"
																style="width: 60px;height: 40px;" alt="">
															<div
																style="color: #999999;font-size: 10px;margin-top: 5px;">
																营业执照</div>
														</div>
													</a-upload>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div style="display: flex;margin-left: 171px;margin-top: 10px;">
									<div style="background-color: #f7f7f7;">
										<div style="padding: 10px;">请核对身份信息，若信息不符合，可手动修改（等待ocr服务）</div>
										<div style="height: 1px;background-color: #d1d0cf;"></div>
										<div style="padding: 10px;">
											<div style="display: flex;align-items: center;">
												<div style="display: flex;justify-content: space-between;width: 5vw;">
													<div></div>
													<div style="display: flex;">
														<span style="color: red;">*</span>
														<span>姓名</span>
													</div>
												</div>
												<a-input v-model:value="name" style="width: 220px;margin-left: 20px;"
													placeholder="请输入姓名" />
											</div>
											<div style="display: flex;align-items: center;margin-top: 10px;">
												<div style="display: flex;justify-content: space-between;width: 5vw;">
													<div></div>
													<div style="display: flex;">
														<span style="color: red;">*</span>
														<span>身份证号</span>
													</div>
												</div>
												<a-input v-model:value="id_card_number"
													style="width: 220px;margin-left: 20px;" placeholder="请输入身份证号" />
											</div>
											<div style="display: flex;align-items: center;margin-top: 10px;">
												<div style="display: flex;justify-content: space-between;width: 5vw;">
													<div></div>
													<div style="display: flex;">
														<span style="color: red;">*</span>
														<span>身份证有效期</span>
													</div>
												</div>
												<div>
													<a-range-picker v-model:value="id_card_times" :format="'YYYY/MM/DD'"
														:value-format="'YYYY/MM/DD'"
														style="width: 220px;margin-left: 20px;" />
												</div>
												<div style="display: flex;align-items: center;margin-left: 10px;">
													<!-- <a-checkbox v-model:checked="isCq">长期</a-checkbox> -->
													<a-popover title="规范" placement="rightTop">
														<template #content>
															<div>请按照身份证准确填写「姓名、身份证号」，核实确认无错别字。</div>
															<div>请按照身份证准确填写「身份证有效期」，不可延长有效期。</div>
															<!-- <div>有效期非“长期”的身份证不可勾选"长期”。</div> -->
														</template>
														<div
															style="color: #1890FF;margin-left: 10px;white-space:nowrap;">
															查看规范</div>
													</a-popover>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div style="display: flex;margin: 15px 0px 15px 44px;align-items: center;">
									<div style="display: flex;white-space:nowrap;">
										<span style="color: red;">*</span>
										<span>移动端绑定手机号</span>
									</div>
									<a-input v-model:value="mobile" style="margin-left: 10px;width: 300px;" />
								</div>
								<a-popover placement="leftTop" v-model:visible="popoverVisible">
									<template #content>
										<div style="font-size: 12px;">
											<div style="display: flex;align-items: center;">
												安全程度：
												<!-- 密码安全度中级单独判断 -->
												<div v-if="pasYz.level==2"
													style="margin-left: 3px;display: flex;margin-top: 2px;">
													<div v-if="pasYz.rule_a"
														style="background-color: orange;width: 40px;height: 8px;margin-right: 3px;">
													</div>
													<div v-else
														style="background-color: orange;width: 40px;height: 8px;margin-right: 3px;">
													</div>
													<div v-if="pasYz.rule_b"
														style="background-color: orange;width: 40px;height: 8px;margin-right: 3px;">
													</div>
													<div v-else
														style="border:1px solid orange;width: 40px;height: 8px;margin-right: 3px;">
													</div>
													<div v-if="pasYz.rule_c"
														style="background-color: orange;width: 40px;height: 8px;margin-right: 3px;">
													</div>
													<div v-else
														style="border:1px solid orange;width: 40px;height: 8px;margin-right: 3px;">
													</div>
												</div>
												<!-- 密码安全度 低 或  高 -->
												<div v-else style="margin-left: 3px;display: flex;margin-top: 2px;">
													<div v-if="pasYz.rule_a"
														style="background-color: green;width: 40px;height: 8px;margin-right: 3px;">
													</div>
													<!-- 规则2 或者规则3 满足一个就是框 -->
													<div v-else-if="pasYz.rule_b||pasYz.rule_c"
														style="border: 1px solid #FF5454;width: 40px;height: 8px;margin-right: 3px;">
													</div>
													<div v-else
														style="background-color: #FF5454;width: 40px;height: 8px;margin-right: 3px;">
													</div>
													<div v-if="pasYz.rule_b"
														style="background-color: green;width: 40px;height: 8px;margin-right: 3px;">
													</div>
													<div v-else
														style="border:1px solid#FF5454;width: 40px;height: 8px;margin-right: 3px;">
													</div>
													<div v-if="pasYz.rule_c"
														style="background-color: green;width: 40px;height: 8px;margin-right: 3px;">
													</div>
													<div v-else
														style="border:1px solid#FF5454;width: 40px;height: 8px;margin-right: 3px;">
													</div>
												</div>
												<span v-if="pasYz.level==1||pasYz.level==0"
													style="color: #FF5454;">低</span>
												<span v-else-if="pasYz.level==2" style="color: orange;">中</span>
												<span v-else-if="pasYz.level==3" style="color: green;">高</span>
											</div>
											<div>
												<div style="display: flex;align-items: center;">
													<CheckCircleFilled v-if="pasYz.rule_a"
														style="font-size: 10px;color: green;margin-right: 5px;" />
													<CloseCircleFilled v-else
														style="font-size: 10px;color: #FF5454;margin-right: 5px;" />
													<span>8-20位</span>
												</div>
												<div style="display: flex;align-items: center;">
													<CheckCircleFilled v-if="pasYz.rule_b"
														style="font-size: 10px;color: green;margin-right: 5px;" />
													<CloseCircleFilled v-else
														style="font-size: 10px;color: #FF5454;margin-right: 5px;" />
													<span>只能包含大小写字母、数字以及符号(不包含空格)</span>
												</div>
												<div style="display: flex;align-items: center;">
													<CheckCircleFilled v-if="pasYz.rule_c"
														style="font-size: 10px;color: green;margin-right: 5px;" />
													<CloseCircleFilled v-else
														style="font-size: 10px;color: #FF5454;margin-right: 5px;" />
													<span>大写字母/小写字母/数组/符号至少包含三种</span>
												</div>
											</div>
										</div>
									</template>
									<div style="display: flex;margin: 15px 0px 15px 72px;align-items: center;">
										<div style="display: flex;white-space:nowrap;">
											<span style="color: red;">*</span>
											<span>后台登录密码</span>
										</div>
										<a-input v-model:value="admin_login_password" @change="pasChange"
											style="margin-left: 10px;width: 300px;" />
									</div>
								</a-popover>
								<!--  -->
								<div style="border-left: 2px solid #1890FF;padding-left: 10px;font-size: 16px;">
									<!-- {{huifu_Type}}//store商家 user用户  汇付类型 -->
									{{huifu_Type=='store'?'商家汇付':'个人汇付'}}开通
								</div>

								<div style="text-align: center;margin-bottom: 20px;display: flex;cursor: pointer;">
									<div style="display: flex;margin: 0 auto;">
										<a-checkbox v-model:checked="xygx"></a-checkbox>
										<div style="display: flex;margin-left: 5px;">
											<span>已仔细阅读并自愿同意</span>
											<span style="color: #1890FF;"
												@click="handOpen('store_entry_introduce')">《商家入驻介绍》</span>
											<span style="color: #1890FF;"
												@click="handOpen('store_privacy_rule')">《商家隐私协议》</span>
											<span style="color: #1890FF;"
												@click="handOpen('store_rule')">《商家服务协议》</span>
										</div>
									</div>
								</div>
								<a-drawer v-model:visible="visible_dr" class="custom-class" :title="drTitle"
									placement="right">
									<div>
										<span v-html="drFwb"></span>
									</div>
								</a-drawer>
								<div v-if="check_remark" style="text-align: center;color: red;margin-bottom: 20px;">
									被拒绝原因：{{check_remark}}</div>
								<!-- 提交 -->
								<div
									style="text-align: center;display: flex;justify-content: space-between;align-items: center;cursor: pointer;">
									<div @click="buzhou_type=1" style="color: #1890FF;">
										<LeftOutlined style="color: #1890FF;" />上一步
									</div>
									<a-button @click="_submitEntryApply" type="primary"
										style="font-size: 15px !important;padding: 8px 40px;" size="large">提交</a-button>
									<div></div>
								</div>
								<!-- <div @click="resule_vis=true">入驻成功</div> -->
								<!-- 入驻成功弹框 -->
								<a-modal v-model:visible="resule_vis" @ok="toHome" width="450px" centered
									@cancel="handUrl('/login')" cancelText="返回登录">
									<div style="">
										<div style="display: flex;">
											<div style="margin: 0 auto;display: flex;align-items: center;">
												<SafetyCertificateFilled
													style="color: #83e930ce; font-size: 20px;margin-right: 5px;" />
												<div style="font-size: 20px;">您已实名认证成功</div>
											</div>
										</div>
										<a-alert message="您离开店成功还差一步,请点击确认提交" type="warning" show-icon
											style="padding: 5px 10px !important;margin-top: 10px;" />
										<div style="display: flex;margin-top: 10px;">
											<div style="width: 180px;text-align: right;">店铺类型： </div>
											<div>
												<span v-if="type=='a'">本地商家</span>
												<span v-if="type=='b'">网店商家</span>
												<span v-if="type=='c'">个体工商户</span>
												<span v-if="type=='d'">企业店</span>
											</div>
										</div>
										<div style="display: flex;margin-top: 20px;">
											<span style="width: 180px;text-align: right;">店铺名称： </span>
											<div>
												<div>{{store_name}}</div>
												<div style="font-size: 10px;">店铺审核后,您需要发起申请才可以修改店铺名</div>
											</div>
										</div>
										<div style="display: flex;margin-top: 20px;">
											<span style="width: 180px;text-align: right;">主营类目： </span>
											<div>
												<div>普通商品</div>
												<div style="font-size: 10px;">您没有销量以前,主营类目都可以修改</div>
											</div>
										</div>
										<div style="display: flex;margin-top: 20px;">
											<span style="width: 180px;text-align: right;">入住人姓名： </span>
											<div>
												<div>{{name}}</div>
											</div>
										</div>
										<div style="display: flex;margin-top: 20px;">
											<span style="width: 180px;text-align: right;">入住人身份证号： </span>
											<div>
												<div>{{id_card_number}}</div>
											</div>
										</div>
									</div>
								</a-modal>
							</div>
						</a-col>
						<a-col :xl="10" :xxl="7">
							<div
								style="margin-top: 20px;margin-left: 20px;border: 2px solid #f5f5f5;border-radius: 5px;background-color: #fff;">
								<div
									style="display:flex;background-color:#f7f8fa;font-size: 16px;padding: 10px 20px;align-items: center;">
									<ExclamationCircleFilled style="color: #1890FF;font-size: 14px;" />
									<div style="margin-left: 10px;">身份证像</div>
								</div>
								<div style="padding: 20px;">
									<div style="font-size: 16px;">不符合以下规范将会被审核驳回</div>
									<div style="color: #999999;">
										<div>1.请开店人仔细检查身份资料，确保身份证照片/信息准确无误。</div>
										<div>2.请上传开店人身份证的正反面实拍图，字体清晰无反光，边角完整，无任何无关水印及故意遮盖。</div>
										<div>3.请按照身份证准确填写「姓名、身份证号」，核实确认无错别字。</div>
									</div>
									<div style="font-size: 16px;margin: 10px 0px;">示例图</div>
									<div>
										<img style="width: 100%;"
											src="https://mms-static.pddpic.com/mallcenter/static/media/idCardImage.7257d73d.png?imageView2/2/w/1700/q/85/format/webp"
											alt="">
									</div>
								</div>
							</div>
						</a-col>
					</a-row>
				</div>
			</div>
		</div>
	</a-spin>
</template>

<style lang="less" scoped>
	.imgClose {
		width: 15px;
		height: 15px;
		position: absolute;
		right: 5px;
		top: 4px;
		color: #fff;
	}

	.map {
		z-index: 999;
		height: 300px !important;
		width: 600px !important;
		float: left;
		border-radius: 5px;
		border: 1px solid slategrey;
		margin-top: 10px;
	}

	.dialog-footer {
		line-height: 32px;
		margin-top: 20px;
		/*position: absolute;*/
		bottom: 10px;
		left: 10px;
		z-index: 9999;
	}
</style>