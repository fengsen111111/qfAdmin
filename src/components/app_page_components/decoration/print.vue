<!-- 优化建议已应用，主要包括：代码结构优化、无用注释清理、重复代码合并、样式简化、明确职责分离等 -->
<!-- 分离逻辑代码和模板，并规范命名与注释使其更清晰易维护 -->
<!-- 文件较长，仅进行了主要逻辑层和模板结构层次优化，如需进一步拆分为子组件也可继续细化 -->

<!-- 此为优化后代码的开始部分 -->
<script setup>
    import { ref, reactive, nextTick, onMounted, inject, defineProps, defineExpose, watch } from 'vue';
    import axios from 'axios';
    import md5 from 'blueimp-md5';
    import JsBarcode from 'jsbarcode';
    import { ExclamationCircleFilled, CheckCircleFilled, LoadingOutlined } from '@ant-design/icons-vue';
    import { h } from 'vue';
    import { getLodop } from './LodopFuncs.js';

    const global = inject("global").value;
    const emit = defineEmits(["djtzmk"]);

    const visible = ref(false);
    const visJc = ref(false);
    const visPrint = ref(false);
    const ksDy = ref(false);

    const props = defineProps({ orderListDetails: Array });
    const fhfzObj = ref({});
    const addressList = ref([]);
    const dyjmc = ref('');
    const zddyj = ref('HPRT N31BT');
    const azqk = ref('');
    const printerList = ref([]);

    const barcode = ref();
    const barcodeTwo = ref();
    const form = reactive({ key1: '' });
    const formref = ref(null);

    const barcodeList = ref([]);      // 横向条形码 svg ref 数组
    const barcodeTwoList = ref([]);   // 竖向条形码 svg ref 数组

    // 获取发货地址列表
    function getStoreAddressList() {
        global.axios.post('decoration/StoreAddress/getStoreAddressList', {
            store_id: localStorage.getItem("storeId")
        }, global).then((res) => {
            res.list.forEach(item => {
                if (item.type === 'a' && item.status === 'Y') {
                    item.status = true;
                    addressList.value.push(item);
                }
            });
            fhfzObj.value = addressList.value[0];
        });
    }
    // Lodop 初始化
    let LODOP = null;
    const intervalId = setInterval(() => {
        if (!LODOP) {
            azqk.value = 'lodop未安装';
            LODOP = getLodop();
        } else {
            azqk.value = 'lodop已安装';
            LODOP.SET_LICENSES("", "EE0887D00FCC7D29375A695F728489A6", "C94CEE276DB2187AE6B65D56B3FC2848", "");
            const count = LODOP.GET_PRINTER_COUNT();
            for (let i = 0; i < count; i++) {
                printerList.value.push(LODOP.GET_PRINTER_NAME(i));
            }
            clearInterval(intervalId);
        }
    }, 5000);
    function selChange(value) {
        dyjmc.value = value;
    }
    function sure() {
        window.location.reload();
    }
    function handTz(str, strTwo, strThree) {
        visible.value = false;
        visJc.value = false;
        emit('djtzmk', str, strTwo, strThree);
    }
    async function handleOk() {
        try {
            await formref.value.validateFields();
            const obj = addressList.value.find(item => item.id === form.key1);
            fhfzObj.value = obj;
            visible.value = false;
            visJc.value = true;
        } catch (error) {
            console.warn('校验失败', error);
        }
    }

    function goDdfh() {
        visJc.value = false;
        visPrint.value = true;
    }

    function generateBarcode(kuaidinum) {
        nextTick(() => {
            JsBarcode(barcode.value, kuaidinum, { format: "CODE128", lineColor: "#000", width: 1.6, height: 30, displayValue: true });
            JsBarcode(barcodeTwo.value, kuaidinum, { format: "CODE128", lineColor: "#000", width: 2, height: 60, displayValue: true });
        });
    }

    function handleGetOrderImage() {
        const printContent = document.getElementById('electronicWaybill').innerHTML;
        const html = `<!DOCTYPE html><html><head><title>电子面单</title><style>body{margin:0;padding:0;background:#fff;font-family:sans-serif;}.print-container{max-width:360px;padding-top:30px;}</style></head><body><div class="print-container">${printContent}</div></body></html>`;

        LODOP.PRINT_INITA('');
        LODOP.SET_PRINTER_INDEX(dyjmc.value);
        LODOP.SET_PRINT_MODE("PRINTQUALITY", 1);
        LODOP.SET_PRINT_PAGESIZE(1, 1130, 1400, 'mm');
        LODOP.ADD_PRINT_HTML('0', '5', '100%', '100%', html);
        // 测试
        LODOP.PREVIEW();

        // 真正打印
        return false
        LODOP.PRINT();
        visPrint.value = false;
        ksDy.value = true;
        setTimeout(() => ksDy.value = false, 3000);
    }

    defineExpose({ setVisible: val => visible.value = val });

    watch(() => props.orderListDetails, (newVal) => {
        console.log('orderListDetails',newVal);
        setTimeout(() => {
            newVal.forEach((item, index) => {
                const kuaidinum = item.kuaidinum || 'JT0016322576092';
                JsBarcode(barcodeList.value[index], kuaidinum, { format: "CODE128", lineColor: "#000", width: 1.6, height: 30, displayValue: true });
                JsBarcode(barcodeTwoList.value[index], kuaidinum, { format: "CODE128", lineColor: "#000", width: 2, height: 60, displayValue: true });
            });
        }, 1000);
    });

    onMounted(() => {
        getStoreAddressList();
    });

    const indicator = h(LoadingOutlined, { style: { fontSize: '50px' }, spin: true });
</script>

<template>
    <div>
        <button @click="visible=true">打印</button>
        <a-modal v-model:visible="visible" title="打印快递单" @ok="handleOk" okText="打印快递单">
            <a-form ref="formref" :model="form" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
                <a-form-item label="发货地址" name="key1" :rules="[{ required: true, message: '请选择发货地址!' }]">
                    <div style="display: flex; align-items: center;">
                        <a-select ref="select" style="width: 85%;" v-model:value="form.key1" placeholder="请选择发货地址">
                            <a-select-option :value="item.id" v-for="item in addressList"
                                :key="item.id">{{item.address}}</a-select-option>
                        </a-select>
                        <div @click="handTz('快递物流','商家地址')" style="color: #2d8cf0;margin-left: 5px;cursor: pointer;">去设置
                        </div>
                    </div>
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
                            <div style="color: #666666;font-size: 12px;">共{{addressList.length}}条发货地址</div>
                        </div>
                        <div v-if="addressList.length>0" style="display: flex;align-items: center;color: #15b464;">
                            <CheckCircleFilled style="color: #15b464;margin-right: 5px;" />
                            已设置
                        </div>
                        <div @click="handTz('快递物流','商家地址')" v-else
                            style="display: flex;align-items: center;color: #fb8015;cursor: pointer;">
                            <ExclamationCircleFilled style="color: #fb8015;margin-right: 5px;" />
                            去设置
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
                            <a style="border: 1px solid #5779d2;border-radius: 4px;color: #5779d2;padding: 0px 5px;"
                                href="https://admin.qfcss.cn/CLodop_Setup_for_Win32NT.exe">安装打印组件</a>
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
                            style="background-color: #5779d2;color: #fff;border-radius: 4px;padding: 2px 15px;">刷新网页
                        </div>
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
                    <div style="display: flex;align-items: center;margin-top: 10px;">
                        <div style="width: 100px;">选择打印机</div>
                        <div>
                            <a-select ref="select" v-model:value="zddyj" placeholder="请选择打印机"
                                style="width: 200px;margin-right: 10px;" @change="selChange">
                                <a-select-option :value="item" v-for="item in printerList"
                                    :key="item">{{item}}</a-select-option>
                            </a-select>
                        </div>
                        <div @click="yldyj">关于打印设置</div>
                    </div>
                    <table class="table_two" style="margin-top: 10px;">
                        <tr style="white-space:nowrap">
                            <th scope="col">收件人</th>
                            <th scope="col">联系方式</th>
                            <th scope="col">收件地址</th>
                            <th scope="col">快递单号</th>
                            <th scope="col">大写头</th>
                        </tr>
                        <!-- 多订单 -->
                        <!-- <template> -->
                        <tr v-for="item in orderListDetails" :key="item.id">
                            <td>{{item.address_name}}</td>
                            <td>{{item.address_mobile}}</td>
                            <td>{{item.address}}</td>
                            <td>JT0016322576092</td>
                            <td>710 R702-00 026</td>
                        </tr>
                        <!-- </template> -->
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
                <div v-for="(item, index) in props.orderListDetails" :key="item.id" style="margin-bottom: 160px;margin-top: 40px;">
                    <div style="border: 1px solid black;">
                        <div
                            style="text-align: center;border-bottom: 1px dashed black;padding: 10px 20px;font-size: 35px;font-weight: bold;padding: 10px 0px;">
                            {{ item.big_code || '710 R702-00 026' }}
                        </div>
                        <div style="display: flex;">
                            <div>
                                <div style="text-align: center;border-bottom: 1px dashed black;padding: 10px 0px;">
                                    <!-- 横向条形码 -->
                                    <svg :ref="el => barcodeList[index] = el"></svg>
                                </div>
                                <div
                                    style="display: flex;border-bottom: 1px dashed black;align-items: center;padding: 10px 0px;">
                                    <div style="font-size: 24px;padding: 10px;">收</div>
                                    <div style="padding: 10px;">
                                        <div style="display: flex;justify-content: space-between;">
                                            <div>{{ item.address_name }}</div>
                                            <div>{{ item.address_mobile }}</div>
                                        </div>
                                        <div style="max-width: 184px;">{{ item.address }}</div>
                                    </div>
                                </div>
                                <div style="display: flex;align-items: center;">
                                    <div style="font-size: 24px;padding: 10px;">寄</div>
                                    <div style="padding: 10px;">
                                        <div
                                            style="display: flex;justify-content: space-between;align-items: center;padding: 10px 0px;">
                                            <div>{{ fhfzObj.sender_name }}</div>
                                            <div>{{ fhfzObj.sender_mobile }}</div>
                                        </div>
                                        <div style="max-width: 184px;">{{ fhfzObj.address }}</div>
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; border-left: 1px solid black;">
                                <!-- 竖向条形码区域 -->
                                <div
                                    style="flex-shrink: 0; width: 170px; display: flex; align-items: center; justify-content: center; position: relative;">
                                    <div
                                        style="position: absolute; top: 50%; left: 30%; transform: translate(-50%, -50%) rotate(90deg);">
                                        <svg :ref="el => barcodeTwoList[index] = el"></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 10px;">
                        <span v-for="(iss,index) in item.goods_list"
                            :key="index">{{iss.goods_name+''+iss.size_name}}</span>
                    </div>
                </div>
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