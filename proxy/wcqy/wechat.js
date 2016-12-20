/* *
 * 获取access_token
 * */
exports.getAccessToken = function(req, callback) {
    // 是否过期
    if ($.config.enterprise.access_token_time && (new Date()).getTime() < $.config.enterprise.access_token_time) {
        callback(null, $.config.enterprise.access_token);
    } else {
        // 获取凭证接口
        $.ajax({
                url: "hhttps://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid={0}&corpsecret={1}".format(
                    $.config.enterprise.corpId,
                    $.config.enterprise.corpsecret
                ),
                type: "get"
            }, function(err, data) {
                // 缓存access_token
                (function (data) {
                    var data = eval('(' + data + ')');
                    if (data && data.errcode) {
                        callback(err, {});
                    } else {
                        $.config.enterprise.access_token = data.access_token;
                        $.config.enterprise.access_token_time = (function (miao) {
                            // 当前时间
                            var t = new Date();
                            // 转换成毫秒
                            var t_s = t.getTime();
                            // 设置事件比当前时间多7200秒
                            return t.setTime(t_s + 1000 * miao);
                        })(parseInt(data.expires_in));
                        callback(err, data.access_token);
                    }
                })(eval("({0})".format(data)));
            }
        );
    }
};
/*// my get access_token
exports.getAccessTokenAnother = (req, callback)=>{
    // 是否过期
    if ($.config.enterprise.access_token_time && (new Date()).getTime() < $.config.enterprise.access_token_time) {
        callback(null, $.config.enterprise.access_token);
    }else {
        // 获取凭证接口
        $.ajax(
            {
                url: "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid="+$.config.enterprise.corpId+"&corpsecret="+$.config.enterprise.corpsecret,
                type:"get"
            }, 
            function(err, data){  
                var data = eval('(' + data + ')');    
                $.config.enterprise.access_token = data.access_token;

            }
        )
    }
}*/
/* *
 * 获取jsapi_ticket
 * */
exports.getJsapiTicket = function(req, callback) {
    if ($.config.debug) {
        $.proxy.wechat.getAccessToken(req, function(err, data) {
            if ($.config.wx.jsapi_ticket_time && (new Date()).getTime() < $.config.wx.jsapi_ticket_time) {
                callback(null, $.config.wx.jsapi_ticket);
            } else {
                // 获取凭证接口
                $.ajax({
                        url: "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token={0}&type=jsapi".format(
                            data
                        ),
                        type: "get",
                        session: {
                            id: req.sessionID,
                            user: req.session.user
                        }
                    }, function(err, data) {
                        // 缓存jsapi_ticket
                        (function (data) {
                            if (data && data.errcode) {
                                callback(err, {});
                            } else {
                                $.config.wx.jsapi_ticket = data.ticket;
                                $.config.wx.jsapi_ticket_time = (function (miao) {
                                    // 当前时间
                                    var t = new Date();
                                    // 转换成毫秒
                                    var t_s = t.getTime();
                                    // 设置事件比当前时间多7200秒
                                    return t.setTime(t_s + 1000 * miao);
                                })(parseInt(data.expires_in));
                                callback(err, data.ticket);
                            }
                        })(eval("({0})".format(data)));
                    }
                );
            }
        });
    } else {
        // 获取凭证接口
        $.ajax({
                url: "{0}/api/WeChatCallback/GetTicket/{1}".format(
                    $.config.wechatUrl,
                    $.config.wx.appid
                ),
                type: "get",
                session: {
                    id: req.sessionID,
                    user: req.session.user
                }
            }, function(err, data) {
                try {
                    data = JSON.parse(data || "{}");
                }
                catch(e) {
                    data = {};
                }
                if (data && data.errmsg) {
                    callback(err, data.errmsg ? data.errmsg.ticket : "");
                }
            }
        );
    }
};

/**
* 通过code获取openid
* code: 页面提供
* 返回格式     
{
   "access_token":"ACCESS_TOKEN",
   "expires_in":7200,
   "refresh_token":"REFRESH_TOKEN",
   "openid":"OPENID",
   "scope":"SCOPE",
   "unionid": "o6_bmasdasdsad6_2sgVt7hMZOPfL"
}
**/
exports.getAccessTokenByCode = function(req, callback) {
    if (req.query.code) {
        $.ajax({
            url: "https://api.weixin.qq.com/sns/oauth2/access_token?appid={0}&secret={1}&code={2}&grant_type=authorization_code".format(
                $.config.wx.appid, 
                $.config.wx.appsecret,
                req.query.code
            ),
            type: "get",
            session: {
                id: req.sessionID,
                user: req.session.user
            }
        }, function(err, data) {
            $.plug.log.logger.info($.showFunLog("根据code获取openid：getAccessTokenByCode【https://api.weixin.qq.com/sns/oauth2/access_token?appid={0}&secret={1}&code={2}&grant_type=authorization_code】", {code: req.query.code}, data));
            callback(err, JSON.parse(data));
        });
    } else {
        $.plug.log.logger.info($.showFunLog("根据code获取openid：getAccessTokenByCode【https://api.weixin.qq.com/sns/oauth2/access_token?appid={0}&secret={1}&code={2}&grant_type=authorization_code】", {}, '{"Message":"code不存在"}'));
        callback(null, {});
    }
};

/**
* 获取用户信息
* access_token: 网页授权接口调用凭证, 注意：此access_token与基础支持的access_token不同
* openid：微信用户唯一标识
*/
exports.getUserinfoByOpenid = function(req, callback) {
    // 获取凭证接口
    $.ajax({
        url: "https://api.weixin.qq.com/sns/userinfo?access_token={0}&openid={1}&lang=zh_CN".format(req.query.access_token, req.query.openid),
        type: "get",
        session: {
            id: req.sessionID,
            user: req.session.user
        }
    }, function(err, data) {
        callback(err, JSON.parse(data));
    });
};