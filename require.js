// 全局应用对象
module.exports = {
	// 批量引用模块
    modules : "./node_modules",
    // 引用配置文件
    config : "./config.js",
    // 引用扩展插件
    ext : "./lib/ext",
    // 引用相关插件
    plug : "./lib/plug",
    // 引用db插件
    db : "./lib/db",
    // 引用oauthserver插件
    //oauthserver: "./lib/oauthserver",
    // 处理层
    proxy_custmg : "./proxy/custmg"
};