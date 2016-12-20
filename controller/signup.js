var wechat = require('wechat-enterprise'),
    fs =require("fs"),
    async = $.async,
    util = require('util'),
    redis = $.plug.redis.redisserver;

var api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret,"41");
var KEY = {
    USER         : 'users:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};

var message= $.config.signup_message;


var httpUrl = $.config.httpUrl;
var socketUrl = $.config.socketUrl;

exports.getreg = function(req, res) {
	var code = req.query.code;
	var state = req.query.state;

 	api.getUserIdByCode(code, (err, data) => {
 		var user = {};
 		console.log(code);
        console.log(data);

        // 获取不到Code或者拿不到UserId
 		if(!code || !data.UserId) {
		   $.extend(user,{
		   	    message:$.config.signup_cantgetuserid
		   });

		   res.render('page/signup',{user: user,httpUrl:httpUrl,socketUrl:socketUrl});
 		}

		if(data.UserId){
		    var key = util.format(KEY.USER, data.UserId);
		    redis.hgetall(key, (err, user)=>{
		   	    console.log(user.issign);
		   	  	//已经签到了
		   	    if(user.issign === "1"){ //  !user.issign || 
		   	    	$.extend(user, {
			   	    	message: $.config.signup_getuserid.format(user.table? user.table:0)
			        });
		   	  	    res.render('page/signup', {user: user,httpUrl:httpUrl,socketUrl:socketUrl});
		   	    }else{
	                //签到成功
	                $.extend(user,{
	              	    //num: $.plug.sms.getRandomInt(1,232),//最大值按照高达字体样式的个数  留两个空位
				   	    issign: 1,
				   	    message: message[$.plug.sms.getRandomInt(0,3)].format(user.name, user.table? user.table:0)
				    });
	                redis.hmset(key, user, (err, data) => {
			           console.log(data);
			        });
			   	    res.render('page/signup',{user: user,httpUrl:httpUrl,socketUrl:socketUrl});
		   	    }
		    });
		}
    });
};





