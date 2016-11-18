    /*
* 读文件夹内的文件夹名
*/
exports.getReaddir = (dirPath, type) => {
    // 读proxy目录结构
    return (files => {
    	switch (type) {
			case 'all':
				return files;
			case 'file':
				return files.filter(v => v.indexOf('.') != -1);
			case 'folder':
				return files.filter(v => v.indexOf('.') == -1);
			default:
				return [];
		}
    })($.fs.readdirSync(dirPath));
};

/**
 * ajax请求
 * obj：请求配置
 * cb：回调
 */
$.ajax = (obj, cb) => {
    $.request[obj.type]({
        headers: {
            'content-type': 'application/json',
            'cookie': 'sessionid=' + obj.session.id + ';userid=' + (obj.session.user ? (obj.session.user.Innerid || "") : "")
        },
        url: obj.url,
        body: JSON.stringify(obj.data)
    }, function (error, response, body) {
        //回调返回
        cb(error, body);
    });
};

/**
 * 缓存结构体生成
 */
$.setCookie = (req, obj) => {
    // 存sessionid
    obj.sessionID = req.sessionID;
    // 存用户数据
    obj.user = req.session ? req.session.user : {};
    // 返回组装
    return obj;
};

/**
 * 计算签名
 * jsapi_ticket
 * url
 */
$.sign = function (jsapi_ticket, url) {
    // 返回签名
    return (function (ret, jsSHA) {
        shaObj = new jsSHA((function (args) {
            return (function (keys, newArgs, string) {
                keys = keys.sort()
                keys.forEach(function (key) {
                    newArgs[key.toLowerCase()] = args[key];
                });
                for (var k in newArgs) {
                    string += '&' + k + '=' + newArgs[k];
                }
                string = string.substr(1);
                return string;
            })(
                Object.keys(args),
                {},
                ""
            );
        })(ret), 'TEXT');
        ret.signature = shaObj.getHash('SHA-1', 'HEX');
        return ret;
    })({
        jsapi_ticket: jsapi_ticket,
        nonceStr: Math.random().toString(36).substr(2, 15),
        timestamp: parseInt(new Date().getTime() / 1000) + '',
        url: url
    }, $.jssha);
};

/**
* 日志整理方法：1
*/
$.showLog = (err, data, eventsName) => {
    var errcode = "0";
    var errmsg = "正常";
    if (data != undefined) {
        if(data.Message != undefined) {
            errcode=-1;
            errmsg="接口异常，严重错误！【{0}】".format(data.Message);
        }
    }
    return "事件名称：{0};返回编码：{1};返回内容：{2}".format(eventsName, data.errcode, data.errmsg);
};

/**
* 日志整理方法：2
* 参数：
*   eventsName 方法名
*   para：参数
*   data: 结果
*   err: 异常
*/
$.showFunLog = (eventsName, para, data) => {
    // 组装消息文本
    var strmsg = "事件名：{0};\n参数：{1};\n返回码：{2};\n返回结果：{3};\n返回内容：{4}\n\r";
    // 是否存在结果
    if (data != undefined) {
        // 转换结果对象
        return (dt => {
            // 是否系统异常
            if (dt.Message != undefined) {
                return strmsg.format(eventsName, JSON.stringify(para), '-1', '该接口已挂掉了', data);
            }
            // 是否结构异常
            if (dt.errcode == undefined ) {
                return strmsg.format(eventsName, JSON.stringify(para), '无', '非法结构，不识别！', data);
            }
            // 是否结果异常
            return strmsg.format(eventsName, JSON.stringify(para), dt.errcode, dt.errcode ? dt.errmsg : '正常', data);
        })(JSON.parse(data || '{}'));
    } else {
        return strmsg.format(eventsName, JSON.stringify(para), '-1', '结果不存在', '无');
    }
};

$.randomNum = function(mim,max) {
    var choice = max - mim + 1;
    return Math.floor(Math.random() * choice + mim);
};

$.getSortFun = (order, sortBy) => {
    var ordAlpah = (order == 'asc') ? '>' : '<';
    var sortFun = new Function('a', 'b', 'return a.' + sortBy + ordAlpah + 'b.' + sortBy + '?1:-1');
    return sortFun;
};

$.parseNullDate = function(obj, col) {
    if (obj && obj[col]) {
        if (!(new Date(obj[col]).getFullYear()) || new Date(obj[col]).getFullYear() < 1980) {
            obj[col] = '未知';
        }
    }
}

$.extend = function(destination, source) {
	for (var property in source) {
	    destination[property] = source[property];
	}
	return destination;
}

/***
** 主动推消息
***/
$.emit = (key, name, data) => {
    if ($.config.socket.clients[key]) {
        $.config.socket.clients[key].emit(name, data);
    }
    return true;
};