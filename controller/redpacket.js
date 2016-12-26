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
 * 红包雨页面(陈总)
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
 * 红包雨页面  请求获取红包的方法(陈总)
 */
exports.getaskforaredredpacket = function(req, res) {
	var timestamp = new Date().getTime();
	var user = req.body;
    $.extend(user,{
       timestamp:timestamp
    });
	getproducetimeluckyer(req, res,user,"chen");
}

/*
 * 计算产生奖项的方法
 */
function getproducetimeluckyer(req, res,user,key){
	redis.hgetall("bonus:{0}".format(key), (err, reply) => {
		if(reply== ''){
			res.send({errCode:10001,text:"还未开始抽奖!"});
            return;
		}
		var mathArr = [];//临时数组 记录奖池中的时间戳
        if(reply.dates == '' || reply.dates == undefined || reply.dates == null){
            res.send({errCode:10001,text:"该阶段的奖项已经抽完了"});
            return;
        }else{
            var arrStr = reply.dates.split(",");
            for(var i=0;i<arrStr.length;i++){
                mathArr.push(arrStr[i]);
            }
            if(parseInt(user.timestamp) >= parseInt(mathArr[0])){
                var lucktime = mathArr.shift();
                mathArr = mathArr.toString();
                redis.hmset("bonus:{0}".format(key), {dates:mathArr}, (err, data) => {});
                redis.keys("bonusof{0}:*".format(key), function (err, result) {
                	var d = {
                		origintime:user.timestamp,
                		lucktime:lucktime,
                		user:user.toString()
                	}
                    redis.hmset("bonusof{0}:{1}".format(key,result.length+1), d, (err, data) => {
                        res.send({errCode:0,text:"恭喜中奖"});
                    });
                })
            }else{
                res.send({errCode:1000,text:"继续努力!胜利就在眼前!"});
            }
        }
    });
}

/*
 * voice红包页面 (朱总)
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
 * voice红包页面 请求获取红包的方法 (朱总)
 */
exports.getaskforaredredpacketagin = function(req, res) {
	var timestamp = new Date().getTime();
	var user = req.body;
    $.extend(user,{
       timestamp:timestamp
    });
	getproducetimeluckyer(req, res,user,"zhu");
}
