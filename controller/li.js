/**
 * Created by lixy on 2016/11/23.
 */

var  redis = $.plug.redis.redisserver;

/*
 * 抽奖页面
 */
exports.getlottery = function(req, res) {
    var data = {};
        data.httpUrl = $.config.httpUrl;
        data.socketUrl = $.config.socketUrl;
    res.render('page/lottery',data)
};

/*
 * 节目投票页面
 */
exports.getvote = function(req, res) {
    var data = {};
        data.data = [];
    redis.keys("vote:*", function (err, replies) {
        async.each(replies, (userid, rcallback) => {
            redis.hgetall(userid, (err, result) => {
                result.key = userid
                data.data.push(result);
                rcallback();
            });
        }, function (err){
            data.httpUrl = $.config.httpUrl;
            data.socketUrl = $.config.socketUrl;
            res.render('page/vote', data);
        });
    });
};
/*
 * 改变number
 */
exports.postchangenumber = function(req, res) {
    var newBody = new Object();
        newBody.number = req.body.number;
        newBody.name = "111";   

    redis.hmset(req.body.key.trim(), newBody, (err, data) => {
        res.send(data)
    });
};

/*
 * 保存中奖人员的信息
 */
exports.postsaveluckyawardmessage = function(req, res) {
    var key ="award:{0}".format(req.body.AwardsLevel);
    redis.hmset(key, req.body, (err, data) => {
        var rep = {
            errCode:0 ,
            data:{text:"保存成功"}
        }
        res.send(rep);
    });
};
