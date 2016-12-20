require("bluebird").promisifyAll($.redis.RedisClient.prototype);
var WebSocket = require('faye-websocket'),
    ws        = new WebSocket.Client($.config.socketUrl+'wxmsg'),	
    util = require('util'),
    redis = $.redis.createClient($.config.redis.server);

function getRandomInt(min, max) {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min)) + min;
}

var KEY = {
    USER         : 'users:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};

var texts =$.config.wechatreply_texts;


var mediaIds =$.config.wechatreply_mediaIds;


var nopemsg = $.config.wechatreply_nopemsg;


module.exports.texthandler = (message, req, res, next) => {
	console.log(message);

	var messages = [
	{
		type: "text",
		content: texts[getRandomInt(0,6)]
	},
	{
		type: "image",
		content: {
			mediaId: mediaIds[getRandomInt(0,3)]
		}
	}];

	res.reply(messages[getRandomInt(0,2)]);
   
	redis.hgetall(util.format(KEY.USER, message.FromUserName), (err, user)=>{
	   $.extend(user, {
          text: message.Content
       });
 // 调用保存text/img的方法
	   textOrImgSaveHandler(user);

	   ws.send(JSON.stringify(user));

    });

	next();
};
module.exports.imagehandler = (message, req, res, next) => {
	console.log(message);

	var messages = [
	{
		type: "text",
		content: texts[getRandomInt(0,6)]
	},
	{
		type: "image",
		content: {
			mediaId: mediaIds[getRandomInt(0,3)]
		}
	}];

	res.reply(messages[getRandomInt(0,2)]);
   
	redis.hgetall(util.format(KEY.USER, message.FromUserName), (err, user)=>{
	   $.extend(user, {
          image: message.PicUrl
       });
   // 调用保存text/img的方法
   		textOrImgSaveHandler(user);

	   ws.send(JSON.stringify(user));

    });
    
    next();
};
// 保存user发送过来的信息
function textOrImgSaveHandler(user){

// message 时间戳   下面的图片的方法也是一样的
    var _date = new Date().format("yyyyMMdd HH:mm:ss SSS");
    $.extend(user, {
        date: _date
    });
    redis.keys("message:*", (err, reply)=>{
		redis.hmset("message:"+(reply.length+1),user, function(err,reply){
	        console.log(reply);
	    });
    });
}

module.exports.voicehandler = (message, req, res, next) => {
	console.log(message);
    
	var messages= $.config.wechatreply_messages;
	
	res.reply({
		type: "text",
		content: messages[getRandomInt(0,11)]
	});
	next();
};


module.exports.locationhandler = (message, req, res, next) => {
	console.log(message);
	res.reply(nopemsg[getRandomInt(0,3)]);
	next();
};

module.exports.videohandler = (message, req, res, next) => {
	console.log(message);
	res.reply(nopemsg[getRandomInt(0,3)]);
	next();
};