var 
    amqp = require('amqplib'),
    util = require('util'),
    WebSocket = require('faye-websocket'),
    ws        = new WebSocket.Client($.config.socketUrl+'wxmsg'),
    ws2        = new WebSocket.Client($.config.socketUrl+'signup'), 
    redis = $.redis.createClient($.config.redis.server);

function getRandomInt(min, max) {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min)) + min;
}

//测试消息发送压力情况
exports.getpush = function(req, res) {
  var message = { FromUserName : ["renth","hucl","tangwc","lvy","liuj"][getRandomInt(0,4)],
                  Content:"你好你好你好你好你好你好你好"
                }
  console.log(message);              
  $.plug.wechatreply.SendMessageToFront(message);

  res.send("1");
};

exports.gettestsend = function(req, res) {
  $.plug.wechatredpack.sendredpack(req.query.id);
  res.send({errcode:0});
};

exports.gettestsign = function(req, res) {
  redis.hgetall("users:renth", (err, user) => {
     ws2.send(JSON.stringify(user));
  });
  res.send({errcode:0});
};




