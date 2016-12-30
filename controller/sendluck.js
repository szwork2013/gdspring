/**
 * Created by tangwc on 2016/12/20
 */
var wechat = require('wechat-enterprise'),
    util = require('util'),
    redis = $.plug.redis.redisserver,
    api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret, $.config.agentid),
    message = $.config.signup_message,
    httpUrl = $.config.httpUrl,
    socketUrl = $.config.socketUrl;

/*
 * 手机页面点击 启动 抽奖页面  转动
 */
exports.getclick = function(req, res) {
    var data = {};
	    data.httpUrl = $.config.httpUrl;
	    data.socketUrl = $.config.socketUrl;
    res.render('page/click',data);
};

/*
 * boss发红包(pad端  红包雨  程董)
 */
exports.getbonusofc = function(req, res) {
    var data = {};
        data.httpUrl = $.config.httpUrl;
        data.socketUrl = $.config.socketUrl; 
    res.render('page/bonusofc',data);
};
/*
 * boss发红包(pad端  voice 朱总)
 */
exports.getbonusofz = function(req, res) {
    var data = {};
        data.httpUrl = $.config.httpUrl;
        data.socketUrl = $.config.socketUrl; 
    res.render('page/bonusofz',data);
};

/*
 * boss发红包(结果展示:程董)
 */
exports.getshowbonusofc = function(req, res) {
    var data = {};
        data.httpUrl = $.config.httpUrl;
        data.socketUrl = $.config.socketUrl; 
    res.render('page/bossbonusshowofc',data);
};
/*
 * boss发红包(结果展示:朱总)
 */
exports.getshowbonusofz = function(req, res) {
    var data = {};
        data.httpUrl = $.config.httpUrl;
        data.socketUrl = $.config.socketUrl; 
    res.render('page/bossbonusshowofz',data);
};
/*
 * 荒岛求生
 */
exports.getbeglive = function(req, res) {

    var code = req.query.code;
    var state = req.query.state;
    var userid = req.query.userid;

    if(userid){
        var key = util.format(KEY.USER, userid);
        redis.hgetall(key, (err, user)=>{
            res.render('page/beglive', {user: user,httpUrl:httpUrl,socketUrl:socketUrl,flag:1});
        });
    }else{
        api.getUserIdByCode(code, (err, data) => {
            var user = {};
            if(!code || !data.UserId) {
                res.send("哎呦! 这水太深了,不能去啊!!!");
            }
            if(data.UserId){
                var key = util.format(KEY.USER, data.UserId);
                redis.hgetall(key, (err, user)=>{
                    if(user.issign === "1"){
                        res.render('page/beglive', {user: user,httpUrl:httpUrl,socketUrl:socketUrl,flag:1});
                    }else{
                        res.send("哎呦! 这水太深了,不能去啊!!!");
                    }
                });
            }
        });
    }
};