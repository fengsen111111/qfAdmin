<script setup>
    import { ref, watchEffect, nextTick, onMounted, reactive } from 'vue'
    import axios from 'axios'
    import md5 from 'blueimp-md5'
    import JsBarcode from 'jsbarcode'
    import { ExclamationCircleFilled, CheckCircleFilled, } from "@ant-design/icons-vue";

    import { getLodop } from './LodopFuncs.js'

    const azqk = ref('')//
    const printerList = ref([]) //所有可用打印机
    const intervalId = setInterval(() => {
        if (window.LODOP && typeof window.LODOP !== 'undefined') {
            console.log('lodop已安装');
            azqk.value = 'lodop已安装'
            const count = LODOP.GET_PRINTER_COUNT()
            for (let i = 0; i < count; i++) {
                printerList.value.push(LODOP.GET_PRINTER_NAME(i))
            }
            console.log('所有可用打印机', printerList.value);

            clearInterval(intervalId); // 停止定时器
        } else {
            azqk.value = 'lodop未安装'
            console.log('lodop未安装');
        }
    }, 2000);
    // Lodop 实例
    let LODOP = null

    // 刷新
    function sure() {
        if (window.LODOP && typeof window.LODOP !== 'undefined') {
            console.log('lodop已安装');
            azqk.value = 'lodop已安装'
            clearInterval(intervalId); // 停止定时器
        } else {
            azqk.value = 'lodop未安装'
            console.log('lodop未安装');
        }
    }

    // 初始化 Lodop
    function initLodop() {
        setTimeout(() => {
            LODOP = getLodop()//调用getLodop获取LODOP对象
        }, 2000);
    }
    function dy() {
        const printContent = document.getElementById('electronicWaybill').innerHTML;
        let html = `
        <html>
            <head>
                <title>电子面单</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        background-color: #fff;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                    }
                    .print-container {
                        max-width:360px;
                        padding-top:60px;
                    } 
                </style>
            </head>
            <body>
                <div class="print-container">
                    ${printContent}
                </div>
            </body>
        </html>`
        LODOP.PRINT_INITA('')  // 打印初始化
        // LODOP.SET_PRINTER_INDEX("HPRT N31BT");//按名称指定打印机
        LODOP.SET_PRINT_MODE("PRINTQUALITY", 1);
        LODOP.SET_PRINT_PAGESIZE(1, 1030, 1200, 'mm')  // 设置纸张大小
        // LODOP.SET_SHOW_MODE('NP_NO_RESULT', true)  // 设置显示模式
        LODOP.ADD_PRINT_HTML('0', '5', '100%', '100%', html)
        LODOP.PREVIEW() // 预览（预览页面可以进行下载）
        LODOP.PRINT()// 直接打印
        visPrint.value = false//关闭打印弹窗
        ksDy.value = true//打开打印提示框
        setTimeout(() => {
            ksDy.value = false//关闭打印提示框
        }, 3000);
    }
    function yldyj() {
        const printContent = document.getElementById('electronicWaybill').innerHTML;
        let html = `
        <html>
            <head>
                <title>电子面单</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        background-color: #fff;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                    }
                    .print-container {
                        max-width:360px;
                        padding-top:60px;
                    } 
                </style>
            </head>
            <body>
                <div class="print-container">
                    ${printContent}
                </div>
            </body>
        </html>`
        LODOP.PRINT_INITA('')  // 打印初始化
        // LODOP.SET_PRINTER_INDEX("HPRT N31BT");//按名称指定打印机
        LODOP.SET_PRINT_MODE("PRINTQUALITY", 1);
        LODOP.SET_PRINT_PAGESIZE(1, 1030, 1200, 'mm')  // 设置纸张大小
        // LODOP.SET_SHOW_MODE('NP_NO_RESULT', true)  // 设置显示模式
        LODOP.ADD_PRINT_HTML('0', '5', '100%', '100%', html)
        LODOP.PREVIEW() // 预览（预览页面可以进行下载）
    }


    // 页面挂载后初始化 Lodop
    onMounted(() => {
        initLodop()
    })

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
            printAddr: '北京市海淀区长北京市海淀区长春', // 注意是字符串
        },
        cargo: '350ml苏打水 原味-恒大 604334534554345*24',
        count: 1,
        callBackUrl: '',
        weight: '1.5'
    })

    const handleGetOrderImage = async () => {
        dy()
        return false
        const printContent = document.getElementById('electronicWaybill').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
        <html>
            <head>
                <title>电子面单</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #fff;
                    }
                    .print-container {
                        max-width:340px;
                        margin:10px 0px;
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
    const barcode = ref()
    const barcodeTwo = ref()

    function generateBarcode(kuaidinum) {
        nextTick(() => {
            JsBarcode(barcode.value, kuaidinum, {
                format: "CODE128",  // 常用条形码格式
                lineColor: "#000",
                width: 1.6,
                height: 30,
                displayValue: true  // 显示订单号文本
            })
            JsBarcode(barcodeTwo.value, kuaidinum, {
                format: "CODE128",  // 常用条形码格式
                lineColor: "#000",
                width: 1.5,
                height: 40,
                displayValue: true  // 显示订单号文本
            })
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

    // 打印快递单弹窗
    const visible = ref(false)
    const form = reactive({
        key1: '',
    });
    const formref = ref(null);
    async function handleOk() {
        try {
            const values = await formref.value.validateFields();
            console.log('Success:', values);
            visible.value = false
            visJc.value = true
        } catch (errorInfo) {
            console.log('Failed:', errorInfo);
        }
    }
    // 检查弹窗
    const visJc = ref(false)
    // 去打单发货
    function goDdfh() {
        visJc.value = false
        visPrint.value = true
    }

    // 打印快递单
    const visPrint = ref(false)
    const zddyj = ref('HPRT N31BT')//指定打印机 
    const kdmc = ref('极兔速递')//快递名称 kdmc

    // 开始打印提示
    const ksDy = ref(false)
    import { LoadingOutlined } from '@ant-design/icons-vue';
    import { defineComponent, h } from 'vue';
    const indicator = h(LoadingOutlined, {
        style: {
            fontSize: '50px',
        },
        spin: true,
    });
</script>

<template>
    <div>
        <!-- <button @click="handleGetOrderImage" :disabled="loading">
            {{ loading ? '请求中...' : '打印' }}
        </button> -->
        <button @click="visible=true">打印快递单</button>
        <!--  -->
        <a-modal v-model:visible="visible" title="打印快递单" @ok="handleOk" okText="打印快递单">
            <a-form ref="formref" :model="form" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
                <a-form-item label="发货地址" name="key1" :rules="[{ required: true, message: '请选择发货地址!' }]">
                    <a-select ref="select" v-model:value="form.key1" placeholder="请选择发货地址">
                        <a-select-option value="1">安徽省滁州市天长市天长市科创园</a-select-option>
                        <a-select-option value="2">四川省成雕塑王企鹅王企鹅</a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>
        <!-- 打单前检查 -->
        <a-modal v-model:visible="visJc" :footer="null">
            <div>
                <div style="text-align: center;">
                    <div style="font-size: 18px;font-weight: bold;">开始打单前，您需要完成以下设置</div>
                    <div style="color: #666666;font-size: 12px;">若对设置有疑问，你可查看多多课堂教程或联系人工客服</div>
                </div>
                <div style="padding:20px;background-color: #f7f8fa;border-radius: 5px;margin-top: 10px;">
                    <div
                        style="display: flex;justify-content: space-between;border-bottom: 1px solid #e0e0e0;padding-bottom: 10px;">
                        <div>
                            <div style="font-weight: bold;">发货地址设置</div>
                            <div style="color: #666666;font-size: 12px;">共2条发货地址</div>
                        </div>
                        <div style="display: flex;align-items: center;color: #15b464;">
                            <CheckCircleFilled style="color: #15b464;margin-right: 5px;" />
                            已设置
                        </div>
                    </div>
                    <div style="display: flex;justify-content: space-between;padding-top: 10px;align-items: center;">
                        <div>
                            <div style="font-weight: bold;">打印组件设置</div>
                            <div v-if="azqk=='lodop已安装'">
                                <div style="color: #666666;font-size: 12px;">已安装并开启打印组件</div>
                                <div style="color: #666666;font-size: 12px;">若未添加打印机，请添加打印机</div>
                            </div>
                            <div v-else>
                                <div style="color: #fb8015;font-size: 12px;">若已安装打印组件，请重启打印组件并点击刷新</div>
                                <div style="color: #666666;font-size: 12px;">如未安装请先 安装打印组件;若未添加打印机，请添加打印机</div>
                            </div>
                        </div>
                        <div v-if="azqk=='lodop已安装'">
                            <div style="display: flex;align-items: center;color: #15b464;">
                                <CheckCircleFilled style="color: #15b464;margin-right: 5px;" />
                                已设置
                            </div>
                        </div>
                        <div v-else style="text-align: right;">
                            <div style="display: flex;justify-content: space-between;">
                                <div></div>
                                <div style="display: flex;align-items: center;color: #fb8015;">
                                    <ExclamationCircleFilled style="color: #fb8015;margin-right: 5px;" />
                                    未设置
                                </div>
                            </div>
                            <div style="border: 1px solid #5779d2;border-radius: 4px;color: #5779d2;padding: 0px 5px;">
                                安装打印组件</div>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 10px;display: flex;">
                    <div style="display: flex;margin: 0 auto;cursor: pointer;">
                        <div v-if="azqk=='lodop已安装'">
                            <div @click="goDdfh"
                                style="background-color: #5779d2;color: #fff;border-radius: 4px;padding: 2px 15px;">
                                去打单发货</div>
                        </div>
                        <div v-else @click="sure()"
                            style="background-color: #5779d2;color: #fff;border-radius: 4px;padding: 2px 15px;">刷新</div>
                        <div @click="visJc=false"
                            style="border-radius: 4px;padding: 2px 15px;margin-left: 10px;border: 1px solid #d4d4d7;">
                            稍后再说</div>
                    </div>
                </div>
            </div>
        </a-modal>
        <!-- 打印快递单2 -->
        <a-modal v-model:visible="visPrint" title="打印快递单" :footer="null" width="800px">
            <div>
                <div>
                    <div style="display: flex;align-items: center;">
                        <div style="width: 100px;">快递名称</div>
                        <a-select ref="select" v-model:value="kdmc" placeholder="请选择快递"
                            style="width: 200px;margin-right: 10px;">
                            <a-select-option :value="item" v-for="item in ['中通快递','顺丰快递','顺丰同城','极兔速递']"
                                :key="item">{{item}}</a-select-option>
                        </a-select>
                    </div>
                    <div style="display: flex;margin-top: 10px;">
                        <div style="width: 100px;">面单余额</div>
                        <div>33</div>
                    </div>
                    <!-- <div style="display: flex;align-items: center;margin-top: 10px;">
                        <div style="width: 100px;">选择打印机</div>
                        <div>
                            <a-select ref="select" v-model:value="zddyj" placeholder="请选择打印机"
                                style="width: 200px;margin-right: 10px;">
                                <a-select-option :value="item" v-for="item in printerList"
                                    :key="item">{{item}}</a-select-option>
                            </a-select>
                        </div>
                        <div @click="yldyj">关于打印设置</div>
                    </div> -->
                    <div style="display: flex;align-items: center;margin-top: 10px;">
                        <div style="width: 100px;">设置打印机</div>
                        <div @click="yldyj">点击进行打印设置</div>
                    </div>
                    <table class="table_two" style="margin-top: 10px;">
                        <tr style="white-space:nowrap">
                            <th scope="col">收件人</th>
                            <th scope="col">联系方式</th>
                            <th scope="col">收件地址</th>
                            <th scope="col">备注</th>
                            <th scope="col">快递单号</th>
                        </tr>
                        <tr>
                            <td>张三</td>
                            <td>18481020570</td>
                            <td>中国 福建省福州市鼓楼区</td>
                            <td>备注1备注111</td>
                            <td>12321312312312</td>
                        </tr>
                    </table>
                </div>
                <div style="margin-top: 10px;display: flex;">
                    <div style="display: flex;cursor: pointer;justify-content: space-between;width: 100%;">
                        <div></div>
                        <div style="display: flex;align-items: center;">
                            <div style="font-weight: bold;">共1笔订单，取号成功1单</div>
                            <div @click="handleGetOrderImage"
                                style="background-color: #5779d2;color: #fff;border-radius: 4px;padding: 2px 15px;margin-left: 10px;">
                                开始打印</div>
                            <div @click="visPrint=false"
                                style="border-radius: 4px;padding: 2px 15px;margin-left: 10px;border: 1px solid #d4d4d7;">
                                取消</div>
                        </div>
                    </div>
                </div>
            </div>
        </a-modal>
        <!-- ksDy -->
        <a-modal v-model:visible="ksDy" :footer="null" width="400px" :closable="false">
            <div style="text-align: center;padding: 20px 0px;">
                <a-spin :indicator="indicator" />
                <div style="margin-top: 15px;font-size: 18px;">正在打印快递单</div>
                <div style="margin-top: 5px;color: #666666;font-size: 16px;">请勿关闭本页面</div>
            </div>
        </a-modal>
        <div v-show="false">
            <!-- 电子面单展示区域 -->
            <div id="electronicWaybill">
                <div style="border: 1px solid black;">
                    <div
                        style="text-align: center;border-bottom: 1px dashed black;padding: 10px 20px;font-size: 35px;font-weight: bold">
                        {{ resule.data[0].bulkpen }}
                    </div>
                    <div style="display: flex;">
                        <div>
                            <div style="text-align: center;border-bottom: 1px dashed black;padding: 0px;">
                                <!-- <canvas id="barcode" style="text-align:center;margin-top:20px;"></canvas> -->
                                <svg ref="barcode"></svg>
                            </div>
                            <div style="display: flex;border-bottom: 1px dashed black;align-items: center;">
                                <div style="font-size: 24px;padding: 10px;">收</div>
                                <div style="padding: 10px;">
                                    <div style="display: flex;justify-content: space-between;">
                                        <div>{{paramObj.recMan.name}}</div>
                                        <div>{{paramObj.recMan.mobile}}</div>
                                    </div>
                                    <div style="max-width: 194px;">{{paramObj.recMan.printAddr}}</div>
                                </div>
                            </div>
                            <div style="display: flex;align-items: center;">
                                <div style="font-size: 24px;padding: 10px;">寄</div>
                                <div style="padding: 10px;">
                                    <div style="display: flex;justify-content: space-between;align-items: center;">
                                        <div>{{paramObj.sendMan.name}}</div>
                                        <div>{{paramObj.sendMan.mobile}}</div>
                                    </div>
                                    <div style="max-width: 194px;">{{paramObj.sendMan.printAddr}}</div>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; border-left: 1px solid black;">
                            <!-- 右边栏，保持flex布局，占据固定宽度，和左边高度一样 -->
                            <div
                                style="flex-shrink: 0; width: 120px; display: flex; align-items: center; justify-content: center; position: relative;">
                                <!-- 旋转的条形码内部绝对定位，不打乱布局 -->
                                <div
                                    style="position: absolute; top: 50%; left: 40%; transform: translate(-50%, -50%) rotate(90deg);">
                                    <svg ref="barcodeTwo"></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 10px;">{{paramObj.cargo}}</div>
            </div>
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

    .table_two {
        border-collapse: collapse;
        border: 1px solid #ebebeb;
        border-radius: 4px;
        font-size: 14px;
        letter-spacing: 1px;
        text-align: left;
    }

    .table_two tr:nth-child(odd) {
        background-color: #f7f8fa;
    }

    .table_one th,
    td {
        border: 1px solid #e9e9e9;
        padding: 10px 60px;
    }

    .table_two th,
    td {
        border: 1px solid #e9e9e9;
        padding: 10px 20px;
    }
</style>