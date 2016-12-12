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
var WebSocket = require('faye-websocket'),
    ws = new WebSocket.Client('ws://www.jskplx.com/mainsocket'),
    util = require('util'),
    redis = $.redis.createClient($.config.redis.server);

exports.getfetchallusers = function(req, res) {
 	api.getDepartmentUsersDetail(1, 1, 0, (err, data)=>{
	   async.each(data.userlist,(user, rcallback) => {
             //初始化桌号
             $.extend(user, {
			   	table: 0
			 });
			 user.department = JSON.stringify(user.department);
			 //保存数据
             redis.hmset(util.format(KEY.USER, user.userid), user, (err, data) => {
             	//console.log(data);
             	rcallback();
			 });
	    },(err) => {
	       console.log(err);
	    });
    });
    res.send("0");
};

exports.getuserlist = function(req, res) {
	var data = {};
	data.items = [];
    var i=1;
	redis.keys(util.format(KEY.USER, "*"), function (err, replies) {
	    // console.log(replies.length + " replies:");
	    async.each(replies, (userid, rcallback) => {

            
         	redis.hgetall(userid, (err, result) => {

                var issign_ = result.issign 
                if(issign_ == '' || issign_ == undefined || issign_ == null){
                    issign_ = 0;
                }
         	   $.extend(result,{
                   num: i++,
                   issign:issign_
               });
         	   data.items.push(result);
         	   rcallback();
		 	});
	    }, function (err){
	    	//console.log(data.items);
	        res.render('page/userlist', data);
	    });
   });
};
// 后台  主的控制  页面是否接受消息的  方法
exports.postmainsocketcontrol = function socketControlFun(req,res){
    var message = req.body.message;
    ws.send(message);

    res.send("1");
    // console.log("mainsocketcontrol");
}

// 后台  主的控制  页面是否 跳转 的方法
exports.postredirectcontrol = function socketControlFun(req,res){
    var _url = req.body.url;
    ws.send(_url);

    res.send("1");
    // console.log("mainsocketcontrol");
}

// 保存页面状态的方法
exports.postsaveStatusFun = function saveStatusFun(req,res){
    var pageName = req.body.pageName;
    var status = req.body.value;

    redis.hmset("pageName:"+pageName, {"pageName":pageName,"status":status}, (err, data) => {
        res.send("1");
        // rcallback();
    });
    // res.send("1");
}
// 获取页面状态的方法
exports.getstatusFun = function StatusFun(req,res){

   var data = {};
   data.items = [];
   redis.keys("pageName:*", function (err, replies) {

        async.each(replies, (statusInfo, rcallback) => {

            redis.hgetall(statusInfo, (err, result) => {

               data.items.push(result);
               rcallback();
            });
        }, function (err){

            res.send(data);
        });
   });
}











