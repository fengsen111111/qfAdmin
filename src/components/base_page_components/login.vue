<script setup>
import {inject, onBeforeMount, reactive} from 'vue'
import {APPConfig} from "@/config";

const global = inject('global').value

const login_state = reactive({
  loginData: {account: '', password: '', captcha_code: ''},  //登陆数据
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
  login_state.loginData = {account: '', password: ''};
}

function login() {
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
}
</script>


<template>
  <div class="login">
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
    <div class="login-form">
      <span style="width: 100%;margin-top: 20px;display: flex;justify-content: center"><img :src="global.adminLogo" alt=""
                                                                                            style="width: auto;height: 70px;border-radius: 5px"></span>
      <span style="display: block;font-size: 28px;color: white;text-align: center">{{ global.appName }}</span>
      <a-form layout="horizontal" style="margin-top: 20px;padding: 0 50px;">
        <div style="width: 100%">
          <a-form-item>
            <a-input v-model:value="login_state.loginData.account" :placeholder="global.findLanguage('请输入账号')"
                     allow-clear
                     size="large"/>
          </a-form-item>
        </div>

        <a-form-item>
          <a-input-password v-model:value="login_state.loginData.password" :placeholder="global.findLanguage('请输入密码')"
                            size="large"/>
        </a-form-item>
        <a-form-item>
          <a-input v-model:value="login_state.loginData.captcha_code" :placeholder="global.findLanguage('请输入验证码')"
                   :style="{width:'150px',float:'left'}"
                   size="large"/>
          <img :src="APPConfig.apiURL+'/factory_system/Base/getCaptcha?timer='+login_state.timer" alt=""
               style="width: 48%;border-radius: 3px;float: right" @click="changeCaptcha">
        </a-form-item>
        <a-form-item :label="global.findLanguage('记住密码')">
                    <span style="float: left;margin-top: 3px">
                       <a-checkbox v-model:checked="login_state.holdLogin"></a-checkbox>
                    </span>
          <span style="float: right">
                        <a-button type="primary" @click="login">{{ global.findLanguage('提交') }}</a-button>
                        <a-button :style="{marginLeft:'20px'}" @click="reset">{{ global.findLanguage('重置') }}</a-button>
                    </span>
        </a-form-item>
      </a-form>
    </div>
  </div>
  <div v-if="global.copyright"
       style="width: 100%;height: 30px;line-height:30px;background-color: rgba(255,255,255,0.22);color: #FFFFFF;position:absolute;bottom:0;z-index:999;text-align: center"
       v-html="global.copyright">

  </div>
</template>


<style scoped>
.login {
  width: 100vw;
  height: 100vh;
  background: url("/resource/image/login_bg.jpg") 50% fixed no-repeat;
  background-size: cover;
}

.login-form {
  z-index: 2;
  width: 430px;
  height: 430px;
  position: absolute;
  top: 20vh;
  right: 12vw;
  background: url("/resource/image/login_form.png");
  background-size: 100% 100%;
}

</style>