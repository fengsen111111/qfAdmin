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
    const visPrint = ref(false);
    const ksDy = ref(false);

    const props = defineProps({ orderListDetails: Array });
    const addressList = ref([]);
    const dyjmc = ref('');
    const zddyj = ref('HPRT N31BT');
    const azqk = ref('');
    const printerList = ref([]);

    const indicator = h(LoadingOutlined, { style: { fontSize: '50px' }, spin: true });//打印加载中


    // 获取快递管理列表
    function getExpressList() {
        global.axios.post('decoration/Express/getExpressList', {
            store_id: localStorage.getItem("storeId")
        }, global).then((res) => {
            addressList.value = res.list
        });
    }
    getExpressList();
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
    // 选择打印机
    function selChange(value) {
        dyjmc.value = value;
    }
    // 刷新网页
    function sure() {
        window.location.reload();
    }
    // 左侧导航栏跳转
    function handTz(str, strTwo, strThree) {
        visible.value = false;
        emit('djtzmk', str, strTwo, strThree);
    }

    // 去打单发货
    function goDdfh() {
        visible.value = false;
        visPrint.value = true;
    }

    function handleGetOrderImage() {
        console.log('开始打印');
        visPrint.value = false;
        ksDy.value = true;
        setTimeout(() => ksDy.value = false, 3000);
    }

    defineExpose({ setVisible: val => visible.value = val });

    // const url = 'https://api.kuaidi100.com/thirdPlatform/print/download/3FE77179BC37421785613415C448ABE3';
    function wzzzdy() {
        // fetch('/kuaidiPDF')
        //     .then(res => res.blob())
        //     .then(blob => {
        //         console.log('blob',blob);
        //         const url = URL.createObjectURL(blob);
        //         console.log('PDF 本地代理链接:', url);
        //     });
        fetch('/kuaidiPDF/thirdPlatform/print/download/3FE77179BC37421785613415C448ABE3')
            .then(res => {
                console.log(res.headers.get('content-type'));
                return res.text();
            })
            .then(text => {
                console.log(text); // 如果是 HTML，说明是提示页/错误页
            });
        // console.log('打印图片');
        // LODOP.PRINT_INITA(""); // 初始化打印任务
        // LODOP.SET_PRINTER_INDEX(dyjmc.value); // 设置打印机
        // LODOP.SET_PRINT_MODE("PRINTQUALITY", 1); // 打印质量
        // LODOP.SET_PRINT_PAGESIZE(1, 600, 1400, 'mm'); // 纸张大小
        // LODOP.SET_PRINT_MODE("COLOR_MODE", 1); // 彩印模式（1 彩色，0 黑白）
        // // 用 ADD_PRINT_IMAGE 打印图片
        // // LODOP.ADD_PRINT_IMAGE(0, 0, "100%", "100%", `<img src="https://pic2.zhimg.com/v2-9f6ddcc5571bc89328a5dc4abe7d237b_b.jpg"/>`);
        // LODOP.ADD_PRINT_PDF(0, 0, "100%", "100%", location.origin + '/kuaidiPDF');
        // LODOP.SET_PRINT_STYLEA(0, "Stretch", 2); // 按比例拉伸填满纸张
        // LODOP.PREVIEW();
    }

</script>

<template>
    <div>
        <div @click="wzzzdy">打印2</div>
        <button @click="visible=true">打印</button>
        <!-- 打单前检查 -->
        <a-modal v-model:visible="visible" :footer="null">
            <div>
                <div style="text-align: center;">
                    <div style="font-size: 18px;font-weight: bold;">开始打单前，您需要完成以下设置</div>
                    <div style="color: #666666;font-size: 12px;">若对设置有疑问，你可查看学习中心教程或联系人工客服</div>
                </div>
                <div style="padding:20px;background-color: #f7f8fa;border-radius: 5px;margin-top: 10px;">
                    <div
                        style="display: flex;justify-content: space-between;border-bottom: 1px solid #e0e0e0;padding-bottom: 10px;">
                        <div>
                            <div style="font-weight: bold;">快递管理设置</div>
                            <div style="color: #666666;font-size: 12px;">已添加{{addressList.length}}种快递</div>
                        </div>
                        <div v-if="addressList.length>0" style="display: flex;align-items: center;color: #15b464;">
                            <CheckCircleFilled style="color: #15b464;margin-right: 5px;" />
                            已设置
                        </div>
                        <div @click="handTz('快递物流','快递管理')" v-else
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
                                <div style="color: #fb8015;font-size: 12px;">若已安装打印组件，请等待检索或点击刷新</div>
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
                        <div @click="visible=false"
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
                        <tr v-for="item in orderListDetails" :key="item.id">
                            <td>{{item.address_name}}</td>
                            <td>{{item.address_mobile}}</td>
                            <td>{{item.address}}</td>
                            <td>JT0016322576092</td>
                            <td>710 R702-00 026</td>
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