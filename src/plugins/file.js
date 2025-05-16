import OSS from "ali-oss";
import COS from "cos-js-sdk-v5";
import ObsClient from "esdk-obs-browserjs/src/obs";
import {saveAs} from "file-saver";
import {APPConfig} from "../config";
import * as qiniu from 'qiniu-js'
import { message } from 'ant-design-vue';

function uploadFile(global, file, fileType = "image", folder, loading, action = null) {
    if(fileType=='image'){
        // file.size>1024*3
        if(file.size>3*1024*1024){
            message.warning('上传图片大小不能超过3MB')
            return false
        }
    }
    let formData = new FormData();
    formData.append("file_type", fileType);
    formData.append("folder", folder);
    global.axios.post("factory_storage/Ticket/getTicket", {}, global).then((ticket_res) => {
        formData.append("ticket_time", ticket_res.ticket_time);
        global.axios.post("factory_storage/File/getUploadType", {}, global).then((upload_type_res) => {
            formData.append("upload_type", upload_type_res.upload_type);
            if (upload_type_res.upload_type === "local") {
                //保存到服务器
                global.axios.upload("factory_storage/File/uploadFile", {
                    file_type: fileType,
                    folder: folder,
                    ticket_time: ticket_res.ticket_time,
                    upload_type: upload_type_res.upload_type,
                }, global, true, null, file).then((res) => {
                    handleResult(fileType, action, res);
                });
            } else {
                //前端上传
                const point = file.name.lastIndexOf(".");
                let fileName = file.name.substr(0, point) + file.name.substr(point);
                let nowDate = new Date();
                let date = {
                    year: nowDate.getFullYear(),
                    month: nowDate.getMonth() + 1,
                    date: nowDate.getDate(),
                };
                let new_name = folder + "/" + date.year + date.month + date.date + "/" + getRandom() + file.name.substr(point);

                global.axios.post("factory_storage/File/refreshSTS", {}, global).then((sts_result) => {
                    if (upload_type_res.upload_type === "oss") {
                        try {

                            let oss = OSS({
                                accessKeyId: sts_result.keyId,
                                accessKeySecret: sts_result.keySecret,
                                stsToken: sts_result.token,
                                bucket: sts_result.bucket,
                                region: sts_result.region,
                                endpoint: sts_result.endpoint,
                                secure: true,
                                cname: true,
                            });

                            let url = sts_result.endpoint+"/" + new_name;
                            //oss分片上传
                            oss.multipartUpload(new_name, file, {
                                progress: function (p) {
                                    if (p === 1) {
                                        frontUploadSuccess(global, fileType, action, {
                                            file_type: fileType,
                                            upload_type: "oss",
                                            name: fileName,
                                            url: url,
                                            size: Math.round((file.size / 1024 / 1024) * 100) / 100,
                                        });
                                    }
                                },
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    } else if (upload_type_res.upload_type === "cos") {
                        try {
                            // 初始化实例
                            let cos = new COS({
                                SecretId: sts_result.keyId,
                                SecretKey: sts_result.keySecret,
                                XCosSecurityToken: sts_result.token,
                            });

                            cos.sliceUploadFile(
                                {
                                    Bucket: sts_result.bucket,
                                    Region: sts_result.region,
                                    Key: new_name,
                                    Body: file,
                                },
                                function (err, data) {
                                    if (err) console.log(err, data);
                                    else {
                                        let url = "https://" + sts_result.bucket + ".cos." + sts_result.region + ".myqcloud.com/" + new_name;
                                        frontUploadSuccess(global, fileType, action, {
                                            file_type: fileType,
                                            upload_type: "cos",
                                            name: fileName,
                                            url: url,
                                            size: Math.round((file.size / 1024 / 1024) * 100) / 100,
                                        });
                                    }
                                }
                            );
                        } catch (error) {
                            console.log(error);
                        }
                    } else if (upload_type_res.upload_type === "obs") {
                        try {
                            let bucketName = sts_result.bucket;
                            let PartSize = 500*1024 * 1024;
                            let lastPartSize = file.size % PartSize;

                            let obs = new ObsClient({
                                security_token: sts_result.token,
                                access_key_id: sts_result.keyId,
                                secret_access_key: sts_result.keySecret,
                                server: 'https://' + sts_result.point,
                            });
                            obs.initiateMultipartUpload({
                                Bucket: sts_result.bucket,
                                Key: new_name,
                            }, function (err, result) {
                                if (err) {
                                    console.log('Error1-->' + err);
                                } else {
                                    if (result.CommonMsg.Status === 200 && result.InterfaceResult) {
                                        let UploadId = result.InterfaceResult.UploadId

                                        // 段数量
                                        let count = Math.ceil(file.size / PartSize);
                                        let uploadInfo = []
                                        for (let n = 1; n <= count; n++) {
                                            obs.uploadPart({
                                                Bucket: bucketName,
                                                Key: new_name,
                                                // 设置分段号，范围是1~10000
                                                PartNumber: n,
                                                // 设置Upload ID
                                                UploadId: UploadId,
                                                // 设置将要上传的大文件
                                                SourceFile: file,
                                                // 设置分段大小
                                                PartSize: count === n ? lastPartSize : PartSize,
                                                // 设置分段的起始偏移大小
                                                Offset: (n - 1) * PartSize
                                            }, function (err, result) {
                                                if (err) {
                                                    console.log('Error2-->' + err);
                                                } else {
                                                    if (result.CommonMsg.Status === 200 && result.InterfaceResult) {
                                                        uploadInfo.push({
                                                            'PartNumber': n,
                                                            'ETag': result.InterfaceResult.ETag
                                                        })
                                                        if (n === count) {
                                                            //合并
                                                            uploadInfo = sortByKey(uploadInfo,"PartNumber")
                                                            obs.completeMultipartUpload({
                                                                Bucket: bucketName,
                                                                Key: new_name,
                                                                UploadId: UploadId,
                                                                Parts: uploadInfo
                                                            }, function (err, result) {
                                                                if (err) {
                                                                    console.log('Error3-->' + err);
                                                                } else {
                                                                    if (result.CommonMsg.Status === 200) {
                                                                        let url = "https://" + sts_result.bucket + '.' + sts_result.point + '/' + new_name;
                                                                        frontUploadSuccess(global, fileType, action, {
                                                                            file_type: fileType,
                                                                            upload_type: "obs",
                                                                            name: fileName,
                                                                            url: url,
                                                                            size: Math.round((file.size / 1024 / 1024) * 100) / 100,
                                                                        });
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    }
                                                }
                                            })
                                        }
                                    }
                                }
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    }else if (upload_type_res.upload_type === "qiniu"){
                        // 初始化上传对象
                        const uploadExtra = {
                            // 可选，是否启用浏览器兼容性上传。默认为 false。若前端请求来自浏览器，则启用该选项。示例： 'false'
                            browserUpload: false,
                            // 可选，是否启用分片上传。默认为 false。示例： 'false'
                            chunkUpload: true, // 可选，是否启用分片上传，同时需要设置分片大小（见 chunkSize）示例： 'false'
                            // 可选，分片大小。只有启用分片上传时才需要设置该参数。单位：字节。示例： '4194304' 表示 4MB
                            chunkSize: 4194304, // 可选，分片大小，单位：字节。示例： '4194304' 表示 4MB
                        };
                    // 调用七牛云SDK的upload函数进行上传（使用之前配置的上传对象和上传信息）
                        const observable = qiniu.upload(file,new_name, sts_result, uploadExtra)
                        const observer = {
                            next(res){
                            },
                            error(err){
                                console.log(err)
                            },
                            complete(res){
                                frontUploadSuccess(global, fileType, action, {
                                    file_type: fileType,
                                    upload_type: "qiniu",
                                    name: fileName,
                                    url: APPConfig.QNHost + "/" + new_name,
                                    size: Math.round((file.size / 1024 / 1024) * 100) / 100,
                                });
                            }
                        }
                        observable.subscribe(observer)
                    }
                });
            }
        });
    });
}

function download(path, name, global) {
    //根据url判断是云存储还是本地存储
    if (path.includes(APPConfig.apiURL)) {
        global.axios.download(null, path, {name: name}, global, "file");
    } else {
        //云存储下载
        saveAs(path, name);
    }
}

function sortByKey(array,key){
    return array.sort(function(a,b){
        var x=a[key];
        var y=b[key];

        return ((x<y)?-1:(x>y)?1:0)
    })
}

function downloadRichText(path, global) {
    //根据url判断是云存储还是本地存储
    if (path.includes(APPConfig.apiURL)) {
        return global.axios.download(null, path, {name: ""}, global, "rich_text");
    } else {
        let xhr = new XMLHttpRequest();
        let okStatus = document.location.protocol === "file:" ? 0 : 200;
        xhr.open("GET", path, false);
        xhr.overrideMimeType("text/html;charset=utf-8");
        xhr.send(null);
        return xhr.responseText;
    }
}

function frontUploadSuccess(global, fileType, action, formData) {

    global.axios.post("factory_storage/File/frontUpload", formData, global).then((res) => {
        handleResult(fileType, action, res);
    });
}

function handleResult(fileType, action, uploadResult) {
    if (action) {
        if (fileType == "rich_text_file") {
            //富文本编辑器
            action(uploadResult.url);
        } else {
            //一般上传
            action(uploadResult);
        }
    }
}

function getRandom() {
    let arr = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",],
        num = "";
    for (let i = 0; i < 32; i++) {
        num += arr[parseInt(Math.random() * 32)];
    }
    return num;
}

export default {
    uploadFile, download, downloadRichText,
};
