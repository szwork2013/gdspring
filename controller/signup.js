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

//handle socket closed 
ws.on('close', function(event) {
  console.log('close', event.code, event.reason);
  ws = null;
});

/*
 *用户签到的页面
 */
exports.getreg = function(req, res) {
    var code = req.query.code;
    var userid = req.query.userid;
    if(userid){
        renderPage(userid,'signup');
    }else{
        api.getUserIdByCode(code, (err, data) => {
            if (!code || !data.UserId) {
                var message = $.config.signup_cantgetuserid;
                res.render('page/signup', { message: message});
            }
            if(data.UserId){
                renderPage(data.UserId,'signup');
            }

        });
    }
};
function renderPage(userid, pageName){
    var key = util.format(KEY.USER, userid);
    redis.hgetall(key, (err, user) => {
        //已经签到了
        if (user.issign === "1") {
            var msg = $.config.signup_getuserid.format(user.table ? user.table : 0);
            res.render('page/{0}'.format(pageName), { message: msg});
        } else {
            var messages = message[$.plug.sms.getRandomInt(0, 3)].format(user.name, user.table ? user.table : 0);
            //签到成功
            $.extend(user, {
                issign: 1,
                message: messages
            });
            
            redis.hmset(key, user, (err, data) => {
                console.log(data);
            });
            //socket通知页面添加头像 reconnect socket
            if(!ws){
              ws = new WebSocket.Client($.config.socketUrl+'wxmsg');
            }
            ws.send(JSON.stringify(user));
            res.render('page/{0}'.format(pageName), { message: messages});
        }
    });
}
// 测试用的  跳板  路由
exports.getregtest = function(req, res) {

    res.render('page/preload', { key: 'signup'});
}