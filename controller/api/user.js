var wechat = require('wechat-enterprise'),
    api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret,$.config.agentid),
    async = $.async,
    util = require('util'),
    redis = $.plug.redis.redisserver;

var KEY = {
    USER   : 'users:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};

/*
 * 获取已签到人员的信息
 */
exports.getreguserlist = function(req, res) {
  	var data = [];
  	redis.keys(util.format(KEY.USER,"*"), function (err, replies) {
  	    async.each(replies, (userid, rcallback) => {
           	redis.hgetall(userid, (err, result) => {
                if(parseInt(result.issign)==1){
                    data.push(result);
                }
           	    rcallback();
  		 	    });
  	    }, function (err){
    	      res.send(data);
  	    });
    });
};

/*
 * 重新拉取用户数据
 */
exports.getfetchallusers =function (req, res){
    var x=1;
    api.getDepartmentUsersDetail(1, 1, 1, (err, data)=>{
        async.each(data.userlist,(user, rcallback) => {
            api.getUserOpenId({"userid": user.userid,"agentid":41},(err,reply)=>{
                $.extend(user, {
                    table: 0,
                    issign:0,
                    isaward:0,
                    openid: reply.openid,
                    appid:reply.appid,
                    num:x++,
                    //增加字段  记录哪个页面中奖了 不能重复在一个活动中中奖 0代表未中奖 1 代表已中奖
                    headaward:0,
                    luckyaward:0,
                    chataward:0,
                    awardofchen:0,
                    awardofzhu:0
                })
                user.department = JSON.stringify(user.department);
                 //保存数据
                redis.hmset(util.format(KEY.USER,user.userid), user, (err, result) => {
                    rcallback();
                });
            });
        },(err) => {
            res.send({errCode:0});
        });
    });
};

/*
 * 签到重置
 */
exports.postresetuser = function(req, res) {
    var key = util.format(KEY.USER,req.body.UserId );
    redis.hgetall(key, (err, user)=>{
        $.extend(user, {
            issign: 0
        });
        redis.hmset(key, user, (err, data) => {
            res.send({errCode:0,issign:0});
        });
    });
};

/*
 * 修改信息
 */
exports.postresetuserinfo = function(req, res) {
    var key = util.format(KEY.USER,req.body.UserId);
    var _table = req.body.table;
    var department = req.body.department;
    if(department == ''){
        redis.hgetall(key, (err, user)=>{
            $.extend(user, {
                table: _table
            });
            redis.hmset(key, user, (err, data) => {
                res.send(_table);
            });
        });
    }
    else {
        var i = 1;
        var data = {};
        data.items = [];
        redis.keys(util.format(KEY.USER,"*"), function (err, data) {
            var item = [];
            async.each(data, (userid, rcallback) => {
                redis.hgetall(userid, (err, _user) => {
                    if("[{0}]".format(department) ==_user.department){
                        $.extend(_user,{
                            table: _table
                        });
                        redis.hmset(util.format(KEY.USER,_user.userid), _user, (err, data) => {});
                    }
                });
                rcallback();
            }, function (err){
                res.send({errCode:0}); 
            });
        });
    }
};

/*
 * 按照条件查找users
 */
exports.postselectUsers = function(req, res) {
    var _table = req.body.table;
    var _department = req.body.department;
    var _issign = req.body.issign;

    var _data = {};
        _data.items = [];
    var i=1;
    // 获取到所有user 的数据
    var tempData = {};
    redis.keys(util.format(KEY.USER, "*"), function (err, result) {
        tempData = result;

        //如果查询条件全部为空的话  返回所有的数据
        if(_table == '' && _department == '' && _issign ==''){
            async.each(tempData, (userid, rcallback) => {
                redis.hgetall(userid, (err, user) => {
                $.extend(user,{
                    num: i++
                });
                _data.items.push(user);
                rcallback();
               });
            }, function (err){
                res.send(_data);
            });
        }
        // 只查桌号的 人员信息
        else if(_table != '' && _department == '' && _issign ==''){
            async.each(tempData, (userid, rcallback) => {
                redis.hgetall(userid, (err, user) => {
                    if(user.table == _table){
                        $.extend(user,{
                            num: i++
                        });
                        _data.items.push(user);
                    }
                    rcallback();
                });
            }, function (err){
                res.send(_data);
            });   
        }
        //只查部门的人员信息
        else if(_table == '' && _department != '' && _issign ==''){
            async.each(tempData, (userid, rcallback) => {
                redis.hgetall(userid, (err, user) => {
                    if(user.department == "[{0}]".format(_department)){
                        $.extend(user,{
                            num: i++
                        });
                        _data.items.push(user);
                    }
                    rcallback();
                });
            }, function (err){
                res.send(_data);
            });
        }

        //只查寻签到情况的人员信息
        else if(_table == '' && _department == '' && _issign !=''){
            async.each(tempData, (userid, rcallback) => {
                redis.hgetall(userid, (err, user) => {
                    if(user.issign == _issign){
                        $.extend(user,{
                            num: i++
                        });
                        _data.items.push(user);
                    }
                    rcallback();
                });
            }, function (err){
                res.send(_data);
            });
        }
        //查询部门和桌号的信息
        else if(_table != '' && _department != '' && _issign ==''){
            async.each(tempData, (userid, rcallback) => {
                redis.hgetall(userid, (err, user) => {
                    if(user.table == _table && user.department =="[{0}]".format(_department)){
                        $.extend(user,{
                            num: i++
                        });
                        _data.items.push(user);
                    }
                   rcallback();
               });
            }, function (err){
                res.send(_data);
            });
        }
        // 查询桌号和部门情况的人员信息
        else if(_table != '' && _department == '' && _issign !=''){
            async.each(tempData, (userid, rcallback) => {
                redis.hgetall(userid, (err, user) => {
                    if(user.table == _table && user.issign == _issign){
                        $.extend(user,{
                            num: i++
                        });
                        _data.items.push(user);
                    }
                    rcallback();
                });
            }, function (err){
                res.send(_data);
            });
        }
        // 查询部门和签到情况的人员信息
        else if(_table == '' && _department != '' && _issign !=''){
            async.each(tempData, (userid, rcallback) => {
                redis.hgetall(userid, (err, user) => {
                    if(user.department == "[{0}]".format(_department) && user.issign == _issign){
                        $.extend(user,{
                            num: i++
                        });
                        _data.items.push(user);
                    }
                    rcallback();
                });
            }, function (err){
                res.send(_data);
            });
        }
        // 查询 桌号, 部门 和签到情况的人员信息
        else if(_table != '' && _department != '' && _issign !=''){
           async.each(tempData, (userid, rcallback) => {
               redis.hgetall(userid, (err, user) => {
                    if(user.table == _table && user.department == "[{0}]".format(_department) && user.issign == _issign){
                        $.extend(user,{
                            num: i++
                        });
                        _data.items.push(user);
                    }
                    rcallback();
               });
            }, function (err){
                res.send(_data);
            });
        }
    })
};

/*
 * 抽奖页面 记录中奖人员的信息
 */
exports.postrecordpeopleOfaward = function(req,res){
    var body = { 
        userid : req.body.userid,
        username : req.body.username, 
        AwardsID:req.body.AwardsID ,
        department : req.body.department,
        imgsrc:req.body.imgsrc,
        awardimg:req.body.awardimg,
        awardsname:req.body.awardsname,
        prizename:req.body.prizename,
    }; 
    var id_ = parseInt(req.body.AwardsID);
    redis.hgetall("award:{0}".format(id_), (err, result) => {
        var _DrawedNumber = parseInt(result.DrawedNumber);
        var _Number = parseInt(result.Number);
        var status = parseInt(result.Status);

        if(_DrawedNumber < _Number){
            //记录中奖人员的信息
            redis.keys("luckyaward:*",(err, data)=>{
                redis.hgetall("luckyaward:{0}".format(data.length),(err, reply)=>{
                    if(reply == null || reply == ''){
                        $.extend(body,{
                            "luckid": 1
                        })
                        redis.hmset("luckyaward:{0}".format(1), body, (err, data) => {});
                    }else{
                        var _luckid = parseInt(reply.luckid)+1;
                        $.extend(body,{
                            "luckid": _luckid
                        })
                        redis.hmset("luckyaward:{0}".format(_luckid), body, (err, data) => {});
                    }
                    
                })
            })
            // 改变被抽中的奖品数量
            result.DrawedNumber = _DrawedNumber +1;
            if((_DrawedNumber +1) == _Number){
                result.Status = 0;
            }
            redis.hmset("award:{0}".format(id_), result, (err, data) => {
                res.send({AwardsID:id_ , DrawedNumber:_DrawedNumber,status:status,msg:"恭喜中奖!"});
            });
        }
        else{
            status = 0;
            result.Status = 0;
            redis.hmset("award:{0}".format(id_), result, (err, data) => {
                res.send({AwardsID:id_,DrawedNumber:_DrawedNumber,status:status,msg:"奖品已经抽完!"});
            });
        }
    });
};

/*
 * 获取 抽奖页面的 奖品的方法
 */
exports.getawardlist = function(req,res){
    var arr = [];
    var arr1 = [];
    var arr2 = [];
    var arr3 = [];
    redis.keys("award:*",function (err,replies){
        async.each(replies, (userid, rcallback) => {
            redis.hgetall(userid, (err, result) => {
                if(parseInt(result.AwardsLevel)==1){
                    arr1.push(result);
                }
                else if(parseInt(result.AwardsLevel)==2){
                    arr2.push(result);
                }
                else if(parseInt(result.AwardsLevel)==3){
                    arr3.push(result);
                }
                
                rcallback();
            });
        },function (err){
            var a = arr.concat(arr1);
            var b = a.concat(arr2);
            var c = b.concat(arr3);
            res.send(c); 
        });
    })
};

/*
 * 获取中奖人员的列表
 */
exports.getfetchallawardpelple = function(req, res) {
    var arr = [];
    var arr1 = [];
    var arr2 = [];
    var arr3 = [];
    redis.keys("luckyaward:*",function (err,replies){
        async.each(replies, (userid, rcallback) => {
            redis.hgetall(userid, (err, result) => {
                if(result.AwardsID == 1){
                    arr1.push(result);
                }
                else if(result.AwardsID == 2){
                    arr2.push(result);
                }
                else{
                    arr3.push(result);
                }
                rcallback();
            });
        },function (err){
            var a = arr.concat(arr1);
            var b = a.concat(arr2);
            var c = b.concat(arr3);
            res.send(c);
        });
    })
};

