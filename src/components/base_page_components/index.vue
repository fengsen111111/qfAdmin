<script setup>
  import { ref, watch, inject } from 'vue'
  import {
    AuditOutlined, ContainerOutlined, ApartmentOutlined, CrownOutlined, InsertRowLeftOutlined, ShopOutlined, TeamOutlined
    , DeleteRowOutlined, BankOutlined, FileProtectOutlined
  } from "@ant-design/icons-vue";
  import * as echarts from 'echarts'

  const global = inject('global').value

  let props = defineProps(["pageData"])
  const pageData = props.pageData

  let emit = defineEmits(["openChildPage", "closeChildPage"])

  function openChildPage(pageData) {
    emit('openChildPage', pageData)
  }

  function closeChildPage(page_key) {
    global.Modal.confirm({
      title: global.findLanguage('确定要返回吗？'),
      okText: global.findLanguage('确定'),
      cancelText: global.findLanguage('取消'),
      okType: 'primary',
      onOk: function () {
        emit('closeChildPage', page_key)
      }
    });
  }

  const type = ref('平台')

  watch(() => type.value, (newVal, oldVal) => {
    if (newVal == '平台') {
      setTimeout(() => {
        ech()
        echTwo()
        window.addEventListener('resize', () => {
          chartInstance && chartInstance.resize();
          chartInstanceTwo && chartInstanceTwo.resize();
        });
      }, 1000);
    }
  });
  // 图表
  const chartRef = ref(null)
  const chartRefTwo = ref(null)
  let chartInstance = null
  let chartInstanceTwo = null
  function echTwo() {
    chartInstanceTwo = echarts.init(chartRefTwo.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          const data = params[0];
          return `${data.axisValue}<br/>营业额: ${data.data} 元`;
        },
        axisPointer: {
          type: 'line'
        }
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 732, 1320, 1420, 1020, 1320, 1432],
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#58d2fc' },
              { offset: 1, color: '#7348fb' }
            ])
          },
          itemStyle: {
            color: '#4080FF' // 拐点颜色
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#e3f0ff' },
              { offset: 1, color: '#fff' }
            ])
          }
        }
      ],
    }
    chartInstanceTwo.setOption(option)
  }
  function ech() {
    chartInstance = echarts.init(chartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          const data = params[0];
          return `${data.axisValue}<br/>营业额: ${data.data} 元`;
        },
        axisPointer: {
          type: 'line'
        }
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 732, 1320, 1420, 1020, 1320, 1432],
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#58d2fc' },
              { offset: 1, color: '#7348fb' }
            ])
          },
          itemStyle: {
            color: '#4080FF' // 拐点颜色
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#e3f0ff' },
              { offset: 1, color: '#fff' }
            ])
          }
        }
      ],
    }
    chartInstance.setOption(option)
  }
  setTimeout(() => {
    ech()
    echTwo()
    window.addEventListener('resize', () => {
      chartInstance && chartInstance.resize();
      chartInstanceTwo && chartInstanceTwo.resize();
    });
  }, 1000);

  const store_id = ref('')
  function getCustomerRoomList() {
    // 获取自己的角色ID和聊天状态
    global.axios.post('decoration/CustomerService/getMyJoinerSign', {}, global, true).then((res_one) => {
      console.log('自己商家id和禁言状态', res_one);
      store_id.value = res_one.joiner_sign
      type.value = res_one.joiner_sign == 1 ? "平台" : '商家'
    })
  }
  getCustomerRoomList()

</script>
<template>
  <div>
    <!-- <div style="display: flex;">
      <div @click="type='商家'">商家</div>
      <div @click="type='平台'">平台</div>
    </div> -->
    <!-- <div>自己商家id：{{store_id}}</div>
    <div>平台id：{{global.adminMsg.id}}</div> -->
    <div v-if="type=='商家'">
      <img alt="" src="/resource/image/index_img.png" style="width: 100%;max-height: 500px;margin-top: 5vh">
    </div>
    <div v-if="type=='平台'">
      <div style="overflow: auto;height: 86vh;">
        <a-row>
          <a-col :lg="24" :xl="18">
            <div style="">
              <div style="display: flex;align-items: center;padding: 20px;font-size: 20px;font-weight: bold;">
                <img src="../../../public/resource/image/pps.png" style="width: 25px;height: 25px;margin-right: 10px;"
                  alt="">
                <div>欢迎回来，Ryan Septimus</div>
              </div>
              <div style="background-color: #f5f5f5;height: 1px;margin-top: 10px"></div>
              <div
                style="display: grid;grid-template-columns: repeat(4, minmax(0, 1fr));border-bottom: 1px solid #f5f5f5;">
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/home1.png"
                      style="width: 24px;height: 24px;position: relative;top:0px;" alt="">
                  </div>
                  <div>
                    <div>总营业额</div>
                    <div class="a47">{{Number(21313).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon2.png"
                      style="width: 24px;height: 24px;position: relative;top:0px;" alt="">

                  </div>
                  <div>
                    <div>今日营业额</div>
                    <div class="a47">{{Number(2131).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon3.png"
                      style="width: 24px;height: 24px;position: relative;top:0px;" alt="">

                  </div>
                  <div>
                    <div>本月营业额</div>
                    <div class="a47">{{Number(213).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon4.png"
                      style="width: 24px;height: 24px;position: relative;top:0px;" alt="">

                  </div>
                  <div>
                    <div>平台押金</div>
                    <div class="a47">{{Number(21313).toLocaleString()}}</div>
                  </div>
                </div>
              </div>
              <div
                style="display: grid;grid-template-columns: repeat(4, minmax(0, 1fr));border-bottom: 1px solid #f5f5f5;">
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon5.png"
                      style="width: 24px;height: 24px;position: relative;top:0px;" alt="">
                  </div>
                  <div>
                    <div>商家总数</div>
                    <div class="a47">{{Number(21313).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon6.png"
                      style="width: 24px;height: 24px;position: relative;top:0px;" alt="">
                  </div>
                  <div>
                    <div>商品总数</div>
                    <div class="a47">{{Number(2131).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon7.png"
                      style="width: 24px;height: 24px;position: relative;top:0px;left: 3px;" alt="">
                  </div>
                  <div>
                    <div>平台收取总服务费</div>
                    <div class="a47">{{Number(213).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon8.png"
                      style="width: 24px;height: 24px;position: relative;top:0px;" alt="">
                  </div>
                  <div>
                    <div>今日平台服务费</div>
                    <div class="a47">{{Number(21313).toLocaleString()}}</div>
                  </div>
                </div>
              </div>
              <div
                style="display: grid;grid-template-columns: repeat(4, minmax(0, 1fr));border-bottom: 1px solid #f5f5f5;">
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon9.png"
                      style="width: 24px;height: 24px;position: relative;top:-2px;" alt="">
                  </div>
                  <div>
                    <div>今日新增用户数</div>
                    <div class="a47">{{Number(21313).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/iocn10.png"
                      style="width: 24px;height: 24px;position: relative;top:-2px;" alt="">
                  </div>
                  <div>
                    <div>本月新增用户数</div>
                    <div class="a47">{{Number(2131).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon11.png"
                      style="width: 24px;height: 24px;position: relative;top:-2px;" alt="">
                  </div>
                  <div>
                    <div>社区总文章数</div>
                    <div class="a47">{{Number(213).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon12.png"
                      style="width: 24px;height: 24px;position: relative;top:-2px;" alt="">
                  </div>
                  <div>
                    <div>社区总视频数</div>
                    <div class="a47">{{Number(21313).toLocaleString()}}</div>
                  </div>
                </div>
              </div>
              <!-- 用户新增数据 -->
              <div>
                <div class="a54">
                  <div>
                    <b>用户新增数据</b>
                    <span class="a55">（本年）</span>
                  </div>
                  <div>
                    <b>总用户数：{{Number(213131).toLocaleString()}}</b>
                  </div>
                </div>
                <div style="width: 100%;">
                  <div ref="chartRef" class="a56"></div>
                </div>
              </div>
              <div style="height: 10px;background-color: #f5f5f5;"></div>
              <div>
                <div class="a54">
                  <div>
                    <b>月营业额数据</b>
                    <span class="a55">（本年）</span>
                  </div>
                  <div>
                  </div>
                </div>
                <div style="width: 100%;">
                  <div ref="chartRefTwo" class="a56"></div>
                </div>
              </div>
              <div style="height: 10px;background-color: #f5f5f5;"></div>
              <div style="display: flex;justify-content: space-between;">
                <div class="a58" style="width: 48%;">
                  <div class="a59">
                    <div style="font-size: 17px;"><b>商品营业额Top10</b></div>
                    <div class="a60">查看更多</div>
                  </div>
                  <div class="a61" v-for="item in [1,2,3,4,5,6,7,8,9,10]" :key="item">
                    <div style="width: 30px;">NO.{{item}}</div>
                    <div style="display: flex;">
                      <img style="width: 20px;height: 20px;border-radius: 50%;margin-right: 10px;"
                        src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/coverImg/2025428/ev9v7kmhau77as4w7jbp9tvee3wdtkis.png"
                        alt="">
                      <div>创作者昵称</div>
                    </div>
                    <div>社区话题标题社区话题标题社区话题...</div>
                    <div>{{Number(21313).toLocaleString()}}万</div>
                  </div>
                </div>
                <div style="width: 10px;background-color: #f5f5f5;"></div>
                <div class="a58" style="width: 48%;">
                  <div class="a59">
                    <div style="font-size: 17px;"><b>商品营业额Top10</b></div>
                    <div class="a60">查看更多</div>
                  </div>
                  <div class="a61" v-for="item in [1,2,3,4,5,6,7,8,9,10]" :key="item">
                    <div style="width: 30px;">NO.{{item}}</div>
                    <div style="display: flex;">
                      <img style="width: 20px;height: 20px;border-radius: 50%;margin-right: 10px;"
                        src="https://decoration-upload.oss-cn-hangzhou.aliyuncs.com/coverImg/2025428/ev9v7kmhau77as4w7jbp9tvee3wdtkis.png"
                        alt="">
                      <div>创作者昵称</div>
                    </div>
                    <div>社区话题标题社区话题标题社区话题...</div>
                    <div>{{Number(21313).toLocaleString()}}万</div>
                  </div>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :lg="10" :xl="6">
            <!-- right -->
            <div style="background-color: #f5f5f5;padding: 10px;">
              <div style="padding: 20px;background-color: #fff;">
                <div style="display: flex;justify-content: space-between;">
                  <div style="font-size: 17px;"><b>工作台</b></div>
                  <div class="a60">管理</div>
                </div>
                <div style="display: grid;grid-template-columns: repeat(3, minmax(0, 1fr));">
                  <div style="text-align: center;margin-top: 20px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <ContainerOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 10px;">运营管理</div>
                  </div>
                  <div style="text-align: center;margin-top: 20px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <ApartmentOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 10px;">流水管理</div>
                  </div>
                  <div style="text-align: center;margin-top: 20px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <CrownOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 10px;">社区管理</div>
                  </div>
                  <div style="text-align: center;margin-top: 20px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <InsertRowLeftOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 10px;">商城管理</div>
                  </div>
                  <div style="text-align: center;margin-top: 20px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <ShopOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 10px;">商家管理</div>
                  </div>
                  <div style="text-align: center;margin-top: 20px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <TeamOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 10px;">用户管理</div>
                  </div>
                </div>
                <div style="height: 1px;background-color: #E6e9f0;margin: 10px 0px;"></div>
                <div style="display: flex;justify-content: space-between;">
                  <div style="font-size: 17px;"><b>代办事项</b></div>
                </div>
                <div style="display: grid;grid-template-columns: repeat(3, minmax(0, 1fr));">
                  <div style="text-align: center;margin-top: 20px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <DeleteRowOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 10px;">退店申请</div>
                  </div>
                  <div style="text-align: center;margin-top: 20px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <BankOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 10px;">聊天投诉</div>
                  </div>
                  <div style="text-align: center;margin-top: 20px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <FileProtectOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 10px;">社区审核</div>
                  </div>
                </div>
              </div>
              <div class="a58">
                <div class="a59">
                  <div style="font-size: 17px;"><b>商品营业额Top10</b></div>
                  <div class="a60">查看更多</div>
                </div>
                <div class="a61" v-for="item in [1,2,3,4,5,6,7,8,9,10]" :key="item">
                  <div style="display: flex;">
                    <div style="width: 30px;">NO.{{item}}</div>
                    <div style="margin-left: 20px;">商家沙琪玛</div>
                  </div>
                  <div>{{Number(21313).toLocaleString()}}万</div>
                </div>
              </div>
              <div class="a58">
                <div class="a59">
                  <div style="font-size: 17px;"><b>商品销量Top10</b></div>
                  <div class="a60">查看更多</div>
                </div>
                <div class="a61" v-for="item in [1,2,3,4,5,6,7,8,9,10]" :key="item">
                  <div style="display: flex;">
                    <div style="width: 30px;">NO.{{item}}</div>
                    <div style="margin-left: 20px;">商家沙琪玛</div>
                  </div>
                  <div>{{Number(21313).toLocaleString()}}万</div>
                </div>
              </div>
              <div class="a58">
                <div class="a59">
                  <div style="font-size: 17px;"><b>二级分类销售量Top10</b></div>
                  <div class="a60">查看更多</div>
                </div>
                <div class="a61" v-for="item in [1,2,3,4,5,6,7,8,9,10]" :key="item">
                  <div style="display: flex;">
                    <div style="width: 30px;">NO.{{item}}</div>
                    <div style="margin-left: 20px;">商家沙琪玛</div>
                  </div>
                  <div>{{Number(21313).toLocaleString()}}万</div>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>
<style scoped>
  .a54 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 15px 0px;
    padding: 0px 60px;
  }

  .a55 {
    color: #999999;
    font-size: 12px;
  }

  .a56 {
    width: 100%;
    height: 400px;
  }

  .a44 {
    display: flex;
    padding: 20px;
    align-items: center;
    border-right: 1px solid #f5f5f5;
    margin-left: 20px;
  }

  .a45 {
    background-color: #f9f9f9;
    border-radius: 50%;
    margin-right: 20px;
    padding: 10px;
  }

  .a46 {
    font-size: 30px;
    color: #40a9ff;
  }

  .a47 {
    font-weight: bold;
    font-size: 30px;
  }

  .a58 {
    border-radius: 4px;
    padding: 10px 20px;
    background-color: #fff;
    margin-top: 10px;
  }

  .a59 {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .a60 {
    color: #40a9ff;
    cursor: pointer;
  }

  .a61 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f5f5f5;
    padding: 5px 0px;
  }

  .a62 {
    height: 10px;
    background-color: #f5f5f5;
  }
</style>