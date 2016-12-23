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
 * 红包雨页面
 */
exports.getredpacket = function(req, res) {
	var code = req.query.code;
	var state = req.query.state;
 	api.getUserIdByCode(code, (err, data) => {
 		var user = {};
        // 获取不到Code或者拿不到UserId
 		if(!code || !data.UserId) {
		   
		   res.render('page/redpacket',{user: user,httpUrl:httpUrl,socketUrl:socketUrl,flag:0});
 		}
		if(data.UserId){
		    var key = util.format(KEY.USER, data.UserId);
		    redis.hgetall(key, (err, user)=>{
		   	  	//已经签到了
		   	    if(user.issign === "1"){
		   	  	    res.render('page/redpacket', {user: user,httpUrl:httpUrl,socketUrl:socketUrl,flag:1});
		   	    }
		    });
		}
    });
};
/*
 * 请求获取红包的方法
 */
exports.getaskforaredredpacket = function(req, res) {
	var timestamp = new Date().getTime();
	var user = req.body;
    $.extend(user,{
       timestamp:timestamp
    });
	
	redis.hgetall("bonus:chen", data, (err, data) => {
        // 调用利用时间戳产生幸运这的方法 if 判断正确  记录中奖者信息 返还给他 errCode:0
    });
	res.send({errCode:1});//errCode:0 中奖
}
/*
 * voice红包页面
 */
exports.getredpacketagin = function(req, res) {
	var code = req.query.code;
	var state = req.query.state;
 	api.getUserIdByCode(code, (err, data) => {
 		var user = {};
        // 获取不到Code或者拿不到UserId
 		if(!code || !data.UserId) {
		   
		   res.render('page/redpacketagin',{user: user,httpUrl:httpUrl,socketUrl:socketUrl,flag:0});
 		}
		if(data.UserId){
		    var key = util.format(KEY.USER, data.UserId);
		    redis.hgetall(key, (err, user)=>{
		   	  	//已经签到了
		   	    if(user.issign === "1"){
		   	  	    res.render('page/redpacketagin', {user: user,httpUrl:httpUrl,socketUrl:socketUrl,flag:1});
		   	    }
		    });
		}
    });
};
/*
 * 请求获取红包的方法
 */
exports.getaskforaredredpacketagin = function(req, res) {
	var timestamp = new Date().getTime();
	var user = req.body;
    $.extend(user,{
       timestamp:timestamp
    });
	
	redis.hgetall("bonus:zhu", data, (err, data) => {
        // 调用利用时间戳产生幸运这的方法 if 判断正确  记录中奖者信息 返还给他 errCode:0
    });
	res.send({errCode:1});//errCode:0 中奖
}




