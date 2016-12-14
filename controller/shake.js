var wechat = require('wechat-enterprise');
var fs =require("fs");

var api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret,"41");

exports.gettugofwar = function(req, res) {
	var code = req.query.code;
	var state = req.query.state;
    var data;

    api.getAccessToken (function(err,data){
     	token = data.accessToken;
     	api.getUserIdByCode(code, (err, data) => {
		    api.getUser(data.UserId, (err,result) => {
		    	console.log(result);
                // result1 = {
                //     avata:"http://shp.qpic.cn/bizmp/ic7zogWndTyW6bS7qiaa6CDAptkLKrTPFMTk9hNUFpGYL9tn2fES2Bjw/"
                //  };
                // console.log(result1);


/*var data = {};
    data.httpUrl = $.config.httpUrl;
    data.socketUrl = $.config.socketUrl;*/

                
		    	res.render('page/tugofwar',result);
		    });
	    });
    });
};

exports.gettugofwarsummary = function(req, res) {
    var data = {};
    data.httpUrl = $.config.httpUrl;
    data.socketUrl = $.config.socketUrl;
	res.render('page/tugofwar_summary',data);
};