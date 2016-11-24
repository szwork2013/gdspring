/**
 * Created by lixy on 2016/11/23.
 */

var wechat = require('wechat-enterprise');
var api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret,'41');

exports.gettugofwar = function(req, res) {
    var code = req.query.code;
    var state = req.query.state;
    var data;
    api.
        api.getUserIdByCode(code, (data)=>{
        data = data;
    console.log(data);
});

res.render('page/tugofwar',data);
};

exports.gettugofwarsummary = function(req, res) {
    var data_json = new Array();
    data_json.push({src:"http://wx.qlogo.cn/mmopen/2BT80xmOuLNuPRrn0EcfvIUEUyNC2dKe3icOFJB7I0ESNIruiaPlBuYBDvDtcqWNRsB34pBo6ZOgH9D5RS00rkBQwOjjUDlU4k/0",name:"超级赛亚人"});
    data_json.push({src:"http://wx.qlogo.cn/mmopen/2BT80xmOuLNuPRrn0EcfvIUEUyNC2dKe3icOFJB7I0ESNIruiaPlBuYBDvDtcqWNRsB34pBo6ZOgH9D5RS00rkBQwOjjUDlU4k/0",name:"超级赛亚人1"});
    data_json.push({src:"http://wx.qlogo.cn/mmopen/2BT80xmOuLNuPRrn0EcfvIUEUyNC2dKe3icOFJB7I0ESNIruiaPlBuYBDvDtcqWNRsB34pBo6ZOgH9D5RS00rkBQwOjjUDlU4k/0",name:"超级赛亚人2"});
    data_json.push({src:"http://wx.qlogo.cn/mmopen/2BT80xmOuLNuPRrn0EcfvIUEUyNC2dKe3icOFJB7I0ESNIruiaPlBuYBDvDtcqWNRsB34pBo6ZOgH9D5RS00rkBQwOjjUDlU4k/0",name:"超级赛亚人3"});
    var data_object = new Object();
    data_object.data = data_json;
    res.render('page/lottery',data_object);
};
