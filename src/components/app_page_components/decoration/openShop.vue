<script setup>
	import { inject, onBeforeMount, reactive, ref, watch, shallowRef } from "vue";
	import { FormComponents } from "../../form_components/form";
	import { TableComponents } from "../../table_components/table";
	import { Row, Col } from 'ant-design-vue';
	import { InfoCircleOutlined, CheckCircleOutlined, PlusOutlined, CloseCircleOutlined } from "@ant-design/icons-vue";
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
				name.value = res.name
				mobile.value = res.mobile
				admin_login_password.value = res.admin_login_password
				address.value = res.address
				location.value = res.location
				check_remark.value = res.check_remark
			}
		})
	}
	getSubmitEntryApplyMsg()

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
		id_card_images.value.push(response.url)
	}
	// 删除身份证
	function delImgSfz(index) {
		console.log('删除身份证');
		id_card_images.value.splice(index, 1)
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
			return false
		}
		if (!logo.value) {
			message.error('请上传门店logo')
			return false
		}
		if (!id_card_images.value || id_card_images.value.length != 2) {
			message.error('请检查身份证照片信息')
			return false
		}
		if (!license_image.value) {
			message.error('请上传营业执照')
			return false
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
		if (!admin_login_password.value) {
			message.error('请输入后台登陆密码')
			return false
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
				global.Modal.confirm({
					title: global.findLanguage(
						"保存成功，点击确定返回上一页！"
					),
					okText: global.findLanguage("确定"),
					cancelText: global.findLanguage("取消"),
					okType: "primary",
					onOk: function () {
						handUrl('/login')
					},
				});
			})
	}

	const visible_dr = ref(false)
	const drTitle = ref('')
	const drFwb = ref('')

	function handOpen(type) {
		drTitle.value = type == 'store_entry_introduce' ? '商家入驻介绍' : type == 'store_privacy_rule' ? '商家隐私协议' : type == 'store_rule' ? '平台商家规则' : '标题'
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
</script>

<template>
	<!--搜索-->
	<a-spin :spinning="spinning">
		<div>
			<div style="background-color: #323242;height: 8vh;display: flex;">
				<div
					style="padding: 20px;height: 100%;width: 70vw;margin: 0 auto;display: flex;justify-content: space-between;align-items: center;">
					<div style="display: flex;">
						<img :src="global.adminLogo" alt="" style="width: auto;height: 45px;border-radius: 5px">
						<span style="font-size: 28px;margin-left: 5px;color: #fff;font-weight: bold;">{{global.appName}}
						</span>
					</div>
					<div @click="handUrl('/login')" style="color: #fff;">
						返回登录
					</div>
				</div>
			</div>
			<div style="display: flex;background: #f5f5f5;height: 92vh;">
				<div style="padding: 20px;overflow: auto;height: 100%;width: 70vw;margin: 0 auto;">
					<div style="font-size: 18px;margin-bottom: 20px;">店铺信息</div>
					<a-row>
						<a-col :xl="24" :xxl="14">
							<div
								style="background-color: #fff;padding: 20px;border: 2px solid #f5f5f5;border-radius: 5px;">
								<div style="border-left: 2px solid #1890FF;padding-left: 10px;font-size: 16px;">店铺基本信息
								</div>
								<div style="display: flex;margin: 20px 0px 20px 100px;align-items: center;">
									<div style="display: flex;white-space:nowrap;">
										<span style="color: red;">*</span>
										<span>店铺名称</span>
									</div>
									<a-input v-model:value="store_name" style="margin-left: 10px;width: 300px;"
										show-count :maxlength="30" />
									<a-popover title="规范" placement="rightTop">
										<template #content>
											<div>不得与已经开通的店铺名称重复</div>
											<div>不得包含容易造成消费者混淆的信息:包含知名人士、地名的品牌</div>
										</template>
										<div style="color: #1890FF;margin-left: 10px;white-space:nowrap;">查看规范</div>
									</a-popover>
								</div>
								<div style="display: flex;margin: 20px 0px 20px 100px;">
									<div style="display: flex;white-space:nowrap;">
										<span style="color: red;">*</span>
										<span>门店logo</span>
									</div>
									<div style="margin-left: 10px;display: flex;">
										<div v-if="logo"
											style="position: relative;display: flex;overflow: hidden;border-radius: 4px;">
											<a-image :width="100" :src="logo" :preview="{ src: logo }" />
											<div @click="delImgLogo()" class="imgClose" style="margin-left: 10px;">
												<CloseCircleOutlined />
											</div>
										</div>
										<a-upload v-else :customRequest="upload" :file-list="[]" list-type="text">
											<div
												style="width: 100px;height: 100px;border: 1px solid #f5f5f5;margin-right: 10px;text-align: center;">
												<PlusOutlined style="font-size: 30px;color: #999999;margin-top: 35%;" />
											</div>
										</a-upload>
									</div>
								</div>
								<!--  -->
								<div style="border-left: 2px solid #1890FF;padding-left: 10px;font-size: 16px;">开店人基本信息
								</div>
								<div style="display: flex;margin: 20px 0px 20px 100px">
									<div style="display: flex;">
										<span style="color: red;">*</span>
										<span>商家类型</span>
									</div>
									<div style="margin-left: 10px;">
										<a-radio-group v-model:value="type" name="radioGroup">
											<a-radio value="b">网店商家</a-radio>
											<a-radio value="a">本地商家</a-radio>
										</a-radio-group>
									</div>
									<a-popover title="规范" placement="rightTop">
										<template #content>
											<div>商家类型为本地商家需要录入详细地址</div>
											<div>商家类型为本地商家需要录入具体定位</div>
										</template>
										<span style="color: #1890FF;margin-left: 10px;">查看规范</span>
									</a-popover>
								</div>
								<!-- 本地商家 -->
								<div v-if="type=='a'">
									<div style="display: flex;margin: 20px 0px 20px 105px;align-items: center;">
										<div style="display: flex;white-space:nowrap;">
											<span>详细地址</span>
										</div>
										<a-input v-model:value="address" style="margin-left: 10px;width: 300px;" />
									</div>
									<div style="display: flex;margin: 20px 0px 20px 133px;align-items: center;">
										<div style="display: flex;white-space:nowrap;">
											<span>坐标</span>
										</div>
										<a-button type="primary" @click="isMap = true"
											style="margin-left: 10px;">打开</a-button>
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
								<div style="display: flex;margin: 20px 0px 20px 100px;">
									<div style="display: flex;white-space:nowrap;">
										<span style="color: red;">*</span>
										<span>身份证像</span>
									</div>
									<div>
										<div style="display: flex;">
											<div style="margin-left: 10px;display: flex;">
												<div style="position: relative;margin-right: 10px;border-radius: 4px;overflow: hidden;display: flex;height: 90px;width: 90px;"
													v-for="(item,index) in id_card_images" :key="index">
													<a-image :width="90" :src="item" :preview="{ src: item }" />
													<div @click="delImgSfz(index)" class="imgClose"
														style="margin-left: 10px;">
														<CloseCircleOutlined />
													</div>
												</div>
												<a-upload v-if="id_card_images.length<2" :customRequest="uploadSfz"
													:file-list="[]" list-type="text">
													<div
														style="width: 100px;height: 100px;border: 1px solid #f5f5f5;margin-right: 10px;text-align: center;">
														<PlusOutlined
															style="font-size: 30px;color: #999999;margin-top: 35%;" />
													</div>
												</a-upload>
											</div>
											<div style="display: flex;margin-left: 20px;">
												<div style="display: flex;white-space:nowrap;">
													<span style="color: red;">*</span>
													<span>营业执照</span>
												</div>
												<div style="margin-left: 10px;display: flex;">
													<div v-if="license_image"
														style="position: relative;display: flex;overflow: hidden;border-radius: 4px;">
														<a-image :width="100" :src="license_image"
															:preview="{ src: license_image }" />
														<div @click="delImgYyzz()" class="imgClose"
															style="margin-left: 10px;">
															<CloseCircleOutlined />
														</div>
													</div>
													<a-upload v-else :customRequest="uploadYyzz" :file-list="[]"
														list-type="text">
														<div
															style="width: 100px;height: 100px;border: 1px solid #f5f5f5;margin-right: 10px;text-align: center;">
															<PlusOutlined
																style="font-size: 30px;color: #999999;margin-top: 35%;" />
														</div>
													</a-upload>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div style="display: flex;margin: 20px 0px 20px 100px;align-items: center;">
									<div style="display: flex;white-space:nowrap;">
										<span style="color: red;">*</span>
										<span>身份证号</span>
									</div>
									<a-input v-model:value="id_card_number" style="margin-left: 10px;width: 300px;" />
								</div>
								<div style="display: flex;margin: 20px 0px 20px 87px;align-items: center;">
									<div style="display: flex;white-space:nowrap;">
										<span style="color: red;">*</span>
										<span>负责人姓名</span>
									</div>
									<a-input v-model:value="name" style="margin-left: 10px;width: 300px;" />
								</div>
								<div style="display: flex;margin: 20px 0px 20px 44px;align-items: center;">
									<div style="display: flex;white-space:nowrap;">
										<span style="color: red;">*</span>
										<span>移动端绑定手机号</span>
									</div>
									<a-input v-model:value="mobile" style="margin-left: 10px;width: 300px;" />
								</div>
								<div style="display: flex;margin: 20px 0px 20px 72px;align-items: center;">
									<div style="display: flex;white-space:nowrap;">
										<span style="color: red;">*</span>
										<span>后台登录密码</span>
									</div>
									<a-input v-model:value="admin_login_password"
										style="margin-left: 10px;width: 300px;" />
								</div>
								<div style="text-align: center;margin-bottom: 20px;display: flex;">
									<div style="display: flex;margin: 0 auto;">
										<a-checkbox v-model:checked="xygx"></a-checkbox>
										<div style="display: flex;margin-left: 5px;">
											<span>已仔细阅读并自愿同意</span>
											<span style="color: #1890FF;"
												@click="handOpen('store_entry_introduce')">《商家入驻介绍》</span>
											<span style="color: #1890FF;"
												@click="handOpen('store_privacy_rule')">《商家隐私协议》</span>
											<span style="color: #1890FF;"
												@click="handOpen('store_rule')">《平台商家规则》</span>
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
								<div style="text-align: center;">
									<a-button @click="_submitEntryApply" type="primary"
										style="font-size: 15px !important;" size="large">提交</a-button>
								</div>
							</div>
						</a-col>
						<a-col :xl="10" :xxl="8">
							<div
								style="margin-top: 20px;margin-left: 20px;border: 2px solid #f5f5f5;border-radius: 5px;background-color: #fff;">
								<div
									style="display:flex;background-color:#f7f8fa;font-size: 16px;padding: 10px 20px;align-items: center;">
									<InfoCircleOutlined style="color: #1890FF;font-size: 14px;" />
									<div style="margin-left: 10px;">身份证像</div>
								</div>
								<div style="padding: 20px;">
									<div style="font-size: 16px;">不符合以下规范将会被审核驳回</div>
									<div style="color: #999999;">
										<div>1.请开店人仔细检查身份资料，确保身份证照片/信息准确无误。</div>
										<div>2.请上传开店人身份证的正反面实拍图，字体清晰无反光，边角完整，无任何无关水印及故意遮盖。</div>
										<div>3.请按照身份证准确填写「姓名、身份证号」，核实确认无错别字。</div>
										<!-- <div>4.请按照身份证准确填写「身份证有效期」，不可延长有效期，有效期非“长期”的身份证不可勾选"长期”。</div> -->
									</div>
									<div style="font-size: 16px;margin: 10px 0px;">示例图</div>
									<div style="padding: 20px;">
										<div style="display: flex;">
											<img style="width: 180px;object-fit: contain;border-radius: 5px;"
												src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/202535/ceoe98ri2u3wjmcejvothruie3dkirih.jpg"
												alt="">
											<div style="margin: 0 10px;">
												<div
													style="display: flex;align-items: center;font-size: 14px;margin-top: 8px;">
													<CheckCircleOutlined style="color: #4DB23F;" />
													<div style="margin-left: 5px;white-space:nowrap">四角完整</div>
												</div>
												<div
													style="display: flex;align-items: center;font-size: 14px;margin: 15px 0px;">
													<CheckCircleOutlined style="color: #4DB23F;" />
													<div style="margin-left: 5px;white-space:nowrap">亮度均匀</div>
												</div>
												<div style="display: flex;align-items: center;font-size: 14px;">
													<CheckCircleOutlined style="color: #4DB23F;" />
													<div style="margin-left: 5px;white-space:nowrap">照片清晰</div>
												</div>
											</div>
										</div>
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