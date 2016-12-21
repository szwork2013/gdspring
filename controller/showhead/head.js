/**
 * Created by tangwc on 2016/12/20
 */

/*
 * 渲染用户签到页面(高达字体样式)
 */
exports.gethead = function(req, res) {
	var data = {};
	    data.httpUrl = $.config.httpUrl;
	    data.socketUrl = $.config.socketUrl;
	res.render('page/showhead',data);
};
