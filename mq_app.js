//循环引用所有文件((req, pro) => {    // 全局模块库    global.$ = pro;    // 循环引用所有资源    for (var un in req)      $[un] = require(req[un]);  })(    // 加载集合    require("./require"),    // 全局引擎模板    {        // 模块自动加载器        require: (path, arr) => {            //递归引用            return ((res, dirPath) => {                // 闭包赋值                return (function (fun, files) {                    //变量文件                    for (f of files) {                        // 绝对路径                        (function (strPath) {                            // 路径文件对象                            (function (stats) {                                //是否是文件夹                                if (stats.isDirectory()) {                                    //层                                    res[f] = {};                                    //递归                                    fun(res[f], strPath);                                  } else {                                    //动态引用                                    res[$.path.basename(strPath, '.js')] = require(strPath);                                  }                                })(                                $.fs.statSync(strPath)                                );                              })(                              $.path.join(dirPath, f)                              );                            }                    // 引用对象集合                    return res;                  })(                    // 当前方法                    arguments.callee,                    // 读path目录结构                    $.fs.readdirSync(dirPath)                    );                })({}, $.path.join(__dirname, path));              }            }            );  var amqp = require('amqplib'),  redis = $.plug.redis.redisserver,  WebSocket = require('faye-websocket'),  ws        = new WebSocket.Client($.config.socketUrl+'wxmsg'),  util = require('util');/* *微信墙订阅服务 */ amqp.connect($.config.mqconnOptions).then(function(conn) {  process.once('SIGINT', function() { conn.close(); });  return conn.createChannel().then(function(ch) {    var ok = ch.assertQueue('chat_queue', {durable: true});    ok = ok.then(function() { ch.prefetch(1); });    ok = ok.then(function() {      ch.consume('chat_queue', doWork, {noAck: false});      console.log(" [*] Waiting for messages. To exit press CTRL+C");    });    return ok;    function doWork(msg) {      var body = msg.content.toString();      console.log(" [x] Received '%s'", body);      textOrImgSaveHandler(JSON.parse(body));      setTimeout(function() {        console.log(" [x] Done");        ch.ack(msg);      }, 10);    }  });}).catch(console.warn);/* *保存user发送过来的信息 并触发中奖 */ function textOrImgSaveHandler(user){  var _date = new Date().format("yyyyMMdd hh:mm:ss SSS");    $.extend(user, {   date: _date });    redis.keys("message:*", (err, reply)=>{      //判断聊天页面 第几条数据是否中奖      if($.config.chatarray.indexOf((reply.length+1))>=0){       $.extend(user, {              flag:1 // 0 ->表示未中奖的信息  1-> 表示中奖之后发送的人员页面            });       redis.keys("chataward:*", (err, result)=>{         redis.hmset("chataward:"+(result.length+1), user ,(err,data)=>{             console.log(data);             if((reply.length+1)==10000)             {                  $.plug.wechatredpack.sendredpackvip(user.userid);             }else{                $.plug.wechatredpack.sendredpack(user.userid);             }         })       })       ws.send(JSON.stringify(user));     }     redis.hmset("message:"+(reply.length+1), user, function(err,reply){       console.log(reply);     });   });}/* *微信墙订阅服务 */ amqp.connect($.config.mqconnOptions).then(function(conn) {  process.once('SIGINT', function() { conn.close(); });  return conn.createChannel().then(function(ch) {    var ok = ch.assertQueue('voice_queue', {durable: true});    ok = ok.then(function() { ch.prefetch(1); });    ok = ok.then(function() {      ch.consume('voice_queue', doWork, {noAck: false});      console.log(" [*] Waiting for voice. To exit press CTRL+C");    });    return ok;    function doWork(msg) {      var body = msg.content.toString();      console.log(" [x] Received '%s'", body);      voiceSaveHandler(JSON.parse(body));      setTimeout(function() {        console.log(" [x] Done");        ch.ack(msg);      }, 10);    }  });}).catch(console.warn);/* *保存user发送过来的信息 并触发中奖 */ function voiceSaveHandler(user){  var _date = new Date().format("yyyyMMdd hh:mm:ss SSS");    $.extend(user, {   date: _date });    redis.keys("voice:*", (err, reply) => {     //中奖计算          redis.hmset("voice:"+(reply.length + 1),user, function(err,reply){      console.log(reply);    });   });}