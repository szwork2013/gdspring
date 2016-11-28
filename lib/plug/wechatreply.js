require("bluebird").promisifyAll($.redis.RedisClient.prototype);
var WebSocket = require('faye-websocket'),
    ws        = new WebSocket.Client('ws://www.jskplx.com/wxmsg'),
    util = require('util'),
    redis = $.redis.createClient($.config.redis.server);

function getRandomInt(min, max) {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min)) + min;
}

var KEY = {
    USER         : 'user:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};

var texts =["继续继续！不能停！",
	"还差一点点，离奖品还差1CM",
	"哦～～～走过了！！！",
	"要不，你换个姿势，再来一次？",
	"蓝瘦，香菇～～～就差一点点了！",
	"天啊，你果然很有一套！还不继续:)"];

var mediaIds =["2XEVMLa2pJnXRx4bETJUutj21rZN1tQr9CqwK5A7eDS5Yas0rjdQE5C-3L3d9k9u0bBBcQkRql7J-lhE9hH-NUw",
"2jeIYxXsxM2vyIP28Njd_yKxt4LOUzicFuX0xhwi7iDSS-9mWsw_xwIKGY393Qqw7n7hKfHligUUh_LgkzbWQDw",
"2mqQg9Xz3Dfmz-NK7NtSkNUZzrXUxduyQ8YSbNI1K76Ol5iBRFzjKLnGoFOW4_A9JczdfHLbRpkkLdqy4HGNjZw"] ;

var nopemsg = ["你辣么美，你知道么？",
					"告诉我，你的愿望是什么？",
					"奖品正在赶往现场的路上！！！"];

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

       console.log(user);
	   ws.send(JSON.stringify(user));
    });
    
    next();
};

module.exports.voicehandler = (message, req, res, next) => {
	console.log(message);
    
	var messages=[
	"0%匹配，你说的是: 【   】  小编：你说话了么？",
	"10%匹配，你说的是: 【高新年】 小编：好好练练普通话！",
	"20%匹配，你说的是: 【高达生日快乐】 小编：问题是，今天不是生日晚会啊！",
	"30%匹配，你说的是: 【高达新年】 小编：👂后面我听不清楚了！",
	"40%匹配，你说的是: 【新年快乐】 小编：谢谢，也祝你快乐！",
	"50%匹配，你说的是: 【快乐】 小编：发奖金最快乐😄",
	"60%匹配，你说的是: 【新年好呀，新年好呀】小编：唱的不错！",
	"70%匹配，你说的是: 【高达，高达，高达】小编：果然很重要，都重复三遍了啊！",
	"80%匹配，你说的是: 【高达】小编：哎，我在！",
	"90%匹配，你说的是: 【高达新年】 小编：快乐！我帮你补齐了，请叫我雷锋👩‍",
	"100%匹配，你说的是: 【高达新年快乐】。小编：不错说的很棒，就是差点运气，再接再厉！"];
	
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