/**
 * Created by lixy on 2016/11/23.
 */

var wechat = require('wechat-enterprise');
var api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret,'41');
var  redis = $.plug.redis.redisserver;
exports.gettugofwar = function(req, res) {
    var code = req.query.code;
    var state = req.query.state;
    // var data='';

    // api.getUserIdByCode(code, (data)=>{
    //     data = data;
    //     console.log(data);
    // });
 //console.log
    var data = {};
    data.httpUrl = $.config.httpUrl;
    data.socketUrl = $.config.socketUrl;
    res.render('page/tugofwar',data);
};

exports.gettugofwarsummary = function(req, res) {
   /* var data_json = new Array();
    data_json.push({src:"http://wx.qlogo.cn/mmopen/2BT80xmOuLNuPRrn0EcfvIUEUyNC2dKe3icOFJB7I0ESNIruiaPlBuYBDvDtcqWNRsB34pBo6ZOgH9D5RS00rkBQwOjjUDlU4k/0",name:"超级赛亚人"});
    data_json.push({src:"http://wx.qlogo.cn/mmopen/2BT80xmOuLNuPRrn0EcfvIUEUyNC2dKe3icOFJB7I0ESNIruiaPlBuYBDvDtcqWNRsB34pBo6ZOgH9D5RS00rkBQwOjjUDlU4k/0",name:"超级赛亚人1"});
    data_json.push({src:"http://wx.qlogo.cn/mmopen/2BT80xmOuLNuPRrn0EcfvIUEUyNC2dKe3icOFJB7I0ESNIruiaPlBuYBDvDtcqWNRsB34pBo6ZOgH9D5RS00rkBQwOjjUDlU4k/0",name:"超级赛亚人2"});
    data_json.push({src:"http://wx.qlogo.cn/mmopen/2BT80xmOuLNuPRrn0EcfvIUEUyNC2dKe3icOFJB7I0ESNIruiaPlBuYBDvDtcqWNRsB34pBo6ZOgH9D5RS00rkBQwOjjUDlU4k/0",name:"超级赛亚人3"});
    var data_object = new Object();
    data_object.data = data_json;*/
    var data = {};
    data.httpUrl = $.config.httpUrl;
    data.socketUrl = $.config.socketUrl;

    res.render('page/lottery',data)
};

exports.getvote = function(req, res) {
    var data = {};
    data.data = [];
    redis.keys("vote:*", function (err, replies) {
        // console.log(replies.length + " replies:");
        async.each(replies, (userid, rcallback) => {

            redis.hgetall(userid, (err, result) => {

                result.key = userid
                data.data.push(result);
                rcallback();
            });
        }, function (err){
            //console.log(data.items);
            data.httpUrl = $.config.httpUrl;
            data.socketUrl = $.config.socketUrl;
            res.render('page/vote', data);
        });
    });
};

exports.postchangenumber = function(req, res) {

   var newBody = new Object();
    newBody.number = req.body.number;
    newBody.name = "111";   

    //console.log(req.body.key.trim())
    redis.hmset(req.body.key.trim(), newBody, (err, data) => {
        console.log(data);
        res.send(data)
    });
};
exports.postsaveluckyawardmessage = function(req, res) {

    var key ="award:"+req.body.AwardsLevel;

    redis.hmset(key, req.body, (err, data) => {
        
        res.send("保存成功")
    });
};
