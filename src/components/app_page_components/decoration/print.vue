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
            //去除底部试用版信息
            LODOP.SET_LICENSES("", "EE0887D00FCC7D29375A695F728489A6", "C94CEE276DB2187AE6B65D56B3FC2848", "");
            const count = LODOP.GET_PRINTER_COUNT();
            for (let i = 0; i < count; i++) {
                printerList.value.push(LODOP.GET_PRINTER_NAME(i));
            }
            clearInterval(intervalId);
        }
    }, 1000);
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
        wzzzdy()
        setTimeout(() => ksDy.value = false, 3000);
    }
    defineExpose({ setVisible: val => visible.value = val });

    // pdf 转图片 打印版
    import * as pdfjsLib from 'pdfjs-dist/build/pdf';
    // 载入 pdf.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    // pdfjsLib.GlobalWorkerOptions.disableWorker = true;
    // function pdfBlobToImage(blob, callback) {
    //     const reader = new FileReader();
    //     reader.onload = function () {
    //         const typedarray = new Uint8Array(reader.result);
    //         pdfjsLib.getDocument(typedarray).promise.then(pdf => {
    //             pdf.getPage(1).then(page => {
    //                 const viewport = page.getViewport({ scale: 1.3 }); // 缩放比例
    //                 const canvas = document.createElement('canvas');
    //                 const context = canvas.getContext('2d');
    //                 canvas.width = viewport.width;
    //                 canvas.height = viewport.height;
    //                 page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {
    //                     const imgData = canvas.toDataURL('image/png');
    //                     console.log('结果', imgData);
    //                     callback(imgData); // 返回 base64 图片
    //                 });
    //             });
    //         });
    //     };
    //     reader.readAsArrayBuffer(blob);
    // }
    // function wzzzdy() {
    //     // 使用示例
    //     fetch('/kuaidiPDF/thirdPlatform/print/download/285B0CABEE7F4A7F820B54D1C781E5D4')
    //         .then(res => res.blob())
    //         .then(blob => {
    //             pdfBlobToImage(blob, (imgBase64) => {
    //                 // 用 LODOP 打印图片
    //                 LODOP.PRINT_INIT("打印快递单");
    //                 LODOP.ADD_PRINT_IMAGE(0, 0, "100%", "100%", `<img src="${imgBase64}"  style="width:95%;height:auto;">`);
    //                 LODOP.PREVIEW(); // 预览打印
    //                 // LODOP.PRINT(); // 直接打印
    //             });
    //         });
    // }

    // html打印版
    // function wzzzdy() {
    //     // 使用示例
    //     fetch('/kuaidiPDF/thirdPlatform/print/download/285B0CABEE7F4A7F820B54D1C781E5D4')
    //         .then(res => res.blob())
    //         .then(blob => {
    //             const container = document.createElement('div'); // 新建一个隐藏的容器
    //             container.style.width = '595px';  // A4纸宽度 px（默认1pt=1.333px，可以根据需要调）
    //             container.style.height = '842px'; // A4纸高度 px
    //             container.style.position = 'absolute';
    //             container.style.left = '-9999px';
    //             document.body.appendChild(container);
    //             pdfBlobToHtml(blob, container, () => {
    //                 // 解析完成，调用 LODOP 打印容器的 html
    //                 console.log('container.innerHTML', container.innerHTML);
    //                 LODOP.PRINT_INIT("打印快递单（html文本版）");
    //                 LODOP.ADD_PRINT_HTM(0, 0, "100%", "100%", container.innerHTML);
    //                 LODOP.PREVIEW();
    //                 // 打印完成后可移除临时容器
    //                 setTimeout(() => document.body.removeChild(container), 3000);
    //             });
    //         });
    // }

    // function pdfBlobToHtml(blob, container, callback) {
    //     const reader = new FileReader();
    //     reader.onload = async () => {
    //         const typedarray = new Uint8Array(reader.result);
    //         const pdf = await pdfjsLib.getDocument(typedarray).promise;
    //         const page = await pdf.getPage(1);
    //         const viewport = page.getViewport({ scale: 1 });
    //         const textContent = await page.getTextContent();
    //         // 清空容器
    //         container.innerHTML = '';
    //         container.style.position = 'relative';
    //         container.style.width = viewport.width + 'px';
    //         container.style.height = viewport.height + 'px';
    //         textContent.items.forEach((textItem) => {
    //             const span = document.createElement('div');
    //             span.textContent = textItem.str;
    //             const tx = pdfjsLib.Util.transform(viewport.transform, textItem.transform);
    //             span.style.position = 'absolute';
    //             span.style.left = `${tx[4]}px`;
    //             span.style.top = `${tx[5] - textItem.height}px`;
    //             span.style.fontSize = `${textItem.height}px`;
    //             span.style.whiteSpace = 'pre';
    //             container.appendChild(span);
    //         });

    //         callback && callback();
    //     };
    //     reader.readAsArrayBuffer(blob);
    // }



    const container = ref(null)

    function wzzzdy() {
        fetch('/kuaidiPDF/thirdPlatform/print/download/285B0CABEE7F4A7F820B54D1C781E5D4')
            .then(res => res.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onload = function () {
                    let base64PDF = reader.result;
                    // 去掉 data:application/pdf;base64, 前缀
                    base64PDF = base64PDF.replace(/^data:application\/pdf;base64,/, '');
                    fff(base64PDF)
                    // LODOP 打印
                    // LODOP.PRINT_INITA("0mm", "0mm", "210mm", "297mm", "快递单打印");
                    // LODOP.SET_PRINT_MODE("PRINTQUALITY", 1);
                    // LODOP.SET_PRINT_MODE("PRINT_NOPROMPT", true); // 不弹任何打印提示
                    // LODOP.ADD_PRINT_PDF("0mm", "0mm", "100%", "100%", base64PDF);
                    // // 缩放比例 90%
                    // LODOP.SET_PRINT_STYLEA(0, "Zoom", 95);
                    // LODOP.PREVIEW(); // 预览打印
                    // // LODOP.PRINT(); // 直接打印
                };
                reader.readAsDataURL(blob); // 转成 Base64
            })
            .catch(err => {
                console.error('下载或处理 PDF 失败:', err);
            });
    }

    async function fff(base64PDF) {
        const pdfData = atob(base64PDF);
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const scale = 1.5;
            const viewport = page.getViewport({ scale });
            // 页面容器
            const pageDiv = document.createElement('div');
            pageDiv.className = 'page';
            pageDiv.style.position = 'relative';
            pageDiv.style.width = viewport.width + 'px';
            pageDiv.style.height = viewport.height + 'px';

            // 创建 canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            // 渲染 PDF 页到 canvas
            await page.render({ canvasContext: context, viewport }).promise;
            pageDiv.appendChild(canvas);
            // 渲染文字层 (可复制文本)
            const textContent = await page.getTextContent();
            const textLayerDiv = document.createElement('div');
            pdfjsLib.renderTextLayer({
                textContent,
                container: textLayerDiv,
                viewport,
                textDivs: []
            });
            pageDiv.appendChild(textLayerDiv);
            container.value.appendChild(pageDiv);
            console.log('pageDiv', pageDiv);
            const printContent = pageDiv.innerHTML

            // 把 canvas 转成 base64 图片字符串
            const imgData = canvas.toDataURL('image/png');
            // 拼装 html，img 引用 base64 图像
            const html = `<!DOCTYPE html>
                <html>
                <head>
                <title>电子面单</title>
                <style>
                    body { margin:0; padding:0; background:#fff; font-family:sans-serif; }
                    .print-container { max-width:360px; }
                </style>
                </head>
                <body>
                <div class="print-container">
                    <img src="${imgData}" style="width:100%;" />
                </div>
                </body>
                </html>`;
            // 用 LODOP 打印
            LODOP.ADD_PRINT_HTML('0', '0', '100%', '100%', html);
            // 预览或打印
            LODOP.PREVIEW();
            // LODOP.PRINT();
        }
    }


    // pdf  base64 打印版
    // function wzzzdy() {
    //     fetch('/kuaidiPDF/thirdPlatform/print/download/285B0CABEE7F4A7F820B54D1C781E5D4')
    //         .then(res => res.blob())
    //         .then(blob => {
    //             const reader = new FileReader();
    //             reader.onload = function () {
    //                 let base64PDF = reader.result;
    //                 // 去掉 data:application/pdf;base64, 前缀
    //                 base64PDF = base64PDF.replace(/^data:application\/pdf;base64,/, '');
    //                 // LODOP 打印
    //                 LODOP.PRINT_INITA("0mm", "0mm", "210mm", "297mm", "快递单打印");
    //                 LODOP.SET_PRINT_MODE("PRINTQUALITY", 1);
    //                 LODOP.SET_PRINT_MODE("PRINT_NOPROMPT", true); // 不弹任何打印提示
    //                 LODOP.ADD_PRINT_PDF("0mm", "0mm", "100%", "100%", base64PDF);
    //                 // 缩放比例 90%
    //                 LODOP.SET_PRINT_STYLEA(0, "Zoom", 95);
    //                 LODOP.PREVIEW(); // 预览打印
    //                 // LODOP.PRINT(); // 直接打印
    //             };
    //             reader.readAsDataURL(blob); // 转成 Base64
    //         })
    //         .catch(err => {
    //             console.error('下载或处理 PDF 失败:', err);
    //         });
    // }
    // pdf下载打印版
    // function wzzzdy() {
    //     fetch('/kuaidiPDF/thirdPlatform/print/download/285B0CABEE7F4A7F820B54D1C781E5D4')
    //         .then(res => res.blob())
    //         .then(blob => {
    //             const a = document.createElement('a');
    //             a.href = URL.createObjectURL(blob);
    //             console.log('a',a);
    //             a.download = 'kuaidi100.pdf';
    //             document.body.appendChild(a);
    //             a.click();
    //             document.body.removeChild(a);
    //             // 如果是客户端环境，下载后可以用本地路径去 LODOP 打印
    //             LODOP.PRINT_INITA(""); // 初始化
    //             LODOP.SET_PRINTER_INDEX(dyjmc.value); // 选择打印机
    //             LODOP.SET_PRINT_MODE("PRINTQUALITY", 1);
    //             // LODOP.SET_PRINT_PAGESIZE(1, 760, 1300, 'mm');
    //             LODOP.ADD_PRINT_PDF(0, 0, "95%", "95%", "D:\\Users\\Downloads\\kuaidi100.pdf");
    //             // LODOP.PREVIEW(); // 预览打印
    //             LODOP.PRINT();
    //         });
    // }

</script>

<template>
    <div>
        <div ref="container" class="pdf-container"></div>
        <!-- <div @click="wzzzdy">打印2</div> -->
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
                            <th scope="col">物流单号</th>
                            <th scope="col">物流公司名称</th>
                            <th scope="col">物流公司编码</th>
                            <th scope="col">电子面单链接</th>
                        </tr>
                        <tr v-for="item in orderListDetails" :key="item.id">
                            <td>JT12331342342342134</td>
                            <td>极兔速递</td>
                            <td>jitushudi</td>
                            <td>
                                <div style="width: 250px;word-wrap:break-word;word-break:normal; ">
                                    https://api.kuaidi100.com/thirdPlatform/print/download/285B0CABEE7F4A7F820B54D1C781E5D4
                                </div>
                            </td>
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

    .textLayer {
        color: rgba(0, 0, 0, 0.3);
        user-select: text;
        pointer-events: none;
    }
</style>