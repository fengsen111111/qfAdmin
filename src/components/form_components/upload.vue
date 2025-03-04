<script setup>
import {inject, onBeforeMount, reactive, ref, watch} from 'vue'
import 'vue-cropper/dist/index.css'
import {VueCropper} from 'vue-cropper'
import PlayMedia from '@/components/other_components/play-media.vue'

const global = inject('global').value
let props = defineProps(['structure'])
const component_state = reactive({
  values: [],
  options: null,
  dialogVisible: false,
  // 裁剪组件的基础配置option
  option: {
    img: '', // 裁剪图片的地址
    autoCropWidth: '', // 默认生成截图框宽度
    autoCropHeight: '', // 默认生成截图框高度
  },
  // 防止重复提交
  loading: false,
  fileObj: {},

})

const cropper = ref()

onBeforeMount(() => {
  component_state.value = [];
  props.structure.value.forEach((item, index) => {
    item.uid = index
    component_state.value.push(item)
  })
  component_state.values = JSON.parse(JSON.stringify(props.structure.value))
  if (props.structure.config.file_type === 'image' && props.structure.config.width >0 && props.structure.config.height >0) {
    component_state.option.autoCropWidth = props.structure.config.width
    component_state.option.autoCropHeight = props.structure.config.height
  }
})
watch(
    () => component_state.dialogVisible,
    (newValue) => {
      if (!component_state.dialogVisible)
        component_state.loading = false
    }
)


function upload(options) {

  component_state.options = options
  component_state.fileObj = options.file;
  let limit = props.structure.config.limit ? props.structure.config.limit : 1;
  if (component_state.values.length + 1 > limit) {
    global.message.error(global.findLanguage('文件数量不能超过') + "：" + limit);
    return false
  }
  let extensions = props.structure.config.extension ? props.structure.config.extension : [];
  if (extensions.length > 0) {
    let fileExtension = component_state.fileObj.name.split('.').pop().toLowerCase();
    let extensionStatus = false
    if (extensions.toString().indexOf(fileExtension) > -1) {
      extensionStatus = true
    }
    if (!extensionStatus) {
      global.message.error(global.findLanguage('文件必须为以下格式') + "：" + extensions.toString());
      return false
    }
  }

  if (props.structure.config.file_type == 'image' && props.structure.config.width) {
    component_state.option.img = URL.createObjectURL(component_state.fileObj);
    component_state.dialogVisible = true
  } else {
    if (component_state.fileObj.size / 1024 / 1024 > props.structure.config.size) {
      global.message.error(global.findLanguage('文件大小不能超过') + '：' + props.structure.config.size + "MB!");
      return false
    }
    global.file.uploadFile(global, component_state.fileObj, props.structure.config.file_type, props.structure.config.folder, true, complete)
  }
}

function complete(response) {

  component_state.dialogVisible = false
  component_state.loading = false
  if (!response || response == undefined) {
    component_state.options.onError();
    return
  }
  component_state.values.push(response)
  props.structure.value = [];
  component_state.values.forEach((item, index) => {
    item.uid = index
    props.structure.value.push(item)
  })
}

function remove(file) {
  props.structure.value = [];
  component_state.values.forEach((item, index) => {
    if (item.uid == file.uid)
      component_state.values.splice(index, 1)
  })
  component_state.values.forEach((item, index) => {
    props.structure.value.push(item.response)
  })
}

function getCropData() {
  cropper.value.getCropBlob(data => {
    component_state.loading = true
    let newFile = new File([data], component_state.fileObj.name, {type: component_state.fileObj.type});
    global.file.uploadFile(global, newFile, props.structure.config.file_type, props.structure.config.folder, true, complete)
  })
}

function download(file) {
  if (file.file_type === 'file') {
    global.Modal.confirm({
      title: global.findLanguage('确定要下载该文件吗？'),
      okText: global.findLanguage('确定'),
      cancelText: global.findLanguage('取消'),
      okType: 'primary',
      onOk: function () {
        global.file.download(file.url, file.name, global)
      }
    });
  }
}


</script>

<template>
  <a-upload
      :customRequest="upload"
      :file-list="component_state.values"
      :show-upload-list="props.structure.config.file_type === 'media' || props.structure.config.file_type === 'image'?false:true"
      list-type="text"
      @preview="download"
      @remove="remove"
  >
    <a-button class="button-class button-primary" type="primary">
      {{global.findLanguage('点击上传')}}
    </a-button>

    <a-modal v-model:visible="component_state.dialogVisible" :centered="true" :closable="false" :footer="null"
             :keyboard="false"
             :maskClosable="false">
      <div class="cropper-content">
        <div class="cropper" style="text-align:center">
          <vue-cropper ref="cropper"
                       :fixedNumber="[component_state.option.autoCropWidth,component_state.option.autoCropHeight]"
                       :img="component_state.option.img"
                       :info="false" autoCrop centerBox
                       fixed/>
        </div>
      </div>
      <div class="dialog-footer">
        <a-button class="button" @click="component_state.dialogVisible = false">{{global.findLanguage('取消')}}</a-button>
        <a-button :loading="component_state.loading" class="button" type="primary" @click="getCropData">
          {{global.findLanguage('裁剪')}}
        </a-button>
      </div>
    </a-modal>

  </a-upload>

  <template v-if="props.structure.config.file_type == 'image'">
    <div style="margin-top: 10px;display: flex;align-items: center;flex-wrap: wrap">
      <div v-for="(item,index) in component_state.values" :key="index"
           style="margin-right: 5px;margin-bottom: 5px;border: 1px dashed gray;border-radius: 5px;position: relative">
        <a-image :src="item.url" class="iconfont"
                 fallback="data:image/png;base64,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"
                 style="height: 80px;width: 80px;border-radius: 5px;">
        </a-image>
        <a-button class="iconfont" style="font-size: 24px !important;border: none;color: red;
                background: none;box-shadow: none;position: absolute;top:-10px;right:-15px"
                  title="删除" @click="remove(item)">&#xe6cb;
        </a-button>
      </div>
    </div>
  </template>
  <template v-if="props.structure.config.file_type == 'media' && component_state.values.length > 0">
    <div v-for="(item,index) in component_state.values" :key="index"
         style="margin-right: 5px;margin-top: 5px;border: 1px dashed gray;border-radius: 5px;position: relative">
    <play-media :src="item.url"></play-media>
      <a-button class="iconfont" style="font-size: 24px !important;border: none;color: red;
                background: none;box-shadow: none;position: absolute;top:-10px;right:-15px"
                title="删除" @click="remove(item)">&#xe6cb;
      </a-button>
    </div>
  </template>
</template>

<style lang="less" scoped>
.cropper-content {
  width: 470px;
  height: 400px;
}

.cropper {
  width: 470px;
  height: 400px;
}

.dialog-footer {
  display: flex;
  padding-top: 20px;
  justify-content: center;

  .button {
    margin-right: 20px;
  }
}

</style>