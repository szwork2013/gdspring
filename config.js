// 配置数据Json
var config = module.exports = {
    cryptsalt: "gold-tech",
    // 数据库配置
    redis: {
        server: {
            host: "172.28.189.101",
            port: 6379,
            db: 8
        }
    },
    mqconnOptions: {
      hostname: '172.28.189.101',
      port: 5672,
      username: 'admin',
      password: 'P@ssword0'
    },
    redpack:{
        mch_id: '1415437202',
        partner_key: 'DFanXJMxDQFqsKYz643v5ANWFeuMgOZ2',
        pfx: require('fs').readFileSync('cert/apiclient_cert.p12'),
        wxappid: 'wxb702524cb9c3b9c7'
    },
    enterprise: {
        corpId: 'wxbea72108079dcb26',
        corpsecret: 'wbqx1xWAELa3HmdJLqjpOk4FXkWh6UjF_kc4mPlwjz9Hlj8yOf-9u5s9TFzhSSWz',
        token: '1iBZ',
        encodingAESKey: '4JdmSv43zuTE8D8rECS45XTvs1dHc5uyUwaOpKUNyHg',
        access_token:'',
        access_token_time:''
    },
    useridToOpenid:"https://qyapi.weixin.qq.com/cgi-bin/user/convert_to_openid?access_token=",//getAccessToken在调用的时候赋值
    agentid:41,
    // 程序路由指定
    dir: "controller",
    // 调试日志开关
    debug: true,
    // 执行超过此值记日志
    time: 50,
    // 入口服务器地址

    // 朱总的红包
    bonusofzhu:1000,
    // 陈总的红包
    bonusofchen:2000,
    //份额
    bonusofshare:25,
    // 最小金额
    minbonus :5,
    
    nginxUrl: "http://localhost:9090/", //"http://192.168.51.4",//   ws://www.jskplx.com/mainsocket   http://localhost:9999/
    httpUrl: "http://222.92.48.94:9090/",
    socketUrl: "ws://139.129.13.113/",
    //testhostname: "http://172.28.184.75:9091",
    // 程序路由结构
    routes: {
        get: {
            '/': function(req, res) {
                res.redirect('/manager/home');
            }
        },
        post: {}
    },
    //路由过滤白名单
    filter: {
        //不受控文件夹
        "rules": ['js', 'css', 'fonts', 'html', 'img', 'common', 'font-awesome'],
        //白名单
        "white-list": [
            '/',
            '/corp/',
            '/corp',
            '/api/wcqy/users',
            '/api/custcenter/login'
        ],
        // 缓存过期时间单位秒, 一般为2个小时有效期
        "max-age": 3600 * 48
    },
    // 页面中用到的文字整合++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    wechatreply_messages:[
        "0%匹配，你说的是: 【   】  小编：你说话了么？", 
        "10%匹配，你说的是: 【高新年】 小编：好好练练普通话！", 
        "20%匹配，你说的是: 【高达生日快乐】 小编：问题是，今天不是生日晚会啊！", 
        "30%匹配，你说的是: 【高达新年】 小编：👂后面我听不清楚了！", 
        "40%匹配，你说的是: 【新年快乐】 小编：谢谢，也祝你快乐！", 
        "50%匹配，你说的是: 【快乐】 小编：发奖金最快乐😄", 
        "60%匹配，你说的是: 【新年好呀，新年好呀】小编：唱的不错！", 
        "70%匹配，你说的是: 【高达，高达，高达】小编：果然很重要，都重复三遍了啊！", 
        "80%匹配，你说的是: 【高达】小编：哎，我在！", 
        "90%匹配，你说的是: 【高达新年】 小编：快乐！我帮你补齐了，请叫我雷锋👩‍", 
        "100%匹配，你说的是: 【高达新年快乐】。小编：不错说的很棒，就是差点运气，再接再厉！"
    ],

    wechatreply_nopemsg: ["你辣么美，你知道么？", "告诉我，你的愿望是什么？", "奖品正在赶往现场的路上！！！"],

    wechatreply_mediaIds: ["2XEVMLa2pJnXRx4bETJUutj21rZN1tQr9CqwK5A7eDS5Yas0rjdQE5C-3L3d9k9u0bBBcQkRql7J-lhE9hH-NUw",
        "2jeIYxXsxM2vyIP28Njd_yKxt4LOUzicFuX0xhwi7iDSS-9mWsw_xwIKGY393Qqw7n7hKfHligUUh_LgkzbWQDw",
        "2mqQg9Xz3Dfmz-NK7NtSkNUZzrXUxduyQ8YSbNI1K76Ol5iBRFzjKLnGoFOW4_A9JczdfHLbRpkkLdqy4HGNjZw"
    ],
    wechatreply_texts: ["继续继续！不能停！",
        "还差一点点，离奖品还差1CM",
        "哦～～～走过了！！！",
        "要不，你换个姿势，再来一次？",
        "蓝瘦，香菇～～～就差一点点了！",
        "天啊，你果然很有一套！还不继续:)"
    ],
    signup_message: ["来得早不如来得巧,{0}的桌号是{1},速速前往!", "{0},都在等你吃饭呢,还不赶快去!记得是第{1}桌!",
        "Hi {0},你的中奖机会已经报爆表,再不落座{1}号桌就归零了哦!5,4,3,2,1! 0!"
    ],
    signup_cantgetuserid: "我猜你是大BOSS，不在五行中！请联系工作人员获取桌号，谢谢！",
    signup_getuserid: "签到了就去吃饭，还愣着干嘛！桌号是{0}",
    chatarray:[25,88,220,888,1992,2017,2092,3888,6666,8888,10000], //消息强页面的  中奖  号码
    rpmessage: {
        wechatwall:{
           send_name: '高达',
           wishing: '祝阖家欢乐、身体健康、万事如意',
           act_name: '2017高达年会',
           remark: '猜越多得越多，快来抢！',
           no : 1
        },
        voice:{
           send_name: '朱总',
           wishing: '祝阖家欢乐、身体健康、万事如意',
           act_name: '2017高达年会',
           remark: '猜越多得越多，快来抢！'
        },
        rain:{
           send_name: '程总',
           wishing: '祝阖家欢乐、身体健康、万事如意',
           act_name: '2017高达年会',
           remark: '猜越多得越多，快来抢！'
        }
    }
};


//Specify config for prod and dev 
if (config.debug) {
    config.port = 9090;
    config.static = 'public';
} else {
    // 程序端口
    config.port = 9090;
    config.static = 'minify';
}
