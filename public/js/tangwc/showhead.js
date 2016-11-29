    var socket = '';
    var url = "ws://www.jskplx.com/signup";
    var flag=1;

    $(function() {
        getData();
        // getwebsocket();
    })
	// 连接websocket  服务
	function getwebsocket(){
        if ('WebSocket' in window)
            socket = new WebSocket(url);
        else if ('MozWebSocket' in window)
            socket = new MozWebSocket(url);
        //打开连接时触发
        socket.onopen = function() {
            console.log('OPEN: ' + socket.protocol);
        };
        //收到消息时触发
        socket.onmessage = function(evt) {
        	console.log(evt.data);
	        var data=JSON.parse(evt.data);
	       	var imgSrc = data.avatar;
	    	var num = data.num;
	    	var name = data.name;
            if(num>230){
                reutrn;
            }
	        if(num != "" && num != undefined && num != null){
	    		if(imgSrc != undefined && imgSrc != '' && imgSrc != null){
	    		    document.getElementById(num).src=imgSrc;// $("#"+num)[0].src = imgSrc;
	    		    document.getElementById(num).title=name;
	    		    smallAndBig(num);
	    		}
	    	}
      	};
	}
    //ajax 请求头像数据
    function getData(){
        $.ajax({
            url:'http://localhost:9999/api/user/reguserlist',
            type:'get',
            async:false,
            // data:{name:'yang',age:25},
            // timeout:5000,    //超时时间
            dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
            success:function(data){
            	insertImg(data);
            },
            error:function(){
             	console.log("没有从数据库中搜索到数据!");
            }
        })
    }
    // 插入微信头像  
    function insertImg(data){
    	if(data != "" && data != null && data != undefined){    //200为正常返回
    	    for(var i = 0; i<data.length;i++){
    	    	var imgSrc = data[i].avatar;
    	    	var num = data[i].num;
                if(num>230){
                    return;
                }
    	    	var name = data[i].name;
    	    	if(num != "" && num != undefined && num != null){
    	    		if(imgSrc != undefined && imgSrc != '' && imgSrc != null){
    	    		    document.getElementById(num).src=imgSrc;// $("#"+num)[0].src = imgSrc;
    	    		    document.getElementById(num).title=name;
    	    		    smallAndBig(num);
    	    		}
    	    	}
    	    }
    	}
    }
    // 将头像放大和缩小 
    function smallAndBig(num){
    	setTimeout(function(){
    		$("#"+num).css({
                "animation":"bigPicture 3s 0s 1"
            })
    	},500);
        $("#"+num).click(function(){
            $("#"+num).css({
                "z-index":"3",
                "transform":"scale(10,10)"
            })
        });
        $("#"+num).dblclick(function(){
            $("#"+num).css({
                "z-index":"1",
                "transform":"inherit"
            })
        });
    }

    // 间隔一段时间,执行该程序
    window.setInterval("AnimationFun()",6000);

    function AnimationFun(){
    	if(flag % 2==1){
     		flag = 2;
    		animationFunOne();
    	}else if(flag % 2==0){
    		flag=1
    		animationFunTwo();
    	}
    }
    function animationFunOne(){
    	$(".secondAnimalDiv").css({
    		"position":"relative",
    		"animation":"",
    		"-moz-animation":"",
    		"-webkit-animation":"",
    		"-o-animation":""
    	})
    	$(".firstDiv").css({
    		"list-style":"none",
    		"-webkit-animation":"revolving 5s 0s 1",
    		"animation":"revolving 5s 0s 1",
    	});
    }
    function animationFunTwo(){
    	$(".firstDiv").css({
    		"list-style":"none",
    		"-webkit-animation":"",
    		"animation":""
    	});
    	$(".secondAnimalDiv").css({
    		"position":"relative",
    		"animation":"animated_div 5s 1",
    		"-moz-animation":"animated_div 5s 1",
    		"-webkit-animation":"animated_div 5s 1",
    		"-o-animation":"animated_div 5s 1"
    	})
    }