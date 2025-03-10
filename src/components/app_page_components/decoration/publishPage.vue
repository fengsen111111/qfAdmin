<script setup>
  import { inject, onBeforeMount, reactive, ref } from "vue";
  import { FormComponents } from "../../form_components/form";
  import { TableComponents } from "../../table_components/table";
  import { InfoCircleOutlined, UpCircleOutlined, DownCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";
  import { message } from 'ant-design-vue';

  import Editor from '@tinymce/tinymce-vue'
  import 'tinymce/tinymce'
  import 'tinymce/themes/silver/theme'
  import 'tinymce/icons/default'
  import 'tinymce/models/dom'

  import 'tinymce/plugins/image' // 插入上传图片插件
  import 'tinymce/plugins/media' // 插入视频插件
  import 'tinymce/plugins/table' // 插入表格插件
  import 'tinymce/plugins/lists' // 列表插件
  import 'tinymce/plugins/link' //  链接插件
  import 'tinymce/plugins/wordcount' // 字数统计插件

  const fwbText = ref('')//富文本内容

  const component_state = reactive({
    isCollapse: false,
    myValue: fwbText.value,
    init: {
      promotion: false,
      language_url: `/tinymce/langs/zh_CN.js`,
      language: 'zh_CN',
      selector: "#init",
      skin_url: `/tinymce/skins/ui/oxide`,
      content_css: `/tinymce/skins/content/default/content.css`,
      height: '30vh',
      plugins: 'lists image media table wordcount link',
      toolbar: false,
      branding: false,
      menubar: true,
      paste_data_images: false, // 允许粘贴图像
      images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
        global.file.uploadFile(global, blobInfo.blob(), 'rich_text_file', 'rich_text_file', true, resolve)
      }),
      file_picker_types: 'media',
      video_template_callback: function (data) {
        return '<span class="mce-preview-object mce-object-video" contenteditable="false" data-mce-object="video" data-mce-p-allowfullscreen="allowfullscreen" data-mce-p-frameborder="no" data-mce-p-scrolling="no" data-mce-p-src=' + data.source + ' data-mce-p-width=' + data.width + ' data-mce-p-height=' + data.height + ' data-mce-p-controls="controls" data-mce-html="%20"> <video width=' + data.width + ' height=' + data.height + ' controls="controls"> <source src=' + data.source + ' type=' + data.sourcemime + '></source> </video> </span>';
      },
      file_picker_callback: (callback, value, meta) => {
        let input = document.createElement('input');//创建一个隐藏的input
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'video/*');
        input.onchange = function () {
          let fileObj = this.files[0];//选取第一个文件
          global.file.uploadFile(global, fileObj, 'rich_text_file', 'rich_text_file', true, callback);
        };
        //触发点击
        input.click();
      }
    },
  })


  let props = defineProps(["pageData"]);
  const pageData = props.pageData;

  let emit = defineEmits(["openChildPage", "closeChildPage"]);

  const global = inject("global").value;

  const activeKey = ref(['1', '2']);


  const visibleSx = ref(false)
  const SxName = ref('')//添加的属性名称
  const SxObj = ref([
    {
      name: '产地',
      value: ''
    }
  ])//属性数组
  // 添加属性
  function addSx() {
    console.log('name', SxName.value);
    if (!SxName.value) {
      message.error('请填写属性')
      return false
    }
    SxObj.value.push({
      name: SxName.value,
      value: ''
    })
    SxName.value = ''
    visibleSx.value = false
  }

  const FwObj = ref([
    {
      name: '全网低价',
      value: '多平台对比，优惠力度最大'
    },
    {
      name: '热销爆款',
      value: '热门商品，大家都在买'
    }
  ])//服务数组
  const FwName = ref('')//服务添加内容
  const visibleFw = ref(false)//服务弹框开关
  // 添加服务
  function addFw() {
    console.log('name', FwName.value);
    if (!FwName.value) {
      message.error('请填写属性')
      return false
    }
    FwObj.value.push({
      name: FwName.value,
      value: ''
    })
    FwName.value = ''
    visibleFw.value = false
  }

  const sqJbxx = ref(false)//商品信息收起展开

  let uploadQueue = []; // 保存要上传的文件
  let isUploading = false; //用于指示上传进度的标志
  // 批量上传
  function upload(options) {
    uploadQueue.push(options);
    if (!isUploading) {
      processQueue();
    }
  }
  async function processQueue() {
    isUploading = true;
    while (uploadQueue.length > 0) {
      const currentOptions = uploadQueue.shift(); // 从队列中删除第一个文件
      try {
        // 等待当前文件上传
        await uploadFileWrapper(global, currentOptions.file, 'image', 'shopImg', true, completeList);
        console.log('上传成功');
      } catch (error) {
        console.log('上传失败');
      }
    }
    isUploading = false; // 队列处理完成时重置标志
  }
  function uploadFileWrapper(global, file, type, category, flag, callback) {
    return new Promise((resolve, reject) => {
      global.file.uploadFile(global, file, type, category, flag, (err, result) => {
        if (err) reject(err);
        else resolve(result);
        completeList(err)
      });
    });
  }
  // 上传回调
  function completeList(response) {
    console.log('商品图片回调', response);
  }
  // 商品分类
  const value = ref();
  const treeData = ref([{
    label: '橱窗',
    value: '1',
    children: [{
      label: '沙发',
      value: '11',
    }, {
      label: '茶几',
      value: '12',
    }],
  }]);

  const value1 = ref()//品牌

</script>

<template>
  <!--搜索-->
  <div>
    <div style="display: flex;justify-content: space-between;">
      <div style="width: 15%;">
        <div style="border: 1px solid #eff0f4;border-radius: 5px;overflow: hidden;">
          <div style="background-color: #ff7300;color: #fff;text-align: center;padding: 10px 20px;">
            商品填写建议
          </div>
          <div style="padding: 10px;display: flex;">
            <div>属性</div>
            <div style="color: #ff7300;margin-left: 20px;">填写属性，获取流量</div>
          </div>
        </div>

        <div style="border: 1px solid #eff0f4;margin-top: 20px;border-radius: 5px;overflow: hidden;">
          <div style="background-color: #407cff;color: #fff;text-align: center;padding: 10px 20px;">
            发布助手
          </div>
          <div style="padding: 10px;color: #999999;">
            <div>商品轮播图</div>
            <div>a.尺寸宽高需要均大于480px</div>
            <div>b.大小3M以内</div>
            <div>c.数量限制在10张以内</div>
            <div>d.图片格式仅支持JPG,PNG格式</div>
            <div>e.批量上传时，图片须等宽高且不小于480px</div>
            <div
              style="display: flex;padding: 10px;border: 1px solid #ffecc8;background-color: #fff6e6;border-radius: 5px;">
              <div>
                <InfoCircleOutlined style="color: #ff7300;font-size: 14px;" />
              </div>
              <div style="margin-left: 5px;color: black;">请按要求填写商品信息，上传商品图片（注意轮播图上传事项）</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 商品信息等 -->
      <div style="width: 84%;overflow: auto;height: 88vh;">
        <!-- 基本信息 -->
        <div style="padding: 20px;border: 1px solid #f5f5f5;width: 100%;">
          <div style="display: flex;font-size: 16px;">
            <div style="color: #407cff;">1</div>
            <div style="margin-left: 5px;">基本信息</div>
          </div>
          <div v-show="!sqJbxx">
            <div>
              <div style="display: flex;margin-top: 20px;margin-left: 20px;">
                <div style="display: flex;">
                  <div style="color: red;">*</div>
                  <div>商品轮播图</div>
                </div>
                <div style="margin-left: 20px;">
                  <div style="color: #ff7300;">请优先上传主轮播图，预填白底图</div>
                  <div style="color: #999999;">图片要求：宽高比为1：1，或3：4，且宽高均大于480px，大小3M内，已上传0/10张。</div>
                  <a-upload :customRequest="upload" :multiple="true" :file-list="[]" list-type="text">
                    <div
                      style="margin-top: 5px;width: 100px;height: 100px;border: 1px solid #f5f5f5;text-align: center;">
                      <PlusOutlined style="font-size: 30px;color: #999999;margin-top: 35%;" />
                    </div>
                  </a-upload>
                </div>
              </div>
            </div>
            <div style="margin-top: 20px;margin-left: 34px;align-items: center;">
              <div style="display: flex;align-items: center;">
                <div style="display: flex;">
                  <div style="color: red;">*</div>
                  <div>商品标题</div>
                </div>
                <a-input type="text" style="margin-left: 20px;width: 79.5%;" placeholder="商品标题组成：商品描述+规格，最多输入30个汉字" />
              </div>
            </div>
            <div style="margin-top: 20px;margin-left: 20px;align-items: center;">
              <div style="display: flex;align-items: center;">
                <div style="display: flex;">
                  <div style="color: red;">*</div>
                  <div>上下架商品</div>
                </div>
                <div style="margin-left: 20px;">
                  <a-switch checked-children="上架" un-checked-children="下架" />
                </div>
              </div>
            </div>
            <div style="margin-top: 20px;margin-left: 40px;">
              <div style="display: flex;">
                <div>商品属性</div>
                <div style="margin-left: 20px;background-color: #f7f8fa;border-radius: 5px;width: 80%;">
                  <div style="padding:10px 20px;display: flex;justify-content: space-between;">
                    <div style="display: flex;">
                      <div style="display: flex;">
                        <div>填写率</div>
                        <div style="color: #ff7300;margin-left: 5px;">12%</div>
                      </div>
                      <div style="margin-left: 20px;color: #999999;width: 60%;">请准确填写属性，有利于商品在搜索和推荐中露出，错误填写可能面临商品下架或流量流失
                      </div>
                    </div>
                    <div style="display: flex;">
                      <div>没有合适属性值？</div>
                      <div @click="()=>{visibleSx=true}" style="color: #407cff;">点击添加</div>
                    </div>
                  </div>
                  <div style="background-color: #999999;height: 1px;width: 100%;"></div>
                  <div
                    style="padding:10px 20px;display: flex;justify-content: space-between;background-color: #f7f8fa;">
                    <div style="width: 45%;">
                      <div>
                        <div style="display: flex;align-items: center;margin: 10px 0px;">
                          <div style="width: 30%;text-align: right;">分类</div>
                          <!-- <a-input type="text" style="width: 60%;margin-left: 20px;" placeholder="请选择分类" /> -->
                          <a-tree-select v-model:value="value" show-search style="width: 60%;margin-left: 20px;"
                            placeholder="请选择商品分类" allow-clear tree-default-expand-all :tree-data="treeData"
                            tree-node-filter-prop="label">
                          </a-tree-select>
                        </div>
                        <div style="display: flex;margin: 10px 0px 10px 104px;">
                          <div style="color: #999999;">未找到合适分类？</div>
                          <div style="color: #407cff;">点击添加</div>
                        </div>
                      </div>
                      <div>
                        <div style="display: flex;align-items: center;margin: 10px 0px;">
                          <div style="width: 30%;text-align: right;">品牌</div>
                          <a-select ref="select" v-model:value="value1" style="width: 60%;margin-left: 20px;" placeholder="请选择品牌名称">
                            <a-select-option value="1">品牌1</a-select-option>
                            <a-select-option value="2">品牌2</a-select-option>
                          </a-select>
                        </div>
                        <div style="display: flex;margin: 10px 0px 10px 104px;">
                          <div style="color: #999999;">未找到合适品牌？</div>
                          <div style="color: #407cff;">点击添加</div>
                        </div>
                      </div>
                    </div>
                    <div style="width: 45%;">
                      <div>
                        <template v-for="(item,index) in SxObj" :key="index">
                          <div style="display: flex;align-items: center;margin: 10px 0px;">
                            <div style="width: 30%;text-align: right;">{{item.name}}</div>
                            <a-input type="text" style="width: 60%;margin-left: 20px;" placeholder="请输入具体属性值" />
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style="margin-top: 20px;">
                <div style="display: flex;">
                  <div>商品详情</div>
                  <div style="margin-left:20px;width: 80%;">
                    <editor id="init" v-model="component_state.myValue" :init="component_state.init">
                    </editor>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div @click="()=>{sqJbxx=!sqJbxx}"
            style="display: flex;align-items: center;margin-left: 77px;margin-top: 10px;color: #407cff;">
            <div style="margin-right: 5px;">{{sqJbxx?'展开':'收起'}}</div>
            <UpCircleOutlined v-if="!sqJbxx" style="color: #407cff;font-size: 14px;" />
            <DownCircleOutlined v-else style="color: #407cff;font-size: 14px;" />
          </div>
        </div>
        <!-- 添加属性 -->
        <a-modal v-model:visible="visibleSx" title="添加属性" @ok="addSx">
          <div>
            <div style="display: flex;align-items: center;">
              <div>名称</div>
              <a-input type="text" v-model:value="SxName" style="margin-left: 20px;width: 80%;" placeholder="请填写名称" />
            </div>
          </div>
        </a-modal>
        <!-- 规格与库存 -->
        <div style="padding: 20px;margin-top: 20px;border: 1px solid #f5f5f5;width: 100%;">
          <div style="display: flex;font-size: 16px;">
            <div style="color: #407cff;">2</div>
            <div style="margin-left: 5px;">规格与库存</div>
          </div>
          <div>
            <div style="display: flex;margin-top: 20px;margin-left: 20px;">
              <div style="display: flex;">
                <div style="color: red;">*</div>
                <div>价格及库存</div>
              </div>
              <div style="margin-left: 20px;width: 90%;">
                <div style="background-color: #f7f8fa;padding: 20px;border-radius: 5px;">
                  <div style="display: flex;justify-content: space-between;">
                    <div style="color: #ff7300;">请如实填写库存信息，以确保商品可以在承诺时间内发出，避免出现违规</div>
                    <div style="color: #407cff;">添加规格</div>
                  </div>
                  <table
                    style="border-collapse: collapse; width: 100%;margin-top: 10px;border: 1px solid #f0f2f5;letter-spacing: 1px;text-align: center;">
                    <tr style="display: grid;grid-template-columns: repeat(9, minmax(0, 1fr));text-align: center;">
                      <th>
                        <div style="display: flex;">
                          <div style="display: flex;margin: 0 auto;">
                            <div style="color: red;">*</div>
                            <div style="color: #999999;">名称</div>
                          </div>
                        </div>
                      </th>
                      <th>
                        <div style="display: flex;">
                          <div style="display: flex;margin: 0 auto;">
                            <div style="color: red;">*</div>
                            <div style="color: #999999;">库存</div>
                          </div>
                        </div>
                      </th>
                      <th>
                        <div style="display: flex;">
                          <div style="display: flex;margin: 0 auto;">
                            <div style="color: red;">*</div>
                            <div style="color: #999999;">原价(元)</div>
                          </div>
                        </div>
                      </th>
                      <th>
                        <div style="display: flex;">
                          <div style="display: flex;margin: 0 auto;">
                            <div style="color: red;">*</div>
                            <div style="color: #999999;">拼单价(元)</div>
                          </div>
                        </div>
                      </th>
                      <th>
                        <div style="color: #999999;">包邮专区活动</div>
                      </th>
                      <th>
                        <div style="color: #999999;">秒杀活动</div>
                      </th>
                      <th>
                        <div style="color: #999999;">启用状态</div>
                      </th>
                      <th>
                        <div style="color: #999999;">排序</div>
                      </th>
                      <th>
                        <div style="color: #999999;">推荐管推荐</div>
                      </th>
                    </tr>
                    <template v-for="item in [1,2,3]" :key="item">
                      <tr
                        style="display: grid;grid-template-columns: repeat(9, minmax(0, 1fr));text-align: center;background-color: #fff;">
                        <td>
                          <a-input type="text" placeholder="请输入名称" />
                        </td>
                        <td>
                          <a-input type="text" placeholder="请输入库存" />
                        </td>
                        <td>
                          <a-input type="text" placeholder="请输入原价" />
                        </td>
                        <td>
                          <a-input type="text" placeholder="输入拼单价" />
                        </td>
                        <td>
                          <a-input type="text" placeholder="请选择活动" />
                        </td>
                        <td>
                          <a-input type="text" placeholder="请选择活动" />
                        </td>
                        <td>
                          <a-switch checked-children="是" un-checked-children="否" />
                        </td>
                        <td>
                          <a-input type="text" placeholder="请输入排序" />
                        </td>
                        <td>
                          <a-switch checked-children="是" un-checked-children="否" />
                        </td>
                      </tr>
                    </template>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 服务与承诺 -->
        <div style="padding: 20px;margin-top: 20px;border: 1px solid #f5f5f5;width: 100%;">
          <div style="display: flex;font-size: 16px;">
            <div style="color: #407cff;">3</div>
            <div style="margin-left: 5px;">商品服务</div>
          </div>
          <div style="display: flex;margin-top: 20px;margin-left: 40px;">
            <div>商品服务</div>
            <div style="margin-left: 20px;background-color: #f7f8fa;border-radius: 5px;width: 80%;">
              <div style="padding:10px 20px;display: flex;justify-content: space-between;">
                <div style="color: #999999;width: 80%;">请准确填写包含的服务内容，错误填写可能面不必要麻烦</div>
                <div style="display: flex;">
                  <div>没有合适服务？</div>
                  <div @click="()=>{visibleFw=true}" style="color: #407cff;">点击添加</div>
                </div>
              </div>
              <div style="background-color: #999999;height: 1px;width: 100%;"></div>
              <div style="padding:10px 20px;display: flex;justify-content: space-between;background-color: #f7f8fa;">
                <div style="width: 100%;">
                  <div>
                    <template v-for="(item,index) in FwObj" :key="index">
                      <div style="display: flex;align-items: center;margin: 10px 0px;">
                        <div style="width: 13%;text-align: right;">{{item.name}}</div>
                        <a-input type="text" v-model:value="item.value" style="width: 80%;margin-left: 20px;"
                          placeholder='请输入服务描述信息' />
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 添加服务 -->
        <a-modal v-model:visible="visibleFw" title="添加服务" @ok="addFw">
          <div>
            <div style="display: flex;align-items: center;">
              <div>名称</div>
              <a-input type="text" v-model:value="FwName" style="margin-left: 20px;width: 80%;" placeholder="请填写名称" />
            </div>
          </div>
        </a-modal>
        <div style="padding: 20px;margin-top: 20px;border: 1px solid #f5f5f5;width: 100%;text-align: center;">
          <a-button type="primary">提交商品数据</a-button>
        </div>
        <!-- 留底高 -->
        <div style="height: 100px;"></div>
      </div>
    </div>
  </div>
  <!--导出-->
</template>

<style scoped>
  th,
  td {
    border: 1px solid #f0f2f5;
    padding: 8px 10px;
  }
</style>