var soap = require('soap');
var url = 'http://192.168.50.100:86/SMSService.wsdl';

module.exports.send = (params,callback)=>{
	var args = {
		    code: '93749aa6-cd10-4761-b73e-11b0d5e2db62',
			number: params.number,
		    content: params.content};
    //console.log(args);

	soap.createClient(url, function(err, client) {
	  client.send(args, function(err, result) {
	  	  console.log(err);
	  	   console.log(result);
	      callback(result);
	  });
	});
}

/*生成随机数*/
module.exports.getRandomInt = (min, max) => {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min)) + min;
}