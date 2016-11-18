/**
* @property api公共返回结构体
* @param {Number} errcode
* @param {String} errmsg
* @optional
* @param {Object} data 如果有结果返回，data将会是一个标准json结构
* @param {Object} extention 如果有结果返回，extention将会是一个标准json结构
*/
var RESULTMSG = {
    errcode: 0,
    errmsg: '',
    data:{},
    extention:{}
};

module.exports = (errcode,errmsg,data,extention) => {
	this.RESULTMSG = RESULTMSG;
	this.RESULTMSG.errcode = errcode;
	this.RESULTMSG.errmsg = errmsg?errmsg:"";
	this.RESULTMSG.data = data?data:{};
	this.RESULTMSG.extention = extention?extention:{};
	return RESULTMSG;
};