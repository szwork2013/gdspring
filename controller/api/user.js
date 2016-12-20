var wechat = require('wechat-enterprise'),
    fs =require("fs"),
    async = $.async,
    util = require('util'),
    redis = $.plug.redis.redisserver,
    wcqy_wechat = $.proxy_wcqy.wechat;

var api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret,$.config.agentid);//$.config.agentid  = 41
var KEY = {
    USER   : 'users:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};
var management = require("../management.js");
exports.getreguserlist = function(req, res) {
  	var data = [];
    var i = 1;
  	redis.keys(util.format(KEY.USER,"*"), function (err, replies) {
  	    // console.log(replies.length + " replies:");
  	    async.each(replies, (userid, rcallback) => {
           	redis.hgetall(userid, (err, result) => {
                if(parseInt(result.issign)==1){
                    data.push(result);
                }
           	    rcallback();
  		 	    });
  	    }, function (err){
    	    	// console.log(data.items);
    	      res.send(data);
  	    });
    });
};
//重新获取ACCESS_TOKEN
// exports.getACCESS_TOKEN = function(req, res) {
//     wcqy_wechat.getAccessTokenAnother(req,function(){console.log("重新获取ACCESS_TOKEN失败")});
//     res.send("1");
// };

//重新拉取用户数据
exports.getfetchallusers =function (req, res){

    api.getDepartmentUsersDetail(1, 1, 1, (err, data)=>{
        var x=1;
        async.each(data.userlist,(user, rcallback) => {

            api.getUserOpenId({"userid": user.userid,"agentid":41},(err,reply)=>{
                /*if(reply.errcode==43013){
                    $.extend(reply, {
                        openid :"undefined"
                    })
                }*/
                $.extend(user, {
                    "table": 0,
                    "issign":0,
                    "isaward":0,
                    //增加三个字段  记录 那个页面中奖了 不能重复 在一个活动中中奖
                    "headaward":0,
                    "luckyaward":0,
                    "chataward":0,
                    
                    "openid": reply.openid,
                    "appid":reply.appid,/*"wxb702524cb9c3b9c7",*/
                    "num":x++
                })
                user.department = JSON.stringify(user.department);
                // console.log("reply:::"+JSON.stringify(reply));
                 //保存数据
                redis.hmset(util.format(KEY.USER,user.userid), user, (err, result) => {
                    rcallback();
                });
            });
         
        },(err) => {
            res.send("1");
        });
    });
} 


// 签到重置
exports.postresetuser = function(req, res) {
    var key = util.format(KEY.USER,req.body.UserId );
    // var _issign = req.query.issign;
    // var _table = req.query.table;
    redis.hgetall(key, (err, user)=>{
        $.extend(user, {
            issign: 0
        });
        redis.hmset(key, user, (err, data) => {
            res.send({issign:0});
        });
    });
};
// 修改信息
exports.postresetuserinfo = function(req, res) {
    // var key = util.format(KEY.USER, req.body.UserId);
    var key = util.format(KEY.USER,req.body.UserId);
    var _table = req.body.table;
    var department = req.body.department;
    if(department == ''){
        redis.hgetall(key, (err, user)=>{
            $.extend(user, {
                table: _table
            });
            redis.hmset(key, user, (err, data) => {
                console.log("修改成功");
                res.send(_table);
            });
        });
    }else{
        var i = 1;
        var data = {};
        data.items = [];
        redis.keys(util.format(KEY.USER,"*"), function (err, data) {
            var item = [];
            async.each(data, (userid, rcallback) => {
                redis.hgetall(userid, (err, _user) => {
                    if("["+department+"]" ==_user.department){
                        $.extend(_user,{
                            table: _table
                        });
                        redis.hmset(util.format(KEY.USER,_user.userid), _user, (err, data) => {
                            console.log( _user.userid+"修改成功");
                        });
                    }
                });
                rcallback();
            }, function (err){
                 return res.send("1"); 
            });
        });
    }
};
// 按照条件查找users
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
    if(_table == '' && _department == '' && _issign ==''){
       async.each(tempData, (userid, rcallback) => {
           redis.hgetall(userid, (err, user) => {
              // var issign_ = user.issign 
              // if(issign_ == '' || issign_ == undefined || issign_ == null){
              //     issign_ = 0;
              // }
              $.extend(user,{
                  num: i++,
                  // issign:issign_
              });
              _data.items.push(user);
              rcallback();
           });
        }, function (err){
          res.send(_data);
        });
    }else if(_table != '' && _department == '' && _issign ==''){
        async.each(tempData, (userid, rcallback) => {
            redis.hgetall(userid, (err, user) => {
                // var issign_ = user.issign 
                // if(issign_ == '' || issign_ == undefined || issign_ == null){
                //     issign_ = 0;
                // }
                if(user.table == _table){
                 $.extend(user,{
                     num: i++,
                     // issign:issign_
                 });

                 _data.items.push(user);
                   // console.log(_data);
                }
                rcallback();
            });
        }, function (err){
          res.send(_data);
        });   
    }else if(_table == '' && _department != '' && _issign ==''){
       async.each(tempData, (userid, rcallback) => {
           redis.hgetall(userid, (err, user) => {
                // var issign_ = user.issign 
                // if(issign_ == '' || issign_ == undefined || issign_ == null){
                //     issign_ = 0;
                // }
               if(user.department == "["+_department+"]"){
                $.extend(user,{
                    num: i++,
                    // issign:issign_
                });
                _data.items.push(user);
               }
               rcallback();
           });
        }, function (err){
           res.send(_data);
        });
    }else if(_table == '' && _department == '' && _issign !=''){
      async.each(tempData, (userid, rcallback) => {
           redis.hgetall(userid, (err, user) => {
                // var issign_ = user.issign 
                // if(issign_ == '' || issign_ == undefined || issign_ == null){
                //     issign_ = 0;
                // }
               if(user.issign == _issign){
                $.extend(user,{
                    num: i++,
                    // issign:issign_
                });
                _data.items.push(user);
               }
               rcallback();
           });
        }, function (err){
          res.send(_data);
        });
    }else if(_table != '' && _department != '' && _issign ==''){
      async.each(tempData, (userid, rcallback) => {
           redis.hgetall(userid, (err, user) => {

            // var issign_ = user.issign 
            // if(issign_ == '' || issign_ == undefined || issign_ == null){
            //     issign_ = 0;
            // }
               if(user.table == _table && user.department =="["+_department+"]"){
                $.extend(user,{
                    num: i++,
                    // issign:issign_
                });
                _data.items.push(user);
               }
               rcallback();
           });
        }, function (err){
          res.send(_data);
        });
    }else if(_table != '' && _department == '' && _issign !=''){
      async.each(tempData, (userid, rcallback) => {
           redis.hgetall(userid, (err, user) => {

            // var issign_ = user.issign 
            // if(issign_ == '' || issign_ == undefined || issign_ == null){
            //     issign_ = 0;
            // }
               if(user.table == _table && user.issign == _issign){
                $.extend(user,{
                    num: i++,
                     // issign:issign_
                });
                _data.items.push(user);
               }
               rcallback();
           });
       }, function (err){
          res.send(_data);
       });
    }else if(_table == '' && _department != '' && _issign !=''){
      async.each(tempData, (userid, rcallback) => {
           redis.hgetall(userid, (err, user) => {

            // var issign_ = user.issign 
            // if(issign_ == '' || issign_ == undefined || issign_ == null){
            //     issign_ = 0;
            // }
               if(user.department == "["+_department+"]" && user.issign == _issign){
                $.extend(user,{
                    num: i++,
                    // issign:issign_
                });
                _data.items.push(user);
               }
               rcallback();
           });
       }, function (err){
          res.send(_data);
       });
    }else if(_table != '' && _department != '' && _issign !=''){
       async.each(tempData, (userid, rcallback) => {
           redis.hgetall(userid, (err, user) => {
            // var issign_ = user.issign 
            // if(issign_ == '' || issign_ == undefined || issign_ == null){
            //     issign_ = 0;
            // }
               if(user.table == _table && user.department == "["+_department+"]" && user.issign == _issign){
                $.extend(user,{
                    num: i++,
                    // issign:issign_
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
// 抽奖页面 记录中奖人员的信息
exports.postrecordpeopleOfaward = function(req,res){
    var body ={ 
        "userid" : req.body.userid,
        "username" : req.body.username, 
        "AwardsID":req.body.AwardsID ,
        "department" : req.body.department,
        "imgsrc":req.body.imgsrc,
        "awardimg":req.body.awardimg,
        "awardsname":req.body.awardsname,
        "prizename":req.body.prizename,
    };
    
    var id_ = parseInt(req.body.AwardsID);

    redis.hgetall("award:"+id_, (err, result) => {
        var _DrawedNumber = parseInt(result.DrawedNumber);
        var _Number = parseInt(result.Number);
        var status = parseInt(result.Status);

        if(_DrawedNumber < _Number){
          //记录中奖人员的信息
            redis.keys("luckyaward:*",(err, data)=>{
                
                redis.hgetall("luckyaward:"+data.length),(err, reply)=>{
                    var luckid_ = parseInt(reply.luckid)+1;
                    $.extend(body,{
                        "luckid": luckid_
                    })
                    redis.hmset("luckyaward:"+luckid_, body, (err, data) => {
                    // res.send("1");
                    });
                }
                
            })
            // 改变被抽中的奖品数量
            result.DrawedNumber = _DrawedNumber +1;
            if((_DrawedNumber +1) == _Number){
               result.Status = 0;
            }
            redis.hmset("award:"+id_, result, (err, data) => {
                res.send({"AwardsID":id_,"DrawedNumber":_DrawedNumber,"status":status,"msg":"恭喜中奖!"});
            });
        }else{

            status = 0;
            result.Status = 0;

            redis.hmset("award:"+id_, result, (err, data) => {
                res.send({"AwardsID":id_,"DrawedNumber":_DrawedNumber,"status":status,"msg":"奖品已经抽完!"});
            });
        }
        
    });
  
}
// 获取 抽奖页面的 奖品的方法
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
                }else if(parseInt(result.AwardsLevel)==2){
                    arr2.push(result);
                }else if(parseInt(result.AwardsLevel)==3){
                    arr3.push(result);
                }
                
                rcallback();//应该放在  hgetall 里面 作为回调函数  否则  下面的 arr 则发出去 是空的
            });
        },function (err){
            var a = arr.concat(arr1);
            var b = a.concat(arr2);
            var c = b.concat(arr3);
            res.send(c); 
        });
    })
}
// 获取中奖人员的列表
exports.getfetchallawardpelple = function(req, res) {
    var arr = [];
    var arr1=[];
    var arr2=[];
    var arr3=[];
    redis.keys("luckyaward:*",function (err,replies){
        async.each(replies, (userid, rcallback) => {
            redis.hgetall(userid, (err, result) => {
                if(result.AwardsID == 1){
                    arr1.push(result);
                }else if(result.AwardsID == 2){
                    arr2.push(result);
                }else{
                    arr3.push(result);
                }
                
                rcallback();//应该放在  hgetall 里面 作为回调函数  否则  下面的 arr 则发出去 是空的
            });
        },function (err){
            var a = arr.concat(arr1);
            var b = a.concat(arr2);
            var c = b.concat(arr3);
            res.send(c);
        });
    })
};

