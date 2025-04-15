<script setup>
  import { inject, onBeforeMount, reactive, ref } from 'vue'

  const global = inject('global').value
  let props = defineProps(['structure'])
  const component_state = reactive({
    placeholder: '',
    disabled: false,
  })
  onBeforeMount(() => {
    if (props.structure.config) {
      if (props.structure.config.placeholder)
        component_state.placeholder = props.structure.config.placeholder
      if (props.structure.config.disabled)
        component_state.disabled = props.structure.config.disabled
    }
  })


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
  }, 1000);
  // 生成随机颜色
  function getRandomColor() {
    const r = Math.floor(Math.random() * 150)
    const g = Math.floor(Math.random() * 150)
    const b = Math.floor(Math.random() * 150)
    return `rgb(${r},${g},${b})`
  }
  const verifyCode = ref(0)//验证状态
  function onChange(){
    console.log('变化',props.structure.value,captchaCode.value);
    if(props.structure.value==captchaCode.value){
      verifyCode.value = 1
    }else{
      verifyCode.value = 2
    }
  }

</script>

<template>
  <!-- <a-input
      v-model:value="props.structure.value"
      :disabled="component_state.disabled"
      :placeholder="component_state.placeholder"
      allow-clear/> -->
  <div>
    <div style="display: flex;justify-content: space-between;align-items: center;margin-top: -5px;">
      <a-input v-model:value="props.structure.value" :placeholder="global.findLanguage('图形验证码')"
        :style="{width:'calc(100% - 110px)',float:'left',}" @change="onChange" size="large" />
      <div @click="drawCaptcha" style="cursor: pointer;padding-top: 5px;">
        <canvas ref="canvasRef" width="100" height="40"></canvas>
      </div>
    </div>
    <span v-if="verifyCode==1" style="color: green;">验证通过！</span>
    <span v-else-if="verifyCode==2" style="color: red;">验证码有误！</span>
  </div>
</template>


<style scoped>

</style>