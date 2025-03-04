<script setup>
  import { inject, onBeforeMount, reactive, shallowRef, watch } from 'vue'

  import AMapLoader from '@amap/amap-jsapi-loader';
  import {
    bd09ToGcj02
  } from './zbzh'

  let myMap = shallowRef(null);

  const global = inject('global').value
  let props = defineProps(['structure'])
  const component_state = reactive({
    isCollapse: false,
    collapseMsg: global.findLanguage('打开'),
    lng: '',
    lat: '',

    marker: {}
  })

  // 定位到当前位置新增代码  =======》开始
  let lng_dq = 104.066285//经度
  let lat_dq = 30.573532//纬度
  if (window.navigator.geolocation) {
    window.navigator.geolocation.getCurrentPosition(
      function (position) {
        if (props.structure.value.length > 1) {
          console.log('有值，不管');
        } else {
          lng_dq = position.coords.longitude.toFixed(6);
          lat_dq = position.coords.latitude.toFixed(6);
          const hxzb = bd09ToGcj02(lng_dq, lat_dq)
          component_state.lng = hxzb.gcj_lon
          component_state.lat = hxzb.gcj_lat
        }
      },
      function (error) {
        // alert(`获取位置失败: ${error.message}`)
        if (props.structure.value.length > 1) {
          console.log('有值，不管');
        } else {
          console.log('lng_dq', lng_dq, lat_dq);
          component_state.lng = lng_dq
          component_state.lat = lat_dq
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


  onBeforeMount(() => {
    if (props.structure.value.length > 0) {
      component_state.lng = props.structure.value.split(',')[0]
      component_state.lat = props.structure.value.split(',')[1]
    }
  })
  watch(
    () => component_state.isCollapse,
    (newValue) => {
      if (component_state.isCollapse) {
        AMapLoader.reset()
        initMap()
      }
      else
        myMap && myMap.destroy();
    }
  )


  function initMap() {
    AMapLoader.load({
      key: props.structure.config.gd_jsapi_ak,
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
        props.structure.value = e.lnglat.getLng() + ',' + e.lnglat.getLat()
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


    }).catch(e => {

    })
  }

  function checkPoint(e) {
    component_state.lng = e.lnglat.lng
    component_state.lat = e.lnglat.lat
    props.structure.value = component_state.lng + ',' + component_state.lat
  }

  function addMarker(Lng, Lat) {
    console.log('经纬度', Lng, Lat);
    clearMarker()
    let marker = new AMap.Marker({
      icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
      position: [Lng, Lat],
      anchor: 'bottom-center'
    });

    myMap.add(marker);
    // myMap.setCenter([Lng, Lat],false,2000);
  }

  function clearMarker() {
    myMap.clearMap();
  }

  function change() {
    props.structure.value = component_state.lng + ',' + component_state.lat
  }

  function collapse() {
    component_state.isCollapse = true
  }
</script>
<template>
  <a-button class="button-class button-primary" style="margin-left: 0;margin-right: 10px;" @click="collapse">
    {{ component_state.collapseMsg }}
  </a-button>
  <span>
    <br>
    {{ global.findLanguage('经度') }} <a-input v-model:value="component_state.lng" allow-clear
      style="width: 200px;margin-top: 10px" @change="change()" />
    <br>
    {{ global.findLanguage('纬度') }} <a-input v-model:value="component_state.lat" allow-clear
      style="width: 200px;margin-top: 10px" @change="change()" />
  </span>


  <a-modal v-model:visible="component_state.isCollapse" :centered="true" :closable="false" :footer="null"
    :keyboard="false" :maskClosable="false" width="650px">
    {{ global.findLanguage('搜索') }} <input id="keyword" style="width: 200px;" /> <span
      style="color: red;font-size: 13px">{{ global.findLanguage('（录入信息越多，搜索结果越准确）') }}</span>
    <div id="container_map" class="map"></div>
    <div slot="footer" class="dialog-footer">
      <span style="margin-right: 30px">
        {{ global.findLanguage('经度') }} <a-input v-model:value="component_state.lng" allow-clear
          style="width: 200px;margin-top: 10px" @change="change()" />
        {{ global.findLanguage('纬度') }} <a-input v-model:value="component_state.lat" allow-clear
          style="width: 200px;margin-top: 10px" @change="change()" />
      </span>
      <a-button style="right: 10px" @click="component_state.isCollapse = false">{{ global.findLanguage('关闭') }}
      </a-button>
    </div>
  </a-modal>

</template>

<style scoped>
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