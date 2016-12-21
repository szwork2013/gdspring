var wechat = require('wechat-enterprise'),
    api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret, $.config.agentid);
/*
 * 摇一摇页面(手机端)
 */
exports.gettugofwar = function(req, res) {
    var code = req.query.code;
    api.getAccessToken(function(err, data) {
        token = data.accessToken;
        api.getUserIdByCode(code, (err, data) => {
            api.getUser(data.UserId, (err, result) => {
                var data = {};
                    data.httpUrl = $.config.httpUrl;
                    data.socketUrl = $.config.socketUrl;
                    data.result = result;
                res.render('page/tugofwar', data);
            });
        });
    });
};
/*
 * boss发红包页面(桌面)
 */
exports.gettugofwarsummary = function(req, res) {
    var data = {};
        data.httpUrl = $.config.httpUrl;
        data.socketUrl = $.config.socketUrl;
    res.render('page/tugofwar_summary', data);
};
