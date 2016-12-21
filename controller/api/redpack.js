var Redpack = require('weixin-redpack').Redpack,
    amqp = require('amqplib'),
    util = require('util'),
    WebSocket = require('faye-websocket'),
    redpack = Redpack($.config.redpack);
    ws        = new WebSocket.Client($.config.socketUrl+'wxmsg'), 
    redis = $.redis.createClient($.config.redis.server),
    texts =$.config.wechatreply_texts ,
    mediaIds = $.config.wechatreply_mediaIds,
    nopemsg = $.config.wechatreply_nopemsg;

var KEY = {
    USER         : 'users:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};

exports.getsendredpack = function(req, res) {
  var mch_billno = '1415437202'+ (new Date()).format("yyyyMMddhhmmss") + Math.random().toString().substr(2,2);
  var data = {
      mch_billno: mch_billno,
      send_name: '程总',
      wishing: '祝阖家欢乐、身体健康、万事如意',
      re_openid: 'oj178waAs026lDintKcLiKxJftoY',//'oj178weHiXSyLwsxow-vXHbwFQfM',
      total_amount: 100,
      total_num: 1,
      client_ip: '222.92.48.94',
      act_name: '2017高达年会',
      remark: '猜越多得越多，快来抢！',
      scene_id:"PRODUCT_4",
  };

  redpack.send(data , function(err, result){
      console.log(result);
  });

  res.send("1");
}

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








