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
 		var user = {};
 		console.log(code);
        console.log(data);

        // 获取不到Code或者拿不到UserId
 		if(!code || !data.UserId) {
		   $.extend(user,{
		   	    message:"我猜你是大BOSS，不在五行中！请联系工作人员获取桌号，谢谢！"
		   });

		   res.render('page/signup',{user: user});
 		}

		if(data.UserId){
		   var key = util.format(KEY.USER, data.UserId);
		   redis.hgetall(key, (err, user)=>{
		   	  console.log(user.issign);
		   	  
		   	  if(!user.issign || user.issign === "1"){
		   	  	 $.extend(user, {
			   	    message: "签到了就去吃饭，还愣着干嘛！桌号是{0}".format(user.table? user.table:0)
			     });
		   	  	 return res.render('page/signup', {user: user});
		   	  }

              //签到成功
              $.extend(user,{
              	  num: $.plug.sms.getRandomInt(1,230),
			   	  issign: 1,
			   	  message: message[$.plug.sms.getRandomInt(0,3)].format(user.name, user.table? user.table:0)
			  });

              redis.hmset(key, user, (err, data) => {
		         console.log(data);
		      });

		   	  res.render('page/signup',{user: user});
		   });
		}
    });
};





