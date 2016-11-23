var wechat = require('wechat-enterprise'),
    fs =require("fs"),
    async = $.async,
    util = require('util'),
    redis = $.plug.redis.redisserver;

var api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret,"41");
var KEY = {
    USER         : 'user:%s',
};

exports.getreg = function(req, res) {
	var code = req.query.code;
	var state = req.query.state;

 	api.getUserIdByCode(code, (err, data)=>{
 		var result = {};
		if(data.errcode == 0){
		   var keyid = util.format(KEY.USER, result.userid);
		   redis.lpush("reg", keyid, (err, data) => {
		   });

		   redis.hgetall(keyid, (err, data){
		   	  res.render('page/signup',data);
		   });
		}else
		{
		   var keyid = util.format(KEY.USER, "renth");
		   redis.lpush("reg", keyid, (err, data) => {
		   });
		   $.extend(result,{avatar:"http://shp.qpic.cn/bizmp/ic7zogWndTyXMsdxYl6QLXpamFlm9FbvzPSokoV6F5BWibqBtK8lTU6Q/"});
		   res.render('page/signup',result);
		}
		
		
	    // api.getUser(data.UserId, function(err,result){
	    // 	if(result.errcode!=0){
	    // 		result = {};
	    // 		$.extend(result,{avatar:"http://shp.qpic.cn/bizmp/ic7zogWndTyXMsdxYl6QLXpamFlm9FbvzPSokoV6F5BWibqBtK8lTU6Q/"});
	    // 		console.log(result);
	    // 		res.render('page/signup',result);
	    // 		return;
	    // 	}

	    // 	if(result.errcode ==0){
	    // 		var keyid = util.format(KEY.USER, result.userid);
	    // 		// $.extend(result, 
	    // 		// 	{	
	    // 		// 		redis.keys
	    // 		// 	});

	    // 		// redis.set(keyid, result, (err, data) => {
			  //   // });

	    // 		res.render('page/signup',result);
	    // 	}
	    // });
    });
};

exports.getfetchallusers = function(req, res) {
 	api.getDepartmentUsersDetail(1, 1, 0, (err, data)=>{
	   async.each(data.userlist,(user, rcallback) => {
             var keyid = util.format(KEY.USER, user.userid);    
             redis.hmset(keyid, user, (err, data) => {
             	console.log(data);
			 });      
	    },(err) => {
	       console.log(err);
	    });
    });
    res.send("data.userlist");
};








