<script setup>
  import { inject, onBeforeMount, reactive, ref } from "vue";
  import { FormComponents } from "../../form_components/form";
  import { TableComponents } from "../../table_components/table";
  import { InfoCircleOutlined,UpCircleOutlined } from "@ant-design/icons-vue";

  let props = defineProps(["pageData"]);
  const pageData = props.pageData;

  let emit = defineEmits(["openChildPage", "closeChildPage"]);

  const global = inject("global").value;

  const activeKey = ref(['1', '2']);

</script>

<template>
  <!--搜索-->
  <div>
    <div style="display: flex;justify-content: space-between;">
      <div style="width: 15%;">
        <div style="border: 1px solid #eff0f4;border-radius: 5px;overflow: hidden;">
          <div style="background-color: #ff7300;color: #fff;text-align: center;padding: 10px 20px;">
            商品填写建议
          </div>
          <div style="padding: 10px;display: flex;">
            <div>属性</div>
            <div style="color: #ff7300;margin-left: 20px;">填写属性，获取流量</div>
          </div>
        </div>

        <div style="border: 1px solid #eff0f4;margin-top: 20px;border-radius: 5px;overflow: hidden;">
          <div style="background-color: #407cff;color: #fff;text-align: center;padding: 10px 20px;">
            发布助手
          </div>
          <div style="padding: 10px;color: #999999;">
            <div>商品轮播图</div>
            <div>a.尺寸宽高需要均大于480px</div>
            <div>b.大小3M以内</div>
            <div>c.数量限制在10张以内</div>
            <div>d.图片格式仅支持JPG,PNG格式</div>
            <div>e.批量上传时，图片须等宽高且不小于480px</div>
            <div
              style="display: flex;padding: 10px;border: 1px solid #ffecc8;background-color: #fff6e6;border-radius: 5px;">
              <div>
                <InfoCircleOutlined style="color: #ff7300;font-size: 14px;" />
              </div>
              <div style="margin-left: 5px;color: black;">请按要求填写商品信息，上传商品图片（注意轮播图上传事项）</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 商品信息等 -->
      <div style="width: 84%;">
        <!-- 基本信息 -->
        <div style="padding: 20px;border: 1px solid #f5f5f5;width: 100%;">
          <div style="display: flex;font-size: 16px;">
            <div style="color: #407cff;">1</div>
            <div style="margin-left: 5px;">基本信息</div>
          </div>
          <div>
            <div style="display: flex;margin-top: 20px;margin-left: 20px;">
              <div style="display: flex;">
                <div style="color: red;">*</div>
                <div>商品轮播图</div>
              </div>
              <div style="margin-left: 20px;">
                <div style="color: #ff7300;">请优先上传主轮播图，预填白底图</div>
                <div style="color: #999999;">图片要求：宽高比为1：1，或3：4，且宽高均大于480px，大小3M内，已上传0/10张。</div>
                <div style="margin-top: 5px;width: 100px;height: 100px;border: 1px solid #f5f5f5;"></div>
              </div>
            </div>
          </div>
          <div style="margin-top: 20px;margin-left: 34px;align-items: center;">
            <div style="display: flex;align-items: center;">
              <div style="display: flex;">
                <div style="color: red;">*</div>
                <div>商品标题</div>
              </div>
              <a-input type="text" style="margin-left: 20px;width: 79.5%;" placeholder="商品标题组成：商品描述+规格，最多输入30个汉字" />
            </div>
          </div>
          <div style="margin-top: 20px;margin-left: 40px;">
            <div style="display: flex;">
              <div>商品属性</div>
              <div style="margin-left: 20px;background-color: #f7f8fa;border-radius: 5px;width: 80%;">
                <div style="padding:10px 20px;display: flex;justify-content: space-between;">
                  <div style="display: flex;">
                    <div style="display: flex;">
                      <div>填写率</div>
                      <div style="color: #ff7300;margin-left: 5px;">12%</div>
                    </div>
                    <div style="margin-left: 20px;color: #999999;width: 60%;">请准确填写属性，有利于商品在搜索和推荐中露出，错误填写可能面临商品下架或流量流失</div>
                  </div>
                  <div style="display: flex;">
                    <div>没有合适属性值？</div>
                    <div style="color: #407cff;">点击添加</div>
                  </div>
                </div>
                <div style="background-color: #999999;height: 1px;width: 100%;"></div>
                <div style="padding:10px 20px;display: flex;justify-content: space-between;background-color: #f7f8fa;">
                  <!-- 左边 -->
                  <div style="width: 45%;">
                    <div>
                      <div style="display: flex;align-items: center;margin: 10px 0px;">
                        <div style="width: 30%;text-align: right;">品牌</div>
                        <a-input type="text" style="width: 60%;margin-left: 20px;" placeholder="请选择品牌名称" />
                      </div>
                      <div style="display: flex;margin: 10px 0px 10px 104px;">
                        <div style="color: #999999;">未找到合适品牌？</div>
                        <div style="color: #407cff;">点击添加</div>
                      </div>
                      <div style="display: flex;align-items: center;margin: 10px 0px;">
                        <div style="width: 30%;text-align: right;">品牌</div>
                        <a-input type="text" style="width: 60%;margin-left: 20px;" placeholder="请选择品牌名称" />
                      </div>
                      <div style="display: flex;align-items: center;margin: 10px 0px;">
                        <div style="width: 30%;text-align: right;">品牌</div>
                        <a-input type="text" style="width: 60%;margin-left: 20px;" placeholder="请选择品牌名称" />
                      </div>
                    </div>
                  </div>
                  <!-- 右边 -->
                  <div style="width: 45%;">
                    <div>
                      <div style="display: flex;align-items: center;margin: 10px 0px;">
                        <div style="width: 30%;text-align: right;">品牌</div>
                        <a-input type="text" style="width: 60%;margin-left: 20px;" placeholder="请选择品牌名称" />
                      </div>
                      <div style="display: flex;margin: 10px 0px 10px 104px;">
                        <div style="color: #999999;">未找到合适品牌？</div>
                        <div style="color: #407cff;">点击添加</div>
                      </div>
                      <div style="display: flex;align-items: center;margin: 10px 0px;">
                        <div style="width: 30%;text-align: right;">品牌</div>
                        <a-input type="text" style="width: 60%;margin-left: 20px;" placeholder="请选择品牌名称" />
                      </div>
                      <div style="display: flex;align-items: center;margin: 10px 0px;">
                        <div style="width: 30%;text-align: right;">品牌</div>
                        <a-input type="text" style="width: 60%;margin-left: 20px;" placeholder="请选择品牌名称" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style="margin-top: 20px;">
              <div style="display: flex;">
                <div>商品详情</div>
                <div style="margin-left:20px">富文本</div>
              </div>
            </div>
            <div style="display: flex;align-items: center;margin-left: 77px;margin-top: 10px;color: #407cff;">
              <div style="margin-right: 5px;">收起</div>
              <UpCircleOutlined style="color: #407cff;font-size: 14px;" />
            </div>
          </div>
        </div>
        <!-- 规格与库存 -->
        <div style="padding: 20px;margin-top: 20px;border: 1px solid #f5f5f5;width: 100%;">
          <div style="display: flex;font-size: 16px;">
            <div style="color: #407cff;">2</div>
            <div style="margin-left: 5px;">规格与库存</div>
          </div>
        </div>
        <!-- 服务与承诺 -->
        <div></div>
      </div>
    </div>
  </div>
  <!--导出-->
</template>

<style lang="less" scoped>

</style>