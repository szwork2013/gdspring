/**
 * Created by tangwc on 2016/12/20
 */

var async = $.async,
    util = require('util'),
    mainUrl = $.config.socketUrl+"mainsocket",
    WebSocket = require('faye-websocket'),
    ws = new WebSocket.Client(mainUrl),
    redis = $.redis.createClient($.config.redis.server);

var KEY = {
    USER : 'users:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};
   
/*
 * 后台 获取用户列表
 */
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

/*
 * 后台  主的控制 页面是否接受消息的 方法
 */
exports.postmainsocketcontrol =(req,res)=>{
    var message = req.body.message;
    ws.send(message);
    res.send({errCode:0});
}

/*
 * 后台  主的控制  页面是否 跳转 的方法
 */
exports.postredirectcontrol = (req,res)=>{
    var _url = req.body.url;
    ws.send(_url);
    res.send({errCode:0});
}

/*
 * 后台 主的控制  发送消息到  抽奖页面  点击开始抽奖
 */ 
exports.postclicktostartlucky = (req,res)=>{
    var click = req.body.click;
    ws.send(click);
    res.send({errCode:0});
}

/*
 * boss 发红包 点击开始抢boss红包
 */ 
exports.postclicktostartlucky = (req,res)=>{
    var bonus = req.body.bonus;
    ws.send(bonus);
    res.send({errCode:0});
}

/*
 * 保存页面状态的方法
 */
exports.postsaveStatusFun = (req,res)=>{
    var data = {
        pageName:req.body.pageName,
        status:req.body.value
    }
    redis.hmset("pageName:{0}".format(data.pageName), data, (err, data) => {
        res.send({errCode:0});
    });
}

/*
 * 获取页面状态的方法
 */
exports.getstatusFun = (req,res)=>{
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

/*
 * 重置 聊天页面数据库中的数据
 */
exports.postresetChatDB = (req,res)=>{
   redis.keys("message:*", (err, replies)=>{
        async.each(replies, (messageInfo, rcallback) => {
            redis.del(messageInfo, (err, reply)=>{  
                rcallback();
            });
        }, function (err){
            redis.keys("chataward:*", (err, replies)=>{
                async.each(replies, (chatawardInfo, rcallback) => {
                    redis.del(chatawardInfo, (err, reply)=>{  
                        rcallback();
                    });
                }, function (err){
                    var rep = {
                        errCode:0 ,
                        data:{
                            text:"重置数据库成功"
                        }
                    }
                    res.send(rep)
                });
            })
        });
   });
}

/*
 * 重置 抽奖页面数据库中的数据
 */
exports.postresetLuckDB = (req,res)=>{
   redis.keys("award:*", (err, replies)=>{
        async.each(replies, (awardInfo, rcallback) => {
            redis.hgetall(awardInfo, (err, result) => {
                result.DrawedNumber = 0;
                result.Status = 1;
                redis.hmset(awardInfo, result, (err, data) => {});
                rcallback();
            });
        }, function (err){
            redis.keys("luckyaward:*", (err, replies)=>{
                async.each(replies, (luckyawardInfo, rcallback) => {
                    redis.del(luckyawardInfo, (err, reply)=>{  
                        rcallback();
                    });
                }, function (err){
                    var rep = {
                        errCode:0 ,
                        data:{text:"重置数据库成功"}
                    }
                    res.send(rep);
                });
            })
        });
   });
}

/*
 * 重置 高达/头像 页面数据库中的数据
 */
exports.postresetHeadDB = (req,res)=>{
    redis.keys(util.format(KEY.USER, "*"), function (err, replies) {
        async.each(replies, (userid, rcallback) => {
            redis.hgetall(userid, (err, result) => {
                $.extend(result,{
                    issign:0
                });
                redis.hmset(util.format(KEY.USER,result.userid), result, (err, data) => {});
                rcallback();
            });
        }, function (err){
            var rep = {
                errCode:0 ,
                data:{text:"重置数据库成功"}
            }
            res.send(rep);
        });
   });
}

/*
 * 保存产生的时间
 */
exports.postcreatetimes = (req,res)=>{
    var date = new Date().getTime(),
        timeQuantum = 1000*60*5,
        dateArr = [];
    for(var i=0;i<10;i++){
        dateArr.push(date+Math.ceil(Math.random()*timeQuantum)) 
    } 
    dateArr=dateArr.sort();
    redis.keys("randomtime:*", function (err, replies) {
        var leng = replies.length+1;
        redis.hmset("randomtime:{0}".format(leng), {dates:dateArr}, (err, data) => {
            res.send({errCode:0});
        });
    });
}

/*
 * 删除生成的时间
 */
exports.postdeletetimes = (req,res)=>{
    redis.del("randomtime:*", function (err, replies) {
        res.send({errCode:0});
    });
}

/*
 * 按照生成的时间产生幸运中奖者
 */
exports.postgeneratetimeluky = (req,res)=>{
    var data = req.body.data;
    var mathArr = [];
    redis.keys("randomtime:*", function (err, replies) {
        redis.hgetall("randomtime:{0}".format(replies.length), (err, result) => {
            var arrStr = result.dates.split(",");
            for(var i=0;i<arrStr.length;i++){
                mathArr.push(parseInt(arrStr[i]));
            }
        });
    });
    for(var i=0;i<arrStr.length;i++){
        var datanum = banarySearch(data,arrStr[i]);
        redis.keys("timeaward:*", function (err, _rep) {
            redis.hmset("timeaward:{0}".format(_rep.length+1), {"dates":date}, (err, data) => {
                res.send({errCode:0});
            });
        })
    }
}

/*
 * 二分法
 */
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

/*
 * 查看聊天页面中奖者信息(与数据库中的信息相比较)        (未写完)
 */
exports.getchatawardpeople = (req,res)=>{
    var data = {};
    redis.keys("chataward:*", function (err, replies) {
        async.each(replies, (chatid, rcallback) => {         
            redis.hgetall(chatid, (err, result) => {
                rcallback();
            });
        }, function (err){
            res.send()
        });
    });
}

/*
 * 控制后端是否保存消息的方法
 */
exports.postbackmessagecontr =(req,res)=>{
    var message = req.body.message;
    var string = message.split(":");
    var objMsg = string[0];
    var controlMsg = string[1];
    if(objMsg == "chat"){
        if(controlMsg == "open"){
            redis.hmset("backcontrol:{0}".format(objMsg), {flag:1,name:objMsg}, (err, data) => {
                res.send({errCode:0});
            });
        }
        else if(controlMsg == "close"){
            redis.hmset("backcontrol:{0}".format(objMsg), {flag:0,name:objMsg}, (err, data) => {
                res.send({errCode:0});
            });
        }
    }
    else{
        res.send({errCode:10001});
    }
}

/*
 * 获取页面状态的方法
 */
exports.getbackstatusFun = (req,res)=>{
    var data = {};
        data.items = [];
    redis.keys("backcontrol:*", function (err, replies) {
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