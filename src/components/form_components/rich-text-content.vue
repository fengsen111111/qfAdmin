<script setup>
import {inject, reactive, watch} from 'vue'
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
// import 'tinymce/plugins/paste'

const global = inject('global').value
let props = defineProps(['structure'])
const component_state = reactive({
  isCollapse: false,
  myValue: props.structure.value,
  init: {
    promotion: false,
    language_url: `/tinymce/langs/zh_CN.js`,
    language: global.language.code === 'cn' ? 'zh_CN' : false,
    selector: "#" + props.structure.field,
    skin_url: `/tinymce/skins/ui/oxide`,
    content_css: `/tinymce/skins/content/default/content.css`,
    height: '75vh',
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
watch(
    () => component_state.myValue,
    (newValue) => {
      props.structure.value = newValue
    }
)

//清空内容
function clear() {
  component_state.myValue = ''
}

//展开收起富文本编辑器
function collapse() {
  component_state.isCollapse = !component_state.isCollapse;
}

</script>
<template>
  <a-button class="button-class button-primary" style="margin-left: 0;margin-right: 10px;" type="primary"
            @click="collapse">{{ global.findLanguage('编辑') }}
  </a-button>

  <a-modal v-model:visible="component_state.isCollapse" :centered="true" :closable="false" :footer="null"
           :keyboard="false" :maskClosable="false" :width="props.structure.config.width*1+48+'px'">

    <a-button style="margin-left: 0;margin-right: 10px" @click="collapse">{{ global.findLanguage('保存') }}</a-button>
    <a-button v-if="component_state.isCollapse" class="button-class button-warning"
              style="margin-left: 0;margin-right: 10px"
              type="primary" @click="clear">{{ global.findLanguage('清空内容') }}
    </a-button>
    <span style="font-size: 13px;color: red;display: block">{{ global.findLanguage('如果内容需要上传图片,请确保图片后缀为小写字母;图片建议设置宽度为'+structure.config.width+'px') }}</span>
    <div :style="{width:props.structure.config.width+'px',marginTop:'10px'}">
      <editor :id="structure.field" v-model="component_state.myValue" :init="component_state.init"></editor>
    </div>

  </a-modal>
</template>

<style scoped>

</style>

