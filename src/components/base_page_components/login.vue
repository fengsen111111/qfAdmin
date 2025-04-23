<script setup>
  import { inject, onBeforeMount, reactive, onMounted } from 'vue'
  import { APPConfig } from "@/config";
  import { WindowsOutlined, CloseCircleOutlined, LeftOutlined, ExclamationCircleFilled, CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons-vue";

  // import graphicsVerify from 'src/components/form_components/graphicsVerify.vue'
  import graphicsVerify from '@/components/form_components/graphicsVerify.vue'

  const global = inject('global').value

  const login_state = reactive({
    loginData: { account: '', password: '', captcha_code: '', mobile: '', mobile_code: '' },  //登陆数据
    timer: new Date().getTime(),           //获取验证码的时间戳
    holdLogin: false,                      //是否保持登陆
    captchaInputWidth: '150px',            //验证码输入框宽度
    captChaImage: ''                       //captChaImage
  })

  const isJb = ref(false)

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      console.log('回车键触发了');
      login()
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

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
    login_state.loginData = { account: '', password: '', code: '', mobile_code: '' };
    sqObj.value = {}//清空商家数据
    rzStatus.value = 0 //清空
    errorMsg.value = ''//清空报错信息
    // 清空密码账号 清除定时器
    if (timer.value) {
      clearInterval(timer.value);
    }
  }

  const errorMsg = ref('')//错误信息

  function login() {
    if (login_state.loginData.captcha_code.toLowerCase() !== captchaCode.value.toLowerCase()) {
      errorMsg.value = '图形验证码输入有误'
      return false
    }
    if (active.value == 1) {
      // 1账号
      if (login_state.loginData.account) {
        console.log('有账号');
      } else {
        errorMsg.value = '请填写账号'
        return false
      }
      // 2密码
      if (login_state.loginData.password) {
        console.log('有密码');
      } else {
        errorMsg.value = '请填写密码'
        return false
      }
      // 账号密码登陆
      global.axios.post('factory_system/Base/login', login_state.loginData, global)
        .then(res => {
          if (res) {
            localStorage.setItem('Authorization', res.token);
            errorMsg.value = '' //清空报错信息
            if (login_state.holdLogin) {
              localStorage.setItem('holdLogin.account', login_state.loginData.account);
              localStorage.setItem('holdLogin.password', login_state.loginData.password);
              localStorage.setItem('holdLogin.status', 'true');
            } else {
              localStorage.removeItem('holdLogin.account');
              localStorage.removeItem('holdLogin.password');
              localStorage.setItem('holdLogin.status', 'false');
            }
            if (isJb.value) { //是否廉政举报
              global.router.push("/lzjb")
            } else {
              global.router.push("/")
            }
          } else {
            changeCaptcha()
          }
        })
        .catch(error => {
          console.log('error', error);
          errorMsg.value = error.message
        })
    } else {
      // 1手机号
      if (login_state.loginData.mobile) {
        const regex = /^1[3-9]\d{9}$/;
        if (login_state.loginData.mobile && !regex.test(login_state.loginData.mobile)) {
          errorMsg.value = '手机号格式错误'
          return false
        }
      } else {
        errorMsg.value = '手机号不可为空'
        return false
      }
      // 2验证码
      if (login_state.loginData.mobile_code) {
        console.log('有验证码');
      } else {
        errorMsg.value = '请填写验证码'
        return false
      }
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
            errorMsg.value = '' //清空报错信息
            // global.router.push("/")
            if (isJb.value) { //是否廉政举报
              global.router.push("/lzjb")
            } else {
              global.router.push("/")
            }
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

  // 页面还要定时器，清除
  if (timer.value) {
    clearInterval(timer.value); //清除定时器
  }

  watch(() => [timeData.value], (newVal, oldVal) => {
    console.log('时间变化', newVal[0]); //
    if (newVal[0] == 0) {
      showDjs.value = false
      clearInterval(timer.value); //清除定时器
    }
  });
  function handActive(type) {
    active.value = type
    drawCaptcha()
    reset()
  }
  function sendCode() {
    console.log('发送验证码');
    if (login_state.loginData.mobile) {
      const regex = /^1[3-9]\d{9}$/;
      if (login_state.loginData.mobile && !regex.test(login_state.loginData.mobile)) {
        errorMsg.value = '手机号格式错误'
        return false
      }
    } else {
      errorMsg.value = '手机号不可为空'
      return false
    }
    global.axios.post('decoration/User/getMobileCode', {
      mobile: login_state.loginData.mobile
    }, global).then(res => {
      console.log('验证码', res.code);
      login_state.loginData.mobile_code = res.code
      showDjs.value = true
      timeData.value = 60
      timer.value = setInterval(() => {
        timeData.value = timeData.value - 1
      }, 1000);
    })
  }

  // 跳转其它路由
  function handUrl(url) {
    // /openShop //0元开店
    console.log('url', url);
    global.router.push(url)
  } const logType = ref(1)//1普通登录 2
  // 0元开店 / 立即登录
  function lykd() {
    console.log('0元开店');
    logType.value = logType.value == 1 ? 2 : 1
    reset()//清空账号密码
    if (logType.value == 1) {
      console.log('刷新验证码');
      setTimeout(() => {
        drawCaptcha()
        showDjs.value = false
      }, 500);
    }
  }
  // 商家入驻
  function lykdShop() {
    logType.value = 2
    reset()//清空账号密码
  }

  const rzStatus = ref(0)//0 未入住 1已入住
  const sqObj = ref({})//申请信息
  // 立即开店
  function ljkd() {
    // 1手机号
    if (login_state.loginData.mobile) {
      const regex = /^1[3-9]\d{9}$/;
      if (login_state.loginData.mobile && !regex.test(login_state.loginData.mobile)) {
        errorMsg.value = '手机号格式错误'
        return false
      }
    } else {
      errorMsg.value = '手机号不可为空'
      return false
    }
    // 2 密码
    const result = validatePassword(login_state.loginData.password)
    if (!result.valid) {
      console.log('密码不合法：', result.msg, pasYz.value);
      errorMsg.value = '密码不满足所有规则'
      return false
    } else {
      console.log('通过校验');
    }

    console.log('提交数据', login_state.loginData);
    // 校验验证码
    global.axios.post('decoration/User/checkMobileCode', {
      mobile: login_state.loginData.mobile,
      mobile_code: login_state.loginData.mobile_code
    }, global).then(res => {
      console.log('res', res);
      if (res.result !== 'N') {
        getSubmitEntryApplyMsg()//商家入驻信息
      } else {
        errorMsg.value = res.message
      }
    })
  }
  function getSubmitEntryApplyMsg() {
    rzStatus.value = 0//未入驻
    global.axios.post('decoration/Store/getSubmitEntryApplyMsg', {
      mobile: login_state.loginData.mobile,
    }, global).then(res => {
      console.log('商家入驻信息', res);
      res = res == [] ? {} : res
      if (res.id) {
        rzStatus.value = 1//入驻
        errorMsg.value = ''//清空错误信息
        sqObj.value = res
      } else {
        rzStatus.value = 0//未入驻
        handUrl('/openShop?password=' + login_state.loginData.password + '&mobile=' + login_state.loginData.mobile)
      }
    })
  }

  // 廉政举报
  function handLzjb() {
    console.log('廉政举报');
    if (localStorage.getItem('Authorization')) {
      global.router.push("/lzjb")
    } else {
      isJb.value = true
      message.error('请登录！')
    }
  }

  const visible = ref(false)
  const keyWt = ref({})//常见问题点击项

  const menuList = ref([]) //常见问题
  const fwbContent = ref('')//常见问题答案

  function getQandAList() {
    global.axios
      .post('decoration/QandA/getQandAList', {}, global)
      .then((res) => {
        // console.log('常见问题', res.list);
        menuList.value = res.list
      });
  }
  getQandAList()
  // 常见问题详情
  function getQandADetail() {
    global.axios
      .post('decoration/QandA/getQandADetail', {
        id: keyWt.value.id
      }, global)
      .then((res) => {
        // console.log('常见问题答案', res.answer);
        fwbContent.value = res.answer
      });
  }
  // 点击其它
  function editKeyWt(item) {
    keyWt.value = item
    getQandADetail()
  }

  const canvasRef = ref(null)
  const captchaCode = ref('') // 可用来校验用户输入

  // 生成随机验证码
  function getRandomCode(length = 4) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let code = ''
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }
  // 画验证码
  function drawCaptcha() {
    verifyCode.value = 2
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const width = canvas.width
    const height = canvas.height
    // 背景
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, width, height)
    // 随机验证码
    const code = getRandomCode()
    captchaCode.value = code
    // 绘制验证码字符
    for (let i = 0; i < code.length; i++) {
      const fontSize = 20 + Math.random() * 10
      ctx.font = `${fontSize}px Arial`
      ctx.fillStyle = getRandomColor()
      const x = 10 + i * 20
      const y = 25 + Math.random() * 10
      const deg = (Math.random() - 0.5) * 30
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((deg * Math.PI) / 180)
      ctx.fillText(code[i], 0, 0)
      ctx.restore()
    }
    // 干扰线
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = getRandomColor()
      ctx.beginPath()
      ctx.moveTo(Math.random() * width, Math.random() * height)
      ctx.lineTo(Math.random() * width, Math.random() * height)
      ctx.stroke()
    }
    // 干扰点
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = getRandomColor()
      ctx.beginPath()
      ctx.arc(Math.random() * width, Math.random() * height, 1, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  setTimeout(() => {
    drawCaptcha()
  }, 500);
  // 生成随机颜色
  function getRandomColor() {
    const r = Math.floor(Math.random() * 150)
    const g = Math.floor(Math.random() * 150)
    const b = Math.floor(Math.random() * 150)
    return `rgb(${r},${g},${b})`
  }
  const verifyCode = ref(0)//验证状态

  const admin_login_logo = ref('')
  const admin_login_back_image = ref('')

  function getSetting() {
    global.axios
      .post('decoration/Setting/getSetting', {}, global)
      .then((res) => {
        console.log('登陆页logo', res);
        admin_login_logo.value = res.admin_login_logo[0]
        admin_login_back_image.value = res.admin_login_back_image[0]
      });
  }
  getSetting()

  let pasYz = ref({
    rule_a: false,//规则1
    rule_b: false,//规则2
    rule_c: false,//规则3
    level: 0//安全等级
  })//密码验证情况
  // o元开店密码变化
  function pasChange() {
    const result = validatePassword(login_state.loginData.password)
    if (!result.valid) {
      console.log('密码不合法：', result.msg, pasYz.value);
    } else {
      console.log('通过校验');
    }
  }
  // 校验密码
  function validatePassword(pwd) {
    let passedCount = 0; // 统计通过的规则数
    // 1. 长度校验
    if (pwd.length >= 8 && pwd.length <= 20) {
      pasYz.value.rule_a = true;
      passedCount++;
    } else {
      pasYz.value.rule_a = false;
    }
    // 2. 字符合法性（不含空格、中文）
    const allowedChars = /^[A-Za-z0-9~!@#$%^&*()_+\-=`[\]{}|;:'",.<>/?]+$/;
    if (allowedChars.test(pwd)) {
      pasYz.value.rule_b = true;
      passedCount++;
    } else {
      pasYz.value.rule_b = false;
    }
    // 3. 至少包含三种类型字符
    let count = 0;
    if (/[A-Z]/.test(pwd)) count++;       // 大写
    if (/[a-z]/.test(pwd)) count++;       // 小写
    if (/[0-9]/.test(pwd)) count++;       // 数字
    // 只计算“合法符号”
    const symbolRegex = /[~!@#$%^&*()_+\-=`[\]{}|;:'",.<>/?]/;
    if (symbolRegex.test(pwd)) count++; // 合法符号
    if (count >= 3) {
      pasYz.value.rule_c = true;
      passedCount++;
    } else {
      pasYz.value.rule_c = false;
    }
    // 设置最终安全等级
    pasYz.value.level = passedCount;
    // 返回最终结果
    if (passedCount === 3) {
      return { valid: true, msg: '密码合法' };
    } else {
      return { valid: false, msg: '密码未满足所有规则' };
    }
  }

</script>

<template>
  <div class="login">
    <div style="position: fixed;right: 20px;top: 12vh;text-align: center;">
      <img src="/resource/image/jpn.png" style="width: 40px;height: 38px;" alt="">
      <a-popover v-model:visible="visible" trigger="click" placement="leftTop">
        <template #content>
          <div style="width: 400px;">
            <div style="display: flex;justify-content: space-between;">
              <div v-if="!keyWt.id" style="font-size: 18px;">您可能想知道</div>
              <div v-else @click="keyWt={}" style="display: flex;align-items: center;">
                <LeftOutlined />
                <span style="margin-left: 5px;">返回</span>
              </div>
              <div>
                <CloseCircleOutlined @click="visible = false" />
              </div>
            </div>
            <div v-if="!keyWt.id">
              <div @click="editKeyWt(item)" class="itemWt"
                style="display: flex; align-items: center;width: 100%;margin-top: 5px;" v-for="item in menuList"
                :key="item.id">
                <div style="background-color: #999999;height: 5px;width: 5px;border-radius: 50%;margin-right: 5px;">
                </div>
                <div style="border-bottom: 1px solid #f5f5f5;width: 100%;padding-bottom: 5px;padding-top: 5px;">
                  {{item.question}}</div>
              </div>
            </div>
            <div v-else style="padding: 10px;">
              <div style="font-weight: bold;margin-bottom: 10px;">{{keyWt.question}}</div>
              <div v-html="fwbContent"></div>
              <div v-if="!fwbContent">
                <a-empty />
              </div>
            </div>
          </div>
        </template>
        <div @click="visible = true"
          style="color: #fff;background-color: #FF5454;text-align: center;padding:7px 15px;border-radius: 5px;line-height: 18px;">
          常见<br>问题</div>
      </a-popover>

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
    <div style="height: 9.5vh;margin-left: 21.5vw;padding-top: 14px;color: #FF0000;font-weight: bold;">
      <div style="display: flex;">
        <img v-if="admin_login_logo" :src="admin_login_logo" alt="" style="width: auto;height: 7vh;border-radius: 5px">
        <img v-else src="/resource/image/logoqf.png" alt="" style="width: auto;height: 7vh;border-radius: 5px">
      </div>
      <!-- <div>logo图标加文字尺寸 拼多多那边宽118px 高56px；背景图尺寸 宽2124 高673</div> -->
    </div>
    <div style="padding: 0px 260px;background-size: 100% 100%;" :style="{
      backgroundImage: admin_login_back_image 
        ? `url(${admin_login_back_image})` 
        : 'linear-gradient(180deg, #103bbc 0%, #00238c 100%)'
    }">
      <!-- background-image: url('/resource/image/loginBgTwo.png'); -->
      <div style="background-repeat: no-repeat;background-size: 100% 100%;height: 63vh;">
        <div v-if="logType==1" class="login-form">
          <div
            style="display: flex;margin-top: 10px;color: #000000CC;font-weight: bold;font-size: 19px; padding: 0 50px;cursor: pointer;">
            <div style="display: flex;margin: 0 auto;">
              <div @click="handActive(1)" :style="{ color: active==1 ? '#FF5454' : ''}">账号登陆</div>
              <div style="color: #999999;margin: 0px 10px;font-weight: 100;">|</div>
              <div @click="handActive(2)" :style="{ color: active==2 ? '#FF5454' : ''}">手机登陆</div>
            </div>
          </div>
          <a-form layout="horizontal" style="margin-top: 10px;padding: 0 10px;">
            <!-- 展示错误信息 -->
            <a-form-item v-if="errorMsg">
              <div
                style="display: flex;color:#FF5454;border: 1px solid #FF5454;font-size: 12px;background-color: #fff4f2;padding: 4px 10px;line-height: 16px;border-radius: 2px;">
                <ExclamationCircleFilled style="color: #FF5454;font-size: 12px;margin-top: 3px;" />
                <span style="margin-left: 5px;">{{errorMsg}}</span>
              </div>
            </a-form-item>
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
              <template v-if="active==1">
                <a-input-password v-model:value="login_state.loginData.password"
                  :placeholder="global.findLanguage('请输入密码')" size="large" />
              </template>
              <template v-else>
                <div style="background-color: #fff;display: flex;">
                  <a-input v-model:value="login_state.loginData.mobile_code"
                    :placeholder="global.findLanguage('请输入验证码')" size="large">
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
              <div style="display: flex;justify-content: space-between;align-items: center;margin-top: -5px;">
                <a-input v-model:value="login_state.loginData.captcha_code" :placeholder="global.findLanguage('图形验证码')"
                  :style="{width:'calc(100% - 110px)',float:'left',}" @change="onChange" size="large" />
                <div @click="drawCaptcha" style="cursor: pointer;padding-top: 5px;">
                  <canvas ref="canvasRef" width="100" height="40"></canvas>
                </div>
              </div>
            </a-form-item>
            <a-form-item>
              <a-button size="large"
                style="width: 100%;font-size: 16px !important;background-color: #FF5454;border: none;" type="primary"
                @click="login">{{
                global.findLanguage('登录') }}</a-button>
            </a-form-item>
            <a-form-item>
              <span style="float: left;margin-top: 3px;cursor: pointer;">
                <span style="color: #999999;">还没有店铺？</span>
                <span @click="lykd" style="color: #2266AA;">0元开店</span>
              </span>
              <span style="float: right;color: #2266AA;">
                <a-checkbox v-model:checked="login_state.holdLogin"></a-checkbox>
                {{global.findLanguage('记住密码')}}
              </span>
            </a-form-item>
          </a-form>
        </div>
        <div v-else class="login-form">
          <div
            style="display: flex;margin-top: 10px;color: #000000CC;font-weight: bold;font-size: 19px; padding: 0 50px;cursor: pointer;">
            <div style="display: flex;margin: 0 auto;">
              <div style="color:#FF5454">0元开店</div>
            </div>
          </div>
          <a-form layout="horizontal" style="padding: 0 10px;margin-top: 10px;">
            <!-- 展示错误信息 -->
            <a-form-item v-if="errorMsg">
              <div
                style="display: flex;color:#FF5454;border: 1px solid #FF5454;font-size: 12px;background-color: #fff4f2;padding: 4px 10px;line-height: 16px;border-radius: 2px;">
                <ExclamationCircleFilled style="color: #FF5454;font-size: 12px;margin-top: 3px;" />
                <span style="margin-left: 5px;">{{errorMsg}}</span>
              </div>
            </a-form-item>
            <!-- 已申请用户,提示登陆 -->
            <a-form-item v-else-if="rzStatus==1">
              <div
                style="display: flex;color:#FF5454;border: 1px solid #FF5454;font-size: 12px;background-color: #fff4f2;padding: 4px 10px;line-height: 16px;border-radius: 2px;">
                <ExclamationCircleFilled style="color: #FF5454;font-size: 12px;margin-top: 3px;" />
                <span style="margin-left: 5px;">该手机号已开店，店铺名：{{sqObj.store_name}}；请直接前往商家后台登录</span>
              </div>
            </a-form-item>
            <a-form-item>
              <a-input v-model:value="login_state.loginData.mobile" :placeholder="global.findLanguage('请输入手机号')"
                allow-clear size="large" />
            </a-form-item>
            <a-form-item>
              <a-popover placement="leftTop">
                <template #content>
                  <div style="font-size: 12px;">
                    <div style="display: flex;align-items: center;">
                      安全程度：
                      <!-- 密码安全度中级单独判断 -->
                      <div v-if="pasYz.level==2" style="margin-left: 3px;display: flex;margin-top: 2px;">
                        <div v-if="pasYz.rule_a"
                          style="background-color: orange;width: 40px;height: 8px;margin-right: 3px;"></div>
                        <div v-else style="background-color: orange;width: 40px;height: 8px;margin-right: 3px;"></div>
                        <div v-if="pasYz.rule_b"
                          style="background-color: orange;width: 40px;height: 8px;margin-right: 3px;"></div>
                        <div v-else style="border:1px solid orange;width: 40px;height: 8px;margin-right: 3px;"></div>
                        <div v-if="pasYz.rule_c"
                          style="background-color: orange;width: 40px;height: 8px;margin-right: 3px;"></div>
                        <div v-else style="border:1px solid orange;width: 40px;height: 8px;margin-right: 3px;"></div>
                      </div>
                      <!-- 密码安全度 低 或  高 -->
                      <div v-else style="margin-left: 3px;display: flex;margin-top: 2px;">
                        <div v-if="pasYz.rule_a"
                          style="background-color: green;width: 40px;height: 8px;margin-right: 3px;"></div>
                        <!-- 规则2 或者规则3 满足一个就是框 -->
                        <div v-else-if="pasYz.rule_b||pasYz.rule_c"
                          style="border: 1px solid #FF5454;width: 40px;height: 8px;margin-right: 3px;"></div>
                        <div v-else style="background-color: #FF5454;width: 40px;height: 8px;margin-right: 3px;"></div>
                        <div v-if="pasYz.rule_b"
                          style="background-color: green;width: 40px;height: 8px;margin-right: 3px;"></div>
                        <div v-else style="border:1px solid#FF5454;width: 40px;height: 8px;margin-right: 3px;"></div>
                        <div v-if="pasYz.rule_c"
                          style="background-color: green;width: 40px;height: 8px;margin-right: 3px;"></div>
                        <div v-else style="border:1px solid#FF5454;width: 40px;height: 8px;margin-right: 3px;"></div>
                      </div>
                      <span v-if="pasYz.level==1||pasYz.level==0" style="color: #FF5454;">低</span>
                      <span v-else-if="pasYz.level==2" style="color: orange;">中</span>
                      <span v-else-if="pasYz.level==3" style="color: green;">高</span>
                    </div>
                    <div>
                      <div style="display: flex;align-items: center;">
                        <CheckCircleFilled v-if="pasYz.rule_a"
                          style="font-size: 10px;color: green;margin-right: 5px;" />
                        <CloseCircleFilled v-else style="font-size: 10px;color: #FF5454;margin-right: 5px;" />
                        <span>8-20位</span>
                      </div>
                      <div style="display: flex;align-items: center;">
                        <CheckCircleFilled v-if="pasYz.rule_b"
                          style="font-size: 10px;color: green;margin-right: 5px;" />
                        <CloseCircleFilled v-else style="font-size: 10px;color: #FF5454;margin-right: 5px;" />
                        <span>只能包含大小写字母、数字以及符号(不包含空格)</span>
                      </div>
                      <div style="display: flex;align-items: center;">
                        <CheckCircleFilled v-if="pasYz.rule_c"
                          style="font-size: 10px;color: green;margin-right: 5px;" />
                        <CloseCircleFilled v-else style="font-size: 10px;color: #FF5454;margin-right: 5px;" />
                        <span>大写字母/小写字母/数组/符号字少包含三种</span>
                      </div>
                    </div>
                  </div>
                </template>
                <a-input-password v-model:value="login_state.loginData.password" @change="pasChange"
                  :placeholder="global.findLanguage('设置密码')" size="large" />
              </a-popover>
            </a-form-item>
            <a-form-item>
              <div style="background-color: #fff;display: flex;">
                <a-input v-model:value="login_state.loginData.mobile_code" :placeholder="global.findLanguage('请输入验证码')"
                  size="large">
                  <template #suffix>
                    <div v-if="!showDjs" @click="sendCode"
                      style="font-size: 14px;color: #999999; border-left: 1px solid #999999;padding-left: 10px;cursor: pointer;">
                      获取验证码
                    </div>
                    <div v-else
                      style="font-size: 14px;color: #999999; border-left: 1px solid #999999;padding-left: 10px;cursor: pointer;">
                      {{timeData}}
                    </div>
                  </template>
                </a-input>
              </div>
            </a-form-item>
            <div>
              <a-button size="large"
                style="width: 100%;font-size: 16px !important;background-color: #FF5454;border: none;" type="primary"
                @click="ljkd">{{
                global.findLanguage('立即开店') }}</a-button>
            </div>
            <div>
              <span style="float: left;margin-top: 10px;">
                <span style="color: #999999;">已有账号？</span>
                <span @click="lykd" style="color: #2266AA;">立即登录</span>
              </span>
            </div>
          </a-form>
        </div>
      </div>
    </div>

    <div style="display: flex;margin-top: 5vh;color: #666666;font-size: 13px;">
      <div style="display: flex;justify-content: space-between;margin: 0 auto;width: 500px;align-items: center;">
        <span @click="lykdShop">商家入驻</span>
        <span @click="handUrl('/ruleCenter?title=常见问题')">常见问题</span>
        <span @click="handUrl('/ruleCenter?title=学习中心')">学习中心</span>
        <span @click="handLzjb()">廉正举报</span>
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
  .itemWt :hover {
    background-color: #f5f5f5;
    color: #2266AA;
  }

  :deep(.ant-popover-inner) {
    background-color: #FF5454 !important;
  }

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
    width: 340px;
    min-height: 340px;
    max-height: 400px;
    position: absolute;
    top: 22vh;
    right: 20vw;
    /* background: url("/resource/image/login_form.png"); */
    /* background-size: 100% 100%; */
    background-color: #fff;
    border-radius: 10px;
    padding: 20px;
  }
</style>