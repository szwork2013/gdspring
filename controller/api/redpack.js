var 
    amqp = require('amqplib'),
    util = require('util'),
    WebSocket = require('faye-websocket'),
    redis = $.redis.createClient($.config.redis.server);
    //ws2 = new WebSocket.Client($.config.socketUrl+'signup');

var KEY = {
    USER   : 'users:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};

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
  var ws2 = new WebSocket.Client($.config.socketUrl+'signup');

  redis.hgetall("users:"+req.query.id, (err, user) => {
     console.log(user);
     $.extend(user, { issign:1});
     ws2.send(JSON.stringify(user));
  });
  res.send({errcode:0});
};

exports.gettestsignonce = function(req, res) {
  var ws2 = new WebSocket.Client($.config.socketUrl+'signup');

  redis.keys(util.format(KEY.USER,"*"), function (err, replies) {
        async.each(replies, (userid, rcallback) => {
            console.log(userid);
            redis.hgetall(userid, (err, result) => {
                $.extend(result, { issign:1});
                ws2.send(JSON.stringify(result));
                rcallback();
            });
        }, function (err){
          res.send({errcode:0});
        });
    });
};


exports.gettestshake = function(req, res) {
  var table = $.randomNum(1,24);
  //console.log(table);
  var data = {
    "table":table,
    "userid":["renth","tangwc","luwh"][$.randomNum(0,2)]
  };
  $.ajax({
      type: "post",
      url: "http://localhost:9090/threekingdoms/attack",
      data: data
     },function(err,data){
        res.send(data);
     });
};

exports.getresetbonus = function(req, res) {
  var key = req.query.key;

  redis.keys("bonus:{0}:*".format(key), function (err, data) {
      async.each(data, (id, rcallback) => {
          redis.del(id, (err, reply)=>{  
            rcallback();
          });
      }, function (err){
      });
  });

  redis.keys(util.format(KEY.USER,"*"), function (err, keys) {
      async.each(keys, (userid, rcallback) => {
          redis.hgetall(userid, (err, _user) => {
             if(key == "chen")
             {
                _user.awardofchen = "0";
             }else if(key == "zhu")
             {
                _user.awardofzhu= "0";
             }
             redis.hmset(userid, _user, (err, data) => {});
          });
          rcallback();
      }, function (err){
          res.send({errCode:0}); 
      });
  });
};

exports.gettestbonus = function(req, res) {
  var key = req.query.key;
  
  redis.keys(util.format(KEY.USER,"*"), function (err, userkeys) {
     var userid = userkeys[$.randomNum(1,200)];
     //console.log(userkeys[$.randomNum(1,200)]);
     $.ajax({
      type: "get",
      url: "http://localhost:9090/management/producetimeluckyer?key={0}&userid={1}".format(key,userid.split(":")[1]),
     },function(err,data){
        res.send({errCode:0}); 
     });
  });
};











