var wechat = require('wechat-enterprise');
var api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret,'41');

exports.gethead = function(req, res) {
	var code = req.query.code;
	var state = req.query.state;
	var data = {};
    data.ip = global.IP;
	res.render('page/showhead',data);
	// res.render('page/bubble');
};
