// 项目名称：装修商城
export const APPConfig = {
    appPageComponentsFolder: 'decoration',
    apiURL: 'https://api.qfcss.cn',
    WebSocketURL: 'wss://api.qfcss.cn/wss',  //
    RSA: false,
    publicKey: 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAOLvkcxwz9hbeiKYWFi40rUdazvEt0Vaf/gtlqqP+tj7W4jeAPl9IinuMqWoq6H2VryLaoMBTprSlxXNMb+HOw8CAwEAAQ==',
    priKey: 'MIIBUwIBADANBgkqhkiG9w0BAQEFAASCAT0wggE5AgEAAkEA4u+RzHDP2Ft6IphYWLjStR1rO8S3RVp/+C2Wqo/62PtbiN4A+X0iKe4ypairofZWvItqgwFOmtKXFc0xv4c7DwIDAQABAkBOjv5a1matECW8mh5jQD/44KFBhHypLoYERMvWaZc9y0bom3+X2PMZeiTBHzxlveax+YWwVF7WgKOPJpVXzM25AiEA8evdlqAzSaaNzeVOznHZOd6eEHUxdMyivLUEpFMCeeUCIQDwJHM6UfhmAnoKGqJnKFjSnp8Z30xyYLRIBAcA97pB4wIgCSD2Xp2y8b+IMFHL1Hx1Tvq4ijRx5k9mgKpv/2dme4UCIBCrJwhkSi6ie2AaKy2n4kp0UizUkBTcW4coKGhLybTrAiARJ3yvHEdPfBPmCbQQ0UBe5Rv9ZrDAYtLcVX8kDZje/Q=='
};
//项目用到的页面
import TablePage from '@/components/app_page_components/decoration/table.vue'
import FormPage from '@/components/app_page_components/beverage/form.vue'
import DetailPage from '@/components/base_page_components/detail.vue'
import StatisticsPage from '@/components/app_page_components/decoration/statistics.vue'
import goodsPage from '@/components/app_page_components/decoration/publishPage.vue'//编辑商品

import IndexPage from '@/components/base_page_components/index.vue' //项目首页，可以采用通用也可以使用个性化
import publishPage from '@/components/app_page_components/decoration/publishPage.vue'//编辑商品
// import AddStorePage from '@/components/app_page_components/decoration/shopInfo.vue'//平台添加店铺信息
import AddStorePage from '@/components/app_page_components/decoration/openShop.vue'//平台添加店铺信息
import shopOut from '@/components/app_page_components/decoration/shopOut.vue'//商家退店
import EditCarriagePage from '@/components/app_page_components/decoration/shippingTemplates.vue'//运费模板
// import newShop from '@/components/app_page_components/decoration/newShop.vue'//发布新商品
import AddNewGoodsPage from '@/components/app_page_components/decoration/newShop.vue'//发布新商品   //正确版本

import myInfo from '@/components/app_page_components/decoration/myInfo.vue'//我的店铺信息
import capitalAccount from '@/components/app_page_components/decoration/capitalAccount.vue'//我的店铺信息--资金账户
import addressManage from '@/components/app_page_components/decoration/addressManage.vue'//地址管理
import userDetails from '@/components/app_page_components/decoration/userDetails.vue'//用户详情
import orderDetails from '@/components/app_page_components/decoration/orderDetails.vue'//订单详情

import pcLookGoodsDetails from '@/components/app_page_components/decoration/pcLookGoodsDetails.vue'//平台查看商品详情
import EditStoreInfo from '@/components/app_page_components/decoration/EditStoreInfo.vue'//修改商家信息
import SubmitInvoice from '@/components/app_page_components/decoration/SubmitInvoice.vue'//地址管理


import courierManagement from '@/components/app_page_components/decoration/courierManagement.vue'//快递管理


export const allPageComponents = {
    SubmitInvoice,
    capitalAccount,
    TablePage, FormPage, DetailPage, IndexPage,
    StatisticsPage,publishPage,AddStorePage,shopOut,
    goodsPage,
    EditCarriagePage,
    // newShop,
    AddNewGoodsPage,myInfo,addressManage,
    userDetails,orderDetails,
    pcLookGoodsDetails,
    EditStoreInfo,
    courierManagement
}

// 项目名称：快鹿送酒
// export const APPConfig = {
//     appPageComponentsFolder: 'beverage',
//     apiURL: 'https://api.kuailusongjiu.com',
//     WebSocketURL: '',
//     RSA: false,
//     publicKey: 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAOLvkcxwz9hbeiKYWFi40rUdazvEt0Vaf/gtlqqP+tj7W4jeAPl9IinuMqWoq6H2VryLaoMBTprSlxXNMb+HOw8CAwEAAQ==',
//     priKey: 'MIIBUwIBADANBgkqhkiG9w0BAQEFAASCAT0wggE5AgEAAkEA4u+RzHDP2Ft6IphYWLjStR1rO8S3RVp/+C2Wqo/62PtbiN4A+X0iKe4ypairofZWvItqgwFOmtKXFc0xv4c7DwIDAQABAkBOjv5a1matECW8mh5jQD/44KFBhHypLoYERMvWaZc9y0bom3+X2PMZeiTBHzxlveax+YWwVF7WgKOPJpVXzM25AiEA8evdlqAzSaaNzeVOznHZOd6eEHUxdMyivLUEpFMCeeUCIQDwJHM6UfhmAnoKGqJnKFjSnp8Z30xyYLRIBAcA97pB4wIgCSD2Xp2y8b+IMFHL1Hx1Tvq4ijRx5k9mgKpv/2dme4UCIBCrJwhkSi6ie2AaKy2n4kp0UizUkBTcW4coKGhLybTrAiARJ3yvHEdPfBPmCbQQ0UBe5Rv9ZrDAYtLcVX8kDZje/Q=='
// };
// //项目用到的页面
// // import TablePage from '@/components/base_page_components/table.vue'
// import FormPage from '@/components/app_page_components/beverage/form.vue'
// import DetailPage from '@/components/base_page_components/detail.vue'
// import CustomerPage from '@/components/base_page_components/customer_service.vue'

// // import IndexPage from '@/components/base_page_components/index.vue' //项目首页，可以采用通用也可以使用个性化
// import IndexPage from '@/components/app_page_components/beverage/index.vue' //项目首页，可以采用通用也可以使用个性化
// import EditGoods from '@/components/app_page_components/beverage/EditGoods.vue' //商品编辑页
// import TablePage from '@/components/app_page_components/beverage/table.vue'


// export const allPageComponents = {
//     TablePage, FormPage, DetailPage, CustomerPage, IndexPage,EditGoods
// }












