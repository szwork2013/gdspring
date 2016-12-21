var Redpack = require('weixin-redpack').Redpack;
require("bluebird").promisifyAll($.redis.RedisClient.prototype);
var WebSocket = require('faye-websocket'),
    ws        = new WebSocket.Client($.config.socketUrl+'wxmsg'), 
    util = require('util'),
    redis = $.redis.createClient($.config.redis.server),
    texts =$.config.wechatreply_texts
    ,mediaIds =$.config.wechatreply_mediaIds
    ,nopemsg = $.config.wechatreply_nopemsg;
var amqp = require('amqplib');

var redpack = Redpack({
    mch_id: '1415437202',
    partner_key: 'DFanXJMxDQFqsKYz643v5ANWFeuMgOZ2',
    pfx: require('fs').readFileSync('cert/apiclient_cert.p12'),
    wxappid: 'wxb702524cb9c3b9c7'
});

var KEY = {
    USER         : 'users:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};

var connOptions = {
  host: '172.28.189.101'
  , port: 5672
  , login: 'guest'
  , password: 'guest'
  , vhost: '/'
}

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

  //res.reply(messages[getRandomInt(0,2)]);  
  //
  redis.hgetall(util.format(KEY.USER, message.FromUserName), (err, user)=>{
    $.extend(user, {
       text: message.Content,
       flag:0 // 0 ->表示未中奖的信息  1-> 表示中奖之后发送的人员页面
    });
    
    var userstring = JSON.stringify(user);
    ws.send(userstring);

    amqp.connect(connOptions).then(function(conn) {
      return conn.createChannel().then(function(ch) {
        var q = 'task_queue';
        var ok = ch.assertQueue(q, {durable: true});

        return ok.then(function() {
          //var msg = process.argv.slice(2).join(' ') || "Hello World!";
          ch.sendToQueue(q, new Buffer(userstring), {deliveryMode: true});
          //console.log(" [x] Sent '%s'", msg);
          return ch.close();
        });
      }).finally(function() { conn.close(); });
    }).catch(console.warn);
  });
  res.send("1");
};

// var q = 'task_queue';
// var open = require('amqplib').connect(connOptions);

// exports.getcheckmq = function(req, res) {
//   // Publisher
//   open.then(function(conn) {
//     return conn.createChannel();
//   }).then(function(ch) {
//     return ch.assertQueue(q).then(function(ok) {
//       return ch.sendToQueue(q, new Buffer('something to do'));
//     });
//   }).catch(console.warn);
//   res.send("1");
// }













