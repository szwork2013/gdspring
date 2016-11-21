var wechat = require('wechat-enterprise');
var api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret);

/**
@description 
用户中心接口模块
@module API
@submodule custcenter
@class custcenter
*/


/**
@description
	用户中心－登录			  </br>
	请求类型: POST             </br>
	请求类型: application/json </br>
	返回结构:      			  </br>
			`{
			    "errcode": "0",
			    "errmsg": "",
			    "data":{},
			    "extention":{}
			}`
			                 </br>
	data参数名说明:            </br>
		username 用户名 </br>
		mobile 手机号 </br>
		roles 角色ID数组 </br>
		resources 资源ID数组 </br>
@method api/custcenter/login
@param username {String} 注册用户名，唯一
@param password {String} 密码
@param [code] {String} 验证码,根据安全需要时会要求提供
@return 返回架构中的 `data`说明
@example
	输入样例
	{
       "username":"admin",
       "password":"xxxxxxx",
       "code": "xxxx"
	}

	返回样例
	{
	   "id: "",
	   "user":{
		   "username": "",
		   "mobile": ""
		   "extention":{}
	   },
	   "roles":["abc","efg"],
	   "resources":["123","456"] 	
	}
*/
exports.getusers = (req,res)  => {
	api.getUser(req.query.userid, function (err, data) {
	  console.log(data);
	  res.send(data);
	});
}

