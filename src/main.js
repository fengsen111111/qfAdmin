import {createApp, ref} from 'vue'
import App from './App.vue'
//Antd
import {setupAntd} from './plugins/antd'
import {message, Modal} from 'ant-design-vue'
//路由
import {router} from './router'
//网络请求
import axios from './plugins/axios'
import file from './plugins/file'
//国际化
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import enUS from 'ant-design-vue/es/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
//echarts
import * as echarts from 'echarts';
//媒体播放
import vue3videoPlay from 'vue3-video-play' // 引入组件
import 'vue3-video-play/dist/style.css' // 引入css



const app = createApp(App)


//全局变量
const global = {
    spinning: false,                                //全局蒙版
    loadingNumber: 0,                               //蒙版计次

    WebSockets: [],                                 //WebSocket连接池

    appName: '',                                     //项目名称
    adminLogo: '',                                   //项目LOGO
    copyright: '',                                   //版权信息

    adminMsg: '',                                     //管理员ID

    videoState:{                                        //视频播放器
        isCollapse :false,
        options: {
            width: "500px",
            height: "240px",
            src: '', //视频源
            controlBtns: ['audioTrack', 'volume', 'fullScreen']
        }
    },
}

setupAntd(app)

Object.assign(global, {Modal})

Object.assign(global, {message})

app.use(router)

Object.assign(global, {router})

Object.assign(global, {axios})

Object.assign(global, {file})

Object.assign(global, {
    antLocal: zhCN,                                   //ant design 语言
    language: {code: 'cn', name: '中文'},              //当前语言
    languageList: [{code: 'cn', name: '中文'}],          //语言列表
    languageSetting: [],                             //翻译字典
})

function changeLanguage(code) {
    const html = document.getElementsByTagName('html')[0];
    if (code === 'cn') {
        dayjs.locale('zh-cn');
        html.lang = 'zh'
    } else {
        dayjs.locale('en');
        html.lang = 'en'

    }
    axios.post('factory_system/Base/language', {
        language_code: code,
        change_language: true
    }, global, false).then(res => {
        global.antLocal = res.language.code === 'cn' ? zhCN : enUS
        global.language = res.language
        global.languageList = res.language_list
        global.languageSetting = res.language_setting
    })
}

function findLanguage(cn) {
    if (global.languageSetting.indexOf(cn) !== -1)
        return global.languageSetting[cn]
    else
        return cn
}

Object.assign(global, {
    findLanguage,                                   //国际化
    changeLanguage,                                 //切换语言
})


Object.assign(global, {echarts: echarts})

app.use(vue3videoPlay)



const global_const = ref(global)
app.provide('global', global_const)

app.mount('#app')
