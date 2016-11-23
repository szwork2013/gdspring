// 配置数据Json
var config = module.exports = {
    cryptsalt : "gold-tech",
    // 数据库配置
    redis: {
        server:{
            host: "172.28.189.101",
            port: 6379,
            db: 8
        }
    },
    enterprise: {
        corpId: 'wxbea72108079dcb26',
        corpsecret: 'wbqx1xWAELa3HmdJLqjpOk4FXkWh6UjF_kc4mPlwjz9Hlj8yOf-9u5s9TFzhSSWz',
        token: '1iBZ',
        encodingAESKey: '4JdmSv43zuTE8D8rECS45XTvs1dHc5uyUwaOpKUNyHg'
    },
    // 程序路由指定
    dir: "controller",
    // 调试日志开关
    debug: true,
    // 执行超过此值记日志
    time: 50,
    // 入口服务器地址
    nginxUrl: "http://192.168.51.4",
    //testhostname: "http://172.28.184.75:9091",
    // 程序路由结构
    routes: {
        get: {
            '/': function(req, res) {
                res.redirect('/manager/home');
            }
        },
        post: {
        }
    },
    //路由过滤白名单
    filter: {
        //不受控文件夹
        "rules": ['js', 'css', 'fonts', 'html', 'img', 'common','font-awesome'],
        //白名单
        "white-list" : [
            '/',
            '/corp/',
            '/corp',
            '/api/wcqy/users',
            '/api/custcenter/login'
        ],
        // 缓存过期时间单位秒, 一般为2个小时有效期
        "max-age": 3600 * 48
    }
};


//Specify config for prod and dev 
if (config.debug) {
    config.port = 9999;
    config.static = 'public';
} else {
    // 程序端口
    config.port = 9999;
	config.static = 'minify';
}
