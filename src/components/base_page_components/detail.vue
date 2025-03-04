<script setup>
import {inject, onBeforeMount, reactive} from 'vue'
import {MoreComponents} from '../other_components/more/more'

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
const detail_state = reactive({
  requestParams: {},       //请求参数
  detailStructure: {},     //详情结构
  showCloseButton: false,   //是否有返回按钮
  timer: new Date().getTime(),
  roundNumber: Math.floor(Math.random() * (9999 - 1 + 1)) + 1
})

onBeforeMount(() => {
  //初始化请求参数
  if (pageData.hasOwnProperty('data'))
    detail_state.requestParams = pageData.data
  getStructure()
})

//获取结构和数据
function getStructure() {
  detail_state.detailStructure = {}
  global.axios.post(pageData.url, detail_state.requestParams, global)
      .then(res => {
        if (res) {
          detail_state.timer = new Date().getTime()
          detail_state.roundNumber = Math.floor(Math.random() * (9999 - 1 + 1)) + 1
          detail_state.detailStructure = res;
        }
      })
}
</script>
<template>
  <div class="table-header">
    <div>
      <a-button v-show="pageData.hasOwnProperty('parent_page_key')" class="iconfont button-class"
                style="font-size: 18px !important;padding: 0 10px;float: left"
                @click="closeChildPage(pageData.page_key)">&#xe6d2;
      </a-button>
      <a-button class="button-class button-success" style="float: left" type="primary" @click="getStructure">
        {{ global.findLanguage('刷新') }}
      </a-button>

    </div>
  </div>
  <div class="table">
    <a-form layout="vertical">
      <a-row>
        <a-col v-for="(colStructure,colIndex) in detail_state.detailStructure" :key="colIndex" :span="6"
               :style="{ padding:'10px'}">
          <div v-for="(rowStructure,rowIndex) in colStructure" :key="rowIndex" style="margin-bottom: 20px">
            <strong style="margin-bottom: 5px;display: block;font-size: 16px">{{ rowStructure['label'] }} </strong>
            <component
                :is="MoreComponents[rowStructure['component']]"
                :key="detail_state.timer+ detail_state.roundNumber +'rowIndex'+ rowIndex"
                :config="rowStructure.config"
                :value="rowStructure.value"
            />
          </div>
        </a-col>
      </a-row>
    </a-form>
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

.warning {
  color: red;
  margin-top: -10px;
  margin-bottom: 2px;
  display: block
}
</style>