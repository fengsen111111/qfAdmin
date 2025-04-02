<script setup>
  import { inject, onBeforeMount, reactive, ref, watch, shallowRef } from "vue";
  import { FormComponents } from "../../form_components/form";
  import { TableComponents } from "../../table_components/table";
  import { Row, Col } from 'ant-design-vue';
  import { InfoCircleOutlined, CheckCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";
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
            console.log('position', position);

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
  // 相册
  function complete(response) {
    console.log('上传回调', response);
  }

  const value1 = ref()

  // 店铺信息
  function getStoreInfo() {
    global.axios
      .post('decoration/Store/getStoreInfo', {}, global)
      .then((res) => {
        console.log('店铺信息', res);
      });
  }
  getStoreInfo()

</script>

<template>
  <!--搜索-->
  <div style="padding: 20px;overflow: auto;height: 100%;">
    <div style="font-size: 18px;margin-bottom: 20px;">运费模板</div>
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