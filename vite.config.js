import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import styleImport from 'vite-plugin-style-import'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  plugins: [
    vue(),
    styleImport({
      libs: [
        {
          libraryName: 'ant-design-vue',
          esModule: true,
          resolveStyle: (name) => {
            return `ant-design-vue/es/${name}/style/css`;
          },
        }
      ]
    })
  ],
  server: {
    proxy: {
      // 这里设置反向代理
      '/api/kuaidi': {
        target: 'http://poll.kuaidi100.com',  // 目标服务器地址
        changeOrigin: true,                   // 开启代理
        rewrite: (path) => path.replace(/^\/api\/kuaidi/, '/eorderapi.do'),  // 重写请求路径
      },
      '/kuaidiPDF': {
        target: 'https://api.kuaidi100.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/kuaidiPDF/, '')
      }
    },
  },
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
