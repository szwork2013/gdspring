/**
 * Created by tangwc on 2016/12/20
 */

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
 * boss发红包(pad端  红包雨  陈总)
 */
exports.getbonus = function(req, res) {
    var data = {};
        data.httpUrl = $.config.httpUrl;
        data.socketUrl = $.config.socketUrl; 
    res.render('page/bonus',data);
};
/*
 * boss发红包(pad端  voice 朱总)
 */
exports.getbonusagin = function(req, res) {
    var data = {};
        data.httpUrl = $.config.httpUrl;
        data.socketUrl = $.config.socketUrl; 
    res.render('page/bonusagin',data);
};

/*
 * boss发红包(结果展示:陈总)
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