var serviceHostName = "http://caiji1.amzfx.cn/index.php/admin";
var currentUserInfo = {};
var serviceData = {
    teamList: [],
    stationList: [],
};

var serviceDataListener = {};

function containsKeyWithSearch(obj, search) {  
    return Object.keys(obj).some(key => key.includes(search));  
}  

function getRequest(path, params, callback){
    var queryString = "";

    var token = layui.data("layuiAdmin")["access_token"]; 

    if (params) {
        queryString = "?";

        // 产品搜索特殊处理
        var tempSearchs = [];
        if (containsKeyWithSearch(params,"search[]")) {
            tempSearchs = params["search[]"];
            delete params["search[]"];
        }

        queryString += new URLSearchParams(Object.entries(params)).toString(); 

        tempSearchs.forEach(item=>{
            queryString += "&search[]="+encodeURIComponent(item);
        });

        if (containsKeyWithSearch(params,"token")) {
            token = params['token'];
        }
    }

    layui.$.ajax({  
        url: serviceHostName + path + queryString,  
        type: 'get',  
        dataType: 'json',  
        data: null,
        withCredentials: true, // 允许发送凭据
        beforeSend: function(xhr) {  
          xhr.setRequestHeader('batoken', token); // 添加认证头部  
          // 可以继续添加其他头部  
        },
        success: function(res) {  
          
          if (res.code != 1) {
            if (res.code == 302 && window.location.href.indexOf('/user/login') == -1) {
              window.location.href = "/#/user/login"
            }
            layer.msg(res.msg || '数据获取失败', {
              offset: '15px'
              ,icon: 2
              ,time: 1000
            }, function(){ });
            return;
          }    
          
          callback(res);
  
        },  
        error: function(xhr, status, error) {  
            console.error("Error: " + error);  
        }  
    });
}

function postRequest(path, params, callback){
    var token = layui.data("layuiAdmin")["access_token"]; 
    
    layui.$.ajax({  
        url: serviceHostName + path,  
        beforeSend: function(xhr) {  
            xhr.setRequestHeader('batoken', token); 
            xhr.setRequestHeader('content-type', "application/json"); 
        },
        type: 'post',  
        dataType: 'json',  
        data: JSON.stringify(params),
        success: callback,  
        error: function(xhr, status, error) {  
            console.error("Error: " + error);  
        }  
    });
}

function delRequest(path, params, callback){
    var token = layui.data("layuiAdmin")["access_token"]; 
    
    layui.$.ajax({  
        url: serviceHostName + path,  
        beforeSend: function(xhr) {  
            xhr.setRequestHeader('batoken', token); 
            xhr.setRequestHeader('content-type', "application/json"); 
        },
        type: 'delete',  // 改为 DELETE 方法
        dataType: 'json',  
        data: JSON.stringify(params),
        success: callback,  
        error: function(xhr, status, error) {  
            console.error("Error: " + error);  
        }  
    });
}

function generateUUID() {  
    // RFC4122 version 4 calls for random numbers  
    var s = [];  
    var hexDigits = "0123456789abcdef";  
    for (var i = 0; i < 36; i++) {  
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);  
    } 
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  
    s[8] = s[13] = s[18] = s[23] = "-";  
  
    var uuid = s.join("");  
    return uuid;  
}  

function addListen(listenCallback){
    var uuid = generateUUID();
    serviceDataListener[uuid] = listenCallback;
    return uuid;
}

function removeListen(uuid) {
    delete serviceDataListener[uuid];
}

function notifyListener(key,value){
    const listeners = Object.values(serviceDataListener); 
    listeners.forEach(listener => {  
        listener(key, value);
    });
}

function applicationInit(retryTimes) {
    console.log("===========加载下拉列表数据============");

    getRequest("/index/index",null,(res)=>{
        console.log("当前用户信息：",res.data);
        if (res.code == 1) {
            currentUserInfo = res.data;
            const userId = currentUserInfo.adminInfo.id; // 假设用户 ID 字段名为 id

            const cachedTeamList = localStorage.getItem(`user_${userId}_teamList`);
            const cachedStationList = localStorage.getItem(`user_${userId}_stationList`);
            const cachedAuthList = localStorage.getItem(`user_${userId}_authList`);
            const cachedAllotList = localStorage.getItem(`user_${userId}_allotList`);
            const cacheTeamAreaList = localStorage.getItem(`user_${userId}_teamAreaList`);
            
            serviceData = {
                teamList: JSON.parse(cachedTeamList),
                stationList: JSON.parse(cachedStationList),
                authList: JSON.parse(cachedAuthList),
                allotList: JSON.parse(cachedAllotList),
                teamAreaList: JSON.parse(cacheTeamAreaList)
            };
            
            console.log("serviceData init",JSON.parse(JSON.stringify(serviceData)));

            getRequest("/index/getTeamArea", {
                page: 1,
                limit: 9999,
            }, (res) => {
                if(res.code == 1){
                    serviceData.teamAreaList = res.data.list || [];
                    localStorage.setItem(`user_${userId}_teamAreaList`, JSON.stringify(serviceData.teamAreaList));
                } else {
                    if (retryTimes > 0) {
                        applicationInit(retryTimes - 1);
                    }
                }
            });

            // 后续请求在用户 ID 获取后执行
            getRequest("/team/select",null,(res)=>{
                if (res.code == 1) {
                    serviceData.teamList = res.data.list;
                    notifyListener("teamList", serviceData.teamList);
                    // 缓存数据
                    localStorage.setItem(`user_${userId}_teamList`, JSON.stringify(serviceData.teamList));
                } else {
                    if (retryTimes > 0) {
                        applicationInit(retryTimes - 1);
                    }
                }
            });

            getRequest("/station/select",{type:2},(res)=>{
                if (res.code == 1) {
                    serviceData.stationList = res.data.list;
                    notifyListener("stationList", serviceData.stationList);
                    // 缓存数据
                    localStorage.setItem(`user_${userId}_stationList`, JSON.stringify(serviceData.stationList));
                } else {
                    if (retryTimes > 0) {
                        applicationInit(retryTimes - 1);
                    }
                }
            });

            getRequest("/auth.admin/select",{type:2},(res)=>{
                if (res.code == 1) {
                    serviceData.authList = res.data.list;
                    notifyListener("authList", serviceData.authList);
                    // 缓存数据
                    localStorage.setItem(`user_${userId}_authList`, JSON.stringify(serviceData.authList));
                } else {
                    if (retryTimes > 0) {
                        applicationInit(retryTimes - 1);
                    }
                }
            });

            getRequest("/product/allotSelect",{type:2},(res)=>{
                if (res.code == 1) {
                    serviceData.allotList = res.data.list;
                    notifyListener("allotList", serviceData.allotList);
                    // 缓存数据
                    localStorage.setItem(`user_${userId}_allotList`, JSON.stringify(serviceData.allotList));
                } else {
                    if (retryTimes > 0) {
                        applicationInit(retryTimes - 1);
                    }
                }
            });
        }
    });
}



applicationInit(5);
function getBlobRequest(path, params, callback) {
    var queryString = "";
    var token = layui.data("layuiAdmin")["access_token"]; 

    if (params) {
        queryString = "?";
        // 产品搜索特殊处理
        var tempSearchs = [];
        if (containsKeyWithSearch(params,"search[]")) {
            tempSearchs = params["search[]"];
            delete params["search[]"];
        }

        queryString += new URLSearchParams(Object.entries(params)).toString(); 

        tempSearchs.forEach(item=>{
            queryString += "&search[]="+encodeURIComponent(item);
        });

        if (containsKeyWithSearch(params,"token")) {
            token = params['token'];
        }
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', serviceHostName + path + queryString, true);
    xhr.responseType = 'blob';  // 关键修改：使用blob类型接收二进制数据
    xhr.setRequestHeader('batoken', token);
    xhr.withCredentials = true;
    
    xhr.onload = function() {
        if (this.status === 200) {
            const disposition = xhr.getResponseHeader('Content-Disposition');
            let filename = '产品列表.xlsx';
            if (disposition && disposition.indexOf('filename=') !== -1) {
                filename = disposition.split('filename=')[1].replace(/"/g, '');
                try {
                    filename = decodeURIComponent(filename);
                } catch(e) {
                    console.error('文件名解码失败:', e);
                }
            }
            
            callback({
                blob: this.response,
                filename: filename,
                type: xhr.getResponseHeader('Content-Type') || 'application/vnd.ms-excel'
            });
        } else {
            // 处理错误响应
            const reader = new FileReader();
            reader.onload = function() {
                try {
                    const errorJson = JSON.parse(this.result);
                    layer.msg(errorJson.msg || '下载失败', {
                        icon: 2,
                        time: 2000
                    });
                } catch(e) {
                    layer.msg('下载失败: ' + xhr.statusText, {
                        icon: 2,
                        time: 2000
                    });
                }
            };
            reader.readAsText(this.response);
        }
    };
    
    xhr.onerror = function() {
        layer.msg('下载失败: 网络错误', {
            icon: 2,
            time: 2000
        });
    };
    
    xhr.send();
}