import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import styleImport from 'vite-plugin-style-import'

export default defineConfig({
  resolve: {
    alias: [{find: '@', replacement: require('path').resolve(__dirname, 'src')}],
  },
  plugins: [
    vue(),
    styleImport({
      libs: [{
        libraryName: 'ant-design-vue',
        esModule: true,
        resolveStyle: (name) => {
          return `ant-design-vue/es/${name}/style/css`;
        },
      }]
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "ant": ["ant-design-vue"],
          "tinymce": ["tinymce"],
          "oss": ["ali-oss"],
          "cos": ["cos-js-sdk-v5"],
          "obs": ["esdk-obs-browserjs"],
          "echarts": ["echarts"],
          "videoPlay": ["vue3-video-play"],
        },
      },
    },
  },
})
