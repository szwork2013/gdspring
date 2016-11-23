var wechat = require('wechat-enterprise');
var fs =require("fs");

var api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret,"41");

exports.getreg = function(req, res) {
	var code = req.query.code;
	var state = req.query.state;

 	api.getUserIdByCode(code, (err, data)=>{
	    api.getUser(data.UserId, function(err,result){
	    	if(result.errcode!=0){
	    		result = {};
	    		$.extend(result,{avatar:"http://shp.qpic.cn/bizmp/ic7zogWndTyXMsdxYl6QLXpamFlm9FbvzPSokoV6F5BWibqBtK8lTU6Q/"});
	    		console.log(result);
	    		res.render('page/signup',result);
	    		return;
	    	}
	    	res.render('page/signup',result);
	    });
    });
};