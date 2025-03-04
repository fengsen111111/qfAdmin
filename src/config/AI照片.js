//项目名称：AI照片
export const APPConfig = {
    appPageComponentsFolder: 'ai_photos',
    apiURL: 'https://api.ai.sczhiyun.net',
    RSA: false,
    publicKey: 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAOLvkcxwz9hbeiKYWFi40rUdazvEt0Vaf/gtlqqP+tj7W4jeAPl9IinuMqWoq6H2VryLaoMBTprSlxXNMb+HOw8CAwEAAQ==',
    priKey: 'MIIBUwIBADANBgkqhkiG9w0BAQEFAASCAT0wggE5AgEAAkEA4u+RzHDP2Ft6IphYWLjStR1rO8S3RVp/+C2Wqo/62PtbiN4A+X0iKe4ypairofZWvItqgwFOmtKXFc0xv4c7DwIDAQABAkBOjv5a1matECW8mh5jQD/44KFBhHypLoYERMvWaZc9y0bom3+X2PMZeiTBHzxlveax+YWwVF7WgKOPJpVXzM25AiEA8evdlqAzSaaNzeVOznHZOd6eEHUxdMyivLUEpFMCeeUCIQDwJHM6UfhmAnoKGqJnKFjSnp8Z30xyYLRIBAcA97pB4wIgCSD2Xp2y8b+IMFHL1Hx1Tvq4ijRx5k9mgKpv/2dme4UCIBCrJwhkSi6ie2AaKy2n4kp0UizUkBTcW4coKGhLybTrAiARJ3yvHEdPfBPmCbQQ0UBe5Rv9ZrDAYtLcVX8kDZje/Q=='
};
//项目用到的页面
import TablePage from '@/components/base_page_components/table.vue'
import FormPage from '@/components/base_page_components/form.vue'
import DetailPage from '@/components/base_page_components/detail.vue'
import CustomerPage from '@/components/base_page_components/customer_service.vue'

import IndexPage from '@/components/base_page_components/index.vue' //项目首页，可以采用通用也可以使用个性化
import StatisticsPage from '@/components/app_page_components/ai_photos/statistics.vue' //统计

export const allPageComponents = {
    TablePage, FormPage, DetailPage, CustomerPage, IndexPage, StatisticsPage
}





