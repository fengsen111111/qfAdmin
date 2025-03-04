<script setup>
  let props = defineProps(["pageData"]);
  const pageData = props.pageData;

  let emit = defineEmits(["openChildPage", "closeChildPage"]);

  function openChildPage(pageData) {
    emit('openChildPage', pageData);
  }

  function closeChildPage(page_key) {
    global.Modal.confirm({
      title: global.findLanguage('确定要返回吗？'),
      okText: global.findLanguage('确定'),
      cancelText: global.findLanguage('取消'),
      okType: 'primary',
      onOk: function () {
        emit('closeChildPage', page_key);
      }
    });
  }

  // 订单通知
  import { ref, onBeforeUnmount, inject } from 'vue';
  const global = inject('global').value;
  const timer = ref(null);
  const audioElement = ref(null); // 用来引用音频元素

  let isMd = ref(false);

  // 清除定时器
  onBeforeUnmount(() => {
    if (timer.value) {
      clearInterval(timer.value); // 正确使用timer.value
      timer.value = null;
      console.log('timer cleared', timer.value);
    }
  });

  // 获取权限列表
  function afterLogin() {
    global.axios.post('factory_system/Base/afterLogin', {}, global, false).then(res => {
      console.log('权限列表', res.menu);
      res.menu.map((item) => {
        if (item.label == '门店管理') {
          isMd.value = true;
        }
      });
    });
  }
  afterLogin();

  function fetchPrice() {
    // 全局通知
    global.axios.post('beverage/Order/afterSaleNotice', {}, global, false).then(res => {
      console.log('全局通知', res);
      if (res.count > 0) {
        console.log('开始播放音频');
        const audio = document.getElementById('myAudio');
        audio.play();
        audio.muted = false;
      }
    });
  }

  const is_btn = ref(false);

  // 轮询订单
  function cliTz() {
    is_btn.value = true;
    if (!timer.value) { // 防止重复创建定时器
      timer.value = setInterval(fetchPrice, 8000);
    }
  }
</script>

<template>
  <div>
    <!-- 快鹿送酒才有 -->
    <div v-if="isMd" style="position: fixed;top: 15px;right: 170px;width: 100px;height: 100px;z-index: 999;text-align: right;">
      <a-button @click="cliTz" type="primary">{{is_btn ? '已打开' : '打开订单通知'}}</a-button>
      <div v-show="false">
        <audio controls id="myAudio">
          <source
            src="https://beverage-upload.oss-cn-chengdu.aliyuncs.com/rich_text_file/2025218/66cde77qgj5acvb38u9tvtfu14edpr8s.mp3"
            type="audio/mpeg">
          您的浏览器不支持 audio 元素。
        </audio>
      </div>
    </div>
    <img alt="" src="/resource/image/index_img.png" style="width: 100%;max-height: 500px;margin-top: 5vh">
  </div>
</template>

<style scoped>
</style>
