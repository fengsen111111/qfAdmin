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

  let emit = defineEmits(["openChildPage", "closeChildPage", "djtzmk"])

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

  const type = ref('')

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
        data: tjzd.value.month_money_sum.keys
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: tjzd.value.month_money_sum.values,
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
          return `${data.axisValue}<br/>新增用户数: ${data.data} `;
        },
        axisPointer: {
          type: 'line'
        }
      },
      xAxis: {
        type: 'category',
        data: tjzd.value.month_new_user_count.keys
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: tjzd.value.month_new_user_count.values,
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
          },
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
  }, 1500);

  const store_id = ref('')
  function getCustomerRoomList() {
    localStorage.removeItem("storeId");
    // 获取自己的角色ID和聊天状态
    global.axios.post('decoration/CustomerService/getMyJoinerSign', {}, global, true).then((res_one) => {
      console.log('自己商家id和禁言状态', res_one);
      store_id.value = res_one.joiner_sign
      type.value = res_one.joiner_sign == 1 ? "平台" : '商家'
      localStorage.setItem("storeId", res_one.joiner_sign);
      if (type.value == '平台') {
        tamplateSta()//统计
        getStoreMoneyTopList() // 获取商家营业额排行列表
        getGoodsSaledNumberTopList() // 获取商品销量排行列表
        getGoodsTypeSaledNumberTopList() // 获取商品二级分类销量排行列表
        getArticleStarTopList() // 获取作品点赞排行列表
        getArticleStarTopListVideo()  //获取视频点赞排行列表

      } else {
      }
    })
  }

  getCustomerRoomList() //执行

  const tjzd = ref({})//统计字段
  function tamplateSta() {
    global.axios.post('decoration/Setting/tamplateSta', {}, global, true).then((res) => {
      console.log('结果', res);
      tjzd.value = res
    })
  }

  // 跳转对应模块
  function handTz(str, strTwo, strThree) {
    if (str == '用户管理') {
      if (strTwo == '商家管理') {
        localStorage.setItem('indexGoShop', true)
      } else {
        localStorage.removeItem('indexGoShop')
      }
    }
    emit('djtzmk', str, strTwo, strThree)
  }
  const sjyyeList = ref([])
  const spxlList = ref([])
  const spejflxlList = ref([])
  const zpddList = ref([])
  const spdzList = ref([])
  // 获取商家营业额排行列表
  function getStoreMoneyTopList() {
    global.axios.post('decoration/Setting/getStoreMoneyTopList', {
      currentPage: 1,
      perPage: 10
    }, global, true).then((res) => {
      console.log('商家营业额排行列表', res);
      sjyyeList.value = res.list
    })
  }
  // 获取商品销量排行列表
  function getGoodsSaledNumberTopList() {
    global.axios.post('decoration/Setting/getGoodsSaledNumberTopList', {
      currentPage: 1,
      perPage: 10
    }, global, true).then((res) => {
      console.log('商家销量排行列表', res);
      spxlList.value = res.list
    })
  }
  // 获取商品二级分类销量排行列表
  function getGoodsTypeSaledNumberTopList() {
    global.axios.post('decoration/Setting/getGoodsTypeSaledNumberTopList', {
      currentPage: 1,
      perPage: 10
    }, global, true).then((res) => {
      console.log('获取商品二级分类销量排行列表', res);
      spejflxlList.value = res.list
    })
  }
  // 获取作品点赞排行列表
  function getArticleStarTopList() {
    global.axios.post('decoration/Setting/getArticleStarTopList', {
      type: 'a',
      currentPage: 1,
      perPage: 10
    }, global, true).then((res) => {
      console.log('获取作品点赞排行列表', res);
      zpddList.value = res.list
    })
  }
  // 获取视频点赞排行列表
  function getArticleStarTopListVideo() {
    global.axios.post('decoration/Setting/getArticleStarTopList', {
      type: 'b',
      currentPage: 1,
      perPage: 10
    }, global, true).then((res) => {
      console.log('获取视频点赞排行列表', res);
      spdzList.value = res.list
    })
  }

  const lookAll = ref(false)//查看更多
  const allTitle = ref('')//弹窗标题
  const allList = ref([])//弹窗数据
  const allColumn = ref([])//弹窗表头
  const columns_spxl_all = [//商品销量top
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '销量',
      dataIndex: 'saled_number',
      key: 'saled_number',
    }];
  const columns_sjyye_all = [//商家营业额
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '营业额',
      dataIndex: 'order_money',
      key: 'order_money',
    }];
  const columns_ejflxl_all = [//二级分类销售量Top10
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '销量',
      dataIndex: 'saled_number',
      key: 'saled_number',
    }];
  const columns_sqwzdz_all = [//社区文章点赞数量
    {
      title: '商品名称',
      dataIndex: 'title',
      key: 'title',
    }, {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '头像',
      dataIndex: 'head_image',
      key: 'head_image',
    },
    {
      title: '点赞数量',
      dataIndex: 'star_number',
      key: 'star_number',
    }
  ];
  function allShopList() {
    allList.value = []
    if (allTitle.value == '二级分类销售量排行') {
      allColumn.value = columns_ejflxl_all
      global.axios.post('decoration/Setting/getGoodsTypeSaledNumberTopList', {
        currentPage: 1,
        perPage: 100
      }, global, true).then((res) => {
        allList.value = res.list
      })
    } else if (allTitle.value == '商家营业额排行') {
      allColumn.value = columns_sjyye_all
      global.axios.post('decoration/Setting/getStoreMoneyTopList', {
        currentPage: 1,
        perPage: 100
      }, global, true).then((res) => {
        allList.value = res.list
      })
    } else if (allTitle.value == '商品销量排行') {
      allColumn.value = columns_spxl_all
      global.axios.post('decoration/Setting/getGoodsSaledNumberTopList', {
        currentPage: 1,
        perPage: 100
      }, global, true).then((res) => {
        allList.value = res.list
      })
    } else if (allTitle.value == '社区文章点赞数量排行') {
      allColumn.value = columns_sqwzdz_all
      global.axios.post('decoration/Setting/getArticleStarTopList', {
        type: 'a',
        currentPage: 1,
        perPage: 100
      }, global, true).then((res) => {
        allList.value = res.list
      })
    } else if (allTitle.value == '社区视频点赞数量排行') {
      allColumn.value = columns_sqwzdz_all
      global.axios.post('decoration/Setting/getArticleStarTopList', {
        type: 'b',
        currentPage: 1,
        perPage: 100
      }, global, true).then((res) => {
        allList.value = res.list
      })
    }
  }

</script>
<template>
  <div>
    <div v-if="type=='商家'">
      <img alt="" src="/resource/image/index_img.png" style="width: 100%;max-height: 500px;margin-top: 5vh">
    </div>
    <div v-if="type=='平台'">
      <div v-if="tjzd.all_money" style="overflow: auto;height: 90vh;">
        <a-row>
          <a-col :lg="24" :xl="18">
            <div>
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
                    <div class="a47">{{Number(tjzd.all_money).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon2.png"
                      style="width: 24px;height: 24px;position: relative;top:0px;" alt="">
                  </div>
                  <div>
                    <div>今日营业额</div>
                    <div class="a47">{{Number(tjzd.today_money).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon3.png"
                      style="width: 24px;height: 24px;position: relative;top:0px;" alt="">
                  </div>
                  <div>
                    <div>本月营业额</div>
                    <div class="a47">{{Number(tjzd.month_money).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon4.png"
                      style="width: 24px;height: 24px;position: relative;top:0px;" alt="">

                  </div>
                  <div>
                    <div>平台押金</div>
                    <div class="a47">{{Number(tjzd.store_money).toLocaleString()}}</div>
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
                    <div class="a47">{{Number(tjzd.store_number).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon6.png"
                      style="width: 24px;height: 24px;position: relative;top:0px;" alt="">
                  </div>
                  <div>
                    <div>商品总数</div>
                    <div class="a47">{{Number(tjzd.goods_number).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon7.png"
                      style="width: 24px;height: 24px;position: relative;top:0px;left: 1px;" alt="">
                  </div>
                  <div>
                    <div>平台收取总服务费</div>
                    <div class="a47">{{Number(tjzd.all_service_money).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon8.png"
                      style="width: 24px;height: 24px;position: relative;top:0px;" alt="">
                  </div>
                  <div>
                    <div>今日平台服务费</div>
                    <div class="a47">{{Number(tjzd.today_service_money).toLocaleString()}}</div>
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
                    <div class="a47">{{Number(tjzd.today_user_number).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/iocn10.png"
                      style="width: 24px;height: 24px;position: relative;top:-2px;" alt="">
                  </div>
                  <div>
                    <div>本月新增用户数</div>
                    <div class="a47">{{Number(tjzd.month_user_number).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon11.png"
                      style="width: 24px;height: 24px;position: relative;top:-2px;" alt="">
                  </div>
                  <div>
                    <div>社区总文章数</div>
                    <div class="a47">{{Number(tjzd.image_number).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="a44">
                  <div class="a45">
                    <img src="../../../public/resource/image/home/icon12.png"
                      style="width: 24px;height: 24px;position: relative;top:-2px;" alt="">
                  </div>
                  <div>
                    <div>社区总视频数</div>
                    <div class="a47">{{Number(tjzd.video_number).toLocaleString()}}</div>
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
                  <div style="margin-right: 100px;">
                    <b>总用户数：{{Number(tjzd.all_user_number).toLocaleString()}}</b>
                  </div>
                </div>
                <div style="width: 100%;height: 324px;position: relative;">
                  <div ref="chartRef" class="a56"></div>
                </div>
              </div>
              <div style="height: 10px;background-color: #f5f5f5;"></div>
              <div style="">
                <div class="a54">
                  <div>
                    <b>月营业额数据</b>
                    <span class="a55">（本年）</span>
                  </div>
                  <div>
                  </div>
                </div>
                <div style="width: 100%;height: 324px;position: relative;">
                  <div ref="chartRefTwo" class="a56"></div>
                </div>
              </div>
              <div style="height: 10px;background-color: #f5f5f5;"></div>
              <div style="display: flex;justify-content: space-between;">
                <div class="a58" style="width: 48%;">
                  <div class="a59">
                    <div style="font-size: 17px;"><b>社区文章点赞数量Top10</b></div>
                    <div class="a60" @click="()=>{lookAll = true;allTitle='社区文章点赞数量排行';allShopList()}">查看更多</div>
                  </div>
                  <div class="a61" v-for="(item,index) in zpddList" :key="item.id">
                    <div style="display: flex;">
                      <div style="width: 30px;margin-right: 30px;">NO.{{index+1}}</div>
                      <div style="display: flex;">
                        <img v-if="item.head_image"
                          style="width: 20px;height: 20px;border-radius: 50%;margin-right: 10px;" :src="item.head_image"
                          alt="">
                        <img v-else style="width: 20px;height: 20px;border-radius: 50%;margin-right: 10px;"
                          src="../../../public/resource/image/userImg.png" alt="">
                        <div>{{item.nickname?item.nickname:'默认昵称'}}</div>
                      </div>
                    </div>
                    <div style="display: flex;justify-content: space-between;width: 70%;">
                      <div v-if="item.title">{{item.title.length>24?item.title.slice(0,24)+'...':item.title}}</div>
                      <div>{{Number(item.star_number).toLocaleString()}}</div>
                    </div>
                  </div>
                  <a-empty v-if="zpddList.length==0" style="margin-top: 20%;" />
                </div>
                <div style="width: 10px;background-color: #f5f5f5;"></div>
                <div class="a58" style="width: 48%;">
                  <div class="a59">
                    <div style="font-size: 17px;"><b>社区视频点赞数量Top10</b></div>
                    <div class="a60" @click="()=>{lookAll = true;allTitle='社区视频点赞数量排行';allShopList()}">查看更多</div>
                  </div>
                  <div class="a61" v-for="(item,index) in spdzList" :key="item.id">
                    <div style="display: flex;">
                      <div style="width: 30px;margin-right: 30px;">NO.{{index+1}}</div>
                      <div style="display: flex;">
                        <img v-if="item.head_image"
                          style="width: 20px;height: 20px;border-radius: 50%;margin-right: 10px;" :src="item.head_image"
                          alt="">
                        <img v-else style="width: 20px;height: 20px;border-radius: 50%;margin-right: 10px;"
                          src="../../../public/resource/image/userImg.png" alt="">
                        <div>{{item.nickname?item.nickname:'默认昵称'}}</div>
                      </div>
                    </div>
                    <div style="display: flex;justify-content: space-between;width: 70%;">
                      <div v-if="item.title">{{item.title.length>24?item.title.slice(0,24)+'...':item.title}}</div>
                      <div>{{Number(item.star_number).toLocaleString()}}</div>
                    </div>
                  </div>
                  <a-empty v-if="spdzList.length==0" style="margin-top: 20%;" />
                </div>
              </div>
            </div>
          </a-col>
          <a-col :lg="10" :xl="6">
            <!-- right -->
            <div style="background-color: #f5f5f5;padding: 0px 10px;">
              <div style="padding: 20px;background-color: #fff;">
                <div style="display: flex;justify-content: space-between;">
                  <div style="font-size: 17px;"><b>工作台</b></div>
                  <div class="a60">管理</div>
                </div>
                <div style="display: grid;grid-template-columns: repeat(3, minmax(0, 1fr));">
                  <div @click="handTz('运营管理','设置','基本配置')" style="text-align: center;margin-top: 40px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <ContainerOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 12px;">运营管理</div>
                  </div>
                  <div @click="handTz('流水管理','流水管理')" style="text-align: center;margin-top: 40px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <ApartmentOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 12px;">流水管理</div>
                  </div>
                  <div @click="handTz('社区管理','话题管理')" style="text-align: center;margin-top: 40px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <CrownOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 12px;">社区管理</div>
                  </div>
                  <div @click="handTz('购物商城','商品管理')" style="text-align: center;margin-top: 40px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <InsertRowLeftOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 12px;">商城管理</div>
                  </div>
                  <div @click="handTz('用户管理','商家管理')" style="text-align: center;margin-top: 40px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <ShopOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 12px;">商家管理</div>
                  </div>
                  <div @click="handTz('用户管理','用户管理')" style="text-align: center;margin-top: 40px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <TeamOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 12px;">用户管理</div>
                  </div>
                </div>
                <div style="height: 1px;background-color: #E6e9f0;margin: 10px 0px;"></div>
                <div style="display: flex;justify-content: space-between;">
                  <div style="font-size: 17px;"><b>代办事项</b></div>
                </div>
                <div style="display: grid;grid-template-columns: repeat(3, minmax(0, 1fr));">
                  <div @click="handTz('用户管理','退店申请')" style="text-align: center;margin-top: 38px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <DeleteRowOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 12px;">退店申请</div>
                  </div>
                  <div @click="handTz('聊天管理','聊天投诉')" style="text-align: center;margin-top: 38px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <BankOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 12px;">聊天投诉</div>
                  </div>
                  <div @click="handTz('社区管理','文章管理')" style="text-align: center;margin-top: 38px;">
                    <span style="background-color: #f5f6f7;border-radius: 4px;padding: 10px;">
                      <FileProtectOutlined style="font-size: 20px;position: relative;top: 2px;" />
                    </span>
                    <div style="margin-top: 12px;">社区审核</div>
                  </div>
                </div>
              </div>
              <div class="a58">
                <div class="a59">
                  <div style="font-size: 17px;"><b>商家营业额Top10</b></div>
                  <div class="a60" @click="()=>{lookAll = true;allTitle='商家营业额排行';allShopList()}">查看更多</div>
                </div>
                <div class="a61" v-for="(item,index) in sjyyeList" :key="item.id">
                  <div style="display: flex;">
                    <div style="width: 30px;">NO.{{index+1}}</div>
                    <div style="margin-left: 20px;">{{item.name}}</div>
                  </div>
                  <div>{{Number(item.order_money).toLocaleString()}}</div>
                </div>
                <a-empty v-if="sjyyeList.length==0" style="margin-top: 20%;" />
              </div>
              <div class="a58">
                <div class="a59">
                  <div style="font-size: 17px;"><b>商品销量Top10</b></div>
                  <div class="a60" @click="()=>{lookAll = true;allTitle='商品销量排行';allShopList()}">查看更多</div>
                </div>
                <div class="a61" v-for="(item,index) in spxlList" :key="item.id">
                  <div style="display: flex;">
                    <div style="width: 30px;">NO.{{index+1}}</div>
                    <div style="margin-left: 20px;">{{item.name}}</div>
                  </div>
                  <div>{{Number(item.saled_number).toLocaleString()}}</div>
                </div>
                <a-empty v-if="spxlList.length==0" style="margin-top: 20%;" />
              </div>
              <div class="a58">
                <div class="a59">
                  <div style="font-size: 17px;"><b>二级分类销售量Top10</b></div>
                  <div class="a60" @click="()=>{lookAll = true;allTitle='二级分类销售量排行';allShopList()}">查看更多</div>
                </div>
                <div class="a61" v-for="(item,index) in spejflxlList" :key="item.id">
                  <div style="display: flex;">
                    <div style="width: 30px;">NO.{{index+1}}</div>
                    <div style="margin-left: 20px;">{{item.name}}</div>
                  </div>
                  <div>{{Number(item.saled_number).toLocaleString()}}</div>
                </div>
                <a-empty v-if="spejflxlList.length==0" style="margin-top: 20%;" />
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
    <!-- 社区文章点赞数量Top10弹窗，社区视频点赞数量Top10弹窗,二级分类销售量Top10弹窗，商品销量Top10弹窗，商家营业额Top10弹窗 -->
    <a-modal v-model:visible="lookAll" :title="allTitle" :footer="null" :width="allTitle=='商品销量排行'?'600px':'800px'">
      <div>
        <a-table :columns="allColumn" :data-source="allList">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'nickname'">
              <span>{{ record.nickname?record.nickname:'默认昵称' }}</span>
            </template>
            <template v-if="column.key === 'head_image'">
              <img v-if="record.head_image" :src="record.head_image" 
                style="width: 30px;height: 30px;border-radius: 50%;" alt="">
              <img v-else style="width: 30px;height: 30px;border-radius: 50%;"
                src="../../../public/resource/image/userImg.png" alt="">
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>
<style scoped>
  .a54 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 15px 0px;
    padding: 0px 20px;
    font-size: 17px;
  }

  .a55 {
    color: #999999;
    font-size: 14px;
  }

  .a56 {
    width: 76vw;
    height: 400px;
    position: absolute;
    left: -4vw;
    top: -5vh;
  }

  .a44 {
    display: flex;
    padding: 20px;
    align-items: center;
    border-right: 1px solid #f5f5f5;
    margin-left: 3vw;
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
    margin-top: 12px;
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