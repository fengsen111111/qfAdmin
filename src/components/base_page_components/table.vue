<script setup>
import {inject, onBeforeMount, reactive} from "vue";
import {FormComponents} from "../form_components/form";
import {TableComponents} from "../table_components/table";

let props = defineProps(["pageData"]);
const pageData = props.pageData;

let emit = defineEmits(["openChildPage", "closeChildPage"]);

function openChildPage(pageData) {
  emit("openChildPage", pageData);
}

function closeChildPage(page_key) {
  emit("closeChildPage", page_key);
}

const global = inject("global").value;
const table_state = reactive({
  showRecycle: true, //展示回收站
  recycleStatus: false, //回收站状态
  recycleClass: "iconfont button-class  button-info", //回收站样式  iconfont button-class button-warning
  tableButtons: {}, //按钮组
  rowSelection: false, //批量操作
  selectKeys: [], //批量操作

  tableWidth: 0, //Table宽度
  clientHeight: "", //浏览器高度
  tableHeight: "", //Table高度
  fixedHeight: 230, //固定减高

  requestParams: {}, //请求参数

  tableStructure: {}, //列表页结构
  recordsUrl: "", //获取数据的链接
  tableData: [], //列表上的数据
  dataCount: 0, //数据总数
  pageSizeOptions: ["10", "20", "40", "50"], //页码配置
  currentPage: 1, //当前页码
  pageSize: 10, //每页数量

  hasSearchStructure: false, //是否有搜索
  searchStructure: {}, //搜索结构
  searchShowButton: true, //展开按钮
  search: true, //是否展开搜索

  showTableFields: false, //是否展开列表显示字段控制
  tableFields: {}, //允许显示的列表字段

  sorterData: [], //排序规则

  hasExportStructure: false, //是否有导出excel
  hasImport: false, //是否有导入excel
  importRequestUrl: "", //导入excel的权限控制地址
  importLabel: "", //导入按钮名字
  exportLabel: "", //导出按钮名字
  exportStructure: {}, //导出excel结构
  showExportStructure: false, //是否展开导出
  excelName: "", //导出Excel的名称

  showData: true, //是否展示数据
  timer: new Date().getTime(), //表单组件key组成字段
  roundNumber: Math.floor(Math.random() * (9999 - 1 + 1)) + 1, //表单组件key组成字段
  tempButtonInfo: [], //临时操作按钮，存储按钮信息
});
onBeforeMount(() => {
  table_state.clientHeight = `${document.documentElement.clientHeight}`; //获取浏览器可视区域高度
  window.onresize = function () {
    table_state.clientHeight = `${document.documentElement.clientHeight}`;
  };
  //初始化请求参数
  if (pageData.hasOwnProperty("data"))
    table_state.requestParams = pageData.data;
  getTableStructure();
});

//获取table页面结构
function getTableStructure() {
  global.axios
      .post(pageData.url, table_state.requestParams, global, false)
      .then((res) => {
        //链接上的请求参数
        res.urlParams.forEach((item, index) => {
          table_state.requestParams[item.key] = item.value;
        });
        //列表分页配置
        table_state.pageSizeOptions = res.tablePageOptions;
        table_state.pageSize = parseInt(table_state.pageSizeOptions[0]);
        //列表
        table_state.tableStructure = res.tableStructure;
        table_state.tableStructure.forEach((item, index) => {
          if (item.sort) {
            table_state.sorterData.push({field: item.field, sort: item.sort});
          }
          if (index > 0) {
            if (table_state.tableFields[index - 1]) {
              if (table_state.tableFields[index - 1].value == "N") {
                table_state.tableStructure.splice(index, 1);
              }
            } else {
              table_state.tableWidth += item.width;
              table_state.tableFields[index - 1] = {
                field: item.field,
                value: "Y",
                config: {
                  values: [
                    {value: "N", label: "不显示"},
                    {value: "Y", label: "显示"},
                  ],
                },
                label: item.label,
              };
            }
          }
        });
        //搜索
        if (res.search.length > 0) {
          table_state.searchStructure = res.search;
          table_state.hasSearchStructure = true;
        }
        //导入
        if (res.import && res.import.status) {
          table_state.hasImport = true;
          table_state.importLabel = res.import.label;
          table_state.importRequestUrl = res.import.requestUrl;
        }

        //导出
        if (res.export.requestUrl) {
          table_state.exportStructure = res.export;
          table_state.exportLabel = res.export.label;
          table_state.hasExportStructure = true;
        }

        //按钮组
        if (res.tableButtons.length > 0) {
          table_state.tableButtons = res.tableButtons;

          table_state.tableButtons.forEach((button, index) => {
            //批量选择
            if (button.handleType == "moreRequest") {
              table_state.rowSelection = {onChange: onSelectChange};
            }
          });
        } else {
          table_state.rowSelection = false;
        }
        //打印

        //设置列表页高度
        setTimeout(function () {
          table_state.tableHeight =
              table_state.clientHeight -
              table_state.fixedHeight -
              document.getElementById("searchStructureID." + pageData.page_key)
                  .offsetHeight;
        }, 200);

        table_state.recordsUrl = res.recordsUrl;
        getRecords();
      });
}

//获取数据
function getRecords() {
  let requestParams;
  if (table_state.requestParams) {
    requestParams = Object.assign(
        {
          searchConditions: table_state.searchStructure,
          sortConditions: table_state.sorterData,
          currentPage: table_state.currentPage,
          pageSize: table_state.pageSize,
        },
        table_state.requestParams
    );
  } else
    requestParams = {
      searchConditions: table_state.searchStructure,
      sortConditions: table_state.sorterData,
      currentPage: table_state.currentPage,
      pageSize: table_state.pageSize,
    };
  if (table_state.recycleStatus)
    requestParams.recycleStatus = true;
  else
    requestParams.recycleStatus = false;
  global.axios.post(table_state.recordsUrl, requestParams, global, false).then((res) => {
        if (res) {
          table_state.tableData = res.list;
          table_state.dataCount = res.count;
          table_state.showData = true;
          if (!table_state.tableData && table_state.currentPage > 0) {
            table_state.currentPage--;
            getRecords();
          }
        }
      });
}

//操作分页
function handleSizeChange(val, size) {
  table_state.currentPage = 1;
  table_state.pageSize = size;
  table_state.showData = false;
  getRecords();
}

function handleCurrentChange(val) {
  table_state.currentPage = val;
  table_state.showData = false;
  getRecords();
}

//展开列表显示字段抽屉
function openTableFields() {
  table_state.showTableFields = true;
}

//关闭列表显示字段抽屉
function closeTableFields(type) {
  if (type) {
    getTableStructure();
    refresh();
  }
  table_state.showTableFields = false;
}

//排序
function tableChange(pagination, filter, sorter) {
  let newSortData = [];
  let oldData = false;
  table_state.sorterData.forEach((item, index) => {
    if (item.field != table_state.tableStructure[sorter.columnKey].field) {
      newSortData.push(item);
    }
  });
  if (sorter.order)
    newSortData.push({
      field: table_state.tableStructure[sorter.columnKey].field,
      sort: sorter.order == "ascend" ? "asc" : "desc",
    });
  table_state.sorterData = newSortData;
  getRecords();
}

//刷新
function refresh() {
  table_state.tableData = [];
  table_state.selectKeys = [];
  table_state.showData = false;
  getRecords();
}

//查看回收站数据
function recycle() {
  if (table_state.recycleStatus) {
    table_state.recycleStatus = false;
    table_state.recycleClass = "iconfont button-class button-info";
  } else {
    table_state.recycleStatus = true;
    table_state.recycleClass = "iconfont button-class button-warning";
  }
  getRecords();
}

//按钮操作
function buttonHandle(button) {
  tableHandles({
    handleInfo: button,
    requestParams: table_state.requestParams,
  });
}

//列表操作
function tableHandles(tableHandlesData) {
  let handleInfo = tableHandlesData.handleInfo;
  let requestParams = tableHandlesData.requestParams;

  if (table_state.recycleStatus)
    requestParams.recycleStatus = true;
  else
    requestParams.recycleStatus = false;
  //直接修改值
  if (handleInfo.handleType == "editValue") {
    if(handleInfo.hasOwnProperty('order')){
      global.axios.post(handleInfo.requestUrl, requestParams, global, false,true,refresh);
    }else{
      global.axios.post(handleInfo.requestUrl, requestParams, global, false);
    }
  }

  //直接操作
  if (handleInfo.handleType == "request") {
    if (handleInfo.warning) {
      global.Modal.confirm({
        title: handleInfo.warning,
        okText: global.findLanguage("确定"),
        cancelText: global.findLanguage("取消"),
        okType: "primary",
        onOk: function () {
          global.axios.post(
              handleInfo.requestUrl,
              requestParams,
              global,
              false,
              true,
              refresh
          );
        },
      });
    } else {
      global.axios.post(
          handleInfo.requestUrl,
          requestParams,
          global,
          false,
          true,
          refresh
      );
    }
  }

  //批量操作
  if (handleInfo.handleType == "moreRequest") {
    requestParams = Object.assign({}, requestParams, {
      selectKeys: table_state.selectKeys,
    });
    if (handleInfo.warning) {
      global.Modal.confirm({
        title: handleInfo.warning,
        okText: global.findLanguage("确定"),
        cancelText: global.findLanguage("取消"),
        okType: "primary",
        onOk: function () {
          global.axios.post(
              handleInfo.requestUrl,
              requestParams,
              global,
              false,
              true,
              refresh
          );
        },
      });
    } else {
      global.axios.post(
          handleInfo.requestUrl,
          requestParams,
          global,
          false,
          true,
          refresh
      );
    }
  }

  //跳转
  if (handleInfo.handleType == "jump") {
    watchComponentShowStatus();
    openChildPage({
      type: handleInfo.page,
      url: handleInfo.requestUrl,
      data: requestParams,
      parent_page_key: pageData.page_key,
    });
  }

  //导入
  if (handleInfo.handleType == "import") {
    table_state.tempButtonInfo = tableHandlesData;
  }
  //弹窗列表
  if (handleInfo.handleType == "openTable") {
  }
  //弹窗表单
  if (handleInfo.handleType == "openForm") {
  }
}

//展开搜索抽屉
function controlSearch() {
  table_state.search = !table_state.search;
  if (table_state.search) {
    table_state.searchShowButton = true;
  } else {
    table_state.searchShowButton = false;
  }

  setTimeout(function () {
    table_state.tableHeight =
        table_state.clientHeight -
        table_state.fixedHeight -
        document.getElementById("searchStructureID." + pageData.page_key)
            .offsetHeight;
  }, 100);
}

//搜索
function searching() {
  table_state.currentPage = 1;
  getRecords();
  if (!table_state.searchShowButton) controlSearch();
}

//清空搜索
function emptySearch() {
  table_state.searchStructure.forEach((item, index) => {
    if (table_state.searchStructure[index]["component"] == "Cascader")
      table_state.searchStructure[index]["value"] = [];
    else table_state.searchStructure[index]["value"] = "";
  });
  getRecords();
}

//展开导出抽屉
function showExport() {
  table_state.showExportStructure = true;
}

//关闭导出抽屉
function closeExport() {
  table_state.showExportStructure = false;
}

//导出excel
function exportExcel() {
  //判断是否是从其他页面跳转过来，并带来参数
  let requestParams;

  if (table_state.requestParams) {
    requestParams = Object.assign(
        {
          searchConditions: table_state.searchStructure,
          sortConditions: table_state.sorterData,
          exportStructure: table_state.exportStructure,
        },
        table_state.requestParams
    );
  } else
    requestParams = {
      searchConditions: table_state.searchStructure,
      exportStructure: table_state.exportStructure,
      sortConditions: table_state.sorterData,
    };
  let scene = "default";
  if (GetUrlParam(table_state.recordsUrl, "scene"))
    scene = GetUrlParam(table_state.recordsUrl, "scene");
  requestParams = Object.assign(
      {
        excel_name: table_state.excelName,
        name: table_state.excelName ? table_state.excelName + ".xlsx" : "",
        scene: scene,
      },
      requestParams
  );

  global.axios.post("factory_storage/Ticket/getTicket", {}, global)
      .then((ticketRes) => {
        requestParams = Object.assign({
          ticket_time: ticketRes.ticket_time,
        }, requestParams);
        global.axios.post(table_state.exportStructure.requestUrl, requestParams, global)
            .then((res) => {
              global.file.download(res.url, res.name, global);
            })
      });
}

function GetUrlParam(url, name) {
  return (
      decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(url) || [, "",])[1].replace(/\+/g, "%20")) || null);
}

//导入excel
function importExcel(param) {
  let fileObj = param.file;
  global.axios.post("factory_storage/Ticket/getTicket", {}, global)
      .then((ticketRes) => {
        global.axios.upload(table_state.importRequestUrl, {ticket_time: ticketRes.ticket_time}, global, true, null, fileObj)
            .then((res) => {
              global.Modal.success({
                title: global.findLanguage("导入结果"),
                content: res.message,
              });
              getRecords();
            });
      });
}

//批量选择
function onSelectChange(keys) {
  table_state.selectKeys = keys;
}

//拉起循环监控页面展示状态（比如表单页返回列表页时需要刷新页面）
function watchComponentShowStatus() {
  let int = setInterval(function () {
    if (pageData.open_status) {
      refresh();
      window.clearInterval(int);
    }
  }, 300);
}
</script>

<template>
  <!--搜索-->
  <div
      v-show="table_state.searchStructure.length > 0"
      :id="'searchStructureID.' + pageData.page_key"
  >
    <a-form ref="form" layout="inline">
      <a-form-item
          v-for="(structure, index) in table_state.searchStructure"
          v-show="table_state.searchShowButton && index >= 4 ? false : true"
          :key="index"
          :label="global.findLanguage(structure.label)"
          style="width: 23.5%; margin-bottom: 12px"
      >
        <component
            :is="FormComponents[structure.component]"
            :key="table_state.timer + table_state.roundNumber + 'index' + index"
            :structure="structure"
        />
      </a-form-item>
    </a-form>
    <div v-if="table_state.searchStructure.length > 4" align="center">
      <span
          v-if="table_state.searchShowButton"
          class="iconfont"
          style="
          font-size: 22px;
          color: #7c7b7b;
          margin-right: 10px;
          cursor: pointer;
        "
          :title="global.findLanguage('展开/收起')"
          @click="controlSearch()"
      >&#xe62a;</span
      >
      <span
          v-else
          class="iconfont"
          style="
          font-size: 22px;
          color: #7c7b7b;
          margin-right: 10px;
          cursor: pointer;
        "
          :title="global.findLanguage('展开/收起')"
          @click="controlSearch()"
      >&#xe614;</span
      >
      <span
          class="iconfont"
          style="
          font-size: 22px;
          color: #7c7b7b;
          margin-right: 10px;
          margin-left: 10px;
          cursor: pointer;
        "
          :title="global.findLanguage('搜索')"
          @click="searching"
      >&#xe6a3;</span
      >
      <span
          class="iconfont"
          style="
          font-size: 22px;
          color: #7c7b7b;
          margin-left: 10px;
          cursor: pointer;
        "
          :title="global.findLanguage('重置')"
          @click="emptySearch"
      >&#xe6a1;</span
      >
    </div>
    <div v-else align="center">
      <span
          class="iconfont"
          style="
          font-size: 22px;
          color: #7c7b7b;
          margin-right: 10px;
          cursor: pointer;
        "
          :title="global.findLanguage('搜索')"
          @click="searching"
      >&#xe6a3;</span
      >
      <span
          class="iconfont"
          style="
          font-size: 22px;
          color: #7c7b7b;
          margin-left: 10px;
          cursor: pointer;
        "
          :title="global.findLanguage('重置')"
          @click="emptySearch"
      >&#xe6a1;</span
      >
    </div>
  </div>
  <!--搜索-->

  <!--按钮-->
  <div class="table-header" >
    <div style="width: 70%">
      <div  v-if="!table_state.recycleStatus">
        <a-button
            v-show="pageData.hasOwnProperty('parent_page_key')"
            class="iconfont button-class"
            style="font-size: 18px !important; padding: 0 10px; float: left"
            @click="closeChildPage(pageData.page_key)"
        >&#xe6d2;
        </a-button>
        <span v-for="(button, buttonIndex) in table_state.tableButtons">
        <a-upload
            v-if="button.handleType == 'import'"
            :customRequest="importExcel"
            :show-file-list="false"
            accept=".xlsx,.xls"
        >
          <a-button
              :key="buttonIndex"
              :class="'button-class  button-' + button.buttonType"
              style="float: left"
              @click="buttonHandle(button)"
          >
            {{ global.findLanguage(button.name) }}
          </a-button>
        </a-upload>

        <a-button
            v-else
            :key="buttonIndex"
            :class="'button-class  button-' + button.buttonType"
            style="float: left"
            @click="buttonHandle(button)"
        >
          {{ global.findLanguage(button.name) }}
        </a-button>
      </span>

        <a-button
            v-if="table_state.hasExportStructure"
            :title="table_state.exportLabel"
            class="iconfont button-class button-primary"
            style="font-size: 18px !important; padding: 0 10px; float: left"
            @click="showExport()"
        >&#xe638;
        </a-button>
        <!--导入的位置不可以移动-->
        <a-upload
            v-if="table_state.hasImport"
            :customRequest="importExcel"
            :show-file-list="false"
            accept=".xlsx,.xls"
        >
          <a-button
              :title="table_state.importLabel"
              class="iconfont button-class button-primary"
              style="font-size: 18px !important; padding: 0 10px; float: left"
          >&#xe635;
          </a-button>
        </a-upload>
      </div>

    </div>
    <div>
      <a-button
          class="iconfont button-class"
          style="font-size: 18px !important; padding: 0 10px; float: left"
          title="筛选"
          @click="openTableFields"
      >&#xe695;
      </a-button>
      <a-button
          class="iconfont button-class button-success"
          style="font-size: 18px !important; padding: 0 10px; float: left"
          title="刷新"
          @click="refresh"
      >&#xe6aa;
      </a-button>
      <a-button
          :class="table_state.recycleClass"
          style="font-size: 18px !important; padding: 0 10px; float: left"
          title="回收站"
          @click="recycle"
      >&#xe6cb;
      </a-button>
    </div>
  </div>
  <!--按钮-->

  <!--列表显示字段控制-->
  <a-drawer
      :body-style="{ padding: 0 }"
      :title="global.findLanguage('选择需要显示的数据')"
      :visible="table_state.showTableFields"
      :width="280"
      @close="closeTableFields(false)"
  >
    <div class="drawer_content">
      <a-form layout="vertical">
        <a-form-item
            v-for="(col, colIndex) in table_state.tableFields"
            :key="colIndex"
            :label="global.findLanguage(col.label)"
        >
          <component
              :is="FormComponents['Radio']"
              :key="
              table_state.timer +
              table_state.roundNumber +
              'colIndex' +
              colIndex
            "
              :structure="col"
          />
        </a-form-item>
      </a-form>
    </div>
    <div :style="{ textAlign: 'center' }" class="drawer_footer">
      <a-button
          :style="{ marginLeft: '40%', float: 'left', marginTop: '8px' }"
          class="button-class button-warning"
          @click="closeTableFields(true)"
      >
        {{ global.findLanguage("确定") }}
      </a-button>
    </div>
  </a-drawer>
  <!--列表显示字段控制-->

  <!--列表-->
  <a-table
      :dataSource="table_state.tableData"
      :pagination="false"
      :row-selection="table_state.rowSelection && !table_state.recycleStatus ? table_state.rowSelection : null"
      :scroll="{ x: table_state.tableWidth, y: table_state.tableHeight }"
      rowKey="id"
      size="small"
      @change="tableChange"
  >
    <a-table-column
        v-for="(item, itemIndex) in table_state.tableStructure"
        :key="itemIndex"
        :fixed="item.fixed ? item.fixed : false"
        :sorter="item.sort ? true : false"
        :title="global.findLanguage(item.label)"
        :width="item.component === 'Media' ? 260 : item.width"
    >
      <template #default="{ record }">
        <component
            :is="TableComponents['Table' + item.component]"
            :id="record.id ? record.id : 0"
            :rowValue="record"
            :structure="item"
            :value="record[item.field] ? record[item.field] : ''"
            @refresh="refresh"
            @tableHandles="tableHandles"
        />
      </template>
    </a-table-column>
  </a-table>
  <!--列表-->

  <!--分页-->
  <a-pagination
      v-if="table_state.dataCount > 0"
      v-model:current="table_state.currentPage"
      :pageSize="table_state.pageSize"
      :pageSizeOptions="table_state.pageSizeOptions"
      :show-total="
      (dataCount) =>
        global.findLanguage('共计') +
        ` ${table_state.dataCount} ` +
        global.findLanguage('条')
    "
      :total="table_state.dataCount"
      show-quick-jumper
      show-size-changer
      @change="handleCurrentChange"
      @showSizeChange="handleSizeChange"
  />
  <!--分页-->

  <!--导出-->
  <a-drawer
      :body-style="{ padding: 0 }"
      :title="global.findLanguage('选择需要导出的数据')"
      :visible="table_state.showExportStructure"
      :width="280"
      @close="closeExport"
  >
    <div class="drawer_content">
      <a-form layout="vertical">
        <a-form-item :label="global.findLanguage('Excel名称')">
          <a-input
              v-model:value="table_state.excelName"
              :placeholder="global.findLanguage('不输入将使用默认名称')"
              allow-clear
          />
        </a-form-item>
        <a-form-item
            v-for="(col, colIndex) in table_state.exportStructure.fields"
            :key="colIndex"
            :label="global.findLanguage(col.label)"
        >
          <component
              :is="FormComponents['Radio']"
              :key="
              table_state.timer +
              table_state.roundNumber +
              'colIndex' +
              colIndex
            "
              :structure="col"
          />
        </a-form-item>
      </a-form>
    </div>
    <div :style="{ textAlign: 'center' }" class="drawer_footer">
      <a-button
          :style="{ marginLeft: '40%', float: 'left', marginTop: '8px' }"
          class="button-class button-warning"
          @click="exportExcel"
      >
        {{ global.findLanguage("导出") }}
      </a-button>
    </div>
  </a-drawer>
  <!--导出-->
</template>

<style lang="less" scoped>
.table-header {
  height: 30px;
  line-height: 30px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
}

.ant-table {
  width: 100%;
  overflow-x: auto;
}

.ant-pagination {
  display: flex;
  justify-content: right;
  position: absolute;
  bottom: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  right: 20px;
}

.button-class {
  margin-left: 5px;
  margin-right: 5px;
}

.drawer_content {
  height: calc(100vh - 96px);
  overflow-y: auto;
  padding: 20px 22px;
}

.drawer_footer {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e9e9e9;
  padding: 0 16px;
  height: 48px;
  line-height: 48px;
  background: #fff;
  text-align: right;
  z-index: 1;
}
</style>
