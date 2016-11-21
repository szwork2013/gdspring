var wechat = require('wechat-enterprise');
var api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret);

exports.gettugofwar = function(req, res) {
	var code = req.query.code;
	var state = req.query.state;
    var data;
    api.getUserIdByCode(code, (data)=>{
    	data = data;
    	alert(data);
    });

	res.render('page/tugofwar',data);
};

exports.gettugofwarsummary = function(req, res) {
	res.render('page/tugofwar_summary');
};