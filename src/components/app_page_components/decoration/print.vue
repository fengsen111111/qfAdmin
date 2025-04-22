<script setup>
    import { ref } from 'vue'
    import axios from 'axios'
    import md5 from 'blueimp-md5'

    const loading = ref(false)
    const message = ref('')

    // ✅ 你需要根据自己申请的参数替换这些值：
    const key = 'HnrBlYFT6507'
    const secret = '2e0240fb828d4f77ae8df65afb2c3ec9'
    const customer = '你的customer'
    const siid = '打印机编号'

    const handlePrint = async () => {
        loading.value = true
        message.value = '正在提交打印请求...'

        const param = {
            com: 'yuantong', // 快递公司编码
            to: {  // 
                name: '张三',
                mobile: '13800000000',
                address: '广东省广州市天河区某小区',
            },
            from: {
                name: '李四',
                mobile: '13900000000',
                address: '上海市徐汇区某写字楼',
            },
            count: 1, //包裹总数量。
            cargo: '商品名称', //物品名称
            payType: 1, //支付方式： SHIPPER：寄方付（默认） CONSIGNEE：到付 MONTHLY：月结 THIRDPARTY：第三方支付
            expType: 1, //产品类型： 标准快递（默认） 顺丰标快（陆运） EMS经济 等
            partnerId: '快递公司客户号', //电子面单客户账户或月结账号，需贵司向当地快递公司网点申请（参考电子面单申请指南）； 是否必填该属性，
            partnerKey: '月结账号或授权码', //电子面单密码，需贵司向当地快递公司网点申请； 是否必填该属性
            net: '网点编码', //收件网点名称,由快递公司当地网点分配， 若使用淘宝授权填入（taobao），使用菜鸟授权填入（cainiao), 使用京东授权填入（jdalpha),使用拼多多授权填入(pinduoduoWx)，使用抖音授权填入(douyin)，使用快手授权填入(kuaishou)。 是否必填该属性，
            checkMan: '', //电子面单承载快递员名，需贵司向当地快递公司网点申请；
            code: '', //电子面单承载编号，需贵司向当地快递公司网点申请； 是否必填该属性，
            siid, // 打印机编号
            callBackUrl: '', // 可选
        }

        const paramStr = JSON.stringify(param)
        const sign = md5(paramStr + key + secret).toUpperCase()

        const formData = new URLSearchParams()
        formData.append('param', paramStr)
        formData.append('key', key)
        formData.append('sign', sign)
        formData.append('t', Date.now().toString())

        try {
            const res = await axios.post('https://poll.kuaidi100.com/printapi/printtask.do', formData)
            if (res.data.result) {
                message.value = '打印任务发送成功！快递单号：' + res.data.nu
            } else {
                message.value = '打印失败：' + res.data.message
            }
        } catch (err) {
            message.value = '请求异常：' + err.message
        } finally {
            loading.value = false
        }
    }
</script>

<template>
    <div class="print-wrap">
        <button @click="handlePrint" :disabled="loading">
            {{ loading ? '打印中...' : '点击打印电子面单' }}
        </button>
        <p style="margin-top: 10px; color: #666">{{ message }}</p>
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