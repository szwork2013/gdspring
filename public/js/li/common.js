var urlstr = window.location.href;
urlstr = urlstr.substring(0, urlstr.indexOf('/', 9));

/*获取url中的参数*/
function QueryString() {
    var name, value, i;
    var str = location.href;
    var num = str.indexOf("?")
    str = str.substr(num + 1);
    var arrtmp = str.split("&");
    for (i = 0; i < arrtmp.length; i++) {
        num = arrtmp[i].indexOf("=");
        if (num > 0) {
            name = arrtmp[i].substring(0, num);
            value = arrtmp[i].substr(num + 1);
            this[name] = value;
        }
    }
}

/*
* String.sub().字符串截取(汉字占两位)
*/
String.prototype.sub = function (n) {
    var str = '';
    var r = /[^\x00-\xff]/g;

    if (this == null || this.length <= 0 || this == undefined) {
        return '';
    }
    else if (this.replace(r, "mm").length <= n) {
        return this;
    }
    else {
        var m = Math.floor(n / 2);
        for (var i = m; i < this.length; i++) {
            if (this.substr(0, i).replace(r, "mm").length >= n) {
                return "<abbr title=\"" + this + "\">" + this.substr(0, i) + "…</abbr>";
            }
        }
        return this;
    }
}

//时间格式化
var Dateformat = function (obj, fmt) {
    if (obj != undefined && obj != null && obj != '') {
        if (typeof obj == 'string')
            var dt1 = new Date(Date.parse(obj.replace(/-/g, "/").replace(/T/g, " ")));
        else
            var dt1 = obj;
        var o = {
            "M+": dt1.getMonth() + 1, //月份 
            "d+": dt1.getDate(), //日 
            "H+": dt1.getHours(),
            "h+": dt1.getHours(), //小时 
            "m+": dt1.getMinutes(), //分 
            "s+": dt1.getSeconds(), //秒 
            "q+": Math.floor((dt1.getMonth() + 3) / 3), //季度 
            "S": dt1.getMilliseconds() //毫秒 
        };
        if (fmt == undefined || fmt == null || fmt == '')
            fmt = "yyyy-MM-dd";
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (dt1.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    } else {
        return '';
    }
}

var setCookie = function () {
    var expireTime = new Date().getTime() + 1000 * 36000;
    var da = new Date();
    da.setTime(expireTime);
    document.cookie = 'userid=admin;expires=' + da.toGMTString() + ';path=/';
    document.cookie = 'sessionid=xxxxxxxxxxxxxxxxx;expires=' + da.toGMTString() + ';path=/';
}

var QiuniuHost = function () {
    var qiniuurl = "http://7xnwvr.com2.z0.glb.qiniucdn.com/";  //正式空间
    //var qiniuurl = "http://7xlopw.com2.z0.glb.qiniucdn.com/";   //测试空间
    return qiniuurl;
}

var getQiniuUrl = function (key) {    
    return QiuniuHost() + key;
}

/*
* 文件上传(返回文件标识，文件名为空时上传不成功)
* @id              {string} 上传控件id
* @callback        {obj} 回调方法
* @exts            {Exts} 格式类型"gif,jpg,png"
* @fileSize        {number} 文件大小(KB)
* @linkType        {string} 文件所属模块分类
* @maxnum          {number} 多选时控制文件数量
* @async          -{bool} 是否异步执行
* return           -1(FileTypeError):文件格式不正确；-2(UploadError):上传异常；-3(FileSizeError)：文件大小超出
*/
var uploadfile = function (id, fileSize, exts, linkType, callback, async, maxnum, minnum) {

    var imgTypes = new Array("gif", "jpg", "jpeg", "png", "bmp");
    if (exts) {
        imgTypes = exts.split(",");
    }

    var files = $("#" + id).get(0).files;
    if (files.length <= 0) {
        callback("0");
        return;
    }

    maxnum = maxnum || 0;
    minnum = minnum || 0;
    if (maxnum !== 0) {
        if (files.length > maxnum) {
            callback("-4"); //选中文件数超过最大数
            return;
        }
    }
    if (minnum !== 0) {
        if (files.length < minnum) {
            callback("-4"); //选中文件数超过最大数
            return;
        }
    }

    //执行同步还是异步 默认值为false
    async = async || false;
    //文件大小 默认值为2*1024KB
    fileSize = fileSize || 2 * 1024;

    var data = new FormData();
    for (var i = 0; i < files.length; i++) {
        var size = (files[i].size / 1024).toFixed(2);
        if (size > fileSize) {
            if (callback != undefined) {
                callback("-3");
            }
            return;
        }

        var fileName = files[i].name;
        var ext = fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase();
        if ($.inArray(ext, imgTypes) < 0) {
            if (callback != undefined) {
                callback("-1");
            }
            return;
        }

        data.append("file" + i, files[i]);
    }

    $.ajax({
        type: "POST",
        url: "/api/Base/FileUpload?type=" + linkType,
        contentType: false,
        processData: false,
        async: async,
        data: data,
        success: function (results) {
            if (callback != undefined) {
                callback(results);
            }
            return;
        },
        error: function (result) {
            if (callback != undefined) {
                callback("-2");
            }
            return;
        }
    });
}

/*
显示body中的内容
*/
var getBodyHtml = function (id, url, obj) {
    $.get(url, function (result) {
        $("#" + id).empty();
        $("#" + id).append(result);
    });
    //显示当前页名称
    $(".header-title").children().html($(obj).text());
}

/*
点击菜单显示body中的内容
*/
var getBodyHtmlByMenu = function (id, url, obj) {
    $.get(url, function (result) {
        $("#" + id).empty();
        $("#" + id).append(result);
    });
    //显示当前页名称
    $(".header-title").children().html($(obj).text());
    //组装面包屑
    CreateBreadcrumb(obj);
}
//创建面包屑
var CreateBreadcrumb = function (obj) {
    $(".breadcrumb").empty();
    var str = "";
    var liName = "";
    var thirdName = $(obj).parent().parent().parent().parent().parent().children().closest("a").text();
    if ($(obj).parent().parent().parent().parent().parent().children().closest("a").text() != "")//有三级目录
    {
        liName += '<li><i class="fa fa-home"></i><a href="#">' + $(obj).parent().parent().parent().parent().parent().children().closest("a").text() + '</a></li>';
        liName += '<li class="active">' + $(obj).parent().parent().parent().children().closest("a").text() + '</li>';
    }
    else {
        liName += '<li><i class="fa fa-home"></i><a href="#">' + $(obj).parent().parent().parent().children().closest("a").text() + '</a></li>';
    }
    liName += '<li class="active">' + $(obj).text() + '</li>';
    $(".breadcrumb").append(liName);
}

//function getCookie(name) {
//    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
//    if (arr = document.cookie.match(reg))
//        return unescape(arr[2]);
//    else
//        return null;
//}

//手机号验证
function checkMobie(mobile)
{
    var telReg = !!mobile.match(/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
    return telReg;
}

function checkEmial(email)
{
    var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    return !reg.test(email);
}




/*
* 添加cookie
* objName  {string} Cookie名称
* objValue {string} Cookie值
* objHours {int} 有效期（小时）
*/
function addCookie(objName, objValue, objHours) {
    var str = objName + "=" + escape(objValue);
    if (objHours > 0) {
        var date = new Date();
        var ms = objHours * 3600 * 1000;
        date.setTime(date.getTime() + ms);
        str += "; expires=" + date.toString();
    }
    document.cookie = str;
}

/*
* 获取指定名称的cookie的值
* objName {string} Cookie名称
* return  {string} 得到的Cookie值
*/
function getCookie(objName) {
    var arrStr = document.cookie.split("; ");
    for (var i = 0; i < arrStr.length; i++) {
        var temp = arrStr[i].split("=");
        if (temp[0] == objName) return unescape(temp[1]);
    }
}

/*
* 设置Cookie
* name {string} Cookie名称
* value {string} Cookie值
*/
function setCookie(name, value) {
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + "; expires=" + exp.toString();
}

/*
* 删除cookie
* name {string} Cookie名称
*/
function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null) document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}
