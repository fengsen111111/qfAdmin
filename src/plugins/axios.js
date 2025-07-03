import { message } from "ant-design-vue";
import axios from "axios";
import { Base64 } from "js-base64";
import JSEncrypt from "jsencrypt";
import { APPConfig } from "../config";
import { router } from "../router/index";

let findLanguageFunction = null;
// 创建axios实例
const httpService = axios.create();

// request拦截器
httpService.interceptors.request.use(
    (config) => {
        // 让每个请求携带token
        console.log('config',config);
        
        if (config.url == 'https://kzcptwo.market.alicloudapi.com/company_two/check'||config.url == 'https://kzidcardv1.market.alicloudapi.com/api-mall/api/id_card/check') { // 阿里云企业认证二要素
            config.headers["Authorization"] = 'APPCODE ' + '366b25062af24d76b52e60924ba0c7fc'
            config.headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
        }else {
            config.headers["Authorization"] = localStorage.getItem("Authorization");
            config.headers["Content-Type"] = "application/json;charset=UTF-8";
        }

        return config;
    },
    (error) => {
        // 请求错误处理
        Promise.reject(error);
    }
);

// respone拦截器
httpService.interceptors.response.use(
    (response) => {
        console.log('response',response);
        if(response.config.url == 'https://kzcptwo.market.alicloudapi.com/company_two/check'){
            return response.data; //企业认证
        }
        if(response.config.url == 'https://kzidcardv1.market.alicloudapi.com/api-mall/api/id_card/check'){
            return response.data;//开店人认证
        }
        let res = null;
        if (APPConfig.RSA === false) {
            res = response.data;
        } else {
            //解密
            res = rsaDecode(response.data);
        }
        //没有code 直接返回
        if (!res.hasOwnProperty("code")) return res;

        // 统一处理应用状态
        if (res.code !== 1) {
            // 需自定义
            // 返回异常
            return Promise.reject({
                status: res.code,
                message: res.message,
            });
        } else {
            //统一成功提示
            if (res.message)
                message.info(findLanguageFunction(res.message));
            return res.data;
        }
    },
    // 处理处理
    (error) => {
        if (error && error.response) {
            switch (error.response.status) {
                case 400:
                    error.message = "WrongRequest";
                    break;
                case 401:
                    error.message = "未授权，请重新登录";
                    break;
                case 403:
                    error.message = "拒绝访问";
                    break;
                case 404:
                    error.message = "WrongRequest";
                    break;
                case 405:
                    error.message = "请求方法未允许";
                    break;
                case 408:
                    error.message = "TimeOut";
                    break;
                case 500:
                    error.message = "ServiceError";
                    break;
                case 501:
                    error.message = "网络未实现";
                    break;
                case 502:
                    error.message = "网络错误";
                    break;
                case 503:
                    error.message = "服务不可用";
                    break;
                case 504:
                    error.message = "网络超时";
                    break;
                case 505:
                    error.message = "http版本不支持该请求";
                    break;
                default:
                    error.message = `未知错误${error.response.status}`;
            }
        } else {
            error.message = "Client Fails";
        }
        error.status = 0
        return Promise.reject(error);
    }
);

/*
 *  post请求
 *  url:请求地址
 *  loading:是否需要遮罩
 *  params:参数
 *  action:回调方法
 * */
export function post(url, params = {}, global, loading = true, rsa_status = true, action = null) {
    findLanguageFunction = global.findLanguage;
    if (loading) {
        if (global.loadingNumber === 0) {
            global.spinning = true;
            global.loadingNumber = 1;
        } else {
            global.loadingNumber++;
        }
    }
    //判断是否拼接接口域名
    let requestUrl = APPConfig.apiURL + "/" + url;
    if (url.includes("https://") || url.includes("http://")) requestUrl = url;

    //参数加密
    let rsa_result = rsaEncode(params, rsa_status);
    let response_result = false;
    return new Promise((resolve, reject) => {
        console.log('请求前', url);
        let query = {}
        if (url == 'aly/company_two/check') { //企业认证
            requestUrl = 'https://kzcptwo.market.alicloudapi.com/company_two/check'
            query = {
                ...rsa_result.params,
                rsa: rsa_result.rsa_params_status,
            }
        }else if (url == 'aly/api-mall/api/id_card/check') { //开店人认证
            requestUrl = 'https://kzidcardv1.market.alicloudapi.com/api-mall/api/id_card/check'
            query = {
                ...rsa_result.params,
                rsa: rsa_result.rsa_params_status,
            }
        } else {
            requestUrl= requestUrl
            query = {
                post_params: rsa_result.params,
                rsa: rsa_result.rsa_params_status,
            }
        }

        httpService({
            url: requestUrl,
            method: "post",
            data: query,
        })
            .then((response) => {
                // console.log('response111',response);
                response_result = response;
                if (action) action(response_result);
                resolve(response);
            })
            .catch((error) => {  //登陆                         //店铺名称查询                     
                if (url == 'factory_system/Base/login' || url == 'decoration/Store/checkStoreName') {
                    // console.log('error',error);
                    reject(error)
                } else {
                    handleError(error);
                }
            });
        if (loading) handleLoading(global);
    })
}

//上传文件
export function upload(url, params = {}, global, loading = true, action = null, fileObj) {
    findLanguageFunction = global.findLanguage;
    if (loading) {
        if (global.loadingNumber === 0) {
            global.spinning = true;
            global.loadingNumber = 1;
        } else {
            global.loadingNumber++;
        }
    }
    let form_data = new FormData();
    for (let key in params) {
        form_data.append("post_params[" + key + "]", params[key]);
    }

    form_data.append("file", fileObj);
    form_data.append("rsa", false);
    //判断是否拼接接口域名
    let requestUrl = APPConfig.apiURL + "/" + url;
    if (url.includes("https://") || url.includes("http://")) requestUrl = url;
    let response_result = false;
    return new Promise((resolve, reject) => {
        httpService({
            url: requestUrl,
            method: "post",
            transformRequest: [
                function (data, headers) {
                    return data;
                },
            ],
            data: form_data,
        })
            .then((response) => {
                response_result = response;
                if (action) action(response_result);
                resolve(response);
            })
            .catch((error) => {
                handleError(error);
            });
        if (loading) handleLoading(global);
    }).catch((e) => {
    });
}

//下载文件
export function download(url = null, path = null, params, global, type = "file") {
    findLanguageFunction = global.findLanguage;
    if (global.loadingNumber === 0) {
        global.spinning = true;
        global.loadingNumber = 1;
    } else {
        global.loadingNumber++;
    }
    //拿票
    return new Promise((resolve, reject) => {
        post(APPConfig.apiURL + "/factory_storage/Ticket/getTicket", {}, global)
            .then((ticket_res) => {
                params = Object.assign({ ticket_time: ticket_res.ticket_time }, params);
                if (!url) {
                    url = APPConfig.apiURL + "/factory_storage/File/downloadFile";
                    params = Object.assign({ url: path }, params);
                }
                //参数加密
                let rsa_result = rsaEncode(params, false);
                //获取文件流
                httpService({
                    url: url,
                    method: "post",
                    responseType: "blob",
                    data: {
                        post_params: rsa_result.params,
                        rsa: rsa_result.rsa_params_status,
                    },
                }).then((response) => {
                    const blob = new Blob([response], {
                        type: "text/plain;charset=utf-8",
                    });
                    if (type == "file") {
                        //保存文件流为文件
                        let downloadElement = document.createElement("a");
                        let href = window.URL.createObjectURL(blob); //创建下载的链接
                        downloadElement.href = href;
                        if (params.name) downloadElement.download = params.name; //下载后文件名
                        document.body.appendChild(downloadElement);
                        downloadElement.click(); //点击下载
                        document.body.removeChild(downloadElement); //下载完成移除元素
                        window.URL.revokeObjectURL(href); //释放掉blob对象
                    } else {
                        //返回文件內容
                        blob.text().then((data) => {
                            resolve(data);
                        }).catch((err) => { });
                    }
                }).catch((error) => {
                    handleError(error);
                });
                handleLoading(global);
            }).catch((e) => {
            });
    });
}

//统一处理loading
function handleLoading(global) {
    setTimeout(function () {
        if (global.loadingNumber > 0) {
            global.loadingNumber--;
        }
        if (global.loadingNumber === 0) {
            global.spinning = false;
        }
    }, 300);
}

//错误统一处理
function handleError(error) {
    setTimeout(function () {
        if (error.status === -999)
            message.warning(findLanguageFunction(error.message));
        if (error.status === 0)
            message.error(findLanguageFunction(error.message));
        if (error.status === -1) {
            localStorage.removeItem("Authorization");
            router.push("/login");
        }
        if (error.status === -2) {
            message.error(error.message ? findLanguageFunction(error.message) : '账号删除/禁用，联系管理员');
            setTimeout(() => {
                localStorage.removeItem("Authorization");
                router.push("/login");
            }, 2000);
        }
    }, 100);
}

//加密
function rsaEncode(params, rsa_status) {
    let rsa_params_status = false;
    if (APPConfig.RSA === true && rsa_status === true) {
        rsa_params_status = true;

        let rsa_params = JSON.stringify(params);
        rsa_params = Base64.encode(rsa_params);
        rsa_params = rsa_params.match(/.{1,50}/g); //分片
        let publicKey = APPConfig.publicKey;
        let encryptor = new JSEncrypt();
        encryptor.setPublicKey(publicKey);
        params = [];
        rsa_params.forEach((item) => {
            params.push(encryptor.encrypt(item));
        });
    }
    return { params: params, rsa: rsa_params_status };
}

//解密
function rsaDecode(data) {
    let decrypt = new JSEncrypt();
    let priKey = APPConfig.priKey;
    decrypt.setPrivateKey(priKey);
    let json_str = "";
    data.forEach((item) => {
        json_str += decrypt.decrypt(item);
    });
    json_str = Base64.decode(json_str);
    return JSON.parse(json_str);
}

export default {
    post, upload, download, rsaEncode, rsaDecode
};
