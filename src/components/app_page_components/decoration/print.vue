<script setup>
    import { ref } from 'vue'
    import axios from 'axios'
    import md5 from 'blueimp-md5'

    const loading = ref(false)
    const imgUrl = ref('')
    const message = ref('')

    // 你的快递100参数
    const key = 'HnrBlYFT6507'
    const secret = '2e0240fb828d4f77ae8df65afb2c3ec9'

    const handleGetOrderImage = async () => {
        loading.value = true
        message.value = ''

        const paramObj = {
            type: 10,//	业务类型，默认为10
            partnerId: 'J00868317776', // 电子面单客户账户或月结账号，需贵司向当地快递公司网点申请（参考电子面单申请指南）； 是否必填该属性，
            partnerKey: 'St0Hu2j9',//电子面单账户密码
            recManName: '张三',
            recManMobile: '13900000000', // 注意是字符串
            recManPrintAddr: '北京市海淀区长春桥路',
            sendManName: '李四',
            sendManMobile: '13900000000',
            sendManPrintAddr: '广东深圳市南山区科技南十二路2号金蝶软件园B10',
            tempid: 'e41bbe3a3c764409a8562b2715f656b2',//模板id
            count: 1,
            cargo: '物品名称-文件',
            callBackUrl: ''
        }

        const paramStr = JSON.stringify(paramObj)
        const sign = md5(paramStr + key + secret).toUpperCase()

        const formData = new URLSearchParams()
        formData.append('param', paramStr)
        formData.append('key', key)
        formData.append('sign', sign)
        formData.append('t', Date.now().toString())

        try {
            const res = await axios.post('https://poll.kuaidi100.com/printapi/printtask.do', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            if (res.data.result) {
                imgUrl.value = res.data.data.imgUrl || res.data.data.imgBase64
                message.value = '电子面单图片获取成功！'
            } else {
                message.value = '获取失败：' + res.data.message
            }
        } catch (err) {
            message.value = '请求异常：' + err.message
        } finally {
            loading.value = false
        }
    }
    let myUrl = 'https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/shopImg/202541/uw5h8uj4cuwrtqbg51jj14jtd1p7dt2f.png'

    function dy() {
        const printWindow = window.open('', '_blank')
        printWindow.document.write(`
        <html>
            <head>
                <title>打印图片</title>
            </head>
            <body style="margin:0;padding:0;">
                <img src="${myUrl}" style="width:100%;" onload="window.print();window.close();" />
            </body>
        </html>
    `)
        printWindow.document.close()
    }
</script>

<template>
    <div>
        <button @click="handleGetOrderImage" :disabled="loading">
            {{ loading ? '请求中...' : '获取电子面单图片' }}
        </button>

        <div v-if="imgUrl" style="margin-top: 20px;">
            <img :src="imgUrl" alt="电子面单" style="width: 300px; border: 1px solid #ccc;" />
            <button style="margin-top: 10px;" @click="window.print()">打印此图片</button>
        </div>

        <p>{{ message }}</p>
        <div @click="dy">打印</div>
    </div>
</template>

<style scoped>
    button {
        background-color: #2d8cf0;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    }

    button:disabled {
        background-color: #aaa;
        cursor: not-allowed;
    }
</style>