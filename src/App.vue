<script setup>
  import { inject, onBeforeMount, onMounted } from 'vue'
  const global = inject('global').value

  onBeforeMount(() => {
    localStorage.removeItem('dktz')
    //BS基本信息
    global.axios.post('factory_system/Base/beforeLogin', {}, global, false).then(res => {
      document.title = res.project_name ? res.project_name : 'Factory5.0';
      global.appName = res.project_name ? res.project_name : 'Factory5.0';
      global.copyright = res.copyright;
      global.adminLogo = res.admin_logo ? res.admin_logo : "/resource/image/logo.png";
      var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = res.admin_favicon ? res.admin_favicon : "/admin_favicon.ico";
      document.getElementsByTagName('head')[0].appendChild(link);
    })

    //初始化语言
    global.changeLanguage(global.language.code)
    //未登录跳转登录页
    if (!localStorage.getItem('Authorization')) {
      // console.log('win',window.location.pathname);
      if(window.location.pathname=='/openShop'){
        // 不跳转
      }else{
        global.router.push("/login")
      }
    }
  })

  onMounted(() => {
    const html = document.getElementsByTagName('html')[0];
    if (global.language.code === 'cn')
      html.lang = 'zh'
    else
      html.lang = 'en'
  })

</script>

<template>
  <a-config-provider :locale="global.antLocal">
    <a-spin :delay="600" :spinning="global.spinning" size="large" tip="Loading...">
      <router-view></router-view>
    </a-spin>
  </a-config-provider>
</template>

<style lang="less">
  /* //全局样式// */
  html,
  body {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }

  /***滚动条设置***/
  ::-webkit-scrollbar {
    /* 滚动条宽度 */
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-thumb {
    /* 滚动条的滑块 */
    background-color: #d4d4d7;
    border-radius: 2px;
  }

  * {
    scrollbar-color: #d4d4d7 rgba(0, 0, 0, 0);
    /* 滑块颜色  滚动条背景颜色 */
    scrollbar-width: thin;
    /* 滚动条宽度有三种：thin、auto、none */
  }

  /***滚动条设置***/

  /***按钮样式重构***/
  .ant-btn {
    font-size: 12px !important;
    border-radius: 3px !important;
  }

  .button-danger {
    background-color: #F5222D !important;
    border-color: #F5222D !important;
    color: #FFFFFF !important;

    &:hover,
    &:focus {
      background-color: #F5222D !important;
      border-color: #ff4d4f !important;
    }

    &:active,
    &.active {
      background-color: #F5222D !important;
      border-color: #F5222D !important;
    }
  }

  .button-warning {
    background-color: #FAAD14 !important;
    border-color: #FAAD14 !important;
    color: #FFFFFF !important;

    &:hover,
    &:focus {
      background-color: #FAAD14 !important;
      border-color: #ffc53d !important;
    }

    &:active,
    &.active {
      background-color: #FAAD14 !important;
      border-color: #FAAD14 !important;
    }
  }

  .button-success {
    background-color: #52C41A !important;
    border-color: #52C41A !important;
    color: #FFFFFF !important;

    &:hover,
    &:focus {
      background-color: #52C41A !important;
      border-color: #73d13d !important;
    }

    &:active,
    &.active {
      background-color: #52C41A !important;
      border-color: #52C41A !important;
    }
  }

  .button-primary {
    background-color: #1890FF !important;
    border-color: #1890FF !important;
    color: #FFFFFF !important;

    &:hover,
    &:focus {
      background-color: #1890FF !important;
      border-color: #1890FF !important;
    }

    &:active,
    &.active {
      background-color: #1890FF !important;
      border-color: #1890FF !important;
    }
  }

  .button-info {
    background-color: #a4a4a4 !important;
    border-color: #a4a4a4 !important;
    color: #FFFFFF !important;

    &:hover,
    &:focus {
      background-color: #a4a4a4 !important;
      border-color: #a4a4a4 !important;
    }

    &:active,
    &.active {
      background-color: #a4a4a4 !important;
      border-color: #a4a4a4 !important;
    }
  }

  /***按钮样式重构***/

  /***字体图标***/
  @font-face {
    font-family: 'iconfont';
    src: url('/resource/iconfont/iconfont.woff2?t=1638977486333') format('woff2'),
      url('/resource/iconfont/iconfont.woff?t=1638977486333') format('woff'),
      url('/resource/iconfont/iconfont.ttf?t=1638977486333') format('truetype');
  }


  .iconfont {
    font-family: 'iconfont' !important;
  }

  /***字体图标***/

  /***loading***/

  .ant-spin-nested-loading>div>.ant-spin {
    max-height: 100vh !important;
  }

  /***loading***/


  .ant-table-fixed-header .ant-table-scroll .ant-table-header {
    margin-bottom: -8px !important;
  }

  /* //播放器样式 */
  .d-play-btn {
    width: 45px !important;
    height: 45px !important;

    .iconfont {
      font-size: 30px !important;
    }
  }


  /* //全局样式// */
</style>