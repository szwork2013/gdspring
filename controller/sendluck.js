var wechat = require('wechat-enterprise'),
    fs =require("fs"),
    async = $.async,
    util = require('util'),
    redis = $.plug.redis.redisserver;

var api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret,"41");
var KEY = {
    USER         : 'users:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};
// 手机页面点击 启动 抽奖页面  转动
exports.getclick = function(req, res) {
    var code = req.query.code;
    var state = req.query.state;
    var data = {};
	    data.httpUrl = $.config.httpUrl;
	    data.socketUrl = $.config.socketUrl;
	    
    res.render('page/click',data);
};
//  boss发红包
exports.getbonus = function(req, res) {
    var code = req.query.code;
    var state = req.query.state;
    var data = {};
        data.httpUrl = $.config.httpUrl;
        data.socketUrl = $.config.socketUrl;
        
    res.render('page/bonus',data);
};

