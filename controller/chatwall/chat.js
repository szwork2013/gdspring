/**
 * Created by tangwc on 2016/12/20
 */

var wechat = require('wechat-enterprise');
    async = $.async,
    redis = $.plug.redis.redisserver;
/*
 * 渲染消息墙页面
 */
exports.getchat = function(req, res) {
    var data = {};
        data.httpUrl = $.config.httpUrl;
        data.socketUrl = $.config.socketUrl;
        data.array = $.config.chatarray;
	res.render('page/chatwall',data);
};

/*
 * 获取消息墙页面 消息信息的总数
 */
exports.getchatmessage = function(req, res) {
	redis.keys("message:*", (err, reply)=>{
    	if(reply.length != undefined || reply.length != null || reply.length != 0){
    		res.send({len:reply.length});
    	}else{
    		res.send({len:0});
    	}
    });
}

/*
 * 获取消息墙页面中奖人员
 */
exports.getchatRecordAward = function(req, res){
	redis.keys("chataward:*",  (err, data)=> {
        var item = [];
        async.each(data, (chataward, rcallback) => {
            redis.hgetall(chataward, (err, _user) => {
                item.push(_user);
                rcallback();
            });
        }, function (err){
            var rep = {
                errCode:0 ,
                data:item
            }
            res.send(rep); 
        });
    });
}
