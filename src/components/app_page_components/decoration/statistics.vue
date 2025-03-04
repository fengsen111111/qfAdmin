<script setup>
import {inject, onBeforeMount, reactive} from 'vue'
import {EchartsComponents} from "../../echarts_components/echarts";

let props = defineProps(["pageData"])
const pageData = props.pageData
let emit = defineEmits(["openChildPage", "closeChildPage"])

function openChildPage(pageData) {
  emit('openChildPage', pageData)
}

function closeChildPage(page_key) {
  emit("closeChildPage", page_key);
}

const global = inject('global').value
const statistics_state = reactive({
  requestParams: {},
  showCloseButton: false,
  datas: {},
  start_time: '',
  end_time: '',
  showECharts:false
})

onBeforeMount(() => {
  //初始化请求参数
  if (pageData.hasOwnProperty('data'))
    statistics_state.requestParams = pageData.data
  getResource()
})

function getResource() {
  statistics_state.showECharts = false
  let requestParams = Object.assign(
      {
        'start_time':statistics_state.start_time,
        'end_time':statistics_state.end_time,
      },
      statistics_state.requestParams,

  );
  global.axios.post('decoration/Setting/statistics', requestParams, global)
      .then(res => {
        if (res) {
          statistics_state.datas = res;
          statistics_state.showECharts = true
        }
      })
}
function reset(){
  statistics_state.start_time = ''
  statistics_state.end_time = ''
  getResource()
}
</script>
<template>
  <div class="table-header">
    <div>
      <a-button v-show="pageData.hasOwnProperty('parent_page_key')" class="iconfont button-class"
                style="font-size: 18px !important;padding: 0 10px;float: left"
                @click="closeChildPage(pageData.page_key)">&#xe6d2;
      </a-button>
      <a-button class="button-class button-success" style="float: left" type="primary" @click="reset">
        {{ global.findLanguage('重置') }}
      </a-button>
    </div>
  </div>
  <div class="table">
    <a-row :wrap="true">
      <component
          :is="EchartsComponents.Card"
          :value="statistics_state.datas.user_number"
          endColor="#6DE195"
          icon="&#xe719;"
          name="总用户数"
          startColor="#C4E759"
      />
      <component
          :is="EchartsComponents.Card"
          :value="statistics_state.datas.store_number"
          endColor="#41C7AF"
          icon="&#xe719;"
          name="总商家数"
          startColor="#54E38E"
      />
      <component
          :is="EchartsComponents.Card"
          :value="statistics_state.datas.goods_number"
          endColor="#fc5e39"
          icon="&#xe719;"
          name="总商品数"
          startColor="#ffa494"
      />
      <component
          :is="EchartsComponents.Card"
          :value="statistics_state.datas.article_number_a"
          endColor="#A43AB2"
          icon="&#xe719;"
          name="总图文数"
          startColor="#E13680"
      />
      <component
          :is="EchartsComponents.Card"
          :value="statistics_state.datas.article_number_b"
          endColor="#6CACFF"
          icon="&#xe719;"
          name="总视频数"
          startColor="#8DEBFF"
      />
      <component
          :is="EchartsComponents.Card"
          :value="statistics_state.datas.all_price"
          endColor="#6CACFF"
          icon="&#xe719;"
          name="总营业额"
          startColor="#8DEBFF"
      />
    </a-row>
    <a-row >
      <a-col :span="24">
        <div v-if="statistics_state.datas.store_prices && statistics_state.showECharts"
             style="border:1px solid #c9c9c9;border-radius:20px;margin: 0 10px">
          <div style="font-size: 18px;margin: 10px 20px">商家营业额排行</div>
          <component
              :is="EchartsComponents.Bar"
              :data="statistics_state.datas.store_prices"
          />
        </div>
      </a-col>
    </a-row>
    <a-row >
      <a-col :span="24">
        <div v-if="statistics_state.datas.day_prices && statistics_state.showECharts"
             style="border:1px solid #c9c9c9;border-radius:20px;margin: 0 10px">
          <div style="font-size: 18px;margin: 10px 20px">近30天营业额对比</div>
          <component
              :is="EchartsComponents.Bar"
              :data="statistics_state.datas.day_prices"
          />
        </div>
      </a-col>
    </a-row>
    <a-row >
      <a-col :span="24">
        <div v-if="statistics_state.datas.month_prices && statistics_state.showECharts"
             style="border:1px solid #c9c9c9;border-radius:20px;margin: 0 10px">
          <div style="font-size: 18px;margin: 10px 20px">近12月营业额对比</div>
          <component
              :is="EchartsComponents.Bar"
              :data="statistics_state.datas.month_prices"
          />
        </div>
      </a-col>
    </a-row>
    <a-row >
      <a-col :span="24">
        <div v-if="statistics_state.datas.day_user && statistics_state.showECharts"
             style="border:1px solid #c9c9c9;border-radius:20px;margin: 0 10px">
          <div style="font-size: 18px;margin: 10px 20px">近30天用户增长对比</div>
          <component
              :is="EchartsComponents.Bar"
              :data="statistics_state.datas.day_user"
          />
        </div>
      </a-col>
    </a-row>
    <a-row >
      <a-col :span="24">
        <div v-if="statistics_state.datas.month_user && statistics_state.showECharts"
             style="border:1px solid #c9c9c9;border-radius:20px;margin: 0 10px">
          <div style="font-size: 18px;margin: 10px 20px">近12月用户增长对比</div>
          <component
              :is="EchartsComponents.Bar"
              :data="statistics_state.datas.month_user"
          />
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.table-header {
  height: 30px;
  line-height: 30px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}

.table {
  height: calc(100vh - 176px) !important;
  overflow-y: auto;
  border-bottom: 1px solid #f0f0f0;
  border-top: 1px solid #f0f0f0;
}

.button-class {
  margin-left: 5px;
  margin-right: 5px;
}
.ant-row {
  margin-bottom: 20px;
}
</style>