<script setup>
    import { ref, watchEffect, nextTick } from 'vue'
    import axios from 'axios'
    import md5 from 'blueimp-md5'
    import JsBarcode from 'jsbarcode'

    const loading = ref(false)
    const imgUrl = ref('')
    const message = ref('')

    // 你的快递100参数
    const key = 'HnrBlYFT6507'
    const secret = '2e0240fb828d4f77ae8df65afb2c3ec9'

    const paramObj = ref({
        partnerId: 'J00868317776', // 电子面单客户账户或月结账号，需贵司向当地快递公司网点申请（参考电子面单申请指南）； 是否必填该属性，
        partnerKey: 'St0Hu2j9',//电子面单账户密码
        kuaidicom: 'jtexpress',//
        recMan: {
            name: '李四',
            mobile: '13900000001', // 注意是字符串
            printAddr: '北京市海淀区长北京市海淀区长春桥路春桥路北京市海淀区长春桥路', // 注意是字符串
        },
        sendMan: {
            name: '张三',
            mobile: '13900000000', // 注意是字符串
            printAddr: '北京市海淀区长北京市海淀区长春桥路春桥路北京市海淀区长春桥路', // 注意是字符串
        },
        cargo: '350ml苏打水 原味-恒大 604334534554345*24',
        count: 1,
        callBackUrl: '',
        weight: '1.5'
    })

    const handleGetOrderImage = async () => {
        const printContent = document.getElementById('electronicWaybill').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
        <html>
            <head>
                <title>打印电子面单</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #fff;
                    }
                    .print-container {
                        padding: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    ${printContent}
                </div>
            </body>
        </html>
    `);
        printWindow.document.close();
        printWindow.print();
        return false
        loading.value = true
        message.value = ''

        const paramStr = JSON.stringify(paramObj.value)
        const t = Date.now().toString()
        const sign = md5(paramStr + t + key + secret).toUpperCase()

        const formData = new URLSearchParams()
        formData.append('param', paramStr)
        formData.append('key', key)
        formData.append('sign', sign)
        formData.append('t', t)
        formData.append('method', 'getElecOrder')

        try {
            const res = await axios.post('/api/kuaidi', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            if (res.data.result) {
                console.log('结果', res.data.data);
                resule.value = res.data
                generateBarcode(resule.value.data[0].kuaidinum)
            } else {
                message.value = '获取失败：' + res.data.message
            }
        } catch (err) {
            message.value = '请求异常：' + err.message
        } finally {
            loading.value = false
        }
    }

    function generateBarcode(kuaidinum) {
        nextTick(() => {
            const barcodeElement = document.getElementById("barcode")
            if (barcodeElement) {
                JsBarcode(barcodeElement, kuaidinum, {
                    format: "CODE128",
                    width: 2,
                    height: 40,
                    displayValue: true,
                    fontSize: 16
                });
            } else {
                console.error("Barcode element not found")
            }
            const barcodeRig = document.getElementById("barcodeRig")
            if (barcodeRig) {
                JsBarcode(barcodeRig, kuaidinum, {
                    format: "CODE128",
                    width: 2,
                    height: 40,
                    displayValue: true,
                    fontSize: 16
                });
            } else {
                console.error("Barcode element not found")
            }
        });
    }

    // 接口返回数据
    const resule = ref({
        "taskId": "CC26146E421464A3D736802C1B8FD37F",
        "message": "成功",
        "result": true,
        "status": "200",
        "data": [
            {
                "pkgName": "廊坊临空转运中心",
                "sameCity": "1",
                "kuaidinum": "JT0016322576092",
                "bulkpen": "710  R702-00 026",
                "sameProv": "1",
                "kdComOrderNum": "01745833873064PT1bzn"
            }
        ]
    })
    generateBarcode('JT0016322576092')

</script>

<template>
    <div>
        <button @click="handleGetOrderImage" :disabled="loading">
            {{ loading ? '请求中...' : '获取电子面单图片' }}
        </button>
        <div>
            <!-- 电子面单展示区域 -->
            <div id="electronicWaybill">
                <div style="border: 1px solid black;">
                    <div
                        style="text-align: center;border-bottom: 1px dashed black;padding: 10px 20px;font-size: 35px;font-weight: bold">
                        {{ resule.data[0].bulkpen }}
                    </div>
                    <div style="display: flex;">
                        <div>
                            <div style="text-align: center;border-bottom: 1px dashed black;padding: 0px 10px;">
                                <canvas id="barcode" style="text-align:center;margin-top:20px;"></canvas>
                            </div>
                            <div style="display: flex;border-bottom: 1px dashed black;height: 125px;">
                                <div style="font-size: 24px;padding: 20px;">收</div>
                                <div style="padding: 10px;width: 100%;">
                                    <div style="display: flex;justify-content: space-between;">
                                        <div>{{paramObj.recMan.name}}</div>
                                        <div>{{paramObj.recMan.mobile}}</div>
                                    </div>
                                    <div style="width: 240px;">{{paramObj.recMan.printAddr}}</div>
                                </div>
                            </div>
                            <div style="display: flex;">
                                <div style="font-size: 24px;padding: 20px;">寄</div>
                                <div style="padding: 10px;width: 100%;">
                                    <div style="display: flex;justify-content: space-between;">
                                        <div>{{paramObj.sendMan.name}}</div>
                                        <div>{{paramObj.sendMan.mobile}}</div>
                                    </div>
                                    <div style="width: 240px;">{{paramObj.sendMan.printAddr}}</div>
                                </div>
                            </div>
                        </div>
                        <div style="border-left: 1px solid black;width: 120px;height: 320px;padding: 5px;">
                            <div style="transform: rotate(90deg)">
                                <canvas id="barcodeRig" style="text-align:center;margin-top:20px;"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 10px;">{{paramObj.cargo}}</div>
            </div>
            <div v-if="imgUrl" style="margin-top: 20px;">
                <img :src="imgUrl" alt="电子面单" style="width: 300px; border: 1px solid #ccc;" />
                <button style="margin-top: 10px;" @click="window.print()">打印此图片</button>
            </div>
            <p>{{ message }}</p>
        </div>
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