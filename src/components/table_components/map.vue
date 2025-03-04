<script setup>
import {inject, onBeforeMount, reactive, shallowRef, watch} from 'vue'

import AMapLoader from '@amap/amap-jsapi-loader';

let myMap = shallowRef(null);

const global = inject('global').value
let props = defineProps(['value', 'structure', 'rowValue', 'id'])
let emit = defineEmits(["tableHandles", "refresh"])
const component_state = reactive({
  isCollapse: false,
  collapseMsg: global.findLanguage('查看'),
  lng: '',
  lat: '',

  marker: {}
})
onBeforeMount(() => {
  if (props.value.length > 0) {
    component_state.lng = props.value.split(',')[0]
    component_state.lat = props.value.split(',')[1]
  }
})
watch(
    () => component_state.isCollapse,
    (newValue) => {
      if (component_state.isCollapse)
        initMap()
      else
        myMap && myMap.destroy();
    }
)


function initMap() {
  AMapLoader.load({
    key: props.structure.config.gd_jsapi_ak,
    version: "2.0",

  }).then((AMap) => {
    myMap = new AMap.Map("container", {
      viewMode: "2D",
      zoom: 16,
      resizeEnable: true
    });

    addMarker(component_state.lng, component_state.lat)

  }).catch(e => {

  })
}


function addMarker(Lng, Lat) {
  clearMarker()
  let marker = new AMap.Marker({
    icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
    position: [Lng, Lat],
    anchor: 'bottom-center'
  });

  myMap.add(marker);
  myMap.setCenter([Lng, Lat]);
}

function clearMarker() {
  myMap.clearMap();
}

function collapse() {
  component_state.isCollapse = true
}
</script>
<template>
  <a-button  class="button-class button-primary" style="margin-left: 0;margin-right: 10px;" @click="collapse">
    {{ component_state.collapseMsg }}
  </a-button>

  <a-modal v-model:visible="component_state.isCollapse" :centered="true" :closable="false" :footer="null"
           :keyboard="false"
           :maskClosable="false"
           width="650px">

    <div id="container" class="map"></div>
    <div slot="footer" class="dialog-footer">
      <span style="margin-right: 80px">{{ global.findLanguage('经度') }} {{component_state.lng}}</span>
      <span style="margin-right: 80px">{{ global.findLanguage('纬度') }} {{component_state.lat}}</span>
      <a-button style="right: 10px" @click="component_state.isCollapse = false">{{ global.findLanguage('关闭') }}
      </a-button>
    </div>
  </a-modal>

</template>

<style scoped>
.map {
  z-index: 999;
  height: 300px;
  width: 600px;
  float: left;
  border-radius: 5px;
  border: 1px solid slategrey;
  margin-top: 10px;
  margin-bottom: 10px;
}

.dialog-footer {
  line-height: 20px;
  margin-top: 10px;
  /*position: absolute;*/
  bottom: 10px;
  left: 10px;
  z-index: 9999;
}

</style>