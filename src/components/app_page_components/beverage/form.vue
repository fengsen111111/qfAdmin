<script setup>
import {inject, onBeforeMount, reactive,ref} from "vue";
import {FormComponents} from "../../form_components/form";
import BankMsg from './BankMsg.vue' //开户行信息
import { QuestionCircleOutlined } from '@ant-design/icons-vue';  //图标
import fwbText from './fwbText.vue'

// FormComponents.BankMsg = BankMsg
const FormComponentsNew = {BankMsg,...FormComponents}
console.log('FormComponentsNew',FormComponentsNew);
let props = defineProps(["pageData"]);
const pageData = props.pageData;
let emit = defineEmits(["openChildPage", "closeChildPage"]);

function openChildPage(pageData) {
  emit("openChildPage", pageData);
}

function closeChildPage(page_key) {
  global.Modal.confirm({
    title: global.findLanguage(
        "确定要返回吗？该操作会导致未保存的数据丢失，请谨慎操作！"
    ),
    okText: global.findLanguage("确定"),
    cancelText: global.findLanguage("取消"),
    okType: "primary",
    onOk: function () {
      emit("closeChildPage", page_key);
    },
  });
}

const global = inject("global").value;

const form_state = reactive({
  requestParams: {}, //请求参数
  formStructure: {}, //表单结构
  submitUrl: "", //提交链接
  timer: new Date().getTime(), //表单组件key组成字段
  roundNumber: Math.floor(Math.random() * (9999 - 1 + 1)) + 1, //表单组件key组成字段
  showCloseButton: pageData.parentPageNumber ? true : false, //是否有返回按钮
});

onBeforeMount(() => {
  //初始化请求参数
  if (pageData.hasOwnProperty("data")) form_state.requestParams = pageData.data;
  getStructure();
});

//重置
function reset() {
  global.Modal.confirm({
    title: global.findLanguage("该操作会导致未保存的数据丢失，请谨慎操作！"),
    okText: global.findLanguage("确定"),
    cancelText: global.findLanguage("取消"),
    okType: "primary",
    onOk: function () {
      getStructure();
    },
  });
}

//获取结构和数据
function getStructure() {
  form_state.formStructure = {};
  global.axios
      .post(pageData.url, form_state.requestParams, global)
      .then((res) => {
        form_state.formStructure = res.formStructure;
        form_state.submitUrl = res.submitUrl;
      });
}

//提交
function submit() {
  global.Modal.confirm({
    title: global.findLanguage("确定要提交吗？"),
    okText: global.findLanguage("确定"),
    cancelText: global.findLanguage("取消"),
    okType: "primary",
    onOk: function () {
      global.axios.post(
          form_state.submitUrl,
          form_state.formStructure,
          global,
          true,
          true,
          submitResult
      );
    },
  });
}

//提交结果
function submitResult(res) {
  setTimeout(function () {
    let message = global.findLanguage("保存成功");
    if (res.message) message = res.message;
    if (pageData.parent_page_key) {
      global.Modal.confirm({
        title: message + "，" + global.findLanguage("需要返回上一页吗？"),
        okText: global.findLanguage("确定"),
        cancelText: global.findLanguage("取消"),
        okType: "primary",
        onOk: function () {
          emit("closeChildPage", pageData.page_key);
        },
        onCancel: function () {
        },
      });
    } else {
      getStructure();
    }
  }, 500);
}

const visibleIcon = ref(false)
const iconItem = ref({})
// 点击图示图片
function handIcon(item){
  console.log('点击图标',item);
  iconItem.value = item
  visibleIcon.value = true
}
// 关闭弹框
function cancelIcon(){
  console.log('关闭弹框');
  visibleIcon.value = false
}
</script>

<template>
  <div class="table-header">
    <div>
      <a-button
          v-show="pageData.hasOwnProperty('parent_page_key')"
          class="iconfont button-class"
          style="font-size: 18px !important; padding: 0 10px; float: left"
          @click="closeChildPage(pageData.page_key)"
      >&#xe6d2;
      </a-button>
      <a-button
          class="button-class button-success"
          style="float: left"
          type="primary"
          @click="submit"
      >
        {{ global.findLanguage("提交") }}
      </a-button>
      <a-button
          class="button-class button-warning"
          style="float: left"
          type="primary"
          @click="reset"
      >
        {{ global.findLanguage("重置") }}
      </a-button>
    </div>
  </div>
  <div class="table">
    <a-form layout="vertical">
      <a-row>
        <a-col
            v-for="(colStructure, colIndex) in form_state.formStructure"
            :key="colIndex"
            :span="6"
            :style="{ padding: '10px',background:'white'}"
        >
          <a-form-item
              v-for="(rowStructure, rowIndex) in colStructure"
              v-show="
              rowStructure.hasOwnProperty('show') ? rowStructure.show : true
            "
              :key="rowIndex"
              :label="global.findLanguage(rowStructure.label)"
              style="position: relative;"
          >
            <!-- 有类型就显示新的 -->
            <template v-if="rowStructure.warningType">
              <div style="position: absolute;top: -30px;right: 0px;">
                <QuestionCircleOutlined @click="handIcon(rowStructure)" style="color: #1890ff" />
              </div>
            </template>
            <!-- 没得类型就显示原来的 -->
            <span v-else-if="rowStructure.warning" class="warning">
              <span
                  v-html="global.findLanguage(rowStructure.warning)"
              ></span>
            </span>
            <component
                :is="FormComponentsNew[rowStructure.component]"
                :key="
                form_state.timer +
                form_state.roundNumber +
                'colIndex' +
                colIndex +
                'rowIndex' +
                rowIndex
              "
                :structure="rowStructure"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <!-- 提示弹窗 -->
    <a-modal v-model:visible="visibleIcon" title="描述" @ok="cancelIcon">
      <!-- 富文本 -->
      <div v-if="iconItem.warningType=='RichTextContent'">
        <fwbText :structure="iconItem" />
      </div>
      <!-- 多行文本 -->
      <div v-else-if="iconItem.warningType=='Textarea'">
        <a-textarea v-model:value="iconItem.warning" placeholder="请输入" :rows="4" />
      </div>
      <!-- 单文本 -->
      <div v-else>
        <a-input v-model:value="iconItem.warning" placeholder="请输入" />
      </div>
    </a-modal>
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
  display: block;
}
</style>
