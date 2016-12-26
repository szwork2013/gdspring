var wechat = require('wechat-enterprise'),
    api = new wechat.API($.config.enterprise.corpId, $.config.enterprise.corpsecret,$.config.agentid),
    async = $.async,
    util = require('util'),
    redis = $.plug.redis.redisserver;


var KEYS ={
	tk_stage_teams : "tk:stage{0}:teams",
    tk_stage_attacks: "tk:stage{0}:attacks:{1}",
    tk_current:"tk:current",
    tk_log:"tk:log:{0}",
}

exports.getinitstage0 = function(req, res) {
	var team1 = [1,2,3,6,7,8,11,12];
	var team2 = [13,15,16,17,18,20,21,22];
	var team3 = [4,5,9,10,14,19,23,24];
	var results = team1.concat(team2).concat(team3);
	
	redis.keys("tk:*", function (err, replies) {
        async.each(replies, (key, rcallback) => {
            redis.del(key, (err, reply)=>{  
                rcallback();
            });
        }, function (err){
			redis.set(KEYS.tk_stage_teams.format(1), JSON.stringify(results));
			redis.set(KEYS.tk_current, 1);
			//初始化一个空的请求组
			async.each(results, (team, rcallback) => {
	           	redis.lpush(KEYS.tk_stage_attacks.format(1, team), "",
	           		function(){
	           			rcallback();
	           		});
	  	    }, function (err){

	  	    });			
        });
    });

	res.send(results);
}

exports.getstageresult = function(req, res) {
	var currentterm,nextterm;
	var currentteams =[];
    var removedteams=[];

	async.waterfall([
		//获取当前轮次以及下一轮次
		function(cb){
			redis.get(KEYS.tk_current,function(err,current){
				currentterm = current;
				nextterm = parseInt(current) + 1;
				cb();
			})
		},
		//验证是否已经结束
		function(cb){
			redis.get(KEYS.tk_stage_teams.format(currentterm),function(err,teams){
				currentteams = JSON.parse(teams);
				if(currentteams.length<=3)return cb(currentteams);
				cb();
			})
		},
		//获取当前轮次的所有参与组Key
		function(cb){
			redis.keys(KEYS.tk_stage_attacks.format(currentterm, "*"), function(err, teamskey){
				cb(null, teamskey);
			});
		},
		//统计当前轮次的所有参与组Key和count
		function(teamskey, cb){
			var sorttable =[];
			async.each(teamskey, (team, rcallback) => {
	           	redis.llen(team, function(err, count){
					sorttable.push({
						team: team.split(":")[3],
						count: count
					});
					rcallback();
				});
	  	    }, function (err){
	    	   cb(null, sorttable);
	  	    });			
		},
		//剔除最后三组
		function(sorttable, cb){
			sorttable.sort(compare("count"));
			redis.set(KEYS.tk_log.format(currentterm), JSON.stringify(sorttable),function(){
				//去除最小的三个组		
	        	for(var i=0;i<3;i++)
	        	{
	        		var team = parseInt(sorttable[i].team);
	        		removedteams.push(team);
	        		currentteams.remove(team);
	        	}

				cb(null,currentteams);
			});
		},
		//保存剩下的组别
		function(newteams, cb){
			console.log(newteams.length);

			async.each(newteams, (team, rcallback) => {
	           	redis.lpush(KEYS.tk_stage_attacks.format(nextterm, team), "",
	           		function(){
	           			rcallback();
	           		});
	  	    }, function (err){

	  	    });			

			redis.set(KEYS.tk_stage_teams.format(nextterm), JSON.stringify(newteams),function(){
				if(newteams.length<=3)
				{
					redis.set(KEYS.tk_current, nextterm);
					return cb(newteams);
				}
				else return cb(null);
			});
		}],
		//开始下一轮
		function(error, data){
		   if(error) return res.send({errorcode:1, retults: error });

		   redis.set(KEYS.tk_current, nextterm);
		   res.send({errorcode:0, removedteams});
	});
}

exports.postattack = function(req, res) {
	var inputs = req.body;
	var currentterm;

	redis.get(KEYS.tk_current, function(erro, term){
		if(!term) return res.send({errocode:1});

		currentterm = term;
		var key = KEYS.tk_stage_teams.format(currentterm);
        
		redis.get(key, function(erro, data){
			if(!data||data.length<=3) return res.send({errocode:1});

			if(data && JSON.parse(data).indexOf(parseInt(inputs.table))> 0)
			{
			   redis.lpush(KEYS.tk_stage_attacks.format(currentterm, inputs.table), inputs.userid);
			}
		});
	});
	res.send({errocode:0});
}



//Object数组排序
var compare = function (prop) {
    return function (obj1, obj2) {
        var val1 = obj1[prop];
        var val2 = obj2[prop];
        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
            val1 = Number(val1);
            val2 = Number(val2);
        }
        if (val1 < val2) {
            return -1;
        } else if (val1 > val2) {
            return 1;
        } else {
            return 0;
        }            
    } 
}

Array.prototype.remove = function(val) {
            var index = this.indexOf(val);
            if (index > -1) {
                this.splice(index, 1);
            }
        };


