<script setup>
  import { inject, onBeforeMount, reactive } from 'vue'
  import { APPConfig } from "@/config";
  import { WindowsOutlined, } from "@ant-design/icons-vue";

  const global = inject('global').value

  const login_state = reactive({
    loginData: { account: '', password: '', captcha_code: '', mobile: '', mobile_code: '' },  //登陆数据
    timer: new Date().getTime(),           //获取验证码的时间戳
    holdLogin: false,                      //是否保持登陆
    captchaInputWidth: '150px',            //验证码输入框宽度
    captChaImage: ''                       //captChaImage
  })

  onBeforeMount(() => {
    //已经有token直接跳转到后台首页
    if (localStorage.getItem('Authorization')) {
      global.router.push("/")
    } else {
      if (localStorage.getItem('holdLogin.status') == 'true') {
        login_state.loginData.account = localStorage.getItem('holdLogin.account');
        login_state.loginData.password = localStorage.getItem('holdLogin.password');
        login_state.holdLogin = true
      } else {
        login_state.loginData.account = "";
        login_state.loginData.password = '';
        login_state.holdLogin = false
      }
    }
    //登录前
    changeCaptcha()
  })


  function changeCaptcha() {
    login_state.timer = new Date().getTime()
  }

  function reset() {
    login_state.loginData = { account: '', password: '', code: '' };
  }

  function login() {
    if (active.value == 1) {
      // 账号密码登陆
      global.axios.post('factory_system/Base/login', login_state.loginData, global).then(res => {
        if (res) {
          localStorage.setItem('Authorization', res.token);
          if (login_state.holdLogin) {
            localStorage.setItem('holdLogin.account', login_state.loginData.account);
            localStorage.setItem('holdLogin.password', login_state.loginData.password);
            localStorage.setItem('holdLogin.status', 'true');
          } else {
            localStorage.removeItem('holdLogin.account');
            localStorage.removeItem('holdLogin.password');
            localStorage.setItem('holdLogin.status', 'false');
          }
          global.router.push("/")
        } else {
          changeCaptcha()
        }
      })
    } else {
      // 校验验证码
      global.axios.post('decoration/User/checkMobileCode', {
        mobile: login_state.loginData.mobile,
        mobile_code: login_state.loginData.mobile_code
      }, global).then(res => {
        console.log('校验验证码', res);
        global.axios.post('decoration/Store/login', {
          mobile: login_state.loginData.mobile
        }, global).then(res => {
          console.log('验证码登陆', res);
          if (res) {
            localStorage.setItem('Authorization', res.token);
            global.router.push("/")
          } else {
            changeCaptcha()
          }
        })
      })
    }
  }

  import { ref, watch } from 'vue'
  import { message } from 'ant-design-vue'
  const active = ref('1')//1账号密码 2手机号
  const showDjs = ref(false)//显示倒计时
  const timeData = ref(60)//倒计时
  const timer = ref(null)//计时器 
  watch(() => [timeData.value], (newVal, oldVal) => {
    console.log('时间变化', newVal[0]); //
    if (newVal[0] == 0) {
      showDjs.value = false
      clearInterval(timer.value); //清除定时器
    }
  });
  function handActive(type) {
    active.value = type
    reset()
  }
  function sendCode() {
    console.log('发送验证码');
    if (login_state.loginData.mobile) {
      const regex = /^1[3-9]\d{9}$/;
      if (login_state.loginData.mobile && !regex.test(login_state.loginData.mobile)) {
        uni.showToast({
          title: '手机号格式错误',
          icon: 'none',
          duration: 2000
        })
        return false
      }
    }
    global.axios.post('decoration/User/getMobileCode', login_state.loginData.mobile, global).then(res => {
      console.log('验证码', res.code);
      login_state.loginData.mobile_code = res.code
      showDjs.value = true
      timer.value = setInterval(() => {
        timeData.value = timeData.value - 1
      }, 1000);
    })
  }

  // 跳转其它路由
  function handUrl(url) {
    console.log('url', url);
    global.router.push(url)
  }
</script>


<template>
  <div class="login">
    <div style="position: fixed;right: 20px;top: 12vh;text-align: center;">
      <img src="/resource/image/jpn.png" style="width: 40px;height: 38px;" alt="">
      <div
        style="color: #fff;background-color: #FF5454;text-align: center;padding:7px 15px;border-radius: 5px;line-height: 18px;">
        官方<br>客服</div>
    </div>
    <!-- 语言 中文 -->
    <a-dropdown>
      <a v-show="global.languageList.length > 1 ?true:false" class="language"
        style="float: right;margin-right: 20px;color: #fff;;line-height: 50px;height: 50px;font-size: 17px">
        {{ global.language.name }}
        <span class="iconfont" style="font-size: 26px;float: right;margin-left: 5px">&#xe64d;</span>
      </a>
      <template #overlay>
        <a-menu>
          <a-menu-item v-for="(item,index) in global.languageList" :key="index"
            @click="global.changeLanguage(item.code)">
            {{ item.name }}
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
    <div style="height: 9vh;margin-left: 16vw;padding: 24px;color: #FF0000;font-weight: bold;">
      <div style="display: flex;">
        <img :src="global.adminLogo" alt="" style="width: auto;height: 45px;border-radius: 5px">
        <span style="font-size: 28px;margin-left: 5px;">{{global.appName}} </span>
      </div>
      <div>logo图标加文字尺寸 拼多多那边宽118px 高56px；背景图尺寸 宽2124 高673</div>
    </div>
    <div
      style="background-image: url('/resource/image/loginBg.png');background-repeat: no-repeat;background-size: 100% 100%;width: 100vw;height: 63vh;">
      <div class="login-form">
        <div
          style="display: flex;margin-top: 10px;color: #000000CC;font-weight: bold;font-size: 19px; padding: 0 50px;cursor: pointer;">
          <div style="display: flex;margin: 0 auto;">
            <div @click="handActive(1)" :style="{ color: active==1 ? '#FF5454' : ''}">账号登陆</div>
            <div style="color: #999999;margin: 0px 10px;font-weight: 100;">|</div>
            <div @click="handActive(2)" :style="{ color: active==2 ? '#FF5454' : ''}">手机登陆</div>
          </div>
        </div>
        <a-form layout="horizontal" style="margin-top: 30px;padding: 0 10px;">
          <div style="width: 100%">
            <a-form-item>
              <template v-if="active==1">
                <a-input v-model:value="login_state.loginData.account" :placeholder="global.findLanguage('请输入账号')"
                  allow-clear size="large" />
              </template>
              <template v-else>
                <a-input v-model:value="login_state.loginData.mobile" :placeholder="global.findLanguage('请输入手机号')"
                  allow-clear size="large" />
              </template>
            </a-form-item>
          </div>
          <a-form-item>
            <!-- 手机号 -->
            <template v-if="active==1">
              <a-input-password v-model:value="login_state.loginData.password"
                :placeholder="global.findLanguage('请输入密码')" size="large" />
            </template>
            <!-- 验证码 -->
            <template v-else>
              <div style="background-color: #fff;display: flex;">
                <a-input v-model:value="login_state.loginData.mobile_code" :placeholder="global.findLanguage('请输入验证码')"
                  size="large">
                  <template #suffix>
                    <div v-if="!showDjs" @click="sendCode"
                      style="font-size: 14px;color: #999999; border-left: 1px solid #999999;padding-left: 10px;cursor: pointer;">
                      发送验证码
                    </div>
                    <div v-else
                      style="font-size: 14px;color: #999999; border-left: 1px solid #999999;padding-left: 10px;cursor: pointer;">
                      {{timeData}}
                    </div>
                  </template>
                </a-input>
              </div>
            </template>
          </a-form-item>
          <a-form-item>
            <a-input v-model:value="login_state.loginData.captcha_code" :placeholder="global.findLanguage('请输入验证码')"
              :style="{width:'150px',float:'left'}" size="large" />
            <img :src="APPConfig.apiURL+'/factory_system/Base/getCaptcha?timer='+login_state.timer" alt=""
              style="width: 48%;border-radius: 3px;float: right" @click="changeCaptcha">
          </a-form-item>
          <a-form-item>
            <a-button size="large"
              style="width: 100%;font-size: 16px !important;background-color: #FF5454;border: none;" type="primary"
              @click="login">{{
              global.findLanguage('登录') }}</a-button>
          </a-form-item>
          <a-form-item>
            <span style="float: left;margin-top: 3px">
              <span style="color: #999999;">还没有店铺？</span>
              <span @click="handUrl('/openShop')" style="color: #2266AA;">0元开店</span>
            </span>
            <!-- <span style="float: right">
              <a-button type="primary" @click="login">{{ global.findLanguage('提交') }}</a-button>
              <a-button :style="{marginLeft:'20px'}" @click="reset">{{ global.findLanguage('重置') }}</a-button>
            </span> -->
            <span style="float: right;color: #2266AA;">
              <a-checkbox v-model:checked="login_state.holdLogin"></a-checkbox>
              {{global.findLanguage('记住密码')}}
            </span>
          </a-form-item>

        </a-form>
      </div>
    </div>
    <div style="display: flex;margin-top: 55px;color: #666666;font-size: 13px;">
      <div style="display: flex;justify-content: space-between;margin: 0 auto;width: 500px;align-items: center;">
        <span>商家入驻</span>
        <span>帮助中心</span>
        <span>规则中心</span>
        <span>廉正举报</span>
        <span style="border: 1px solid #999999;padding: 2px 10px;border-radius: 3px;">
          <WindowsOutlined />PC版
        </span>
      </div>
    </div>
    <div style="display: flex;font-size: 13px;">
      <div style="margin: 0 auto;color: #666666;margin-top: 30px;">
        <div>Copyright 2025-2035 quanfeng 版权所有 (增值电信业务经营许可证：xxx-xxxxxx)</div>
      </div>
    </div>
    <div style="display: flex;font-size: 13px;">
      <div style="margin: 0 auto;color: #666666;margin-top: 10px;">
        <div>沪公网安备 xxxxxxxxxxxxxxxx-xxxx</div>
      </div>
    </div>
  </div>
  <div v-if="global.copyright"
    style="width: 100%;height: 30px;line-height:30px;background-color: rgba(255,255,255,0.22);color: #FFFFFF;position:absolute;bottom:0;z-index:999;text-align: center"
    v-html="global.copyright">

  </div>
</template>


<style scoped>
  :deep(.ant-form-item) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    color: rgba(0, 0, 0, 0.85);
    font-size: 14px;
    font-variant: tabular-nums;
    line-height: 1.5715;
    list-style: none;
    font-feature-settings: 'tnum';
    margin-bottom: 16px;
    vertical-align: top;
  }

  .login {
    width: 100vw;
    height: 100vh;
    /* background: url("/resource/image/login_bg.jpg") 50% fixed no-repeat; */
    /* background-size: cover; */
  }

  .login-form {
    z-index: 2;
    width: 380px;
    height: 380px;
    position: absolute;
    top: 24vh;
    right: 13vw;
    /* background: url("/resource/image/login_form.png"); */
    /* background-size: 100% 100%; */
    background-color: #fff;
    border-radius: 10px;
    padding: 20px;
  }
</style>