var uuid = require('node-uuid');
var bluebird = require('bluebird');
var util = require('util'),
async = $.async,
redis = $.plug.redis.userdbserver;

var KEY = {
    USER         : 'user:%s',
    USER_USERNAME: 'username:%s'
};

/*用户中心－开放登录*/
exports.login = (para, callback) =>
{
    var user,userSession;
    async.waterfall([
            //检察请求参数完整性
            function (cb) {
                if (!para || !para.username || !para.password)
                    return cb($.plug.resultformat(30001, "Username and password is mandatory"));
                cb();
            },
            //验证码验证
            function (cb) {
                var checkpara = {name:para.username, type:"0", code:para.code};
                forcecodeverify(checkpara, (data)=>{
                    return cb(data);
                });
            },
            //账户异常
            function (cb) {
                //账户异常
                var isrequired = false;
                if (isrequired) return cb($.plug.resultformat(30007, "The account is innormal"));
                cb();
            },
            //获取权限
            function (cb) {
                $.plug.crypto.encrypt(para.password, $.config.cryptsalt, (maskpw)=>{
                    para.password = maskpw;
                });

                var sql = "\
                           select \
                                u.`id`,\
                                u.`name`,\
                                u.`status`,\
                                u.`type`,\
                                u.`mobile`,\
                                u.`email`,\
                                u.`create_dt`,\
                                u.`create_user`,\
                                u.`modify_dt`,\
                                u.`modify_user`,\
                                ci.`compcode`,\
                                ci.`compname`,\
                                ci.`contact`,\
                                ci.`identitytype`,\
                                ci.`identitycode`\
                            from `user` as u\
                            left join cust_info as ci on u.id = ci.id\
                            WHERE u.name = '{0}' and u.password='{1}';\
                            ".format(para.username, para.password);

                // var sql = "\
                //            select count(1) as count\
                //            from `user`\
                //             WHERE name = '{0}' and password='{1}';\
                //             ".format(para.username, para.password);

                $.db.mysql.gd.query(sql, (err, data) => {
                    if (err) return cb($.plug.resultformat(40001, err));
                    if (data.length == 0) 
                    {
                        forceverify({name:para.username, type:"1"});
                        return cb($.plug.resultformat(30003, "Either username or password is incorrect"));
                    }
                    cb(null, data[0]);
                 });
            }
        ],
        function (err,data) {
            if (err) {
                callback(err);
            } else {
                callback($.plug.resultformat(0, '', data));
            }
        });
}

/*用户中心－开放注册*/
exports.register = (user, callback) =>
{
    var userid,codeid;

    async.waterfall([
            //检察请求参数完整性
            function (cb) {
                if (!user || !user.username||!user.password)
                   return cb($.plug.resultformat(30001, "Username, password, mobile is mandatory"));
                cb();
            },
            //获取是否已经注册过
            function (cb) {
                $.db.mysql.gd.query("select count(1) as count from user where name='{0}'".format(user.username), (err,data) => {
                    if (data[0].count > 0) return cb($.plug.resultformat(30006, "User is already existing"));
                    cb();
                });
            },
            //验证码验证
            function (cb) {
               codeid = util.format("code:%s:%s", "0", user.username);
               redis.get(codeid, (err, data) => {
                   getcode = data;
                   if(user.code != getcode) {
                      return cb($.plug.resultformat(30011, "code is incorrect or expired"));
                   }
                   cb();
               });
            },
            //用户添加
            function (cb) {
                var mobile_regx = /^(?:13\d|15\d|18[123456789])-?\d{5}(\d{3}|\*{3})$/;
                var email_reg = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/gi;
                user.mobile = mobile_regx.test(user.username)? user.username:"";
                user.email = email_reg.test(user.username)? user.username:"";

                user.id = uuid.v4();
                $.plug.crypto.encrypt(user.password, $.config.cryptsalt, (maskpw)=>{
                    user.password = maskpw;
                });

                sql = "\
                    INSERT INTO `user`\
                        (`id`,\
                         `name`,\
                         `password`,\
                         `status`,\
                         `type`,\
                         `mobile`,\
                         `email`,\
                         `create_dt`,\
                         `create_user`)\
                    VALUES \
                        ('{0}', \
                        '{1}', \
                        '{2}', \
                        {3},\
                        {4},\
                        '{5}',\
                        '{6}',\
                        UNIX_TIMESTAMP(),\
                        '{7}'); \
                    ".format(
                        user.id,
                        user.username,
                        user.password,
                        1,
                        user.type,
                        user.mobile,
                        user.email,
                        user.id);
                $.db.mysql.gd.query(sql, (err,data) => {
                    if (err) return cb($.plug.resultformat(40001, err));
                    cb();
                });
            },
            function (cb) {
                cons
                var cust_info_sql = "\
                    INSERT INTO `cust_info`\
                        (`id`,\
                        `name`,\
                        `compcode`,\
                        `compname`,\
                        `contact`,\
                        `identitytype`,\
                        `identitycode`,\
                        `recommander`,\
                        `create_dt`,\
                        `create_user`)\
                    VALUES \
                        ('{0}', \
                        '{1}', \
                        '{2}', \
                        '{3}',\
                        '{4}',\
                        {5},\
                        '{6}',\
                        '{7}',\
                        UNIX_TIMESTAMP(),\
                        '{8}'); \
                    ".format(
                        user.id,
                        user.username,
                        user.compcode?user.compcode:'',
                        user.compname?user.compname:'',
                        user.contact?user.contact:'',
                        user.identitytype?user.identitytype:0,
                        user.identitycode?user.identitycode:'',
                        user.recommander?user.recommander:'',
                        user.id);
                console.log(cust_info_sql);
                $.db.mysql.gd.query(cust_info_sql, (err,data) => {
                    //if (err) return cb($.plug.resultformat(40001, err));
                    console.log(err);
                    cb();
                });

            },
            //授权默认权限
            function (cb) {
                //todo add default roles and resources
                cb();
            }
        ],
        function (err) {
            if (err) {
                callback(err);
            } else {
                callback($.plug.resultformat(0, '', {id:user.id}));
            }
        });
}

/*用户中心－密码修改*/
exports.resetpassword = (para, callback) =>
{
    var codeid;
    async.waterfall([
            //检察请求参数完整性
            function (cb) {
                if (!para || !para.username||!para.newpassword)
                    return cb($.plug.resultformat(30001, "Username, password is mandatory"));

                $.plug.crypto.encrypt(para.newpassword, $.config.cryptsalt, (maskpw)=>{
                    para.newpassword = maskpw;
                });

                codeid = util.format("code:%s:%s", "2", para.username);
                cb();
            },
            //验证码验证
            function (cb) {
                redis.get(codeid, (err, data) => {
                   getcode = data;
                   if(para.code != getcode) {
                      return cb($.plug.resultformat(30011, "code is incorrect or expired"));
                   }
                   cb();
                });
            },
            //密码重置
            function (cb) {
                var sql ="update user \
                          set password = '{1}'\
                          where name = '{0}'\
                          ".format(para.username, para.newpassword);
                $.db.mysql.gd.query(sql, (err, data) => {
                    if (err) return cb($.plug.resultformat(40001, err));
                    redis.expire(codeid , 0);
                    cb();
                });
            }
        ],
        function (err) {
            if (err) {
                callback(err);
            } else {
                callback($.plug.resultformat(0, ''));
            }
        });
}

//生成验证码
//type: 1 登录验证
function forceverify(para) {
    var codeid = util.format("forceverify:%s:%s", para.type, para.name);
    redis.lpush(codeid, 1, (err, data) => {
        redis.expire(codeid, 2000);
    });
}

//生成验证码
//type: 0注册，1登录验证，2忘记密码
exports.codegenerate = (para, callback) =>
{
    var code = $.plug.sms.getRandomInt(1000,9999);
    var codeid = util.format("code:%s:%s", para.type, para.name);
    redis.set(codeid, code, (err, data) => {
        redis.expire(codeid, 300);
        var value = {
            number : para.name,
            content:"验证码为:{0},有效时间为5分钟。".format(code)
        };
        $.plug.sms.send(value,(result)=>{console.log("短信发送结果:"+ result)});
        return callback($.plug.resultformat(0, '', value));
    });
}

//强制验证码校验
function forcecodeverify(para, callback)
{
    var forceverifyid = util.format("forceverify:%s:%s", "1", para.name);
    var codeid = util.format("code:%s:%s", "0", para.name);
    var getcode;
    async.waterfall([
        //检察是否必须强制验证码
        function (cb) {
            redis.llen(forceverifyid, (err, data) => {
                if(data > 5 && !para.code) return cb($.plug.resultformat(30005, "Code is forcing requiered"));
                if(data > 5) {
                    redis.get(codeid, (err, data) => {
                        getcode = data;
                        if(para.code != getcode) {
                          return cb($.plug.resultformat(30011, "code is incorrect or expired"));
                        } else {
                            redis.expire(codeid , 0);
                            redis.expire(forceverifyid , 0);
                        }
                    });
                }
                cb();
            });
        }],
        function (err) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        }
    );
}

//验证码检查
exports.codeverify = (para, callback) => {
    var codeid = util.format("code:%s:%s", para.type, para.name);
    redis.get(codeid, (err, data) => {
        if(para.code == data) {
           redis.expire(codeid , 0);
           return callback($.plug.resultformat(0, ''));
        }
        return callback($.plug.resultformat(30011, 'code is incorrect'));
    });
}

exports.custsummary = (para, callback) => {
    var sql= "select \
              count(1) as count\
              from user";
    var result={
        totalcount:0,
        newcount:0,
    }
    async.waterfall([
        //检察是否必须强制验证码
        function (cb) {
            $.db.mysql.gd.query(sql, (err,data) => {
                result.totalcount = data[0].count;
                cb();
            });
        },
        function (cb) {
            var newcount_sql=" where create_dt > unix_timestamp(date_sub('{0}',INTERVAL WEEKDAY('{0}') day)) \
            and  create_dt < unix_timestamp(date_sub('{0}',INTERVAL WEEKDAY('{0}') - 7 DAY))".format(para);
         
            $.db.mysql.gd.query(sql + newcount_sql, (err,data) => {
                result.newcount = data[0].count    
                cb();
            });
        }],
        function (err) {
            if (err) {
                callback(err);
            } else {
                callback($.plug.resultformat(0, '', result));
            }
        }
    );

}





