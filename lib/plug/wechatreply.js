require("bluebird").promisifyAll($.redis.RedisClient.prototype);
var WebSocket = require('faye-websocket'),
    ws        = new WebSocket.Client($.config.socketUrl+'wxmsg'),	
    util = require('util'),
    redis = $.redis.createClient($.config.redis.server);
    amqp = require('amqplib');

var KEY = {
    USER         : 'users:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};

var texts = $.config.wechatreply_texts;
var mediaIds =$.config.wechatreply_mediaIds;
var nopemsg = $.config.wechatreply_nopemsg;
var ws;

function getRandomInt(min, max) {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min)) + min;
}

//handle socket closed 
ws.on('close', function(event) {
  console.log('close', event.code, event.reason);
  ws = null;
});

/*
 * 获取用户信息并触发前端页面
 */
function SendMessageToFront(message, res){
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

	if(res)
	   res.reply(messages[getRandomInt(0,2)]);
   
	redis.hgetall(util.format(KEY.USER, message.FromUserName), (err, user)=>{
	   console.log(user);

	   $.extend(user, {
          image: message.PicUrl,
          text: message.Content,
          flag: 0 // 0 ->表示未中奖的信息  1-> 表示中奖之后发送的人员页面
       });

       var userstring = JSON.stringify(user);
	   
	   //reconnect socket
	   if(!ws)
	   {
	   	  ws = new WebSocket.Client($.config.socketUrl+'wxmsg');
	   }
	   ws.send(userstring);

	   //mq
	   amqp.connect($.config.mqconnOptions).then(function(conn) {
	      return conn.createChannel().then(function(ch) {
	        var q = 'chat_queue';
	        var ok = ch.assertQueue(q, {durable: true});
	        return ok.then(function() {
	          ch.sendToQueue(q, new Buffer(userstring), {deliveryMode: true});
	          return ch.close();
	        });
	      }).finally(function() { conn.close(); });
        }).catch(console.warn);
    });
    return;
}

/*
 * 获取用户信息并触发前端页面
 */
function SendVoiceToMQ(message, res){
	if(res)
	  res.reply({
		type: "text",
		content: $.config.wechatreply_messages[getRandomInt(0,11)]
	  });
   
	redis.hgetall(util.format(KEY.USER, message.FromUserName), (err, user)=>{
	   console.log(user);
	   $.extend(user, {
          voice: message.MediaId,
       });

       var userstring = JSON.stringify(user);
	   //mq
	   amqp.connect($.config.mqconnOptions).then(function(conn) {
	      return conn.createChannel().then(function(ch) {
	        var q = 'voice_queue';
	        var ok = ch.assertQueue(q, {durable: true});
	        return ok.then(function() {
	          ch.sendToQueue(q, new Buffer(userstring), {deliveryMode: true});
	          return ch.close();
	        });
	      }).finally(function() { conn.close(); });
        }).catch(console.warn);
    });
    return;
}

/*
 * 文字消息类型处理
 */
module.exports.texthandler = (message, req, res, next) => {
	console.log(message);
	SendMessageToFront(message,res);
	next();
};

/*
 * 图片消息类型处理
 */
module.exports.imagehandler = (message, req, res, next) => {
	console.log(message);
	SendMessageToFront(message,res);
    next();
};

module.exports.voicehandler = (message, req, res, next) => {
	console.log(message);
    
	SendVoiceToMQ(message,res);

	next();
};

/*
 * 定位消息类型处理
 */
module.exports.locationhandler = (message, req, res, next) => {
	console.log(message);
	res.reply(nopemsg[getRandomInt(0,3)]);
	next();
};

/*
 * 视频消息类型处理
 */
module.exports.videohandler = (message, req, res, next) => {
	console.log(message);
	res.reply(nopemsg[getRandomInt(0,3)]);
	next();
};

/*
 * 获取用户信息并触发前端页面
 */
module.exports.SendMessageToFront = SendMessageToFront;

/*
 * 发送语音数据入数据库
 */
module.exports.SendVoiceToMQ = SendVoiceToMQ;
