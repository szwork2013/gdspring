require("bluebird").promisifyAll($.redis.RedisClient.prototype);
var Redpack = require('weixin-redpack').Redpack,
    util = require('util'),
    redis = $.redis.createClient($.config.redis.server);
    redpack = Redpack($.config.redpack);

var KEY = {
    USER         : 'users:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};


module.exports.sendredpack = function(user) {
  var mch_billno = '1415437202'+ (new Date()).format("yyyyMMddhhmmss") + Math.random().toString().substr(2,2);
    var data = {
        mch_billno: mch_billno,
        send_name: $.config.rpmessage.wechatwall.send_name,
        wishing: $.config.rpmessage.wechatwall.wishing,
        re_openid: user.openid,
        total_amount: 100 * $.config.rpmessage.wechatwall.no,
        total_num: 1,
        client_ip: '222.92.48.94',
        act_name: $.config.rpmessage.wechatwall.act_name,
        remark: $.config.rpmessage.wechatwall.remark,
        scene_id:"PRODUCT_4",
      };
    console.log(data);
    redpack.send(data , function(err, result){
        console.log(result);
        redis.set("wechatredpack:"+ user.chataward+ ":"+user.userid, JSON.stringify(result),function(err, result){
        })
    });
  return;
}

module.exports.sendredpackvip = function(user) {
  var mch_billno = '1415437202'+ (new Date()).format("yyyyMMddhhmmss") + Math.random().toString().substr(2,2);
    var data = {
        mch_billno: mch_billno,
        send_name: $.config.rpmessage.wechatwall.send_name,
        wishing: $.config.rpmessage.wechatwall.wishing,
        re_openid: user.openid,
        total_amount: 1000 * $.config.rpmessage.wechatwall.no,
        total_num: 1,
        client_ip: '222.92.48.94',
        act_name: $.config.rpmessage.wechatwall.act_name,
        remark: $.config.rpmessage.wechatwall.remark,
        scene_id:"PRODUCT_4",
      };
    console.log(data);
    redpack.send(data , function(err, result){
        console.log(result);
        redis.set("wechatredpack:"+ user.chataward+ ":"+user.userid, JSON.stringify(result),function(err, result){
        })
    });
  return;
}

module.exports.sendbossredpack = function(user) {
    var mch_billno = '1415437202'+ (new Date()).format("yyyyMMddhhmmss") + Math.random().toString().substr(2,2);
    var data = {
        mch_billno: mch_billno,
        send_name: user.send_name,
        wishing: $.config.rpmessage.wechatwall.wishing,
        re_openid: user.openid,
        total_amount: user.amount * $.config.rpmessage.wechatwall.no,
        total_num: 1,
        client_ip: '222.92.48.94',
        act_name: $.config.rpmessage.wechatwall.act_name,
        remark: $.config.rpmessage.wechatwall.remark,
        scene_id:"PRODUCT_4",
    };

    console.log(data);
    redpack.send(data , function(err, result){
        console.log(result);
        redis.set("bonus:{0}:wechatredpack:{1}".format(user.key,user.userid), JSON.stringify(result),function(err, result){
        })
    });
    
    return;
}