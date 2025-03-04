<script setup>
//websocket 不适配factory5.0
import {inject, nextTick, onBeforeMount, onMounted, onUnmounted, reactive, ref, watch} from 'vue'
import {APPConfig} from "../../config";

let props = defineProps(["pageData"])
const pageData = props.pageData
let emit = defineEmits(["openChildPage", "closeChildPage"])
const global = inject('global').value

const customer_service_state = reactive({
  customer_msg: { joiner_sign: '', name: '', head_image: '' },

  customerListCurrentPage:0,
  room_count: 0,
  room_id: '',
  room: null,
  room_list: [],


  msgListCurrentPage:0,
  msg_count: 0,
  msg_list: [],

  text_content: '',
  file_type: 'image',
  image_file_extends: '.jpg,.jpeg,.png',
  media_file_extends: '.mp3,.mp4',

  // 防止重复提交
  loading: false,

  //查看大图
  now_image: '',
  isCollapse: false,




  //WebSocket
  heartCheck: {},
  WebSocketClient: {},
  connect_msg: 'wait'
})

onBeforeMount(() => {
  init()
  getCustomerRoomList()
})


//获取聊天列表
function getCustomerRoomList() {
  if(customer_service_state.room_list.length === 0 || Math.ceil(customer_service_state.room_count/10) > customer_service_state.customerListCurrentPage){
    customer_service_state.customerListCurrentPage ++
    global.axios.post('factory_system/CustomerService/getCustomerRoomList', {currentPage: customer_service_state.customerListCurrentPage, pageSize: 10}, global, true).then((res) => {
      if(res.list.length > 0){
        customer_service_state.room_list = customer_service_state.room_list.concat(res.list)
        customer_service_state.room_count = res.count
      }
      nextTick(()=>{
        shortRoomList()
      })
    })
    if(customer_service_state.room_count !== 0)
      customer_service_state.customerListCurrentPage++
  }
}

function shortRoomList(){
  return customer_service_state.room_list.sort(function (a,b) {
    var y= a['active_time']
    var x= b['active_time']
    return ((x<y)?-1:((x>y)?1:0))
  })
}

function check(room_id) {
  customer_service_state.room_id = room_id
  for (let i = 0; i < customer_service_state.room_list.length; i++) {
    if (customer_service_state.room_list[i]['room_id'] === room_id) {
      customer_service_state.customer_msg = customer_service_state.room_list[i]['customer_msg']
      if (!customer_service_state.room_list[i].checked) {
        customer_service_state.room_list[i].checked = true
        customer_service_state.room_list[i].unread = 0
        getMsg()
      }
     nextTick(()=>{
       customer_service_state.room = customer_service_state.room_list[i]
     })
    } else {
      customer_service_state.room_list[i].checked = false
    }
  }
}

function getMsg(){
  if(customer_service_state.msg_list.length === 0 || Math.ceil(customer_service_state.msg_count/7) > customer_service_state.msgListCurrentPage){
    customer_service_state.msgListCurrentPage ++
    global.axios.post('factory_system/CustomerService/getHistoryMessage', { currentPage: customer_service_state.msgListCurrentPage, pageSize: 7, room_id: customer_service_state.room_id, joiner_sign: global.adminMsg.id, joiner_type: 'worker' }, global, true).then((res) => {
      customer_service_state.msg_count = res.count
      customer_service_state.msg_list.unshift(...res.list)
      if(customer_service_state.msgListCurrentPage === 1){
       nextTick(()=>{
         scrollToBottom()
       })
      }
    })
  }
}

//发送文字消息
function send_word() {
  send({
    content_type: 'text',
    content: customer_service_state.text_content,
  })
  customer_service_state.msg_list.push({ create_time: timeFormate(new Date()), content_type: 'text', content: customer_service_state.text_content, joiner_sign: global.adminMsg.id })
  customer_service_state.text_content = ''
  nextTick(()=>{
    scrollToBottom()
  })
}

//上传资源
function upload(options) {
  customer_service_state.loading = true
  global.file.uploadFile(global, options.file, customer_service_state.file_type, 'customer_service', true, send_resource_msg)
}

//发送资源消息
function send_resource_msg(response) {
  customer_service_state.loading = false
  send({
    content_type: customer_service_state.file_type,
    content: response,
  })
  customer_service_state.msg_list.push({ create_time: timeFormate(new Date()), content_type: customer_service_state.file_type, content: response, joiner_sign: global.adminMsg.id })
  nextTick(()=>{
    scrollToBottom()
  })
}

//处理消息
function handleGetRecordsResult(res) {

  let socket_data = []
  if (APPConfig.RSA === false) {
    socket_data = res
  } else {
    socket_data = global.axios.rsaDecode(res);
  }
  if (socket_data.room_id === customer_service_state.room_id && socket_data.type === 'content') {
    customer_service_state.msg_list.push({ create_time: socket_data.data.create_time, content_type: socket_data.data.content_type, content: socket_data.data.content, joiner_sign: socket_data.data.joiner_sign })
    nextTick(()=>{
      scrollToBottom()
    })
  } else {

    if(socket_data.type === 'content'){
      for (let i = 0; i < customer_service_state.room_list.length; i++) {
        if (customer_service_state.room_list[i]['room_id'] === socket_data.room_id) {
          customer_service_state.room_list[i].unread++
          nextTick(()=>{
            shortRoomList()
          })
        }
      }
    }else{
      //房间不存在。插入房间
      customer_service_state.room_list.unshift(socket_data.data)
      nextTick(()=>{
        shortRoomList()
      })
    }
  }
}

//下载文件
function download(file) {
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




//WebSocket相关
function init() {
  //如果存在就先关闭连接
  for (let i = 0; i < global.WebSockets.length; i++) {
    if (global.WebSockets[i].pageNumber === pageData.pageNumber) {
      global.WebSockets[i].Client.close()
    }
  }
  //初始化WebSocket
  customer_service_state.WebSocketClient = new WebSocket(APPConfig.WebSocketURL);
  customer_service_state.WebSocketClient.onmessage = onMessage;
  customer_service_state.WebSocketClient.onopen = onOpen;
  customer_service_state.WebSocketClient.onerror = onError;
  customer_service_state.WebSocketClient.onclose = onClose;
  global.WebSockets.push({ pageNumber: pageData.pageNumber, Client: customer_service_state.WebSocketClient })
}

function onOpen() {
  // 心跳检验
  customer_service_state.heartCheck = {
    timeout: 2000,//5秒
    timeoutObj: null,
    reset: function () {
      clearInterval(customer_service_state.heartCheck.timeoutObj);
    },
    start: function () {
      customer_service_state.heartCheck.timeoutObj = setInterval(function () {
        if (customer_service_state.WebSocketClient.readyState !== 1) {
          customer_service_state.heartCheck.reset()
          customer_service_state.WebSocketClient.close()
        } else {
          send({}, 'Y');// 发送心跳信息，保持不断
        }
      }, customer_service_state.heartCheck.timeout)
    }
  }
  customer_service_state.heartCheck.reset()
  customer_service_state.heartCheck.start()
}

function onError() {
  customer_service_state.connect_msg = 'error'
  clearInterval(customer_service_state.heartCheck.timeoutObj)
  customer_service_state.heartCheck = {}
  customer_service_state.WebSocketClient = {}
}

function onClose() {
  customer_service_state.connect_msg = 'close'
  clearInterval(customer_service_state.heartCheck.timeoutObj)
  customer_service_state.heartCheck = {}
  customer_service_state.WebSocketClient = {}
}

function onMessage(message) {
  if (message.data !== 'receive success') {
    handleGetRecordsResult(JSON.parse(message.data))
  }
}

function send(data, heart_beat = 'N') {
  if (heart_beat === 'N')
    data.joiner_type = 'worker'
  let send_data = global.axios.rsaEncode({
    heart_beat: heart_beat,
    room_id: customer_service_state.room_id,
    joiner_sign: global.adminMsg.id,
    messages:data
  })
  if(global.adminMsg.id){
    customer_service_state.WebSocketClient.send(JSON.stringify(send_data));
    customer_service_state.connect_msg = 'success'
  }
}



//辅助方法
function timeFormate(timeStamp) {
  let year = new Date(timeStamp).getFullYear();
  let month = new Date(timeStamp).getMonth() + 1 < 10 ? "0" + (new Date(timeStamp).getMonth() + 1) : new Date(timeStamp).getMonth() + 1;
  let date = new Date(timeStamp).getDate() < 10 ? "0" + new Date(timeStamp).getDate() : new Date(timeStamp).getDate();
  let hh = new Date(timeStamp).getHours() < 10 ? "0" + new Date(timeStamp).getHours() : new Date(timeStamp).getHours();
  let mm = new Date(timeStamp).getMinutes() < 10 ? "0" + new Date(timeStamp).getMinutes() : new Date(timeStamp).getMinutes();
  let ss = new Date(timeStamp).getSeconds() < 10 ? "0" + new Date(timeStamp).getSeconds() : new Date(timeStamp).getSeconds();
  return year + "-" + month + "-" + date + " " + " " + hh + ":" + mm + ':' + ss;
}
//展开大图
function collapse(url) {
  customer_service_state.isCollapse = true
  customer_service_state.now_image = url
}
const scrolledToBottom = ref(false);


// -------------------------------------左侧滚动事件---------------------------------------
// 定义滚动事件处理函数
const handleScroll = () => {
  const scrollContainer = document.getElementById('scrollContainer');
  const scrollTop = scrollContainer.scrollTop;
  const scrollHeight = scrollContainer.scrollHeight;
  const clientHeight = scrollContainer.clientHeight;
  if(scrollTop + clientHeight >= scrollHeight){
    getCustomerRoomList()
  }
};
//  -------------------------------------消息窗滚动到顶部------------------------------------
const scrolledToTop = ref(false);
const handleScrollToTOP = () => {
  scrolledToTop.value = msgScroll.value.scrollTop === 0;
  if (scrolledToTop.value === true) {
    getMsg()
    msgScroll.value.scrollTop = 50
  }
};


// -------------------------------------消息窗自动底部------------------------------------
const msgScroll = ref(null)
const scrollToBottom = () => {
  msgScroll.value.scrollTop = msgScroll.value.scrollHeight;
};

watch(msgScroll, () => {
  scrolledToTop.value = msgScroll.value.scrollTop === 0;
});


// 注册滚动事件监听器
onMounted(() => {
  const scrollContainer = document.getElementById('scrollContainer');
  scrollContainer.addEventListener('scroll', handleScroll);
  // 执行滚动到底部
});

// 在组件销毁时移除滚动事件监听器
onUnmounted(() => {
  const scrollContainer = document.getElementById('scrollContainer');
  // scrollContainer.removeEventListener('scroll', handleScroll);
});




</script>



<template>
  <div align="center" class="table">
    <span style="color: #1b95e5" v-if="customer_service_state.connect_msg === 'wait'">连接中...</span>
    <span style="color: #0a980a" v-if="customer_service_state.connect_msg === 'success'">连接成功...</span>
    <span style="color: red" v-if="customer_service_state.connect_msg === 'error'">连接异常，请关闭页面重试或联系平台管理员</span>
    <span style="color: #efb06c" v-if="customer_service_state.connect_msg === 'close'">连接已关闭，请关闭页面重试或联系平台管理员</span>
    <div class="chat">
      <div class="users">
        <div align="left" class="list" id="scrollContainer">

          <div :key="'room_list_' + customer_service_state.room.room_id" class="user" v-if="customer_service_state.room"
               :style="{ 'background-color': customer_service_state.room.checked ? '#c5c6c6' : '#f5f5f5' }">
            <div class="head_image">
              <img
                  :src="customer_service_state.room.customer_msg.hasOwnProperty('head_image') ? customer_service_state.room.customer_msg.head_image : '../../public/resource/image/head_img.png'"
                  alt="">
            </div>
            <div class="msg">
              <div class="name">{{ customer_service_state.room.customer_msg.name }}</div>
            </div>
            <div class="unread" v-if="customer_service_state.room.unread > 0">{{ customer_service_state.room.unread }}</div>
          </div>


          <div v-for="(item, index) in customer_service_state.room_list">
            <div  @click="check(item.room_id)" v-if="!customer_service_state.room || customer_service_state.room.room_id !== item.room_id"
                  :key="'room_list_' + index" class="user"
                  :style="{ 'background-color': item.checked ? '#c5c6c6' : '#f5f5f5' }">
              <div class="head_image">
                <img
                    :src="item.customer_msg.hasOwnProperty('head_image') ? item.customer_msg.head_image : '../../public/resource/image/head_img.png'"
                    alt="">
              </div>
              <div class="msg">
                <div class="name">{{ item.customer_msg.name }}</div>
              </div>
              <div class="unread" v-if="item.unread > 0">{{ item.unread }}</div>
            </div>
          </div>

        </div>
      </div>
      <div class="content" v-if="customer_service_state.room_id">
        <div class="msg" ref="msgScroll" @scroll="handleScrollToTOP">
          <div style="width:100%;height: 20px"></div>
          <div style="width: 100%" v-for="(item, index) in customer_service_state.msg_list" :key="'msg_list_' + index">
            <div class="left_user" v-if="item.joiner_sign !== global.adminMsg.id">
              <div align="left" style="float: left;margin-right: 12px">
                <img
                    :src="customer_service_state.customer_msg.hasOwnProperty('head_image') ? customer_service_state.customer_msg.head_image : '../../public/resource/image/head_img.png'">
              </div>
              <div>
                <div style="text-align: left;margin-bottom: 5px">{{ item.create_time }}</div>

                <div v-if="item.content_type === 'text'" style="white-space:pre-line;" class="left_content"
                     v-html="item.content"></div>
                <div v-if="item.content_type === 'image'" class="left_content">
                  <img :src="item.content.url" @click="collapse(item.content.url)" alt=""
                       style="width: 100px;height: auto;float: left">
                </div>
                <div v-if="item.content_type === 'media'" class="left_content">
                  <video :src="item.content.url" controls="controls"
                         style="width: 200px;height: 160px;float: left"></video>
                </div>
                <div v-if="item.content_type === 'file'" class="left_content">
                  <span style="color: #1890ff;cursor: pointer" @click="download(item.content.url)">{{ item.content.name }}</span>
                </div>
              </div>

            </div>

            <div class="right_user" v-if="item.joiner_sign === global.adminMsg.id">
              <div>
                <div style="text-align: right;margin-bottom: 5px">{{ item.create_time }}</div>
                <div v-if="item.content_type === 'text'" style="white-space:pre-line;" class="right_content"
                     v-html="item.content"></div>
                <div v-if="item.content_type === 'image'" class="right_content">
                  <img :src="item.content.url" @click="collapse(item.content.url)" alt=""
                       style="width: 100px;height: auto;float: right">
                </div>
                <div v-if="item.content_type === 'media'" class="right_content">
                  <video :src="item.content.url" controls="controls"
                         style="width: 200px;height: 160px;float: right"></video>
                </div>
                <div v-if="item.content_type === 'file'" class="left_content">
                  <span style="color: #1890ff;cursor: pointer" @click="download(item.content.url)">{{ item.content.name
                    }}</span>
                </div>
              </div>

              <div align="left" style="float: right;margin-left: 12px">
                <img :src="global.adminMsg.portrait">
              </div>
            </div>
            <div style="clear: both"></div>
            <!-- </div> -->
          </div>
          <div id="end" style="clear: both;width:100%;height: 20px"></div>
        </div>
        <div class="send">
          <div style="float: left;width: 70%;height: 100%;">
            <textarea v-model="customer_service_state.text_content"
                      style="padding: 6px;width: 100%;height: 100%;border-radius: 5px;background-color: #c8c8c8;resize:none;border: none;outline: none "></textarea>
          </div>
          <div
              style="float: right;width: 30%;height: 100%;padding: 0 10px;    display: flex;justify-self: center;justify-content: center;flex-direction: column;">
            <div
                style="width: 100%;height: 40px;line-height: 40px;background-color: #1b95e5;border-radius: 3px;color: white;font-size: 16px"
                @click="send_word()">
              发 送 消 息
            </div>
            <div style="width: 100%;line-height: 30px;margin-top: 5px;color: white;font-size: 12px;">
              <div style="width: 32%;height: 30px;margin-right: 2%;float: left;">

                <div style="width: 100%;height: 30px;background-color: #1b95e5;border-radius: 3px;"
                     @click="customer_service_state.file_type = 'image'">
                  <a-upload :customRequest="upload" :showUploadList="false"
                            :accept="customer_service_state.image_file_extends">
                    <span style="color: white">图&nbsp;&nbsp;&nbsp;片</span>
                  </a-upload>
                </div>

              </div>
              <div style="width: 32%;height: 30px;margin-right: 2%;float: left;">

                <div style="width: 100%;height: 30px;background-color: #1b95e5;border-radius: 3px;"
                     @click="customer_service_state.file_type = 'media'">
                  <a-upload :customRequest="upload" :showUploadList="false"
                            :accept="customer_service_state.media_file_extends">
                    <span style="color: white">音/视频</span>
                  </a-upload>
                </div>
              </div>
              <div style="width: 32%;height: 30px;float: left;">

                <div style="width: 100%;height: 30px;background-color: #1b95e5;border-radius: 3px;"
                     @click="customer_service_state.file_type = 'file'">
                  <a-upload
                      :customRequest="upload"
                      :showUploadList="false"
                  >
                    <span style="color: white">文&nbsp;&nbsp;&nbsp;件</span>
                  </a-upload>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="content" v-else>
      </div>
      <a-modal v-model:visible="customer_service_state.isCollapse" :centered="true" :closable="false" :footer="null"
               :keyboard="false" :maskClosable="false" width="60vw">
        <div style="padding: 20px;width: 100%">
          <img :src="customer_service_state.now_image" style="width:50vw;height: auto" alt="">
        </div>
        <div slot="footer" class="dialog-footer">
          <a-button class="button-class button-primary" style="right: 10px"
                    @click="customer_service_state.isCollapse = false">{{ global.findLanguage('关闭') }}</a-button>
        </div>
      </a-modal>
    </div>
  </div>
</template>

<style lang="less" scoped>
.table {
  height: calc(100vh - 176px) !important;
  overflow-y: auto;
  border-bottom: 1px solid #f0f0f0;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}

.chat {
  width: 70%;
  height: 90%;
  border: 1px solid gray;
  border-radius: 5px;
  margin-top: 10px;

  .users {
    margin: 0;
    width: 25%;
    height: 100%;
    padding: 10px 0 20px 0;
    overflow-y: auto;
    border-right: 1px solid gray;
    float: left;
    background-color: #eceaea;
    border-radius: 5px 0 0 5px;

    .list {
      width: 100%;
      height: 100%;
      overflow: scroll;

      .user {
        padding: 5px;
        height: 60px;

        .head_image {
          float: left;
          width: 48px;
          height: 48px;
          img {
            width: 48px;
            height: 48px;
          }
        }

        .msg {
          float: left;
          line-height: 50px;
          height: 50px;
          margin-left: 10px;
          width: 55%;
          .name {
            line-height: 30px;
            height: 30px;
            width: 95%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .unread {
          text-align: center;
          float: right;
          width: 20px;
          height: 20px;
          background-color: red;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          font-size: 12px;
        }
      }
    }
  }

  .content {
    padding: 0;
    margin: 0;
    width: 75%;
    height: 100%;
    overflow-y: auto;
    float: left;

    .highContent {
      min-height: 1000px;
    }

    .msg {
      width: 100%;
      height: 80%;
      border-bottom: 1px solid gray;
      padding: 10px;
      padding-top: 50px;
      overflow-y: scroll;
      background-color: #f5f5f5;
    }

    .left_user {
      min-height: 48px;
      float: left;
      margin-bottom: 15px;
      display: flex;
      justify-items: right;

      img {
        width: 48px;
        height: 48px;
      }
    }

    .left_content {
      float: left;
      background-color: white;
      max-width: 400px;
      min-height: 48px;
      border-radius: 3px;
      text-align: left;
      padding: 10px;
      width: inherit;
    }

    .right_user {
      min-height: 48px;
      float: right;
      margin-bottom: 15px;
      display: flex;
      justify-items: right;

      img {
        width: 48px;
        height: 48px;
      }
    }

    .right_content {
      float: right;
      background-color: white;
      max-width: 400px;
      min-height: 48px;
      border-radius: 3px;
      text-align: left;
      padding: 10px;
      width: inherit;
    }

    .send {
      width: 100%;
      height: 20%;
      padding: 10px 0 10px 10px;


    }
  }
}

.dialog-footer {
  line-height: 32px;
  margin-top: 20px;
  position: fixed;
  top: 13vh;
  right: 20vw;
  z-index: 9999;
}
</style>