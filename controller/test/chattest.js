/**
 * Created by tangwc on 2016/12/20
 */

var WebSocket = require('faye-websocket'),
    ws = new WebSocket.Client($.config.socketUrl + 'wxmsg'),
    util = require('util'),
    redis = $.redis.createClient($.config.redis.server);
    texts = $.config.wechatreply_texts,
    mediaIds = $.config.wechatreply_mediaIds,
    nopemsg = $.config.wechatreply_nopemsg;

var KEY = {
    USER: 'users:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};
/*
 * 获取随机数
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

/*
 * 测试  处理用户发过来的文字
 */
module.exports.texthandler = (message, req, res, next) => {
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
        }
    ];

    // res.reply(messages[getRandomInt(0,2)]);
   
    redis.hgetall(util.format(KEY.USER, message.FromUserName), (err, user)=>{
       $.extend(user, {
          text: message.Content,
          flag:0 // 0 ->表示未中奖的信息  1-> 表示中奖之后发送的人员页面
       });
        // 调用保存text/img的方法
       textOrImgSaveHandler(user);

       ws.send(JSON.stringify(user));

    });
    next();
};

/*
 * 测试  处理用户发过来的图片
 */
module.exports.imagehandler = (message, req, res, next) => {
    var messages = [
        {
            type: "text",
            content: texts[getRandomInt(0, 6)]
        }, 
        {
            type: "image",
            content: {
                mediaId: mediaIds[getRandomInt(0, 3)]
            }
        }
    ];

    // res.reply(messages[getRandomInt(0,2)]);

    redis.hgetall(util.format(KEY.USER, message.FromUserName), (err, user) => {
        $.extend(user, {
            image: message.PicUrl,
            flag: 0 // 0 ->表示未中奖的信息  1-> 表示中奖之后发送的人员页面
        });
        // 调用保存text/img的方法
        textOrImgSaveHandler(user);

        ws.send(JSON.stringify(user));

    });

    next();
};

/*
 * 测试 保存user发送过来的信息
 */
function textOrImgSaveHandler(user){
    var _date = new Date().format("yyyyMMdd HH:mm:ss SSS");
    var awardArr = $.config.chatarray;
    $.extend(user, {
        date: _date
    });
    redis.keys("message:*", (err, reply)=>{
        //判断聊天页面 第几条数据是否中奖
        if(awardArr.indexOf((reply.length+1))){
               $.extend(user, {
                  flag:1 // 0 ->表示未中奖的信息  1-> 表示中奖之后发送的人员页面
               });
            redis.keys("chataward:*", (err, result)=>{
                redis.hmset("chataward:"+(result.length+1),user,(err,data)=>{
                    
                })
            })
            ws.send(JSON.stringify(user));
        }
        redis.hmset("message:"+(reply.length+1),user, function(err,reply){
            console.log(reply);
        });
    });
}