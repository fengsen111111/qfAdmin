<script setup>
  import { ref, inject, watch, defineProps, defineEmits, defineExpose } from 'vue'
  import Editor from '@tinymce/tinymce-vue'

  import 'tinymce/tinymce'
  import 'tinymce/themes/silver/theme'
  import 'tinymce/icons/default'
  import 'tinymce/models/dom'

  import 'tinymce/plugins/image'
  import 'tinymce/plugins/media'
  import 'tinymce/plugins/table'
  import 'tinymce/plugins/lists'
  import 'tinymce/plugins/link'
  import 'tinymce/plugins/wordcount'

  const global = inject('global').value

  const myValue = ref('')

  const init = {
    language_url: `/tinymce/langs/zh_CN.js`,
    language: global.language.code === 'cn' ? 'zh_CN' : false,
    skin_url: `/tinymce/skins/ui/oxide`,
    content_css: `/tinymce/skins/content/default/content.css`,
    height: '40vh',
    plugins: 'lists image media table wordcount link',
    toolbar: false,
    branding: false,
    menubar: true,
    paste_data_images: false,
    images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
      global.file.uploadFile(global, blobInfo.blob(), 'rich_text_file', 'rich_text_file', true, resolve)
    }),
    file_picker_types: 'media',
    video_template_callback: (data) => {
      return `
        <span class="mce-preview-object mce-object-video" contenteditable="false"
              data-mce-object="video" data-mce-p-src="${data.source}"
              data-mce-p-width="${data.width}" data-mce-p-height="${data.height}"
              data-mce-p-controls="controls">
          <video width="${data.width}" height="${data.height}" controls>
            <source src="${data.source}" type="${data.sourcemime}">
          </video>
        </span>`
    },
    file_picker_callback: (callback, value, meta) => {
      let input = document.createElement('input')
      input.type = 'file'
      input.accept = 'video/*'
      input.onchange = function () {
        let file = this.files[0]
        global.file.uploadFile(global, file, 'rich_text_file', 'rich_text_file', true, callback)
      }
      input.click()
    }
  }

  // 暴露方法
  function getContent() {
    return myValue.value
  }
  // 暴露方法
  function clearContent() {
    myValue.value = ''
  }
  defineExpose({
    getContent,
    clearContent
  })
</script>

<template>
  <editor v-model="myValue" :init="init" />
</template>