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

exports.getreguserlist = function(req, res) {
	var data = [];
    var i = 1;
	redis.keys(util.format(KEY.USER, "*"), function (err, replies) {
	    console.log(replies.length + " replies:");
	    async.each(replies, (userid, rcallback) => {
         	redis.hgetall(userid, (err, result) => {
               $.extend(result,{
                   num: i++
               });
         	   data.push(result);
         	   rcallback();
		 	});
	    }, function (err){
	    	console.log(data.items);
	        res.send(data);
	    });
   });
};
