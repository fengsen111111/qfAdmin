<script setup>
  //websocket 不适配factory5.0
  import { inject, nextTick, onBeforeMount, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
  import { APPConfig } from "@/config";
  import { message } from 'ant-design-vue';

  import { emojiData } from "./emojiData.js";

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

  const component_state = reactive({
    init: {
      promotion: false,
      language_url: `/tinymce/langs/zh_CN.js`,
      language: 'zh_CN',
      selector: "#init",
      skin_url: `/tinymce/skins/ui/oxide`,
      height: '100%',
      content_css: `/tinymce/skins/content/default/content.css`,
      plugins: 'lists image media table wordcount link',
      toolbar: false,
      branding: false,
      menubar: false,
      statusbar: false,
      content_style: `
        body {
          padding: 8px; /* 默认可能是 16px，可以适当缩小 */
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f1f1f1;
        }
        p:first-child {
          margin-top: 0 !important;
        }
        p {
          margin: 0;
          padding: 0;
        }
        /* WebKit 滚动条美化 */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #999;
        }
      `, // 修改背景颜色
      forced_root_block: false,  // 禁止默认 <p>，防止 TinyMCE 自动包装内容
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
      },
      setup(editor) {
        editor.on('keydown', function (event) {
          // console.log('触发',event);
          if (event.key === 'Enter' && !event.ctrlKey && !event.shiftKey) {
            event.preventDefault();
            send_word(); // 替换为你自己的发送函数
          }
          if (event.key === 'Enter' && event.ctrlKey) {
            customer_service_state.text_content += '<br />'; // 添加换行符
          }
        });
      }
    },
  })


  let props = defineProps(["pageData"])
  const pageData = props.pageData

  let emit = defineEmits(["openChildPage", "closeChildPage"])
  const global = inject('global').value

  const customer_service_state = reactive({
    customer_msg: { joiner_sign: '', name: '', head_image: '' },
    customerListCurrentPage: 0,
    room_count: 0,
    room_id: '',
    room: null,
    room_list: [], //聊天房间
    msgObjImg: '',//当前聊天对象头像
    msgListCurrentPage: 0,
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
    getCustomerRoomList()//获取聊天房间列表
    _shopInfo()
  })

  // 查询与平台是否有房间


  const contents = ref([])//聊天话数据库
  // 获取聊天话术库
  function _lthsk(msg) {
    msg = msg.split('%')
    console.log('msg', msg);
    global.axios.post('decoration/TalkWords/sendTalkWord', {
      joiner_sign: store_id.value,
      key: msg[msg.length - 1]
    }, global, true).then((res) => {
      console.log('获取聊天话术库', res);
      contents.value = res.contents
    })
  }
  // 点击提示信息
  function handTs(text) {
    let arr = customer_service_state.text_content.split('%')
    arr[arr.length - 1] = text
    let str = ''
    arr.map((item) => {
      if (str == '') {
        str = item
      } else if (item == arr[arr.length - 1]) {
        // 最后一块内容不要%
        str = str + item
      } else {
        str = str + '%' + item
      }
    })
    customer_service_state.text_content = str//替换赋值回去
  }

  watch(
    () => customer_service_state.text_content,
    (newValue, oldValue) => {
      // console.log('输入内容变化了', oldValue, 'to', newValue);
      // 触发平台话术
      if (newValue.includes('%')) {
        _lthsk(newValue)
      }
    }
  )

  const shopList = ref([]) //商品列表
  //获取自己商品列表
  function _shopList() {
    global.axios.post('decoration/Goods/getGoodsList', {
      currentPage: 1,
      pageSize: 10,
      store_id: store_id.value
    }, global, true).then((res) => {
      console.log('获取自己商品列表', res.list);
      res.list.map((item) => {
        if (item.name.length > 10) {
          item.name = item.name.slice(0, 10) + '...'
        }
      })
      shopList.value = res.list
    })
  }
  const columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '图片',
      dataIndex: 'cover_image',
      key: 'cover_image',
    },
    {
      title: '商品分类',
      dataIndex: 'goods_type_name',
      key: 'goods_type_name',
    },
    {
      title: '商品品牌',
      dataIndex: 'brand_name',
      key: 'brand_name',
    },
    {
      title: '操作',
      dataIndex: '',
      key: 'action',
    },
  ]
  // 发送商品
  function send_shop(item) {
    if (customer_service_state.connect_msg !== 'success') {
      message.error('当前连接未建立，请稍等或关闭页面重连')
      return false
    }
    console.log('发送商品', item);
    let params = {
      id: item.id,//id
      name: item.name,//商品名称
      images: item.cover_image,//图片
      goods_type_name: item.goods_sizes[0].name,//规格名称
      price: item.goods_sizes[0].price,//价格
    }
    send({
      content_type: 'shop',
      content: JSON.stringify(params),
    })
    customer_service_state.msg_list.push({ create_time: timeFormate(new Date()), content_type: 'shop', content: JSON.stringify(params), joiner_sign: store_id.value })
    shopVisable.value = false

  }
  const store_id = ref('')//商家id/平台id

  // 房间去重
  function deduplicateByNicknameAndType(list) {
    const map = new Map();
    list.forEach(item => {
      const key = `${item.nickname}_${item.joiner_type}`;
      const current = map.get(key);

      if (!current) {
        map.set(key, item);
      } else {
        // 比较 active_time，保留时间晚的
        const oldTime = new Date(current.active_time).getTime();
        const newTime = new Date(item.active_time).getTime();
        if (newTime > oldTime) {
          map.set(key, item);
        }
      }
    });
    let arr = Array.from(map.values()).sort((a, b) => new Date(b.active_time) - new Date(a.active_time));
    arr = arr.filter((item) => item.new_content)// 过滤掉没有内容的房间
    return arr
  }

  //获取聊天房间列表
  function getCustomerRoomList() {
    store_id.value = localStorage.getItem("storeId")
    global.axios.post('decoration/CustomerService/getRoomList', {
      joiner_sign: store_id.value //自己id
    }, global, true).then((res) => {
      console.log('聊天房间数据', res.list);
      if (store_id.value == '1') {
        console.log('当前身份为平台客服！');
        customer_service_state.room_list = deduplicateByNicknameAndType(res.list)
        // 自动打开第一个人的聊天房间
        customer_service_state.room = res.list[0] //聊天房间
        customer_service_state.room_id = res.list[0].id //聊天房间id
        customer_service_state.msgObjImg = res.list[0].head_image//聊天对象头像
        cancelMsgNumber()// 去掉当前打开聊天框的消息红点
        _getMessage()
        _shopList()//获取商品信息
      } else {
        // 当前身份是商家,创建与平台客服的聊天
        global.axios.post('decoration/CustomerService/findRoomID', {
          joiner_signs: [store_id.value, '1']
        }, global, true).then((res_two) => {
          if (res_two.room_id) {
            console.log('有平台房间，处理数据');
            console.log('与平台房间号', res_two.room_id);
            customer_service_state.room_list = deduplicateByNicknameAndType(res.list)
            // 自动打开第一个人的聊天房间
            customer_service_state.room = res.list[0] //聊天房间
            customer_service_state.room_id = res.list[0].id //聊天房间id
            customer_service_state.msgObjImg = res.list[0].head_image//聊天对象头像

            cancelMsgNumber()// 去掉当前打开聊天框的消息红点
            _getMessage()
            _shopList()//获取商品信息
          } else {
            console.log('与平台无房间');
            // 创建与平台的房间
            global.axios.post('factory_system/WebSocketRoom/initRoom', {
              joiner_signs: store_id.value,
              joiners: [
                {
                  joiner_sign: store_id.value,
                  other_msg: {}
                },
                {
                  joiner_sign: '1',
                  other_msg: {}
                }
              ]
            }, global, true).then((res_three) => {
              console.log('与平台房间', res_three);
              getCustomerRoomList() //更新房间列表
            })
          }
        })
      }
    })
  }
  // 点击房间
  function checkRoom(item, room_id, head_image) {
    customer_service_state.msgListCurrentPage = 0//重置页数
    customer_service_state.msg_list = []//重置消息列表
    customer_service_state.room = item //聊天房间
    customer_service_state.room_id = room_id //聊天房间id
    customer_service_state.msgObjImg = head_image//聊天对象头像
    customer_service_state.room_list.map((item) => {
      if (item.id == room_id) {
        // 找到对应房间
        console.log('点击房间', item);
        customer_service_state.room = item//保存点击的房间
        customer_service_state.customer_msg = '最新一条消息'
        item.checked = true//设置状态 当前打开
        emojiVisable.value = false//关闭表情
        cancelMsgNumber()// 去掉当前打开聊天框的消息红点
        _getMessage(item.id) //获取聊天内容
        // 切换房间后自动聚焦  自动滚动到底部
        setTimeout(() => {
          scrollToBottom()
          textareaRef.value?.focus();
        }, 1000);
      } else {
        item.checked = false//其余全部关闭
      }
    })
  }
  // 去掉当前打开聊天框的消息红点
  function cancelMsgNumber() {
    console.log('当前房间id', customer_service_state.room_id);
    customer_service_state.room_list.map((item, index) => {
      if (item.id == customer_service_state.room_id) {
        customer_service_state.room_list[index].unread = 0
      }
    })

  }
  // 处理红包状态
  function hbStatus() {
    customer_service_state.msg_list.map((item, index) => {
      if (item.content_type == 'hb') {
        global.axios.post('decoration/RedBag/getRedBagStatus', {
          red_bag_id: item.content
        }, global, true).then((res) => {
          console.log('红包状态', res);// 红包状态 P支付中 S支付成功 F支付失败 G已领取 T已退回：支付中和支付失败的红包信息，不在接收方的聊天内容中展示  
          if (res.status == 'P') {
            customer_service_state.msg_list[index].content = customer_service_state.msg_list[index].content + '|支付中!'
          } else if (res.status == 'S') {
            customer_service_state.msg_list[index].content = customer_service_state.msg_list[index].content + '|红包来了!'
          } else if (res.status == 'F') {
            customer_service_state.msg_list[index].content = customer_service_state.msg_list[index].content + '|支付失败!'
          } else if (res.status == 'G') {
            customer_service_state.msg_list[index].content = customer_service_state.msg_list[index].content + '|已领取!'
          } else if (res.status == 'T') {
            customer_service_state.msg_list[index].content = customer_service_state.msg_list[index].content + '|已退回!'
          }
        })
      }
    })
  }
  // 获取聊天内容
  function _getMessage() {
    if (customer_service_state.msg_list.length === 0 || Math.ceil(customer_service_state.msg_count / 10) > customer_service_state.msgListCurrentPage) {
      customer_service_state.msgListCurrentPage++
      global.axios.post('decoration/CustomerService/getMessage', {
        room_id: customer_service_state.room_id, //房间id
        joiner_sign: store_id.value, //自己id
        currentPage: customer_service_state.msgListCurrentPage, //页数
        perPage: 10 //条数
      }, global, true).then((res) => {
        console.log('房间消息列表', res.list);
        customer_service_state.msg_count = res.count// 消息总数
        res.list.map((item) => {
          item.content = JSON.parse(item.content)
        })
        res.list = res.list.reverse()
        customer_service_state.msg_list.unshift(...res.list) //消息
        hbStatus()// 处理红包状态
        if (customer_service_state.msgListCurrentPage == 1) {
          // 当前页码等于1，自动滚动到底部
          setTimeout(() => {
            scrollToBottom()
          }, 1000);
        }
      })
    } else {
      message.warning('已无更多消息！');
    }
  }
  const emojiIndex = ref(0)//div轮播下标
  // 表情页切换
  function onEmojiChange(index) {
    emojiIndex.value = index
  }
  // 添加表情
  function addEmoji(emoji) {
    console.log('emoji', emoji);
    customer_service_state.text_content += emoji.alt;//表情追加到后面
    const emojiMap = {};
    emojiData.forEach(group => {
      group.forEach(emoji => {
        emojiMap[emoji.alt] = emoji.url;
      });
    });
    customer_service_state.text_content = customer_service_state.text_content.replace(/<p>/g, '').replace(/<\/p>/g, '');
    customer_service_state.text_content = customer_service_state.text_content.replace(/\[([^\]]+)\]/g, (match, alt) => {
      const url = emojiMap[`[${alt}]`];
      return url ? `<image src="${url}" style="width:18px;height:18px" />` : match;
    });
  }
  const emojiVisable = ref(false)//表情开关
  // 打开表情选择
  function xzBq() {
    console.log('选择表情');
    emojiVisable.value = !emojiVisable.value
  }
  const shopVisable = ref(false)//商品开关
  // 打开商品选择
  function xzSp() {
    // console.log('选择商品',store_id,global.adminMsg.id);
    if (store_id.value == global.adminMsg.id) {
      message.error('当前身份为平台客服！')
    } else {
      shopVisable.value = !shopVisable.value
    }
  }


  import QRCode from 'qrcode';
  const hbVisable = ref(false)//红包开关
  const hbMoney = ref(null)//红包金额
  const pay_Obj = ref({})//生成的支付数据
  let isPay = ref(false)  // 支付弹窗开关
  let qrCodeData = ref('')//存储生成的二维码数据URL
  let red_bag_id = ref('')
  let timer = ref(null);
  const totalSeconds = ref(5 * 60); // 5 分钟
  const minute = ref('05');
  const second = ref('00');
  const cz_type = ref('')//dpbzj 店铺保证金  flbzj 分类保证金
  const codeGq = ref(false);//二维码没失效
  // 打开红包弹框
  function fsHb() {
    console.log('打开发送红包');
    hbMoney.value = ''//打开前清空金额
    hbVisable.value = !hbVisable.value
  }
  // 发送红包 -支付
  function send_hb() {
    pay_Obj.value = {}//清空支付信息
    console.log('支付红包', hbMoney.value);
    if (!Number(hbMoney.value)) {
      message.error('请检查你的红包金额！')
      return false
    }
    global.axios.post('decoration/RedBag/sendRedBag', {
      handler_scene: 'pc',//app移动端 pc电脑端  
      sender_type: store_id.value == global.adminMsg.id ? 'company' : 'store',//store商家 user用户 company平台  
      sender_id: store_id.value, //商家id
      geter_id: customer_service_state.room.joiner_sign,//接收人id
      money: hbMoney.value,//红包金额
      trade_type: store_id.value == global.adminMsg.id ? 'BALANCE' : 'A_NATIVE',//T_APP微信  A_NATIVE支付宝   BALANCE余额支付
    }, global, true).then((res) => {
      console.log('发送红包', res);
      pay_Obj.value = res //储存支付信息
      if (res.resp_code == '0000') { // 0000  未开通余额账号；0001  未绑定提现银行卡；0002 余额不足，拉起支付，选择支付方式后重新调用发红包接口  
        message.error('未开通余额账号,前往前台开通！')
      } else if (res.resp_code == '0001') {
        message.error('未绑定提现银行卡,前往前台绑定！')
      } else if (res.resp_code == '0002') {
        message.error('余额不足！')
      }
      // 有支付信息
      if (res.pay_info) {
        red_bag_id.value = res.red_bag_id //记录红包id
        QRCode.toDataURL(res.pay_info)
          .then((url) => {
            console.log('生成的二维码', url); // 将生成的二维码图片URL存储到状态中
            qrCodeData.value = url
            hbVisable.value = false//关闭输入弹窗
            isPay.value = true
            timer.value = setInterval(updateTime, 1000);
          })
          .catch((err) => {
            console.error('生成二维码失败', err);
          });
      }
    })
  }
  // 支付倒计时
  const updateTime = () => {
    codeGq.value = false
    const mins = Math.floor(totalSeconds.value / 60);
    const secs = totalSeconds.value % 60;
    minute.value = String(mins).padStart(2, '0');
    second.value = String(secs).padStart(2, '0');
    if (totalSeconds.value > 0) {
      totalSeconds.value--;
    } else {
      clearInterval(timer.value);
      // 倒计时结束后的处理逻辑
      console.log('倒计时结束,二维码过期,清除二维码，关闭弹窗');
      codeGq.value = true
    }
  };
  // 刷新二维码
  function sxewm() {
    console.log('刷新二维码');
    send_hb()
  }
  // 支付弹框点击确定
  function handOKCode() {
    // 查询支付结果
    global.axios
      .post('decoration/Store/payTypePricesResult', {
        money_log_id: pay_Obj.value.money_log_id
      }, global)
      .then((res) => {
        // P支付中 S成功 F失败  
        if (res.result == 'P') {
          message.error('支付中')
        } else if (res.result == 'S') {
          message.success('支付成功')
          if (red_bag_id.value) {
            send({
              content_type: 'hb',
              content: red_bag_id.value,
            })
            customer_service_state.msg_list.push({ create_time: timeFormate(new Date()), content_type: 'hb', content: red_bag_id.value, joiner_sign: store_id.value })
            red_bag_id.value = ''
            isPay.value = false//关闭弹框
            hbVisable.value = false//关闭发红包弹框
          }
          isPay.value = false
        } else if (res.result == 'F') {
          message.error('支付失败')
        } else {
          message.error('未知')
        }
      })
  }
  // 领取红包 发送消息
  function editList(item) {
    const hb_id = item.content.split('|')[0]
    const hb_status = item.content.split('|')[1]
    if (hb_status == '红包来了!') {
      global.axios.post('decoration/RedBag/getRedBag', {
        red_bag_id: hb_id
      }, global, true).then((res) => {
        console.log('领取红包', res);
        send({
          content_type: 'hb',
          content: hb_id,
        })
        customer_service_state.msg_list.push({ create_time: timeFormate(new Date()), content_type: 'hb', content: hb_id + '|已领取！', joiner_sign: store_id.value })
      })
    }
  }

  const timeoutId = ref(null)// 用于存储超时id

  // 去除p 标签
  function removePTagsIfOnlyText(html) {
    let match = html.match(/^<p>([^<>]*)<\/p>$/i);
    console.log('match', match);

    return match ? match[1] : html;
  }

  //发送文字消息
  function send_word() {
    if (customer_service_state.connect_msg !== 'success') {
      message.error('当前连接未建立，请稍等或关闭页面重连')
      return false
    }
    if (!customer_service_state.text_content) {
      message.warning('请输入内容！');
      return false
    }

    // customer_service_state.text_content = removePTagsIfOnlyText(customer_service_state.text_content)
    // // 处理表情包
    const emojiMap = {};
    emojiData.forEach(group => {
      group.forEach(emoji => {
        emojiMap[emoji.alt] = emoji.url;
      });
    });
    customer_service_state.text_content = customer_service_state.text_content.replace(/\[([^\]]+)\]/g, (match, alt) => {
      const url = emojiMap[`[${alt}]`];
      return url ? `<image src="${url}" style="width:18px;height:18px" />` : match;
    });
    console.log('发送的消息内容', customer_service_state.text_content);
    send({
      content_type: 'text',
      content: customer_service_state.text_content,
    })
    customer_service_state.msg_list.push({ create_time: timeFormate(new Date()), content_type: 'text', content: customer_service_state.text_content, joiner_sign: store_id.value })
    customer_service_state.text_content = ''
    nextTick(() => {
      scrollToBottom()
    })
    // 每次发送消息之后，判断有没得定时器，有就清除，没得就添加
    if (timeoutId.value) {
      clearTimeout(timeoutId.value);
    }
    // 设置新的超时检查，如果超过30秒未完成，触发另一个函数
    timeoutId.value = setTimeout(() => {
      _zdhf()
    }, 30000); // 30秒后检查是否超时
  }
  // 自动回复
  function _zdhf() {
    console.log('超过时间，执行函数', customer_service_state.msg_list);
    let text = ''//用户最后一条消息
    customer_service_state.msg_list.map((item) => {
      // 确保不是自己发送的id
      if (item.joiner_sign !== store_id.value) {
        // 确保是文字内容
        if (item.content_type == 'text') {
          text = item.content
        }
      }
    })
    // console.log('用户发送的最后一条文字消息',text);
    global.axios.post('decoration/AutoAnswer/autoAnswer', {
      joiner_sign: store_id.value,
      room_id: customer_service_state.room_id,
      user_text_content: text
    }, global, true).then((res) => {
      console.log('自动回复', res);
      // 自动回复了，加一条消息在下面  ==》自动回复是后端那边发的消息，我这边不需要显示，app 推送了就行
      // if (res.length > 0) {
      //   customer_service_state.msg_list.push({ create_time: timeFormate(new Date()), content_type: 'text', content: res, joiner_sign: store_id.value })
      // }
    })
  }

  //上传资源
  function upload(options) {
    if (customer_service_state.connect_msg !== 'success') {
      message.error('当前连接未建立，请稍等或关闭页面重连')
      return false
    }
    customer_service_state.loading = true
    global.file.uploadFile(global, options.file, customer_service_state.file_type == 'video' ? 'media' : customer_service_state.file_type, 'customer_service', true, send_resource_msg)
  }

  //发送资源消息
  function send_resource_msg(response) {
    customer_service_state.loading = false
    send({
      content_type: customer_service_state.file_type,
      content: response.url,
    })
    customer_service_state.msg_list.push({
      create_time: timeFormate(new Date()),
      content_type: customer_service_state.file_type, content: response.url, joiner_sign: store_id.value
    })
    nextTick(() => {
      scrollToBottom()
    })
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
    customer_service_state.WebSocketClient.onmessage = onMessage;//接收到消息
    customer_service_state.WebSocketClient.onopen = onOpen;// 心跳检验
    customer_service_state.WebSocketClient.onerror = onError;//连接失败
    customer_service_state.WebSocketClient.onclose = onClose;//关闭连接
    global.WebSockets.push({ pageNumber: pageData.pageNumber, Client: customer_service_state.WebSocketClient })
  }
  // 心跳检验
  function onOpen() {
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
  // 连接错误
  function onError() {
    customer_service_state.connect_msg = 'error'
    clearInterval(customer_service_state.heartCheck.timeoutObj)
    customer_service_state.heartCheck = {}
    customer_service_state.WebSocketClient = {}
  }
  // 关闭连接
  function onClose() {
    customer_service_state.connect_msg = 'close'
    clearInterval(customer_service_state.heartCheck.timeoutObj)
    customer_service_state.heartCheck = {}
    customer_service_state.WebSocketClient = {}
  }
  // 发送消息
  function send(data, heart_beat = 'N') {
    // console.log('发送',data);
    if (heart_beat === 'N')
      data.joiner_type = 'worker' // worker客服  customer用户  
    // heart_beat == Y 是心跳 N 不是心跳
    let send_data = global.axios.rsaEncode({
      heart_beat: heart_beat, //是否心跳
      room_id: heart_beat == 'Y' ? '' : customer_service_state.room_id, //房间id
      joiner_sign: store_id.value, //用户id
      messages: data //数据
    })

    if (heart_beat == 'N') {
      console.log('房间信息', customer_service_state);
      // 发送消息，把当前房间号排序变道第一个
      msgOneEdit(customer_service_state.room_id)
    }

    if (store_id.value) {
      customer_service_state.WebSocketClient.send(JSON.stringify(send_data));
      customer_service_state.connect_msg = 'success'
    }
  }
  // 房间移动到最前
  function msgOneEdit(roomId) {
    let check = customer_service_state.room_list.filter((item) => item.id == roomId)
    customer_service_state.room_list.unshift(check[0])
    customer_service_state.room_list = [...new Set(customer_service_state.room_list)];
  }
  // 接收到消息
  function onMessage(message) {
    console.log('接收到消息', message);
    // 接收到消息
    if (message.data !== 'receive success') {
      handleGetRecordsResult(JSON.parse(message.data))
    }
  }
  //处理消息
  function handleGetRecordsResult(res) {
    let socket_data = []
    if (APPConfig.RSA === false) {
      socket_data = res
    } else {
      socket_data = global.axios.rsaDecode(res);
    }
    console.log('socket_data', socket_data);
    if (socket_data.room_id === customer_service_state.room_id && socket_data.type === 'content') {
      customer_service_state.msg_list.push({ create_time: socket_data.data.create_time, content_type: socket_data.data.content_type, content: JSON.parse(socket_data.data.content), joiner_sign: socket_data.data.joiner_sign })
      nextTick(() => {
        scrollToBottom()
      })
    } else {
      // 不是当前聊天对象的消息
      if (socket_data.type === 'content') {
        customer_service_state.room_list.map((item, index) => {
          if (item.id == socket_data.room_id) {
            customer_service_state.room_list[index].unread++
            customer_service_state.room_list[index].new_content = socket_data.data.content
            customer_service_state.room_list[index].new_content_type = socket_data.data.content_type
            customer_service_state.room_list[index].update_time = socket_data.data.create_time
          }
        })
      } else {
        //房间不存在。重新获取房间列表
        getCustomerRoomList()
      }
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
    // if (scrollTop + clientHeight >= scrollHeight) {
    //   getCustomerRoomList()
    // }
  };
  //  -------------------------------------消息窗滚动到顶部------------------------------------
  const scrolledToTop = ref(false);
  const handleScrollToTOP = () => {
    scrolledToTop.value = msgScroll.value.scrollTop === 0;
    if (scrolledToTop.value === true) {
      msgScroll.value.scrollTop = 50
      _getMessage()
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
  const textareaRef = ref(null);
  // 注册滚动事件监听器
  onMounted(() => {
    const scrollContainer = document.getElementById('scrollContainer');
    // 执行滚动到底部
    scrollContainer.addEventListener('scroll', handleScroll);
    // 自动获取输入框焦点
    setTimeout(() => {
      textareaRef.value?.focus();
    }, 1000);
  });
  // 在组件销毁时移除滚动事件监听器
  onUnmounted(() => {
    const scrollContainer = document.getElementById('scrollContainer');
  });

  const shopObj = ref({})//店铺信息
  // 店铺信息
  function _shopInfo() {
    shopObj.value = {}
    global.axios.post('decoration/Store/webGetStoreInfo', {
      store_id: localStorage.getItem("storeId")
    }, global)
      .then(res => {
        shopObj.value = res
      })
  }


  // 订单弹窗
  // 搜索项
  const searchConditions = ref([
    {
      "field": "id",
      "label": "订单编号",
      "value": "",
      "searchType": "=",
      "component": "Input"
    },
    {
      "field": "status",
      "label": "状态",
      "value": "",
      "searchType": "=",
      "component": "Select",
      "config": {
        "values": [
          {
            "value": "a",
            "label": "待支付"
          },
          {
            "value": "b",
            "label": "待拼成"
          },
          {
            "value": "c",
            "label": "待发货"
          },
          {
            "value": "d",
            "label": "待收货"
          },
          {
            "value": "e",
            "label": "已完成"
          }
        ]
      }
    },
    {
      "field": "create_time",
      "label": "下单时间 起",
      "value": "",
      "searchType": ">=",
      "component": "Date",
      "config": {
        "valueFormat": "YYYY-MM-DD HH:mm:ss"
      }
    },
    {
      "field": "create_time",
      "label": "下单时间 止",
      "value": "",
      "searchType": "<=",
      "component": "Date",
      "config": {
        "valueFormat": "YYYY-MM-DD HH:mm:ss"
      }
    },
    {
      "field": "address_name",
      "label": "收货人",
      "value": "",
      "searchType": "like",
      "component": "Input"
    },
    {
      "field": "address_mobile",
      "label": "收货电话",
      "value": "",
      "searchType": "=",
      "component": "Input"
    },
    {
      "field": "logistics_num",
      "label": "快递单号",
      "value": "",
      "searchType": "=",
      "component": "Input"
    },
    {
      "field": "store_id",
      "label": "商家",
      "value": "",
      "searchType": "=",
      "component": "Search",
      "config": {
        "valueUrl": "decoration/Store/findLabel?value=",
        "optionUrl": "decoration/Store/getRecords?key_word="
      }
    }
  ],)
  const orderVisable = ref(false)
  // 打开商品选择
  function xzDd() {
    // console.log('选择商品',store_id,global.adminMsg.id);
    if (store_id.value == global.adminMsg.id) {
      message.error('当前身份为平台客服！')
    } else {
      orderVisable.value = !orderVisable.value
    }
  }
  const orderList = ref([])
  //获取与客户订单列表
  function _orderList() {
    global.axios.post('decoration/Order/findTableRecords', {
      searchConditions: searchConditions.value,
      recycleStatus: false,
      sortConditions: []
    }, global, true).then((res) => {
      console.log('获取与客户订单列表', res.list);
      // res.list.map((item) => {
      //   if (item.name.length > 10) {
      //     item.name = item.name.slice(0, 10) + '...'
      //   }
      // })
      orderList.value = res.list
    })
  }
  _orderList()
  const columnsOrder = [
    {
      title: '订单编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '商家名称',
      dataIndex: 'store_name',
      key: 'store_name',
    },
    {
      title: '收货人',
      dataIndex: 'address_name',
      key: 'address_name',
    },
    {
      title: '操作',
      dataIndex: '',
      key: 'action',
    },
  ]
  function send_order(item) {
    console.log('发送订单');
    if (customer_service_state.connect_msg !== 'success') {
      message.error('当前连接未建立，请稍等或关闭页面重连')
      return false
    }
    console.log('发送订单', item);
    let params = {
      id: item.id,//id
      name: item.name,//商品名称
      store_name: item.store_name,//商家名称
      address_name: item.address_name,//收货人
    }
    send({
      content_type: 'order',
      content: JSON.stringify(params),
    })
    customer_service_state.msg_list.push({ create_time: timeFormate(new Date()), content_type: 'order', content: JSON.stringify(params), joiner_sign: store_id.value })
    orderVisable.value = false
  }

</script>
<template>
  <div align="center" class="table">
    <span style="color: #1b95e5" v-if="customer_service_state.connect_msg === 'wait'">连接中...</span>
    <span style="color: #000000;" v-if="customer_service_state.connect_msg === 'success'">
      <!-- 连接成功... -->
      {{customer_service_state.room.nickname}}
    </span>
    <span style="color: red" v-if="customer_service_state.connect_msg === 'error'">连接异常，请关闭页面重试或联系平台管理员</span>
    <span style="color: #efb06c" v-if="customer_service_state.connect_msg === 'close'">连接已关闭，请关闭页面重试或联系平台管理员</span>
    <div class="chat">
      <div class="users">
        <div align="left" class="list" id="scrollContainer">
          <!-- 房间列表 -->
          <div v-for="(item, index) in customer_service_state.room_list" :key="item.id">
            <div @click="checkRoom(item,item.id,item.head_image)" class="user"
              :style="{ 'background-color': item.id==customer_service_state.room_id ? '#c5c6c6' : '#f5f5f5' }">
              <div class="head_image">
                <img v-if="item.head_image" :src="item.head_image" alt="">
                <!-- 平台 -->
                <img v-else-if="item.joiner_type=='c'" src="../../../../public/resource/image/head_img.png" alt="">
                <!-- 用户或者商家 -->
                <img v-else src="../../../../public/resource/image/userImg.png" alt="">
              </div>
              <div class="msg">
                <div class="name">
                  {{ item.nickname }}
                  <span v-if="item.joiner_sign=='1'"
                    style="border:1px solid #0a980a;color: #0a980a;border-radius: 2px;font-size: 8px;position: relative;top: -2px;padding: 0px;">官方</span>
                </div>
                <div style="line-height: 18px;font-size: 12px;opacity: 0.6;">
                  <span v-if="item.new_content_type=='text'" class="col666666">
                    <span class="ellipsis-html" v-html="JSON.parse(item.new_content)"></span>
                  </span>
                  <span v-else-if="item.new_content_type=='image'" class="col666666">[图片]</span>
                  <span v-else-if="item.new_content_type=='czztw'" class="col666666">[话题]</span>
                  <span v-else-if="item.new_content_type=='map'" class="col666666">[地址]</span>
                  <span v-else-if="item.new_content_type=='video'" class="col666666">[视频]</span>
                  <span v-else-if="item.new_content_type=='shop'" class="col666666">[商品]</span>
                  <span v-else-if="item.new_content_type=='hb'" class="col666666">[红包]</span>
                  <span v-else-if="item.new_content_type=='questions'" class="col666666">[问题列表]</span>
                  <span v-else-if="item.new_content_type=='question'" class="col666666">[自动回复问题]</span>
                  <span v-else class="col666666"> </span>
                </div>
              </div>
              <div class="unread" v-if="item.unread > 0">{{ item.unread }}</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 具体内容 -->
      <div class="content" style="position: relative;" v-if="customer_service_state.room_id">
        <!-- 顶部用户名只有5%高度 -->
        <!-- <div
          style="width:100%;padding:5px 10px;text-align: left;background-color: #f5f5f5;border-bottom: 1px solid #d4d4d7;font-size: 20px;">
          {{customer_service_state.room.nickname}}</div> -->
        <div class="msg" ref="msgScroll" @scroll="handleScrollToTOP">
          <div style="width: 100%" v-for="(item, index) in customer_service_state.msg_list" :key="'msg_list_' + index">
            <!-- 红包单独判断 -->
            <!-- {{item.content_type}} -->
            <template v-if="item.content_type =='hb'">
              <template
                v-if="item.content.split('|')[1]=='红包来了!'||item.content.split('|')[1]=='已领取!'||item.content.split('|')[1]=='已退回!'">
                <!-- id不相同，别人发的消息 -->
                <div class="left_user" v-if="item.joiner_sign != store_id">
                  <div align="left" style="float: left;margin-right: 12px">
                    <img v-if="customer_service_state.msgObjImg" :src="customer_service_state.msgObjImg" alt="">
                    <img v-else src="../../../../public/resource/image/userImg.png" alt="">
                  </div>
                  <div>
                    <div style="text-align: left;margin-bottom: 5px">{{ item.create_time }}</div>
                    <!-- 消息类型 text：文字 image: 图片 video：视频 map：地址  hb：红包  -->
                    <div v-if="item.content_type === 'hb'" class="left_content"
                      style="display: flex;justify-content: space-between;background-color: #FEB351;color: #fff;">
                      <div></div>
                      <div @click="editList(item)" style="display: flex;align-items: center">
                        <img style="width: 45px;height: 48px;"
                          src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025211/skb8e51i2jiireo79oftb5dv69etqcjv.png"
                          mode="">
                        <div class="ml20 col-white font-bold text30 no-wrap">{{item.content.split('|')[1]}}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 自己消息 -->
                <div class="right_user" v-else>
                  <div>
                    <div style="text-align: right;margin-bottom: 5px">{{ item.create_time }}</div>
                    <div v-if="item.content_type === 'hb'" class="left_content"
                      style="display: flex;justify-content: space-between;background-color: #FEB351;color: #fff;">
                      <div></div>
                      <div style="display: flex;align-items: center">
                        <img style="width: 45px;height: 48px;"
                          src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025211/skb8e51i2jiireo79oftb5dv69etqcjv.png"
                          mode="">
                        <div class="ml20 col-white font-bold text30 no-wrap">{{item.content.split('|')[1]}}</div>
                      </div>
                    </div>
                  </div>
                  <div align="left" style="float: right;margin-left: 12px">
                    <img :src="global.adminMsg.portrait">
                  </div>
                </div>
              </template>
            </template>
            <!-- 不是红包类型 -->
            <template v-else>
              <!-- id不相同，别人发的消息 -->
              <div class="left_user" v-if="item.joiner_sign != store_id">
                <div align="left" style="float: left;margin-right: 12px">
                  <img v-if="customer_service_state.msgObjImg" :src="customer_service_state.msgObjImg" alt="">
                  <img v-else src="../../../../public/resource/image/userImg.png" alt="">
                </div>
                <div>
                  <div style="text-align: left;margin-bottom: 5px">{{ item.create_time }}</div>
                  <!-- 消息类型 text：文字 image: 图片 video：视频 map：地址  hb：红包  -->
                  <div v-if="item.content_type === 'text'" style="white-space:pre-line;" class="left_content"
                    v-html="item.content"></div>
                  <div v-if="item.content_type === 'image'" class="left_content">
                    <img :src="item.content" @click="collapse(item.content)" alt=""
                      style="width: 100px;height: auto;float: left">
                  </div>
                  <div v-if="item.content_type === 'video'" class="left_content">
                    <video :src="item.content" controls="controls"
                      style="width: 200px;max-height: 160px;float: left"></video>
                  </div>
                  <div @click="openMap(JSON.parse(item.content))" v-if="item.content_type === 'map'"
                    class="left_content">
                    <div class="p20">{{JSON.parse(item.content).name}}</div>
                    <img
                      src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025211/sw95ted63vfihjsuwabkeq6doajr2bu7.png"
                      style="width: 300px;height: auto;" mode="widthFix">
                  </div>
                  <div v-if="item.content_type === 'hb'" class="left_content"
                    style="display: flex;justify-content: space-between;background-color: #FEB351;color: #fff;">
                    <div></div>
                    <div @click="editList(item)" style="display: flex;align-items: center">
                      <img style="width: 45px;height: 48px;"
                        src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025211/skb8e51i2jiireo79oftb5dv69etqcjv.png"
                        mode="">
                      <div class="ml20 col-white font-bold text30 no-wrap">{{item.content.split('|')[1]}}</div>
                    </div>
                  </div>
                  <div v-if="item.content_type === 'shop'" class="left_content" style="display: flex;">
                    <img :src="JSON.parse(item.content).images" alt="" style="width: 100px;height: auto;float: left">
                    <div style="font-weight: bold;margin-left: 10px;">
                      <div style="font-size: 18px;">
                        {{JSON.parse(item.content).name.length>15?JSON.parse(item.content).name.slice(0,15)+'...':JSON.parse(item.content).name}}
                      </div>
                      <div style="color: #666666;font-size: 14px;">规格:{{JSON.parse(item.content).goods_type_name}}
                      </div>
                      <div style="color: #FF0000;font-size: 14px;">￥{{JSON.parse(item.content).price}}</div>
                    </div>
                  </div>
                  <!--  -->
                </div>
              </div>
              <!-- 自己消息 -->
              <div class="right_user" v-else>
                <div>
                  <div style="text-align: right;margin-bottom: 5px">{{ item.create_time }}</div>
                  <!-- 消息类型 text：文字 image: 图片 video：视频 map：地址  hb：红包  -->
                  <div v-if="item.content_type === 'text'" style="display: flex;justify-content: space-between;">
                    <div></div>
                    <div style="white-space:pre-line;" class="left_content" v-html="item.content"></div>
                  </div>
                  <div v-if="item.content_type === 'image'" class="left_content">
                    <img :src="item.content" @click="collapse(item.content)" alt=""
                      style="width: 100px;height: auto;float: left">
                  </div>
                  <div v-if="item.content_type === 'video'" class="left_content">
                    <video :src="item.content" controls="controls"
                      style="width: 200px;max-height: 160px;float: right"></video>
                  </div>
                  <div v-if="item.content_type === 'map'" class="left_content">
                    <div class="p20">{{JSON.parse(item.content).name}}</div>
                    <img
                      src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025211/sw95ted63vfihjsuwabkeq6doajr2bu7.png"
                      style="width: 300px;height: auto;" mode="widthFix">
                  </div>
                  <div v-if="item.content_type === 'hb'" class="left_content"
                    style="display: flex;justify-content: space-between;background-color: #FEB351;color: #fff;">
                    <div></div>
                    <div style="display: flex;align-items: center">
                      <img style="width: 45px;height: 48px;"
                        src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/goods/2025211/skb8e51i2jiireo79oftb5dv69etqcjv.png"
                        mode="">
                      <div class="ml20 col-white font-bold text30 no-wrap">{{item.content.split('|')[1]}}</div>
                    </div>
                  </div>
                  <div v-if="item.content_type === 'shop'" class="left_content" style="display: flex;">
                    <img :src="JSON.parse(item.content).images" alt="" style="width: 100px;height: auto;float: left">
                    <div style="font-weight: bold;margin-left: 10px;">
                      <div style="font-size: 18px;">
                        {{JSON.parse(item.content).name.length>15?JSON.parse(item.content).name.slice(0,15)+'...':JSON.parse(item.content).name}}
                      </div>
                      <div style="color: #666666;font-size: 14px;">规格:{{JSON.parse(item.content).goods_type_name}}
                      </div>
                      <div style="color: #FF0000;font-size: 14px;">￥{{JSON.parse(item.content).price}}</div>
                    </div>
                  </div>
                </div>
                <div align="left" style="float: right;margin-left: 12px">
                  <img v-if="store_id=='1'" :src="global.adminMsg.portrait">
                  <img v-else :src="shopObj.logo">
                </div>
              </div>
            </template>
            <div style="clear: both"></div>
            <!-- </div> -->
          </div>
          <div id="end" style="clear: both;width:100%;height: 20px"></div>
        </div>
        <div style="position: absolute;top: 75%;width: 100%;" v-if="contents.length">
          <div style="overflow-x: auto;text-align: left;white-space: pre;">
            <span @click="handTs(item)" v-for="item in contents" :key="item">&nbsp;&nbsp;{{item}}&nbsp;&nbsp;</span>
          </div>
        </div>
        <!-- 发送模块 -->
        <div class="send">
          <!-- 消息内容块（包含表情包） -->
          <div style="float: left;width: 70%;height: 100%;">
            <editor id="init" v-model="customer_service_state.text_content" :init="component_state.init">
            </editor>
            <!-- 表情选择 -->
            <div v-if="emojiVisable" class="" style="position: relative;top: -238px;">
              <div v-for="(page, pageIndex) in emojiData" :key="pageIndex">
                <div v-if="emojiIndex==pageIndex"
                  style="display: grid;grid-template-columns: repeat(7, minmax(0, 1fr));">
                  <div v-for="(emoji, emojiIndex) in page" :key="emojiIndex" @click="addEmoji(emoji)"
                    class="text-center">
                    <img :src="emoji.url" class="w40 h40 radius10" mode="" />
                  </div>
                </div>
              </div>
              <!-- 切换的点点 -->
              <div style="display: flex;margin-top: 10px;">
                <div style="display: flex;margin: 0 auto;">
                  <div v-for="(page, pageKey) in emojiData" :key="pageKey" @click="onEmojiChange(pageKey)">
                    <div v-if="emojiIndex==pageKey"
                      style="width: 10px;height: 10px;border-radius: 50%;background-color: #1b95e5;margin: 0px 10px;">
                    </div>
                    <div v-else
                      style="width: 10px;height: 10px;border-radius: 50%;background-color: #c8c8c8;margin: 0px 10px;">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 右边 -->
          <div
            style="float: right;width: 30%;height: 100%;padding: 0 10px;    display: flex;justify-self: center;justify-content: center;flex-direction: column;">
            <a-button type="primary" @click="send_word()">发送消息</a-button>
            <div
              style="display: grid;grid-template-columns: repeat(3, minmax(0, 1fr));grid-column-gap: 5px; align-items: center;margin: 5px 0px;">
              <a-button type="primary" @click="xzBq()">表情</a-button>
              <a-button type="primary" @click="xzSp()">商品</a-button>
              <a-button type="primary" @click="xzDd()">订单</a-button>
            </div>
            <div
              style="display: grid;grid-template-columns: repeat(3, minmax(0, 1fr));grid-column-gap: 5px; align-items: center;">
              <a-button type="primary" @click="customer_service_state.file_type = 'image'">
                <a-upload :customRequest="upload" :showUploadList="false"
                  :accept="customer_service_state.image_file_extends">
                  <span style="color: #fff;font-size: 12px;">图片</span>
                </a-upload>
              </a-button>
              <a-button type="primary" @click="customer_service_state.file_type = 'video'">
                <a-upload :customRequest="upload" :showUploadList="false"
                  :accept="customer_service_state.media_file_extends">
                  <span style="color: #fff;font-size: 12px;">视频</span>
                </a-upload>
              </a-button>
              <a-button type="primary" @click="fsHb()">红包</a-button>
            </div>
          </div>
        </div>
      </div>
      <!-- 没内容 -->
      <div class="content" v-else>
      </div>
      <!-- 弹窗 -->
      <a-modal v-model:visible="customer_service_state.isCollapse" @cancel="customer_service_state.isCollapse = false"
        :footer="null">
        <div style="padding: 20px;width: 100%">
          <img :src="customer_service_state.now_image" style="width:100%;height: auto" alt="">
        </div>
      </a-modal>
      <!-- 选择订单弹框 -->
      <a-modal v-model:visible="orderVisable" title="选择订单" width="800px" :footer="null">
        <div style="width: 100%">
          <a-table :dataSource="orderList" :columns="columnsOrder">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'cover_image'">
                <img @click="collapse(record.cover_image[0])" :src="record.cover_image"
                  style="width: 40px;height: 40px;" alt="">
              </template>
              <template v-else-if="column.key === 'action'">
                <!-- 操作 -->
                <a-button @click="send_order(record)" type="primary" size="small">发送订单</a-button>
              </template>
            </template>
          </a-table>
        </div>
      </a-modal>
      <!-- 选择商品弹框 -->
      <a-modal v-model:visible="shopVisable" title="选择商品" width="800px" :footer="null">
        <div style="width: 100%">
          <a-table :dataSource="shopList" :columns="columns">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'cover_image'">
                <img @click="collapse(record.cover_image[0])" :src="record.cover_image"
                  style="width: 40px;height: 40px;" alt="">
              </template>
              <template v-else-if="column.key === 'action'">
                <!-- 操作 -->
                <a-button @click="send_shop(record)" type="primary" size="small">发送商品</a-button>
              </template>
            </template>
          </a-table>
        </div>
      </a-modal>
      <!-- 发送红包 -->
      <a-modal v-model:visible="hbVisable" title="发送红包" @ok="send_hb">
        <div style="width: 100%">
          <label>红包金额:</label>
          <a-input v-model:value="hbMoney" placeholder="请输入红包金额" />
        </div>
      </a-modal>
      <a-modal v-model:visible="isPay" :centered="true" @ok="handOKCode" :keyboard="false" ok-text="已支付"
        style="z-index: 999999;" cancel-text="放弃" :maskClosable="false">
        <div class="container">
          <div class="pcHeader">
            <img class="logoImg"
              src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/shopImg/2025421/tjgvd9d3mr771js7f2o6hqqjsegs2p9b.png"
              alt="Logo" title="Logo" />
            <div class="headerTitle">收银台</div>
          </div>
          <div class="price">
            <span class="priceUnit">¥</span>
            <span class="priceNumber">{{hbMoney}}</span>
          </div>
          <div class="payTimeRemaining">
            <span class="payTxt">支付剩余时间</span>
            <span class="time">
              <span class="time">
                <span class="timeItem">{{ minute }}</span>
                <span class="timeSplit">:</span>
                <span class="timeItem">{{ second }}</span>
              </span>
            </span>
          </div>
          <div class="payType">
            <ul class="payTab">
              <li class="payItem activePayItem" style="--theme: #0B5AFE" data-type="alipay">
                <img class="payIcon"
                  src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/coverImg/2025421/1lbj3114n1mkb3mt71ak14ajhv5gc5nh.png" />
                <span class=" payTitle">支付宝</span>
              </li>
            </ul>
            <div class="payContent">
              <img :src="qrCodeData" alt="支付二维码" :style="{opacity: codeGq?'0.1':'1'}" />
              <div v-if="codeGq" style="position: relative;top: -100px;color: #000000;">
                二维码已失效
                <div style="color: #ff0000;cursor: pointer;" @click="sxewm">刷新</div>
              </div>
              <div class="conetentTxt"><span class="payDesc"><span id="payName">使用支付宝App扫码完成支付</span></span>
              </div>
            </div>
          </div>
        </div>
      </a-modal>
    </div>
  </div>
</template>

<style lang="less" scoped>
  :deep(p) {
    margin: 0 !important;
  }

  .container {
    width: 100%;
    max-width: 1080px;
    height: 100%;
    max-height: 720px;
    position: relative;
    text-align: center;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 14px;
  }

  .pcHeader {
    margin-left: 24px;
    align-items: center;
    display: flex;
    flex-direction: row;
  }

  .logoImg {
    object-fit: contain;
    height: 30px;
    margin-right: 10px;
    max-width: 160px;
  }

  .headerTitle {
    font-size: 18px;
    font-weight: 500;
    color: #050505;
  }

  .price {
    font-size: 30px;
    font-weight: 700;
    margin-bottom: 10px;
    font-family: DINAlternate, DINAlternate-Bold;
    color: #333333;
  }

  .priceUnit {
    font-size: 20px;
    font-weight: 400;
    margin-right: 4px;
  }

  .priceNumber {
    font-size: 24px;
    font-weight: 500;
    margin-left: 4px;
  }

  .payTimeRemaining {
    margin-bottom: 6px;
  }

  .payTxt {
    color: #999;
    margin-right: 11px;
  }

  .time {
    font-weight: 400;
    font-size: 14px;
    color: #000000;
  }

  .timeItem {
    background: rgba(0, 0, 0, 0.04);
    border-radius: 2px;
    padding: 2px;
  }

  .timeSplit {
    margin: 0 4px;
  }

  .payTab {
    margin-top: 20px;
    display: flex;
    border-bottom: 1px solid #e9e6e6;
  }

  .payItem {
    padding: 10px 20px;
    background: #ffffff;
    font-size: 14px;
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
    margin-right: 20px;
    box-sizing: border-box;
  }

  .payItem:last-of-type {
    margin-right: 0;
  }

  .payIcon {
    height: 20px;
    object-fit: contain;
    margin-right: 10px;
  }

  .activePayItem {
    border-radius: 6px 6px 0px 0px;
    border: 1px solid #e9e6e6;
    border-bottom: none;
  }

  .payItem:first-of-type::after {
    position: absolute;
    content: '推荐';
    right: -18px;
    top: -11px;
    width: 36px;
    height: 22px;
    text-align: center;
    line-height: 22px;
    border-radius: 10px 0 10px 0;
    background: #E74E4E;
    color: #ffffff;
    z-index: 999;
    font-size: 12px;
  }

  .activePayItem::before {
    position: absolute;
    content: '';
    right: 0;
    bottom: -1px;
    width: 100%;
    height: 3px;
    background: #ffffff;
    z-index: 999;
  }

  .payContent {
    display: flex;
    width: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .conetentTxt {
    text-align: center;
    font-weight: 400;
    color: #000000;
    /* margin-bottom: 55px; */
  }



  .ellipsis-html {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    /* 限制最多显示 3 行 */
    overflow: hidden;
    max-height: 100px;
    /* 适当调整高度 */
    word-break: break-word;
  }

  .table {
    height: calc(100vh - 300px) !important;
    height: 100%;
    overflow-y: auto;
    /* border-bottom: 1px solid #f0f0f0; */
    /* border-top: 1px solid #f0f0f0; */
    padding-top: 10px;
  }

  .chat {
    /* width: 70%; */
    height: 95%;
    border: 1px solid #d4d4d7;
    border-radius: 5px;
    margin-top: 10px;

    .users {
      margin: 0;
      width: 25%;
      height: 100%;
      /* padding: 10px 0 20px 0; */
      padding-top: 10px;
      overflow-y: auto;
      border-right: 1px solid #d4d4d7;
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
            overflow: hidden;

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
        height: 79%;
        border-bottom: 1px solid #d4d4d7;
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
        /* min-height: 48px; */
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
        /* min-height: 48px; */
        border-radius: 3px;
        text-align: left;
        padding: 10px;
        width: inherit;
      }

      .send {
        width: 100%;
        height: 20%;
        padding: 10px 0 0px 10px;

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