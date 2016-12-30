var wechat = require('wechat-enterprise'),
    util = require('util'),
    redis = $.plug.redis.redisserver,
    api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret, $.config.agentid),
    message = $.config.signup_message,
    httpUrl = $.config.httpUrl,
    socketUrl = $.config.socketUrl;

var KEY = {
    USER: 'users:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};
/*
 * 红包雨页面(程董)
 */
exports.getredpacket = function(req, res) {
	var code = req.query.code;
	var state = req.query.state;
	var userid = req.query.userid;

	res.render('page/redpacket');
	
	/*if(userid){
	    var key = util.format(KEY.USER, userid);
	    redis.hgetall(key, (err, user)=>{
	   	  	res.render('page/redpacket', {user: user,httpUrl:httpUrl,socketUrl:socketUrl,flag:1});
	    });
    }else{
        api.getUserIdByCode(code, (err, data) => {
	 		var user = {};
	 		if(!code || !data.UserId) {
	 			res.send("哎呦! 这水太深了,不能去啊!!!");
			   	// res.render('page/redpacket',{user: user,httpUrl:httpUrl,socketUrl:socketUrl,flag:0});
	 		}
			if(data.UserId){
			    var key = util.format(KEY.USER, data.UserId);
			    redis.hgetall(key, (err, user)=>{
			   	    if(user.issign === "1"){
			   	  	    res.render('page/redpacket', {user: user,httpUrl:httpUrl,socketUrl:socketUrl,flag:1});
			   	    }else{
			   	    	res.send("哎呦! 这水太深了,不能去啊!!!");
			   	    }
			    });
			}
	    });
    }*/
};


/*
 * 获取还有多少奖项
 */
exports.getnumofbossaward = function(req, res) {

	var name = req.query.name;

	redis.hgetall("bonus:{0}".format(name),(err,data)=>{
		if(data.dates == '' || data.dates == undefined || data.dates == null){
			res.send({size:0});
			return;
		}
		var strs = data.dates.split(",");
		res.send({size:strs.length});
	})

    
}