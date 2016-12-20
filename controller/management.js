var wechat = require('wechat-enterprise'),

    fs =require("fs"),
    async = $.async,
    util = require('util'),
    redis = $.plug.redis.redisserver;

var api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret,"41");
var KEY = {
    USER  : 'users:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};
var mainUrl = $.config.socketUrl+"mainsocket";
var WebSocket = require('faye-websocket'),
    ws = new WebSocket.Client(mainUrl),
    util = require('util'),
    redis = $.redis.createClient($.config.redis.server);

/*exports.getfetchallusers = function(req, res) {
 	api.getDepartmentUsersDetail(1, 1, 0, (err, data)=>{
        var i = 1;
	    async.each(data.userlist,(user, rcallback) => {
             //初始化桌号
             $.extend(user, {
			   	table: 0,
                issign:0,
                num:i++
			 });
			 user.department = JSON.stringify(user.department);
			 //保存数据
             redis.hmset(util.format(KEY.USER, user.userid), user, (err, data) => {
             	//console.log(data);
             	rcallback();
			 });
	    },(err) => {
	       res.send("拉取数据成功");
	    });
    });
};*/

exports.getuserlist = function(req, res) {
	var data = {};
	data.items = [];
    
    
	redis.keys(util.format(KEY.USER, "*"), function (err, replies) {
        var i=1;
	    async.each(replies, (userid, rcallback) => {

         	redis.hgetall(userid, (err, result) => {
         	    $.extend(result,{
                    num:i++
                });
         	    data.items.push(result);
         	    rcallback();
		 	});
	    }, function (err){
	    	
            data.httpUrl = $.config.httpUrl;
            data.socketUrl = $.config.socketUrl;
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

//重置 聊天页面数据库中的数据
exports.postresetChatDB = (req,res)=>{

   redis.keys("message:*", (err, replies)=>{
        async.each(replies, (messageInfo, rcallback) => {

            redis.del(messageInfo, (err, reply)=>{  
                rcallback();
            });
        }, function (err){
            console.log("1:::"+err);
            redis.keys("chataward:*", (err, replies)=>{
                async.each(replies, (chatawardInfo, rcallback) => {

                    redis.del(chatawardInfo, (err, reply)=>{  
                        rcallback();
                    });
                }, function (err){
                    console.log("2:::"+err);
                    res.send("重置数据库成功")
                });
            })
        });
   });
}
//重置 聊天页面数据库中的数据
exports.postresetLuckDB = (req,res)=>{

   redis.keys("award:*", (err, replies)=>{
        async.each(replies, (awardInfo, rcallback) => {

            redis.hgetall(awardInfo, (err, result) => {
                result.DrawedNumber = 0;
                result.Status = 1;
                redis.hmset(awardInfo, result, (err, data) => {
                    
                    // rcallback();
                });
                rcallback();
            });
        }, function (err){
            // console.log("1:::"+err);
            redis.keys("luckyaward:*", (err, replies)=>{
                async.each(replies, (luckyawardInfo, rcallback) => {

                    redis.del(luckyawardInfo, (err, reply)=>{  
                        rcallback();
                    });
                }, function (err){
                    // console.log("2:::"+err);
                    res.send("重置数据库成功")
                });
            })
        });
   });
}

//重置 高达/头像 页面数据库中的数据
exports.postresetHeadDB = (req,res)=>{

    redis.keys(util.format(KEY.USER, "*"), function (err, replies) {

        async.each(replies, (userid, rcallback) => {
            
            redis.hgetall(userid, (err, result) => {

                $.extend(result,{
                    issign:0
                });
                redis.hmset(util.format(KEY.USER,result.userid), result, (err, data) => {
                   // console.log(data);
                });
               
                rcallback();
            });
        }, function (err){
            
            res.send("重置数据库成功")
        });
   });
}
//保存产生的时间
exports.postsavetimes = (req,res)=>{
    var date = req.body.date;
    redis.keys("randomtime:*", function (err, replies) {
        redis.hmset("randomtime:"+(replies.length+1), {"dates":date}, (err, data) => {
            res.send("1");
        });
    });
}
//删除生成的时间
exports.postdeletetimes = (req,res)=>{

    redis.del("randomtime:*", function (err, replies) {
        res.send("1");
    });
}
// 按照生成的时间产生幸运中奖者
exports.postgeneratetimeluky = (req,res)=>{
    var data = req.body.data;
    var mathArr = [];
    redis.keys("randomtime:*", function (err, replies) {
        redis.hgetall("randomtime:"+replies.length, (err, result) => {
            var arrStr = result.dates.split(",");
            for(var i=0;i<arrStr.length;i++){
                mathArr.push(parseInt(arrStr[i]));
            }
        });
    });
    for(var i=0;i<arrStr.length;i++){
        var datanum = banarySearch(data,arrStr[i]);
        redis.keys("timeaward:*", function (err, _rep) {
            redis.hmset("timeaward:"+(_rep.length+1), {"dates":date}, (err, data) => {
                res.send("1");
            });
        })
    }
    
}
function banarySearch(array,num){
    var low=0, high, mid;
    high = array.length - 1;
    while (low <= high){
        mid =Math.ceil( (low + high) / 2);
        if (array[mid] < num){
            low = mid + 1;
        }else if (array[mid]>num){
            high = mid - 1;
        }else{
            return array[mid+1];
        }
    }
    return array[mid+1];
}

