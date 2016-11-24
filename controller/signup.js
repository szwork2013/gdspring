var wechat = require('wechat-enterprise'),
    fs =require("fs"),
    async = $.async,
    util = require('util'),
    redis = $.plug.redis.redisserver;

var api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret,"41");
var KEY = {
    USER         : 'user:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};

var message=["来得早不如来得巧,{0}的桌号是{1},速速前往!", 
             "{0},都在等你吃饭呢,还不赶快去!记得是第{1}桌!", 
             "Hi {0},你的中奖机会已经报爆表,再不落座{1}号桌就归零了哦!5,4,3,2,1! 0!"];

exports.getreg = function(req, res) {
	var code = req.query.code;
	var state = req.query.state;

 	api.getUserIdByCode(code, (err, data) => {
 		var result = {};
 		console.log(code);
 		console.log(data);
        
        // 获取不到Code或者拿不到UserId
 		if(!code || !data.UserId) {
		   $.extend(result,{
		   	    message:"我猜你是大BOSS，不在五行中！请联系工作人员获取桌号，谢谢！"
		   });

		   res.render('page/signup',result);
 		}

		if(data.UserId){
		   redis.KEY(util.format(KEY.Reg, data.UserId), (err,data) => {
		   	  console.log(err);
		   	  console.log(data);

		   });

		   redis.hgetall(util.format(KEY.USER, data.UserId), (err, data)=>{
			   $.extend(result,{
			   	    message: message[$.plug.sms.getRandomInt(0,2)].format(data.name, data.table?data.table:0)
			   });
		   	  res.render('page/signup',data);
		   });
		}
    });
};





