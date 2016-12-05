var wechat = require('wechat-enterprise'),
    fs =require("fs"),
    async = $.async,
    util = require('util'),
    redis = $.plug.redis.redisserver;

var api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret,"41");
var KEY = {
    USER         : 'user:%s',
    Reg: 'user_reg:%s',
    Table: 'user_table:%s'
};
var management = require("../management.js");
exports.getreguserlist = function(req, res) {
  	var data = [];
    var i = 1;
  	redis.keys(util.format(KEY.USER, "*"), function (err, replies) {
  	    console.log(replies.length + " replies:");
  	    async.each(replies, (userid, rcallback) => {
           	redis.hgetall(userid, (err, result) => {
                $.extend(result,{
                    num: i++
                });
           	    data.push(result);
           	    rcallback();
  		 	    });
  	    }, function (err){
    	    	console.log(data.items);
    	      res.send(data);
  	    });
    });
};

exports.getfetchallusers = function(req, res) {
    api.getDepartmentUsersDetail(1, 1, 0, (err, data)=>{
        async.each(data.userlist,(user, rcallback) => {
            //初始化桌号
            // $.extend(user, {
            //   table: 0
            // });
            user.department = JSON.stringify(user.department);


            console.log(user.department+"::::"+user.table);
             //保存数据
            redis.hmset(util.format(KEY.USER, user.userid), user, (err, data) => {
                console.log(data);
                rcallback();
            });
        },(err) => {
            console.log(err);
            res.send("0");
        });
    });
};
// 签到重置
exports.getresetuser = function(req, res) {
    var key = util.format(KEY.USER, req.query.UserId);
    var _issign = req.query.issign;
    var _table = req.query.table;
    redis.hgetall(key, (err, user)=>{
        $.extend(user, {
            table: _table,
            issign: _issign
        });
       
        redis.hmset(key, user, (err, data) => {
            console.log(data);
        });
        res.send("0");
    });
};
// 修改信息
exports.postresetuserinfo = function(req, res) {
    var key = util.format(KEY.USER, req.body.UserId);
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
        redis.keys(util.format(KEY.USER, "*"), 
            function (err, data) {
                var item = [];
                async.each(data, (userid, rcallback) => {
                    redis.hgetall(userid, (err, _user) => {
                        if("["+department+"]" ==_user.department){
                            $.extend(_user,{
                                table: _table
                            });
                            redis.hmset(util.format(KEY.USER, _user.userid), _user, (err, data) => {
                                console.log( _user.userid+"修改成功");
                            });
                        }
                    });
                    rcallback();
                }, function (err){
                     return res.send("1"); 
                });
            }
        );
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
            var issign_ = user.issign 
            if(issign_ == '' || issign_ == undefined || issign_ == null){
                issign_ = 0;
            }
            $.extend(user,{
                num: i++,
                issign:issign_
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
              var issign_ = user.issign 
              if(issign_ == '' || issign_ == undefined || issign_ == null){
                  issign_ = 0;
              }
              if(user.table == _table){
               $.extend(user,{
                   num: i++,
                   issign:issign_
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
              var issign_ = user.issign 
              if(issign_ == '' || issign_ == undefined || issign_ == null){
                  issign_ = 0;
              }
             if(user.department == "["+_department+"]"){
              $.extend(user,{
                  num: i++,
                  issign:issign_
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
              var issign_ = user.issign 
              if(issign_ == '' || issign_ == undefined || issign_ == null){
                  issign_ = 0;
              }
             if(user.issign == _issign){
              $.extend(user,{
                  num: i++,
                  issign:issign_
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

          var issign_ = user.issign 
          if(issign_ == '' || issign_ == undefined || issign_ == null){
              issign_ = 0;
          }
             if(user.table == _table && user.department =="["+_department+"]"){
              $.extend(user,{
                  num: i++,
                  issign:issign_
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

          var issign_ = user.issign 
          if(issign_ == '' || issign_ == undefined || issign_ == null){
              issign_ = 0;
          }
             if(user.table == _table && user.issign == _issign){
              $.extend(user,{
                  num: i++,
                   issign:issign_
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

          var issign_ = user.issign 
          if(issign_ == '' || issign_ == undefined || issign_ == null){
              issign_ = 0;
          }
             if(user.department == "["+_department+"]" && user.issign == _issign){
              $.extend(user,{
                  num: i++,
                  issign:issign_
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
          var issign_ = user.issign 
          if(issign_ == '' || issign_ == undefined || issign_ == null){
              issign_ = 0;
          }
             if(user.table == _table && user.department == "["+_department+"]" && user.issign == _issign){
              $.extend(user,{
                  num: i++,
                  issign:issign_
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




