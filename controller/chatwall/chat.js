var wechat = require('wechat-enterprise');
    // fs =require("fs"),
    async = $.async,
    // util = require('util'),
    redis = $.plug.redis.redisserver;

var api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret,'41');

exports.getchat = function(req, res) {
	var code = req.query.code;
	var state = req.query.state;
    var data = {};
    data.httpUrl = $.config.httpUrl;
    data.socketUrl = $.config.socketUrl;
    data.array = $.config.chatarray;
	res.render('page/chatwall',data);
};
exports.getchatmessage = function(req, res) {
	redis.keys("message:*", (err, reply)=>{
    	if(reply.length != undefined || reply.length != null || reply.length != 0){
    		res.send(reply);
    	}else{
    		reply.length = 0;
    		res.send(reply);
    	}
    });
}
exports.postrecordChatAwardPeople = function(req, res){
	var body = req.body;
	console.log(body)
	redis.keys("chataward:*", (err, reply)=>{
		redis.hmset("chataward:"+(reply.length+1),body,(err,data)=>{
			res.send("1");
		})
	})
}
exports.getchatRecordAward = function(req, res){
	redis.keys("chataward:*",  (err, data)=> {
        var item = [];
        async.each(data, (chataward, rcallback) => {
            redis.hgetall(chataward, (err, _user) => {

                item.push(_user);
                rcallback();
            });
            // rcallback();
        }, function (err){

            res.send(item); 
        });
    });
}
