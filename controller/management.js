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
    res.send({errCode:0,});
}

/*
 * boss 发红包  (信息入库)   
 */ 
exports.getclicktorubbonus = (req,res)=>{
    var name = req.query.bonus;//bonus="chen",bonus="zhu"
    var date = new Date().getTime(),
        timeQuantum = 1000*60*3 +20*1000,//抢红包时长 三分二十秒
        dateArr = [];
    for(var i=0;i<$.config.bonusofshare;i++){
        dateArr.push(date+Math.ceil(Math.random()*timeQuantum)) 
    } 
    dateArr=dateArr.sort();
    var Str = dateArr.toString();
    var title;
    var count;
    var sock = '';
    if(name == "chen") {
        title = "陈总的红包";
        count = $.config.bonusofchen;
        sock +="chen";
    }else if(name == "zhu"){
        title = "朱总的红包";
        count = $.config.bonusofzhu;
        sock +="zhu";
    }
    var data = {
        count : count,//红包总金额
        share: $.config.bonusofshare,//份额
        name :title,
        dates :Str,//用的时候使用的这个
        times:Str//做备份
    }
    redis.hmset("bonus:{0}".format(name), data, (err, data) => {

        ws.send("red:"+sock);

        // 推送消息给每个签到的user
        // 陈总-->路由  redpacket/redpacket

        res.send({errCode:0});
    });
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

                    redis.keys("wechatredpack:*", (err, replies)=>{
                        async.each(replies, (wechatredpack, rcallback) => {
                            redis.del(wechatredpack, (err, reply)=>{  
                                rcallback();
                            });
                        }, function (err){
                    })})

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
    var Str = dateArr.toString(); 
    redis.keys("randomtime:*", function (err, replies) {
        var leng = replies.length+1;
        redis.hmset("randomtime:{0}".format(leng), {dates:Str,timeArr:Str}, (err, data) => {
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
exports.getproducetimeluckyer = (req,res)=>{ 
    // 参数
    var key = req.query.key; 
    var user = {};
        user.timestamp = new Date().getTime(),
        user.userid  = req.query.userid,
        user.openid  = req.query.openid;

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
                        // todo
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


/*
 * 根据分配数值随机分配到N个，总和等于：allotRange 
 * @param allolTotal 分配的总和 
 * @param allotSize 分配大小 
 * @param allotMinVal 分配最小值 
 * @return 
 */  
exports.getrandomassignment = (req,res)=>{

}


function randomassignment(allolTotal,allotSize,allotMinVal){
    var randoms = new Array(allotSize);
    for (var i = 0; i < allotSize; i++) {  

        var safe_total = (allolTotal - (allotSize - i) * allotMinVal) / (allotSize - i);  

        var random = Math.round(safe_total - allotMinVal) + allotMinVal;  
        if (random < allotMinVal) {  
            random = allotMinVal;  
        }  
        if (i == allotSize - 1) {  
            random = allolTotal;  
        } 
        allolTotal -= random;  
        randoms.push(random);  
    }  
    return randoms; 
}
