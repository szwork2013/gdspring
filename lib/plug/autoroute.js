// 程序主进程生成
module.exports = cbFun => {
    // 定义app
    $.app = $.express();
    // 设置端口
    $.app.set("port", process.env.PORT || $.config.port);
    // 生成http服务
    $.server = $.http.createServer(((app, o) => {
        // app设置
        cbFun(app);
        // 开始路由
        for (var m in o)
            for (var p in o[m]) {
                console.log(new Date() + " 生成路由：" + p);
                app[m].apply(app, [p, o[m][p]]);
            }
            return app;
        })(
        // 程序app对象
        $.app,
        // 程序路由对象
        (cb => {
            // 定义文件数组
            return (a => {
                // 获取文件夹下的所有子文件路径字符串数组
                (function(p, a) {
                    // 获得方法本身和文件夹下的文件或文件夹数组
                    ((f, fls) => {
                        // 递归获取子文件路径数组
                        for (n of fls)
                            /\.js$/.test($.path.join(p, n))
                        ? a.push($.path.join(p, n))
                        : f($.path.join(p, n), a);
                    })(arguments.callee, $.fs.readdirSync(p));
                })($.path.join(__dirname, '../..', $.config.dir), a);
                // 返回文件数组
                return cb(a);
            })([]);
        })(
            // 生成文件夹内路由结构
            fls => {
                // 定义路由结构体
                for (fl of fls)
                    // 遍历生成路由
                for (var fun in require(fl)) {
                        // 去特殊字符‘
                        fun = fun.replace(/\'/g, "");
                        // 遍历路由类型
                        for (var type in $.config.routes)
                            // 匹配是否符合访问类型规则
                        if (new RegExp("^" + type + "[\\w\\.]*$").test(fun)) {
                                // 生成路径结构
                                $.config.routes[type][
                                $.path.join((pf => {
                                    return pf.split($.config.dir)[1].split(".js")[0];
                                })(fl), (str => {
                                    return str.slice(0, 1).toLowerCase() +
                                    str.slice(1, str.length).replace(/_/ig, "/:");
                                })(fun.replace(type, ""))).replace(/\\/g, "/")
                                ] = require(fl)[fun];
                            }
                        }
                        return $.config.routes;
                    }
                    ))
        ).listen($.app.get("port"));
    // 附加websocket
    $.plug.ws();
};