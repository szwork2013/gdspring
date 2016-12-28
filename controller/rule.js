/**
 * Created by renth on 2016/12/22
 */

/*
 * 签到说明
 */
exports.getsign = function(req, res) {
    res.render('page/signinstraction');
};

/*
 * 节目单
 */
exports.getprogramme = function(req, res) {
    res.render('page/programme');
};

/*
 * 座位表
 */
exports.getsites = function(req, res) {
    res.render('page/sites');
};

/*
 * 微信墙规则
 */
exports.getwechatwall = function(req, res) {
    res.render('page/wechatwall');
};

/*
 * 大转盘规则
 */
exports.getturnplate = function(req, res) {
    res.render('page/turnplate');
};

/*
 * pk规则
 */
exports.getturnplate = function(req, res) {
    res.render('page/pk');
};