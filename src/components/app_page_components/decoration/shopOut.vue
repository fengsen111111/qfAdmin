<script setup>
  import { inject, onBeforeMount, reactive, ref } from "vue";
  import { FormComponents } from "../../form_components/form";
  import { TableComponents } from "../../table_components/table";
  import { message } from 'ant-design-vue';

  import { ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons-vue";

  let props = defineProps(["pageData"]);
  const pageData = props.pageData;

  const global = inject("global").value;

  const current = ref(0)//进度

  const checkedList = ref(['生意不佳', '没时间经营'])

  const value = ref();

  const phoneDis = ref(true)//禁用

  const is_checked = ref(false)
  function onChange(e) {
    console.log('e', e.target.checked);
    is_checked.value = e.target.checked
  }

  const visible = ref(false)
  // 下一步
  function handTo() {
    if (!is_checked.value) {
      message.warning('请先阅读并同意圈风退店协议！')
      return false
    }
    visible.value = true
  }

  function handleOk() {
    console.log('确认提交');
    current.value = 1
    visible.value = false
  }

  // 倒计时
  const deadline = ref(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 30)

  const tz_visible = ref(false)//退店公告弹窗

  let emit = defineEmits(["goLookTD"])
  // 查看退店
  function lookTD(){
    emit("goLookTD");
  }
</script>

<template>
  <!--搜索-->
  <div>
    <div style="padding: 20px;">
      <div style="display: flex;justify-content: space-between;">
        <div style="font-size: 18px;">退店</div>
        <div style="color: #1890FF;" @click="lookTD">查看退店</div>
      </div>
      <div style="text-align: center;padding: 30px 50px;">
        <a-steps :current="current" size="small">
          <a-step title="验证身份" />
          <a-step title="申请退店" />
          <a-step title="材料审核" />
          <a-step title="确认账户" />
          <a-step title="银行退款" />
          <a-step title="退款成功" />
        </a-steps>
      </div>
      <div style="text-align: center;padding: 30px;">
        <!-- 验证身份 -->
        <div v-if="current==0">
          <div style="font-size: 16px;">请验证店铺绑定手机号并填写退店原因</div>
          <div style="color: #ff7300;margin-top: 10px;">您的贷款余额，保证金，广告账户余额，均将在退店审核成功后全部退还至绑定银行卡，无需额外缴纳保证金</div>
          <div style="color: #ff7300;">申请退店后所有状态为「推广中」的广告推广，流量将暂停:不支持新建推广、报名活动。不再下发广告红包。撤销退店后，申请退店期间的广告红包不会补发。</div>
          <div>
            <div style="display: flex;width: 100%;">
              <div style="margin: 5px auto;">
                <div style="display: flex;margin-top: 20px;">
                  <div style="width: 30%;display: flex;justify-content: space-between;">
                    <div></div>
                    <div style="display: flex;">
                      <div style="color: red;">*</div>
                      <div>退店主要原因</div>
                    </div>
                  </div>
                  <div style="width: 760px;margin-left: 10px;">
                    <a-checkbox-group v-model:value="checkedList">
                      <a-checkbox value="生意不佳" name="type">生意不佳</a-checkbox>
                      <a-checkbox value="没时间经营" name="type">没时间经营</a-checkbox>
                      <a-checkbox value="售后退款问题" name="type">售后退款问题</a-checkbox>
                      <a-checkbox value="想更换主营类目" name="type">想更换主营类目</a-checkbox>
                      <a-checkbox value="平台判定导流" name="type">平台判定导流</a-checkbox>
                      <a-checkbox value="不善于经营" name="type">不善于经营</a-checkbox>
                      <a-checkbox value="货源问题" name="type">货源问题</a-checkbox>
                      <a-checkbox value="资金链断裂" name="type">资金链断裂</a-checkbox>
                      <a-checkbox value="不接受协议新规" name="type">不接受协议新规</a-checkbox>
                      <a-checkbox value="其他" name="type">其他</a-checkbox>
                    </a-checkbox-group>
                  </div>
                </div>
                <div style="display: flex;margin-top: 20px;">
                  <div style="width: 30%;display: flex;justify-content: space-between;">
                    <div></div>
                    <div style="display: flex;">
                      <div style="color: red;">*</div>
                      <div>退店后你还会在哪里经营</div>
                    </div>
                  </div>
                  <div style="width: 760px;margin-left: 10px;float: left;display: flex;">
                    <a-radio-group v-model:value="value">
                      <a-radio :value="1">其它店铺</a-radio>
                      <a-radio :value="2">抖音、快手</a-radio>
                      <a-radio :value="3">淘宝</a-radio>
                      <a-radio :value="3">京东</a-radio>
                      <a-radio :value="3">不再经营</a-radio>
                      <a-radio :value="3">其它平台</a-radio>
                    </a-radio-group>
                  </div>
                </div>
                <div style="display: flex;margin-top: 20px;align-items: center;">
                  <div style="width: 30%;display: flex;justify-content: space-between;">
                    <div></div>
                    <div style="display: flex;">
                      <div style="color: red;">*</div>
                      <div>主账号绑定手机号</div>
                    </div>
                  </div>
                  <div style="margin-left: 10px;width: 760px;float: left;display: flex;align-items: center;">
                    <!-- :disabled="phoneDis"  -->
                    <a-input v-model:value="value" style="width: 296px;" placeholder="请输入主账号绑定手机号" />
                    <!-- <div @click="()=>{phoneDis=!phoneDis}" style="color: #1890FF;margin-left: 5px;">修改手机号</div> -->
                  </div>
                </div>
                <div style="display: flex;margin-top: 20px;align-items: center;">
                  <div style="width: 30%;display: flex;justify-content: space-between;">
                    <div></div>
                    <div style="display: flex;">
                      <div style="color: red;">*</div>
                      <div>短信验证码</div>
                    </div>
                  </div>
                  <div style="margin-left: 10px;width: 760px;float: left;display: flex;align-items: center;">
                    <a-input v-model:value="value" style="width: 200px;" placeholder="请输入验证码" />
                    <div style="border: 1px solid #d9d9d9;margin-left: 5px;padding: 4px 10px;border-radius: 4px;">获取验证码
                    </div>
                  </div>
                </div>
                <div style="margin-top: 20px;display: flex;">
                  <div style="margin: 0 auto;display: flex;">
                    <a-checkbox v-model:checked="is_checked" @change="onChange" />
                    <div style="margin-left: 10px;">我已阅读并同意</div>
                    <div style="color: #1890FF;">《圈风退店协议》</div>
                  </div>
                </div>
                <div style="margin-top: 20px;display: flex;">
                  <div style="margin: 0 auto;">
                    <a-button @click="handTo" type="primary">下一步</a-button>
                  </div>
                </div>
                <!-- 弹框 -->
                <a-modal v-model:visible="visible" width="750px">
                  <div style="padding: 0 50px;">
                    <div style="text-align: center;">
                      <ExclamationCircleOutlined style="color: #ff7300;font-size: 50px;" />
                    </div>
                    <div style="text-align: center;margin-top: 10px;">
                      <div style="color: #ff7300;">尊敬的商家，您好:</div>
                      <div style="color: #ff7300;">当您进入这个页面，意味着您正在申请退出圈风店铺，请注意以下提示信息:</div>
                    </div>
                    <div style="display: flex;align-items: center;margin-top: 20px;">
                      <div
                        style="width: 10px;height: 10px;border-radius: 10px;background-color: #ff7300;margin-right: 5px;">
                      </div>
                      <div>若您当前还存在上架商品，请在退店处理环节中进行商品下架;</div>
                    </div>
                    <div style="display: flex;align-items: center;">
                      <div
                        style="width: 10px;height: 10px;border-radius: 10px;background-color: #ff7300;margin-right: 5px;">
                      </div>
                      <div>若您当前还存在未完成或售后订单，请在退店处理环节尽快处理完成;</div>
                    </div>
                    <div style="display: flex;align-items: center;">
                      <div
                        style="width: 10px;height: 10px;border-radius: 10px;background-color: #ff7300;margin-right: 5px;">
                      </div>
                      <div>在申请退店后需进行30天的退店公示，店铺首页显著位置会公示“本店铺将关闭”标志;</div>
                    </div>
                    <div style="display: flex;align-items: center;">
                      <div
                        style="width: 10px;height: 10px;border-radius: 10px;background-color: #ff7300;margin-right: 5px;">
                      </div>
                      <div>未有成团订单的商家在完成退店处理环节后，将跳过材料审核环节，直接进入退款环节，且不可撤销退店;</div>
                    </div>
                    <div style="display: flex;align-items: center;">
                      <div
                        style="width: 10px;height: 10px;border-radius: 10px;background-color: #ff7300;margin-right: 5px;">
                      </div>
                      <div>在退店环节中如有任何疑问可参考<span style="color: #1890FF;">《拼多多退店流程说明及常见问题》</span>;</div>
                    </div>
                    <div style="font-size: 16px;">
                      为保障您的资金安全与基本权益，请在申请退店前再次确认:
                    </div>
                    <div style="margin-left: 20px;color: red;">
                      <div style="margin-top: 5px;">1、已统计店铺最终剩余可退还资金金额</div>
                      <div style="margin-top: 5px;">2、已开具的电子发票下载完毕</div>
                      <div style="margin-top: 5px;">3、有效发票账单是否需要申请发票</div>
                    </div>
                  </div>
                  <template #footer>
                    <div style="display: flex;">
                      <div style="margin: 0 auto;display: flex;">
                        <a-button type="primary" @click="handleOk">确认提交</a-button>
                        <a-button @click="()=>{visible=false}">取消</a-button>
                      </div>
                    </div>
                  </template>
                </a-modal>
              </div>
            </div>
          </div>
        </div>
        <!-- 申请退店 -->
        <div v-else-if="current==1">
          <div style="text-align: center;">
            <ExclamationCircleOutlined style="color: #ff7300;font-size: 50px;" />
            <div style="font-weight: bold;margin-top: 20px;">请在申请退店前处理完以下事项</div>
            <div style="color: #999999;margin-top: 10px;">完成退店处理事项后将自动发起退店申请，退店申请发起成功后，将于30个工作日内退店审核完毕并打款</div>
            <div style="display: flex;margin-top: 10px;">
              <table style="margin: 0 auto;">
                <thead>
                  <tr>
                    <th>退店条件</th>
                    <th>待处理事项</th>
                    <th>建议操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style="display: flex;align-items: center;">
                        <CheckCircleOutlined style="color: green;margin-right: 5px;" />
                        <CloseCircleOutlined style="color: red;margin-right: 5px;" />
                        店铺无异常
                      </div>
                    </td>
                    <td>无</td>
                    <td>无</td>
                  </tr>
                  <tr>
                    <td rowspan="2">
                      <div style="display: flex;align-items: center;">
                        <CheckCircleOutlined style="color: green;margin-right: 5px;" />
                        <CloseCircleOutlined style="color: red;margin-right: 5px;" />
                        资金无异常
                      </div>
                    </td>
                    <td>关闭推广账户</td>
                    <td>请点击此链接<span style="color: #1890FF;">「关闭推广账户」</span>操作，自行前往推广平台暂停或删除推广无法关闭帐户</td>
                  </tr>
                  <tr>
                    <td>店铺存在欠费</td>
                    <td>联系商家客服或者对接运营</td>
                  </tr>
                  <tr>
                    <td>
                      <div style="display: flex;align-items: center;">
                        <CheckCircleOutlined style="color: green;margin-right: 5px;" />
                        <CloseCircleOutlined style="color: red;margin-right: 5px;" />
                        商品已处理
                      </div>
                    </td>
                    <td>无</td>
                    <td>无</td>
                  </tr>
                  <tr>
                    <td>
                      <div style="display: flex;align-items: center;">
                        <CheckCircleOutlined style="color: green;margin-right: 5px;" />
                        <CloseCircleOutlined style="color: red;margin-right: 5px;" />
                        订单已完成
                      </div>
                    </td>
                    <td>无</td>
                    <td>无</td>
                  </tr>
                  <tr>
                    <td>
                      <div style="display: flex;align-items: center;">
                        <CheckCircleOutlined style="color: green;margin-right: 5px;" />
                        <CloseCircleOutlined style="color: red;margin-right: 5px;" />
                        售后已完成
                      </div>
                    </td>
                    <td>无</td>
                    <td>无</td>
                  </tr>
                  <tr>
                    <td>
                      <div style="display: flex;align-items: center;">
                        <CheckCircleOutlined style="color: green;margin-right: 5px;" />
                        <CloseCircleOutlined style="color: red;margin-right: 5px;" />
                        服务已关闭
                      </div>
                    </td>
                    <td>无</td>
                    <td>无</td>
                  </tr>
                  <tr>
                    <td>
                      <div style="display: flex;align-items: center;">
                        <CheckCircleOutlined style="color: green;margin-right: 5px;" />
                        <CloseCircleOutlined style="color: red;margin-right: 5px;" />
                        活动已结束
                      </div>
                    </td>
                    <td>无</td>
                    <td>无</td>
                  </tr>
                  <tr>
                    <td>
                      <div style="display: flex;align-items: center;">
                        <CheckCircleOutlined style="color: green;margin-right: 5px;" />
                        <CloseCircleOutlined style="color: red;margin-right: 5px;" />
                        退店已公告
                      </div>
                    </td>
                    <td>退店公示未满30天</td>
                    <td>
                      <div style="display: flex;">
                        <div style="color: #1890FF;" @click="()=>{tz_visible=true}">开启公示</div>
                        <a-statistic-countdown title="倒计时" :value="deadline" format="D 天 H 时 m 分 s 秒"
                          style="font-size: 16px;" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <!-- 弹窗 -->
              <a-modal v-model:visible="tz_visible" title="是否确认开启退店公示？">
                <div style="color: #999999;">
                  <div>&nbsp;&nbsp;据2019年1月1日开始施行的《中华人民共和国电子商务法》第二章第十六条要求:电子商务经营者自行终止从事电子商务的，应当提前三十日在首页显著位置持续公示有关信息。
                  </div>
                  <div>&nbsp;&nbsp;退店需提前30日进行公示，开启退店公示后，店铺首页显著位置会公示“本店铺将关闭”标志，持续30天。</div>
                </div>
                <template #footer>
                  <div style="display: flex;">
                    <div style="margin: 0 auto;display: flex;">
                      <a-button type="primary">确认开启</a-button>
                      <a-button @click="()=>{tz_visible=false}">取消</a-button>
                    </div>
                  </div>
                </template>
              </a-modal>
            </div>
            <div style="display: flex;margin-top: 20px;">
              <div style="margin: 0 auto;">
                <a-button @click="()=>{current=0}">撤销退店申请</a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--导出-->
</template>

<style lang="less" scoped>
  table {
    text-align: left;
    border-collapse: collapse;
    border: none;
    font-family: sans-serif;
    font-size: 0.8rem;
    letter-spacing: 1px;
  }

  caption {
    caption-side: bottom;
    padding: 10px;
    font-weight: bold;
  }

  thead,
  tfoot {
    background-color: #f4f5f9;
  }

  th,
  td {
    border: 1px solid #d4d6d6;
    padding: 8px 12px;
    width: 300px;
  }

  :deep(.ant-statistic-content) {
    color: rgba(0, 0, 0, 0.85);
    font-size: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  }

  :deep(.ant-checkbox-group) {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  /* :deep(.ant-radio-group) {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
  } */
  :deep(.ant-checkbox-wrapper + .ant-checkbox-wrapper) {
    margin-left: 0px;
  }

  /* :deep(.ant-radio-wrapper) {
    border: 1px solid #d9d9d9 !important;
    margin-bottom: 10px;
    padding: 0px 5px;
    white-space:nowrap;
    border-radius: 4px;
  } */

  /* :deep(.ant-checkbox+span) {
    padding-right: 0px;
    padding-left: 8px;
  }

  :deep(.ant-checkbox-wrapper) {
    border: 1px solid #d9d9d9 !important;
    margin-bottom: 10px;
    padding: 0px 5px;
  } */

  :deep(.ant-steps-item-icon) {
    width: 18px !important;
    height: 18px !important;
    font-size: 12px !important;
    line-height: 17px !important;
    margin: 3px 3px 0 0 !important;
  }

  :deep(.ant-steps-item-icon > .anticon) {
    font-size: 12px !important;
  }
</style>