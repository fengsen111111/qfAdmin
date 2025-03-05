<script setup>
  import { inject, onBeforeMount, reactive, ref, watch, shallowRef } from "vue";
  import { FormComponents } from "../../form_components/form";
  import { TableComponents } from "../../table_components/table";
  import { Row, Col } from 'ant-design-vue';
  import { InfoCircleOutlined, CheckCircleOutlined,PlusOutlined } from "@ant-design/icons-vue";
  import Map from './map.vue'
  import AMapLoader from '@amap/amap-jsapi-loader';
  import { bd09ToGcj02 } from './zbzh'


  let props = defineProps(["pageData"]);
  const pageData = props.pageData;

  let emit = defineEmits(["openChildPage", "closeChildPage"]);

  const global = inject("global").value;

  const shopName = ref('')// 店铺名称
  const userName = ref('')//姓名
  const userCode = ref('')//身份证号
  const codeTime = ref('')//身份证有效期
  const isCq = ref(false)//身份证 是否长期
  const type = ref('2')//商家类型
  const isChecked = ref(false)

  const checkAll = ref(false)
  const indeterminate = ref(false)
  const plainOptions = ['包邮到家', '24小时发货', '活动促销'];
  const checkedList = ref(['包邮到家', '24小时发货'])

  function onCheckAllChange(e) {
    checkedList.value = e.target.checked ? plainOptions : []
  }
  watch(() => checkedList, val => {
    console.log('val', val.value);
  }, { deep: true });

  const isMap = ref(false)//是否打开地图
  watch(() => isMap, val => {
    // console.log('地图', val.value);
    if (val.value) {
      // initMap()
      if (window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(
          function (position) {
            console.log('position',position);
            
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

  // 上传
	function upload(options) {
		global.file.uploadFile(global, options.file, 'image', 'shopImg', true, complete)
	}
</script>

<template>
  <!--搜索-->
  <div style="padding: 20px;overflow: auto;height: 100%;">
    <div style="font-size: 18px;margin-bottom: 20px;">店铺信息</div>
    <a-row>
      <a-col :xl="24" :xxl="16">
        <div style="background-color: #fff;padding: 20px;border: 2px solid #f5f5f5;border-radius: 5px;">
          <div style="border-left: 2px solid #1890FF;padding-left: 10px;font-size: 16px;">店铺基本信息</div>
          <div style="display: flex;margin: 20px 0px 20px 100px;align-items: center;">
            <div style="display: flex;white-space:nowrap;">
              <span style="color: red;">*</span>
              <span>店铺名称</span>
            </div>
            <a-input v-model:value="shopName" style="margin-left: 10px;width: 300px;" show-count :maxlength="30" />
            <div style="color: #1890FF;margin-left: 10px;white-space:nowrap;">查看规范</div>
          </div>
          <div style="display: flex;margin: 20px 0px 20px 100px;">
            <div style="display: flex;white-space:nowrap;">
              <span style="color: red;">*</span>
              <span>门店logo</span>
            </div>
            <div style="margin-left: 10px;display: flex;">
              <a-upload :customRequest="upload" :file-list="[]" list-type="text">
                <div style="width: 120px;height: 120px;border: 1px solid #f5f5f5;margin-right: 10px;text-align: center;">
                  <PlusOutlined style="font-size: 30px;color: #999999;margin-top: 35%;" />
                </div>
							</a-upload>
            </div>
          </div>
          <!--  -->
          <div style="border-left: 2px solid #1890FF;padding-left: 10px;font-size: 16px;">开店人基本信息</div>
          <div style="display: flex;margin: 20px 0px 20px 100px">
            <div style="display: flex;">
              <span style="color: red;">*</span>
              <span>商家类型</span>
            </div>
            <div style="margin-left: 10px;">
              <a-radio-group v-model:value="type" name="radioGroup">
                <a-radio value="1">网店商家</a-radio>
                <a-radio value="2">本地商家</a-radio>
              </a-radio-group>
            </div>
            <span style="color: #1890FF;margin-left: 10px;">查看规范</span>
          </div>
          <!-- 本地商家 -->
          <div v-if="type==2">
            <div style="display: flex;margin: 20px 0px 20px 105px;align-items: center;">
              <div style="display: flex;white-space:nowrap;">
                <span>详细地址</span>
              </div>
              <a-input v-model:value="shopName" style="margin-left: 10px;width: 300px;" />
            </div>
            <div style="display: flex;margin: 20px 0px 20px 133px;align-items: center;">
              <div style="display: flex;white-space:nowrap;">
                <span>坐标</span>
              </div>
              <a-button type="primary" @click="isMap = true" style="margin-left: 10px;">打开</a-button>
              <a-modal v-model:visible="isMap" :centered="true" :closable="false" :footer="null" :keyboard="false"
                :maskClosable="false" width="650px">搜索<input id="keyword" style="width: 200px;margin-left: 10px;" /> <span
                  style="color: red;font-size: 13px;margin-left: 10px;">录入信息越多，搜索结果越准确</span>
                <div id="container_map" class="map"></div>
                <div slot="footer" class="dialog-footer">
                  <span style="margin-right: 30px">
                    经度<a-input v-model:value="component_state.lng" allow-clear style="width: 150px;margin-top: 10px;margin-left: 10px;" />
                    纬度<a-input v-model:value="component_state.lat" allow-clear style="width: 150px;margin-top: 10px;margin-left: 10px;" />
                  </span>
                  <a-button style="right: 10px" @click="isMap = false">关闭</a-button>
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
                  <a-upload :customRequest="upload" :file-list="[]" list-type="text">
                    <div style="width: 120px;height: 120px;border: 1px solid #f5f5f5;margin-right: 10px;text-align: center;">
                      <PlusOutlined style="font-size: 30px;color: #999999;margin-top: 35%;" />
                    </div>
                  </a-upload>
                  <a-upload :customRequest="upload" :file-list="[]" list-type="text">
                    <div style="width: 120px;height: 120px;border: 1px solid #f5f5f5;margin-right: 10px;text-align: center;">
                      <PlusOutlined style="font-size: 30px;color: #999999;margin-top: 35%;" />
                    </div>
                  </a-upload>
                </div>
                <div style="display: flex;margin-left: 20px;">
                  <div style="display: flex;white-space:nowrap;">
                    <span style="color: red;">*</span>
                    <span>营业执照</span>
                  </div>
                  <div style="margin-left: 10px;display: flex;">
                    <a-upload :customRequest="upload" :file-list="[]" list-type="text">
                      <div style="width: 120px;height: 120px;border: 1px solid #f5f5f5;margin-right: 10px;text-align: center;">
                        <PlusOutlined style="font-size: 30px;color: #999999;margin-top: 35%;" />
                      </div>
                    </a-upload>
                  </div>
                </div>
              </div>
              <div style="display: flex;margin-left: 10px;margin-top: 20px;">
                <div style="background-color: #f7f7f7;">
                  <div style="padding: 20px;">请核对身份信息，若信息不符合，可手动修改</div>
                  <div style="height: 1px;background-color: #d1d0cf;"></div>
                  <div style="padding: 20px;">
                    <div style="display: flex;align-items: center;">
                      <div style="display: flex;justify-content: space-between;width: 7vw;">
                        <div></div>
                        <div style="display: flex;">
                          <span style="color: red;">*</span>
                          <span>姓名</span>
                        </div>
                      </div>
                      <a-input v-model:value="userName" style="width: 200px;margin-left: 20px;"
                        placeholder="Basic usage" />
                    </div>
                    <div style="display: flex;align-items: center;margin-top: 20px;">
                      <div style="display: flex;justify-content: space-between;width: 7vw;">
                        <div></div>
                        <div style="display: flex;">
                          <span style="color: red;">*</span>
                          <span>身份证号</span>
                        </div>
                      </div>
                      <a-input v-model:value="userCode" style="width: 200px;margin-left: 20px;"
                        placeholder="Basic usage" />
                    </div>
                    <div style="display: flex;align-items: center;margin-top: 20px;">
                      <div style="display: flex;justify-content: space-between;width: 7vw;">
                        <div></div>
                        <div style="display: flex;">
                          <span style="color: red;">*</span>
                          <span>身份证有效期</span>
                        </div>
                      </div>
                      <a-input v-model:value="userCode" style="width: 200px;margin-left: 20px;"
                        placeholder="Basic usage" />
                      <div style="display: flex;align-items: center;margin-left: 10px;">
                        <a-checkbox v-model:checked="isCq">长期</a-checkbox>
                        <div style="color: #1890FF;margin-left: 10px;white-space:nowrap;">查看规范</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style="display: flex;margin: 20px 0px 20px 114px;align-items: center;">
            <div style="display: flex;white-space:nowrap;">
              <span style="color: red;">*</span>
              <span>负责人</span>
            </div>
            <a-input v-model:value="shopName" style="margin-left: 10px;width: 300px;" />
          </div>
          <div style="display: flex;margin: 20px 0px 20px 114px;align-items: center;">
            <div style="display: flex;white-space:nowrap;">
              <span style="color: red;">*</span>
              <span>手机号</span>
            </div>
            <a-input v-model:value="shopName" style="margin-left: 10px;width: 300px;" show-count :maxlength="11" />
          </div>
          <div style="display: flex;margin: 20px 0px 20px 44px;align-items: center;">
            <div style="display: flex;white-space:nowrap;">
              <span style="color: red;">*</span>
              <span>移动端绑定手机号</span>
            </div>
            <a-input v-model:value="shopName" style="margin-left: 10px;width: 300px;" />
          </div>
          <div style="display: flex;margin: 20px 0px 20px 100px;">
            <div style="display: flex;white-space:nowrap;">
              <span style="color: red;">*</span>
              <span>商家服务</span>
            </div>
            <div style="margin-left: 10px;">
              <div>
                <a-checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="onCheckAllChange">
                  全选
                </a-checkbox>
              </div>
              <a-checkbox-group v-model:value="checkedList" :options="plainOptions" />
            </div>
          </div>
          <div style="display: flex;margin: 20px 0px 20px 105px;align-items: center;">
            <div style="display: flex;white-space:nowrap;">
              <span>是否自营</span>
            </div>
            <a-switch style="margin-left: 10px;" v-model:checked="isChecked" />
          </div>
          <div style="display: flex;margin: 20px 0px 20px 100px;align-items: center;">
            <div style="display: flex;white-space:nowrap;">
              <span style="color: red;">*</span>
              <span>后台密码</span>
            </div>
            <a-input v-model:value="shopName" style="margin-left: 10px;width: 300px;" />
          </div>
          <div style="display: flex;margin: 20px 0px 20px 100px;align-items: center;">
            <div style="display: flex;white-space:nowrap;">
              <span style="color: red;">*</span>
              <span>启用状态</span>
            </div>
            <a-switch style="margin-left: 10px;" v-model:checked="isChecked" />
          </div>
          <!-- 提交 -->
          <div style="text-align: center;">
            <a-button type="primary">提交</a-button>
          </div>
        </div>
      </a-col>
      <a-col :xl="10" :xxl="6">
        <div style="margin-top: 20px;margin-left: 20px;border: 2px solid #f5f5f5;border-radius: 5px;">
          <div style="display:flex;background-color:#f7f8fa;font-size: 16px;padding: 10px 20px;align-items: center;">
            <InfoCircleOutlined style="color: #1890FF;font-size: 14px;" />
            <div style="margin-left: 10px;">身份证像</div>
          </div>
          <div style="padding: 20px;">
            <div style="font-size: 16px;">不符合以下规范将会被审核驳回</div>
            <div style="color: #999999;">
              <div>1.请开店人本人做人脸识别，确保身份证照片/信息与人脸识别为同一人。</div>
              <div>2.请上传开店人身份证的正反面实拍图，字体清晰无反光，边角完整，无任何无关水印及故意遮盖。</div>
              <div>3.请按照身份证准确填写「姓名、身份证号」，核实确认无槽别字。</div>
              <div>4.请按照身份证准确填写「身份证有效期」，不可延长有效期，有效期非“长期”的身份证不可勾选"长期”。</div>
            </div>
            <div style="font-size: 16px;margin: 10px 0px;">示例图</div>
            <div style="background-color: #f6f8fa;padding: 20px;">
              <div style="display: flex;">
                <img style="width: 60%;object-fit: contain;border-radius: 5px;"
                  src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/202535/ceoe98ri2u3wjmcejvothruie3dkirih.jpg"
                  alt="">
                <div style="margin: 0 10px;">
                  <div style="display: flex;align-items: center;font-size: 14px;margin-top: 8px;">
                    <CheckCircleOutlined style="color: #4DB23F;" />
                    <div style="margin-left: 5px;">四角完整</div>
                  </div>
                  <div style="display: flex;align-items: center;font-size: 14px;margin: 15px 0px;">
                    <CheckCircleOutlined style="color: #4DB23F;" />
                    <div style="margin-left: 5px;">亮度均匀</div>
                  </div>
                  <div style="display: flex;align-items: center;font-size: 14px;">
                    <CheckCircleOutlined style="color: #4DB23F;" />
                    <div style="margin-left: 5px;">照片清晰</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
  <!--导出-->
</template>

<style lang="less" scoped>
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