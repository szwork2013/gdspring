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
exports.postlogin = (req,res)  => {
	$.proxy_custmg.custcenter.login(req.body,(result) => {
		//create session
		//var id = req.session.id;
		if(result.data){
			req.session.user_id = result.data.id;
			req.session.user_name = result.data.name;
			req.session.userSession = result.data;

			result.data = {
				session_id:req.session.id,
				user:result.data
			};

	        req.session.save(function(err) {
	        	res.send(result);
	        });
		}else {
			req.session.user_id = "";
			req.session.user_name = "";
			req.session.userSession = {};

			result.data = {
				session_id:"",
				user:{}
			};
			res.send(result);
		}
	});
}

/**
@description
	用户中心－注册			 </br>
	请求类型: POST             </br>
	请求类型: application/json </br>
	返回结构: {RESULTMSG}      </br>
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
@method api/custcenter/register
@param username {String} 注册用户名，唯一
@param password {String} 密码
@param code {String} 验证码，必须
@return 返回架构中的 `data`说明
@example 
	输入参数
	   {
	        username:'admin',
	        password:'xxxxxxx',
	        code: 'xxxx'
	   }
*/
exports.postregister = (req,res) => {
	console.log(req.body);
    $.proxy_custmg.custcenter.register(req.body,(result)=>{
		res.send(result);
	});
}

/**
@description
	重置密码			 </br>
	请求类型: POST             </br>
	请求类型: application/json </br>
	返回结构: {RESULTMSG}      </br>
			`{
			    "errcode": "0",
			    "errmsg": "",
			    "data":{},
			    "extention":{}
			}`
						      </br>
@method api/custcenter/resetpassword
@param username {String} 注册用户名，唯一
@param newpassword {String} 重置后密码
@return 参考返回结构
@example 
	输入样例
	{
	        username:'admin',
	        newpassword:'xxxxxxx',
	        code: 'xxxx'
	}

	返回码说明
	0        生成成功
	40001	 生成失败
*/
exports.postresetpassword = (req,res)  => {
	$.proxy_custmg.custcenter.resetpassword(req.body,(result)=>{
		res.send(result);
	});
}

/**
@description
	获取验证码			 </br>
	请求类型: GET             </br>
	请求类型: application/json </br>
	返回结构: {RESULTMSG}      </br>
			`{
			    "errcode": "0",
			    "errmsg": "",
			    "data":{},
			    "extention":{}
			}`
						      </br>
@method api/custcenter/codegenerate
@param username {String} 注册用户名，唯一
@param type {String} 参数值的应用场景分别为 0：注册，1：登录验证，2：忘记密码
@return 参考返回结构
@example 
	输入样例
	/api/custcenter/codegenerate?username=admin&type=0

	返回码说明
	0        生成成功
	40001	 生成失败
*/
exports.getcodegenerate = (req,res)  => {
	var data = {
		name:req.query.username,
		type:req.query.type
	};

	$.proxy_custmg.custcenter.codegenerate(data,(result)=>{
		res.send(result);
	});
}


/*用户中心－用户认证*/
exports.postverify = (req,res) => {
	$.proxy_custmg.custcenter.verify(req.body,(result)=>{
		res.send(result);
	});
}

/**
@description
	登出			 </br>
	请求类型: POST             </br>
	请求类型: application/json </br>
	返回结构: {RESULTMSG}      </br>
			`{
			    "errcode": "0",
			    "errmsg": "",
			    "data":{},
			    "extention":{}
			}`
						      </br>
@method api/custcenter/logout
@param username {String} 注册用户名，唯一
@param session_id {String} sessionid
@return 参考返回结构
@example 
	输入样例

	返回码说明
	0        生成成功
	40001	 生成失败
*/
exports.postlogout = (req,res) => {
	res.send($.plug.resultformat(0, ''));
	// $.proxy_custmg.custcenter.logout(req.body,(result)=>{
	// 	res.send(result);
	// });
}

/**		
/*用户中心－用户信息更新*/
exports.postprofileupdate = (req,res) => {
	$.proxy_custmg.custcenter.profileupdate(req.body,(result)=>{
		res.send(result);
	});
}

exports.postencrypt = (req,res) => {
	$.proxy_common.securitymg.encrypt(req.body,(result)=>{
		res.send(result);
	});
}

exports.postdecrypt = (req,res) => {
	$.proxy_common.securitymg.decrypt(req.body,(result)=>{
		res.send(result);
	});
}

exports.getcodeverify = (req,res)  => {
	var data= {
		name:req.query.username,
		type:req.query.type,
		code:req.query.code
	};

	$.proxy_custmg.custcenter.codeverify(data,(result)=>{
		res.send(result);
	});
}


