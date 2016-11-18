/**
* 日志模块
***/
var logger = {
	// 当前日期
	date: null,
	// 日志文件对象
	stream: null,
	// 日志记录
	log: (strTime, type, msg) => {
		// 创建日志对象
		// if (!logger.date && logger.date != strTime.format("yyyyMMdd")) {
		// 	logger.date = strTime.format("yyyyMMdd");
		// 	logger.stream = $.fs.createWriteStream('{0}\\log\\{1}.log'.format(__dirname.split("\\lib")[0], logger.date), { 
		//   		flags: 'a' 
		//   	});
		// }
		// 日志文本
		var strMsg = "【{0}】{1} : {2}".format(strTime, type, msg);
		// // 记录文件日志
		// logger.stream.write(strMsg);
		// 控制台日志
		console.log(strMsg);
	},
	// 获取时间
	getTime: (cb) => {
		cb(new Date());
	},
	// 调用日志
    info: (msg) => {
    	logger.getTime((time) => {
    		logger.log(time, "INFO", msg);
    	});
    },
    // 错误日志
    error: (data) => {
    	logger.getTime((time) => {
    		logger.log(time, "ERROR", msg);
    	});
    }
};
module.exports.logger = logger;