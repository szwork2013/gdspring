var wechat = require('wechat-enterprise'),
    util = require('util'),
    redis = $.plug.redis.redisserver,
    api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret, $.config.agentid),
    message = $.config.signup_message,
    httpUrl = $.config.httpUrl,
    socketUrl = $.config.socketUrl,
    WebSocket = require('faye-websocket'),
    ws        = new WebSocket.Client($.config.socketUrl+'signup');

var KEY = {
    USER: 'users:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};

/*
 *用户签到的页面
 */
exports.getreg = function(req, res) {
    var code = req.query.code;
    api.getUserIdByCode(code, (err, data) => {
        var user = {};
        // 获取不到Code或者拿不到UserId
        if (!code || !data.UserId) {
            $.extend(user, {
                message: $.config.signup_cantgetuserid
            });
            res.render('page/signup', { user: user, httpUrl: httpUrl, socketUrl: socketUrl });
        }
        if (data.UserId) {
            var key = util.format(KEY.USER, data.UserId);
            redis.hgetall(key, (err, user) => {
                console.log(user.issign);
                //已经签到了
                if (user.issign === "1") {
                    $.extend(user, {
                        message: $.config.signup_getuserid.format(user.table ? user.table : 0)
                    });
                    res.render('page/signup', { user: user, httpUrl: httpUrl, socketUrl: socketUrl });
                } else {
                    //签到成功
                    $.extend(user, {
                        issign: 1,
                        message: message[$.plug.sms.getRandomInt(0, 3)].format(user.name, user.table ? user.table : 0)
                    });
                    redis.hmset(key, user, (err, data) => {
                        console.log(data);
                    });
                    
                    //socket通知页面添加头像
                    ws.send(JSON.stringify(user));

                    res.render('page/signup', { user: user, httpUrl: httpUrl, socketUrl: socketUrl });
                }
            });
        }
    });
};
