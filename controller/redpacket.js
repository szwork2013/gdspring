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
exports.postaskforaredredpacket = function(req, res) {
	var timestamp = new Date().getTime();
	var user = req.body.data;
	var key = req.body.key;
    $.extend(user,{
       timestamp:timestamp
    });
	getproducetimeluckyer(req, res,user,key);
}

/*
 * 计算产生奖项的方法
 */
function getproducetimeluckyer(req,res,user,key){
	if(key == "chen"){
		if(parseInt(user.awardofchen) == 1){
			res.send({errCode:10002,text:"你已中奖了!将机会留给其他人!"});
            return;
		}
	}else if(key == "zhu"){
		if(parseInt(user.awardofzhu) == 1){
			res.send({errCode:10002,text:"你已中奖了!将机会留给其他人!"});
            return;
		}
	}
	//记录每次请求抢红包的人的信息
	redis.keys("redlogof{0}:*".format(key),(err, rep)=>{
		redis.hmset("redlogof{0}:{1}".format(key,rep.length+1),user,(err, result) => {})
	})
	// 查询是否中奖
	redis.hgetall("bonus:{0}".format(key), (err, reply) => {
		if(reply== ''){
			res.send({errCode:1001,text:"还未开始抽奖!"});
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
                //将boss奖项的剩余时间戳存入数据库
                redis.hmset("bonus:{0}".format(key), {dates:mathArr}, (err, data) => {});

                //抢到红包后就不能在领取  将用户的字段设置成 1 表示已经领取
            	if(key == "chen"){
            		redis.hmset(util.format(KEY.USER,user.userid),{awardofchen:1},(err, data) => {})
            	}else if(key == "zhu"){
            		redis.hmset(util.format(KEY.USER,user.userid),{awardofzhu:1},(err, data) => {})
            	}

                //记录下中奖人的信息
                redis.keys("bonusof{0}:*".format(key), function (err, result) {
                	var d = {
                		origintime:user.timestamp,
                		lucktime:lucktime,
                		user:user.toString()
                	}
                    redis.hmset("bonusof{0}:{1}".format(key,result.length+1), d, (err, data) => {
                    	// todo  将红包发给中奖者
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
/*exports.getredpacketagin = function(req, res) {
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
};*/
/*
 * voice红包页面 请求获取红包的方法 (朱总)
 */
/*exports.getaskforaredredpacketagin = function(req, res) {
	var timestamp = new Date().getTime();
	var user = req.body;
    $.extend(user,{
       timestamp:timestamp
    });
	getproducetimeluckyer(req, res,user,"zhu");
}*/
/*
 * 获取还有多少奖项
 */
exports.getnumofbossaward = function(req, res) {

	var name = req.query.name;
	if(name == "chen"){
		redis.hgetall("bonus:chen",(err,data)=>{
			if(data.dates == '' || data.dates == undefined || data.dates == null){
				res.send({size:0});
				return;
			}
			var strs = data.dates.split(",");
			res.send({size:strs.length});
		})
	}else if(name == "zhu"){
		redis.hgetall("bonus:zhu",(err,data)=>{
			if(data.dates == '' || data.dates == undefined || data.dates == null){
				res.send({size:0});
				return;
			}
			var strs = data.dates.split(",");
			res.send({size:strs.length})
			
		})
	}
    
}