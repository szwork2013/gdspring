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