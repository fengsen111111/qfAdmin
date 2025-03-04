<template>
  <div>
    <a-button type="primary" @click="handleOpen">查看</a-button>
    <a-modal
      :visible="visible"
      title=""
      :width="widthModel"
      :footer="null"
      @cancel="cancel"
    >
      <div class="h5box">
        <iframe
          :src="context"
          frameborder="0"
          scrolling="yes"
          style="width: 100%; height: 500px; border: none"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { onBeforeMount, ref } from "vue";
// 传递数据
const props = defineProps(["structure"]);
// 打开弹框
// ---------------- 页面单独参数------------------------------
let visible = ref(false);
let widthModel = ref("700px"); //默认宽度
let context = ref("https://www.baidu.com/");
// let context = ref('')
onBeforeMount(()=>{
	if (props.structure) {
		console.log('赋值');
		const {width} = props.structure.config
        widthModel.value = width?width:widthModel.value //默认700px
		const {value} = props.structure.value
		context.value = value?value:context.value  //判断 无连接就跳百度
	}
})

function cancel() {
  console.log("取消");
  visible.value = false;
}
function handleOk() {
  visible.value = false;
  console.log("数据", location.value);
}
function handleOpen() {
  visible.value = true;
}

if (window.addEventListener) {
  window.addEventListener("load", fixIframe, false);
  window.addEventListener("resize", fixIframe, false);
} else {
  window.attachEvent("onload", fixIframe);
  window.attachEvent("onresize", fixIframe);
}

function fixIframe() {
  var box = document.querySelector(".h5box");
  var frame = box.querySelector("iframe");
  var screenWidth = window.outerWidth || document.documentElement.clientWidth;
  var screenHeight =
    window.outerHeight || document.documentElement.clientHeight;
  var movieWidth = parseInt(frame.width || frame.style.width);
  var movieHeight = parseInt(frame.height || frame.style.height);
  var vScale = screenHeight / movieHeight;
  var hScale = screenWidth / movieWidth;

  var scale = Math.min(vScale, hScale, 1);

  var frameLeft = (movieWidth * (scale - 1)) / 2;
  var frameTop = (movieHeight * (scale - 1)) / 2;

  frame.style.transform = "scale(" + scale + ")";
  frame.style.webkitTransform = "scale(" + scale + ")";
  frame.style.mozTransform = "scale(" + scale + ")";
  frame.style.left = frameLeft;
  frame.style.top = frameTop;
  frame.style.margin = "auto";
  frame.style.position = "relative";
  box.style.width = "100%";
  box.style.height = movieHeight * scale;
  box.style.overflow = "hidden";
  box.style.minHeight = movieHeight * scale;
  box.style.textAlign = "center";
}
</script>

<style>
.scrollable-content {
  scrollbar-width: 2px; /* 设置滚动条的宽度 */
  scrollbar-color: #888 #f1f1f1; /* 滑块颜色与轨道颜色 */
}
</style>