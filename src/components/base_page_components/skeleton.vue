<script setup>
  import { ExclamationCircleOutlined, ContainerOutlined, BellOutlined, MailOutlined, MessageOutlined } from "@ant-design/icons-vue";
  import md5 from "js-md5";
  import { createVNode, inject, onBeforeMount, onMounted, reactive,ref  } from "vue";
  import { allPageComponents } from "../../config";
  import { message } from 'ant-design-vue';
  import CustomerPageVis from '@/components/app_page_components/decoration/customer_service_vis.vue'

  const global = inject("global").value;

  const skeleton_state = reactive({
    author: "", //开发者信息
    admin: {}, //管理员信息

    collapsed: false, //二级菜单向左折叠/向右展开

    menuData: [], //菜单数据
    tabMenuCheckedLabel: "首页", //一级菜单名称
    tabCheckedMenu: {}, //一级选中菜单
    menuCheckedValues: [], //二级、三级选中的菜单key，仅有一个值
    openedPages: [], //已经打开的所有页面
    tags: [], //已经打开的所有tag

    nowPage: {}, //当前页面
  });

  onBeforeMount(() => {
    global.axios.post("factory_system/Base/afterLogin", {}, global, false).then((res) => {
      skeleton_state.author = res.author;
      skeleton_state.admin = res.admin;
      skeleton_state.admin.portrait = res.admin.portrait ? res.admin.portrait : "/resource/image/head_img.png";
      global.adminMsg = skeleton_state.admin
      // res.menu.push({
      //   icon: "",
      //   label: "新开发页面",
      //   order: "1",
      //   page_id: "0",
      //   pid: "706154120674803772",
      //   type: "publishPage",
      //   url: "",
      //   value: "723777073939746104",
      //   children: [
      //     {
      //       icon: "",
      //       label: "运费模板(开发中)",
      //       order: "1",
      //       page_id: "0",
      //       pid: "706154120674803773",
      //       type: "shippingTemplates",
      //       url: "",
      //       value: "333333",
      //     }
      //   ]
      // })
      //初始化tabMenu为未选中
      skeleton_state.menuData = res.menu;
      //循环三次，给每个菜单页面设置page_key以及checked = false
      skeleton_state.menuData.forEach((tabMenu, tab_index) => {
        skeleton_state.menuData[tab_index]["checked"] = false;
        skeleton_state.menuData[tab_index]["font_color"] = "#fff !important";
        if (tabMenu.hasOwnProperty("children"))
          tabMenu.children.forEach((firstMenu, fir_index) => {
            if (!firstMenu.hasOwnProperty("children")) {
              skeleton_state.menuData[tab_index].children[fir_index][
                "checked"
              ] = false;
            } else {
              firstMenu.children.forEach((secondMenu, sec_index) => {
                skeleton_state.menuData[tab_index].children[fir_index].children[
                  sec_index
                ]["checked"] = false;
              });
            }
          });
      });
    });
  });

  onMounted(() => {
    //打开首页
    openPage(
      { value: -1, label: "首页", type: "IndexPage", page_key: "index_page" },
      true
    );
  });

  //注销
  function logout() {
    global.Modal.confirm({
      title: global.findLanguage("确定要注销登陆吗？"),
      okText: global.findLanguage("确定"),
      cancelText: global.findLanguage("取消"),
      icon: createVNode(ExclamationCircleOutlined),
      onOk() {
        localStorage.setItem("Authorization", "");
        global.router.push("/login");
      },
      onCancel() {
      },
    });
  }

  //展开二级菜单
  function showFirstMenu(value) {
    skeleton_state.menuData.forEach((item, index) => {
      //判断是哪个tabMenu被选中，并设置相关值
      skeleton_state.menuData[index]["checked"] = false;
      skeleton_state.menuData[index]["font_color"] = "";
      if (value == item.value) {
        skeleton_state.tabMenuCheckedLabel =
          skeleton_state.menuData[index]["label"];
        skeleton_state.menuData[index]["checked"] = true;
        skeleton_state.menuData[index]["font_color"] = "#fff !important";
        skeleton_state.tabCheckedMenu =
          skeleton_state.menuData[index]["children"];
      }
    });
  }

  //鼠标移入移除时topMenu时修改字体颜色
  function changeFontColor(value, handleType) {
    skeleton_state.menuData.forEach((item, index) => {
      if (value == item.value && handleType == "in" && item.checked == false) {
        skeleton_state.menuData[index]["font_color"] = "#1890ff !important";
      } else {
        skeleton_state.menuData[index]["font_color"] = "#fff !important";
      }
    });
  }

  //打开页面
  function openPage(pageData, openTagStatus = false) {
    // if () {//当前是退店页面
    //   message.error('正在退店，禁止跳转')
    //   return false
    // } else {
    //   // 当前不是退店就跳转到退店
    // }
    // console.log('pageData', pageData);
    let new_page = true;
    skeleton_state.openedPages.forEach((item, index) => {
      if (
        pageData.hasOwnProperty("page_key") &&
        item.page_key === pageData.page_key
      ) {
        new_page = false;
      }
    });
    if (new_page) {
      if (!pageData.hasOwnProperty("page_key"))
        Object.assign(pageData, {
          page_key: md5(new Date() + Math.round(Math.random() * 10000)),
        });
      skeleton_state.openedPages.push(pageData);
    }

    if (openTagStatus) openTag(pageData);
    else setNowPage(pageData);
  }

  //设置当前页面
  function setNowPage(pageData) {
    skeleton_state.nowPage = getChildPage(pageData);

    skeleton_state.openedPages.forEach((item, index) => {
      skeleton_state.openedPages[index].open_status = false;
      if (skeleton_state.nowPage.page_key == item.page_key) {
        skeleton_state.openedPages[index].open_status = true;
      }
    });
  }

  function getChildPage(pageData) {
    let child_page = null;
    skeleton_state.openedPages.forEach((item, index) => {
      if (item.parent_page_key === pageData.page_key) {
        child_page = getChildPage(item);
      }
    });
    if (child_page) return child_page;
    else return pageData;
  }

  //打开子页面
  function openChildPage(pageData) {
    openPage(pageData);
  }

  //关闭子页面
  function closeChildPage(page_key) {
    skeleton_state.openedPages.forEach((item, index) => {
      if (item.page_key === page_key) {
        skeleton_state.openedPages.splice(index, 1);
        skeleton_state.openedPages.forEach((parent) => {
          if (item.parent_page_key === parent.page_key) {
            setTimeout(function () {
              setNowPage(parent);
            }, 50);
          }
        });
      }
    });
  }

  //打开tag
  function openTag(pageData) {
    let old_tag = false;
    skeleton_state.tags.forEach((item, index) => {
      skeleton_state.tags[index].checked_status = false;
      if (pageData.page_key == item.page_key) {
        skeleton_state.tags[index].checked_status = true;
        old_tag = true;
      }
    });
    if (!old_tag) {
      Object.assign(pageData, { checked_status: true });
      skeleton_state.tags.push(pageData);
    }

    //切换菜单选中(三次循环)
    skeleton_state.menuData.forEach((tabMenu, tab_index) => {
      if (tabMenu.hasOwnProperty("children"))
        tabMenu.children.forEach((firstMenu, fir_index) => {
          if (firstMenu.hasOwnProperty("children")) {
            firstMenu.children.forEach((secondMenu, sec_index) => {
              if (
                secondMenu.hasOwnProperty("page_key") &&
                secondMenu.page_key == pageData.page_key
              ) {
                skeleton_state.menuData[tab_index].children[fir_index].children[
                  sec_index
                ]["checked"] = true;
                skeleton_state.menuCheckedValues = [secondMenu.value];
                skeleton_state.menuData[tab_index].children[fir_index][
                  "checked"
                ] = true;
                showFirstMenu(tabMenu["value"]);
              }
            });
          } else {
            if (
              firstMenu.hasOwnProperty("page_key") &&
              firstMenu.page_key == pageData.page_key
            ) {
              skeleton_state.menuData[tab_index].children[fir_index][
                "checked"
              ] = true;
              skeleton_state.menuCheckedValues = [firstMenu.value];
              showFirstMenu(tabMenu["value"]);
            }
          }
        });
    });

    setNowPage(pageData);

    if (pageData.value === -1) {
      skeleton_state.tabMenuCheckedLabel = "首页";
      skeleton_state.tabCheckedMenu = [];
      skeleton_state.menuCheckedValues = [];
      showFirstMenu(-1);
    }
  }

  //关闭Tag
  function closeTag(page_key) {
    //删除页面，删除子页面
    skeleton_state.openedPages.forEach((item, openPageIndex) => {
      if (item.page_key == page_key) {
        deleteChildrenPage(page_key);
        skeleton_state.openedPages.splice(openPageIndex, 1);
      }
    });

    //关闭tag
    skeleton_state.tags.forEach((item, tagIndex) => {
      if (item.page_key == page_key) {
        //判断当前tage是要关闭的tag就切换至该tag上一个tag
        if (item.checked_status) openTag(skeleton_state.tags[tagIndex - 1]);
        skeleton_state.tags.splice(tagIndex, 1);
      }
    });
  }

  //关闭所有Tag
  function closeAllTag() {
    skeleton_state.tags.forEach((item, index) => {
      if (item.page_key != "index_page") {
        setTimeout(() => {
          closeTag(item.page_key);
        }, 5);
      }
    });
  }

  //递归删除子页面
  function deleteChildrenPage(parent_page_key) {
    skeleton_state.openedPages.forEach((item, index) => {
      if (item.parent_page_key == parent_page_key) {
        deleteChildrenPage(item.page_key);
        skeleton_state.openedPages.splice(index, 1);
      }
    });
  }

  //修改密码
  function changePassword() {
    let page = {
      value: "changePWD",
      label: global.findLanguage("修改密码"),
      page_id: "changePWD",
      type: "FormPage",
      parent_page_key: "index_page",
      data: { id: skeleton_state.admin.id },
      url: "factory_admin/Admin/getEditStructure?scene=changePWD",
    };
    openPage(page);
  }
  //关闭播放器
  function closeVideo() {
    global.videoState.options.src = ""
  }

  // 前往查看退店路由
  function goLookTD() {
    // console.log('前往查看退店路由',skeleton_state.menuCheckedValues);
    openPage({
      checked: true,
      checked_status: true,
      icon: "",
      label: "发布商品(开发中)",
      open_status: true,
      order: "1",
      page_id: "0",
      page_key: "e06ac6e73a5db3b8f010acb46114b0fd",
      pid: "706154120674803772",
      type: "publishPage",
      url: "",
      value: "111111",
    }, false)
    skeleton_state.menuCheckedValues = ['111111']
  }
  // 点击规则中心
  function gzzx() {
    // message.error('功能暂未开通')
    global.router.push('/ruleCenter?title=学习中心')
  }
  const msgVisible = ref(false)//消息弹框开关
  const msgType = ref('1')//消息类型
  // 点击消息,点击站内信 1消息2站内信
  function openVis(type) {
    msgType.value = type+''
    msgVisible.value = true
    if(type==1){
      console.log('点击消息');
    }else{
      console.log('点击站内信');
    }
  }
  const msgKey = ref('1')//消息类型
  function editMsgKey(key) {
    msgKey.value = key
  }

  const serVis = ref(false)//聊天弹框开关
  // 点击消息,点击站内信 1消息2站内信
  function openSer() {
    serVis.value = true
  }
</script>

<template>
  <a-layout>
    <!-- v-show="!skeleton_state.collapsed"  -->
    <a-layout-sider class="menu">
      <div class="project-name">
        <div style="display: flex;margin: 0 auto;align-items: center;">
          <img :src="global.adminLogo" alt="" style="width: 30px;height: 30px;margin-right: 20px;" />
          <span>{{ global.appName }}</span>
        </div>
      </div>
      <div class="line"></div>
      <div align="center" style="width: 100%">
        <div class="tab-name">{{ skeleton_state.tabMenuCheckedLabel }}</div>
      </div>
      <!--  -->
      <div class="menu-list">
        <a-menu :inlineCollapsed="true" v-model:selectedKeys="skeleton_state.menuCheckedValues" mode="inline">
          <template v-for="(item, index) in skeleton_state.menuData" :key="index">
            <a-sub-menu v-if="item.hasOwnProperty('children') && item.children.length > 0" :key="item.value">
              <template #title>
                <span>
                  <span class="iconfont" v-html="item.icon" />
                  <span>{{ item.label }}</span>
                </span>
              </template>
              <template v-for="child in item.children" :key="child.value">
                <template v-if="child.children">
                  <a-sub-menu :key="child.value">
                    <template #title>
                      <span>
                        <!-- <span class="iconfont" v-html="child.icon" /> -->
                        <span>{{ child.label }}</span>
                      </span>
                    </template>
                    <a-menu-item v-for="iss in child.children" :key="iss.value" @click="openPage(iss, true)">
                      {{ iss.label }}
                    </a-menu-item>
                  </a-sub-menu>
                </template>
                <!-- 只有一级 -->
                <template v-else>
                  <a-menu-item :key="child.value" @click="openPage(child, true)">
                    <!-- <template #icon>
                      <span class="iconfont" v-html="child.icon" />
                    </template> -->
                    {{ child.label }}
                  </a-menu-item>
                </template>
              </template>
            </a-sub-menu>
            <a-menu-item v-else :key="item.value" @click="openPage(item, true)">
              <span class="iconfont" v-html="item.icon" />{{ item.label }}
            </a-menu-item>
          </template>
        </a-menu>
      </div>
    </a-layout-sider>
    <a-layout>
      <a-layout-header>
        <!-- <div class="icon-font" style="color: #656565 !important; font-size: 22px">
          <span v-if="!skeleton_state.collapsed" class="iconfont"
            @click="skeleton_state.collapsed = !skeleton_state.collapsed">&#xe79a;</span>
          <span v-else class="iconfont" @click="skeleton_state.collapsed = !skeleton_state.collapsed">&#xe794;</span>
        </div> -->

        <div class="tag">
          <a-tag v-for="tag in skeleton_state.tags" :key="tag.value" :class="tag.checked_status ? 'active-tag' : ''"
            :closable="tag.value === -1 ? false : true" @click="openTag(tag)" @close="closeTag(tag.page_key)">
            {{ tag.label }}
          </a-tag>
        </div>
        <div style="height: 60px; width: 50px">
          <a-tag v-if="skeleton_state.tags.length > 1" style="
              float: right;
              line-height: 28px;
              height: 28px;
              margin-right: 10px;
              padding: 0 10px;
              margin-top: 16px;
            " @click="closeAllTag()"><span class="iconfont" style="font-size: 26px">&#xe6a1;</span></a-tag>
        </div>
        <div @click="gzzx()">
          <div style="text-align: center;line-height: 18px;padding-top: 20px;color: #666666;font-size: 12px;">
            <ContainerOutlined style="font-size: 16px;" />
            <br>
            <span>学习中心</span>
          </div>
        </div>
        <div class="admin-msg">
          <a-dropdown>
            <a class="ant-dropdown-link" href="javascript:;" style="color: #515a6e !important">
              <img :src="skeleton_state.admin.portrait" alt="" />
              {{ skeleton_state.admin.nickname }}
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item v-if="skeleton_state.admin.id != -1">
                  <span @click="changePassword">修改信息</span>
                </a-menu-item>
                <a-menu-item>
                  <span @click="logout">退出登陆</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <a-dropdown>
          <a v-show="global.languageList.length > 1 ? true : false" class="ant-dropdown-link" href="javascript:;">
            <div class="language" style="margin-right: 20px; color: #515a6e !important">
              {{ global.language.name }}
              <span class="iconfont" style="font-size: 22px; float: right; margin-left: 5px">&#xe64d;</span>
            </div>
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item v-for="(item, index) in global.languageList" :key="index"
                @click="global.changeLanguage(item.code)">
                {{ item.name }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-layout-header>

      <a-layout-content>
        <div v-for="page in skeleton_state.openedPages" :key="page.page_key" v-show="page.open_status" class="content">
          <keep-alive>
            <component :is="allPageComponents[page.type]" :pageData="page" @closeChildPage="closeChildPage"
              @openChildPage="openChildPage" @goLookTD="goLookTD" />
          </keep-alive>
        </div>
      </a-layout-content>
      <!-- 固定标 -->
      <div style="position: fixed;top: 30vh;right: 30px;cursor: pointer;z-index: 999;">
        <div>
          <!-- BellOutlined,MailOutlined,MessageOutlined -->
          <a-badge count="5">
            <div @click="openVis(1)"
              style="width: 68px;background-color: #f5f5f5;padding: 10px;text-align: center;border-radius: 5px;color: #666666;margin-bottom: 20px;">
              <BellOutlined style="font-size: 18px;" />
              <br><span style="font-size: 12px;">消息</span>
            </div>
          </a-badge><br>
          <a-badge count="5">
            <div @click="openVis(2)"
              style="width: 68px;background-color: #f5f5f5;padding: 10px;text-align: center;border-radius: 5px;color: #666666;margin-bottom: 20px;">
              <MailOutlined style="font-size: 18px;" />
              <br><span style="font-size: 12px;">站内信</span>
            </div>
          </a-badge><br>
          <a-badge count="0">
            <div @click="openSer()"
              style="width: 68px;background-color: #f5f5f5;padding: 10px;text-align: center;border-radius: 5px;color: #666666;margin-bottom: 20px;">
              <MessageOutlined style="font-size: 18px;" />
              <br><span style="font-size: 12px;">官方客服</span>
            </div>
          </a-badge>
        </div>
        <!-- 聊天弹框 -->
        <a-modal v-model:visible="serVis" width="1000px" :footer="null">
          <div v-if="serVis">
           <CustomerPageVis :pageData="{}" />
          </div>
        </a-modal>
        <!-- 消息站内信弹框 -->
        <a-modal v-model:visible="msgVisible" width="600px" :footer="null">
          <div >
            <a-tabs v-model:activeKey="msgType">
              <a-tab-pane key="1" tab="消息盒子">
                <div style="display: flex;">
                  <div style="width: 20%;border: solid 1px #e8e8e8;text-align: center;">
                    <div @click="editMsgKey(1)" :class="msgKey=='1'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">店铺通知</div>
                    <div @click="editMsgKey(2)" :class="msgKey=='2'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">物流售后</div>
                    <div @click="editMsgKey(3)" :class="msgKey=='3'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">账户资金</div>
                    <div @click="editMsgKey(4)" :class="msgKey=='4'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">违规预警</div>
                    <div @click="editMsgKey(5)" :class="msgKey=='5'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">店铺营销</div>
                    <div @click="editMsgKey(6)" :class="msgKey=='6'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">商品动态</div>
                    <div @click="editMsgKey(7)" :class="msgKey=='7'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">店铺推广</div>
                    <div @click="editMsgKey(8)" :class="msgKey=='8'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">店铺违规</div>
                    <div @click="editMsgKey(9)" :class="msgKey=='9'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">商家成长</div>
                    <div @click="editMsgKey(10)" :class="msgKey=='10'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">买菜通知</div>
                  </div>
                  <div style="width: 80%;">
                    <div v-if="msgKey==2">
                      <div style="padding: 5px 20px;">
                        <div  style="color: #666666;">
                          <div style="display: flex;justify-content: space-between;">
                            <div style="font-weight: bold;">拼多多新手入驻攻略，必看！</div>
                            <div>13:57</div>
                          </div>
                          <div style="margin: 5px 0px;">多多大学为您准备《入门必学10节课》，带0基础的你快速赚钱！</div>
                          <div style="height: 1px;width: 100%;background-color: #f5f5f5;"></div>
                        </div>
                      </div>
                    </div>
                    <div v-else style=" margin-top: 20%;"><a-empty /></div>
                  </div>
                </div>
              </a-tab-pane>
              <a-tab-pane key="2" tab="站内信" force-render>
                <div style="display: flex;">
                  <div style="width: 20%;border: solid 1px #e8e8e8;text-align: center;">
                    <div @click="editMsgKey(1)" :class="msgKey=='1'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">店铺动态</div>
                    <div @click="editMsgKey(2)" :class="msgKey=='2'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">平台动态</div>
                    <div @click="editMsgKey(3)" :class="msgKey=='3'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">规则更新</div>
                    <div @click="editMsgKey(4)" :class="msgKey=='4'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">违规通知</div>
                    <div @click="editMsgKey(5)" :class="msgKey=='5'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">营销推广</div>
                    <div @click="editMsgKey(6)" :class="msgKey=='6'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">重要通知</div>
                    <div @click="editMsgKey(7)" :class="msgKey=='7'?'checkKey':''" style="border-bottom: 1px solid #e8e8e8;padding: 10px 0px;">商家成长</div>
                  </div>
                  <div style="width: 80%; margin-top: 10%;">
                    <a-empty />
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>
            <div style="margin-left: 20%;border-top: 1px solid #e8e8e8;margin-top: 10px;padding-top: 8px;display: flex;justify-content: space-between;align-items: center;">
              <a-button>全部标记已读</a-button>
              <div>共有 1 条</div>
            </div>
          </div>
        </a-modal>
      </div>
    </a-layout>
  </a-layout>
  <!--  全局视频组件-->
  <a-modal v-model:visible="global.videoState.isCollapse" :centered="true" :closable="true" :footer="null"
    :keyboard="false" @cancel="closeVideo" :maskClosable="false" :width="580+'px'" :height="280+'px'">
    <vue3VideoPlay v-bind="global.videoState.options" />
  </a-modal>

</template>

<style lang="less" scoped>
  /* 消息选中样式 */
  .checkKey{
    background-color: #f0f7ff;
    color: #407cff;
  }
  .ant-layout {
    .tab-menu {
      flex: none !important;
      min-width: 100px !important;
      max-width: 100px !important;
      background-color: #20222a !important;
      height: 100vh;
      overflow-y: auto;
      overflow-x: hidden;
      font-size: 14px;
      color: white;
      text-align: left;

      .logo {
        width: 100%;
        height: 60px;
        margin-bottom: 2px;
        padding-top: 10px;

        .logo-img {
          width: auto;
          height: 40px;
          border-radius: 3px;
        }
      }

      .tab-menu-list {
        padding-bottom: 50px;

        .tab-menu-item {
          width: 100%;
          height: 46px;

          .tab-menu-card-checked {
            height: 100%;
            margin: 20px 4px;
            border-radius: 2px;
            border-bottom: 3px solid #1890ff;
          }

          .tab-menu-card {
            height: 100%;
            margin: 20px 4px;
            border-radius: 2px;
            border: 1px solid #495462;
          }

          .icon-font {
            font-size: 22px;
            line-height: 22px;
            height: 22px;
          }

          .menu-label {
            margin-top: 2px;
            line-height: 16px;
            height: 16px;
          }
        }
      }
    }

    .menu {
      flex: none !important;
      min-width: 200px !important;
      max-width: 200px !important;
      background-color: white;
      height: 100vh;
      overflow-y: auto;

      .project-name {
        display: flex;
        align-items: center;
        color: #515a6e;
        font-size: 20px;
        height: 60px;

        span {
          width: 100%;
          text-align: center;
        }
      }

      .line {
        width: 100%;
        height: 1px;
        background-color: #f6f6f6;
      }

      .tab-name {
        position: relative;
        bottom: 12px;
        color: #515a6e;
        width: auto;
        display: inline-block !important;
        display: inline;
        padding: 0 20px;
        background-color: white;
      }

      .menu-list {
        height: calc(100vh - 95px);
        padding-bottom: 20px;
        overflow-y: auto;

        .iconfont {
          font-size: 22px;
          line-height: 22px;
          height: 22px;
          position: relative;
          top: 3px;
          right: 2px;
        }
      }
    }

    .ant-menu-inline {
      border: 1px white solid;
    }

    .ant-layout-header {
      height: 60px;
      line-height: 60px;
      background-color: #fff;
      border-left: 1px solid #f6f6f6;
      padding: 0 10px;
      display: flex;

      .icon-font {
        color: #545353;
        font-size: 26px;
        margin-right: 20px;
      }

      .tag {
        display: flex;
        flex: 1;
        height: 60px;
        overflow-x: scroll;

        .ant-tag {
          line-height: 28px;
          height: 28px;
          margin-right: 10px;
          padding: 0 10px;
          margin-top: 16px;
        }

        .active-tag {
          padding: 0 16px;
          line-height: 28px;
          border: 1px solid #1890ff;
          color: #1890ff;
          background: #e8f4ff;
        }
      }

      .admin-msg {
        margin-left: 10px;
        margin-right: 20px;
        height: 60px;

        img {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          margin-right: 10px;
        }
      }
    }

    .ant-layout-content {
      /* //height: calc(100vh - 120px); */
      height: auto;
      overflow-y: hidden;

      .content {
        padding: 14px 14px 0 14px;
        width: calc(100% - 14px);
        background-color: white;
        height: calc(100vh - 80px);
        margin: 7px;
        border-radius: 3px;

        .ant-layout-content {
          height: auto;

          /* //height: calc(100vh - 150px); */
          .ant-layout-footer {
            padding: 0;
            width: 35%;
            background-color: white;
            font-size: 14px;
            color: #515a6e;
            position: absolute;
            bottom: 24px;
          }
        }
      }
    }
  }
</style>