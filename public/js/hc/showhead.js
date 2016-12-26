    var connectIP = $("#mainIP").html();
    var ip =connectIP.split("|")[0];
    var socketUrl=connectIP.split("|")[1];

    // 主监听socket   用来控制 次监听socket
    var mainSocket='';
    var mainUrl= socketUrl +'mainsocket';
    // 次监听socket
    var socket = '';
    var url = socketUrl+'signup';

    // var mainUrl="ws://www.jskplx.com/mainsocket";
    // var url = "ws://www.jskplx.com/signup";

    // 记录签到人员数量
    var signNumber=0;
    
    window.onresize = adjust();
    $(function() {

        var width = $(document).width()*0.6;
        var height = $(document).width()*0.6;
        $(".firstDiv").css({
            // "margin":"auto",
            "width": width+"px !important",
            "height": height+"px !important",
            "display": "block",
            "margin-left":width*0.4+"px",
            // "width": "100%",
            // "text-align": "center"
        })
        $(".smallDiv").css({
            "width": width/40+"px",
            "height":height/40+"px",
            "position":"relative",
            // "float":"left",
            // "z-index": "2"
        })
        $(".newLineDiv").css({
            "width": width/40+"px",
            "height":height/40+"px"
        })

        mainWebSocket();
        getData();
        getwebsocket();

    })


// 连接mainWebSocket  服务
    function mainWebSocket(){
        if ('WebSocket' in window)
            mainSocket = new WebSocket(mainUrl);
        else if ('MozWebSocket' in window)
            mainSocket = new MozWebSocket(mainUrl);
        //打开连接时触发
        mainSocket.onopen = function() {
            console.log('OPEN: ' + mainSocket.protocol);
        };
        //收到消息时触发
        mainSocket.onmessage = function(message) {

            var string = message.data.split(":");
            var objMsg = string[0];
            var controlMsg = string[1];
            if(objMsg == "head"){
                if(controlMsg == "open"){
                    getwebsocket();
                }else if(controlMsg == "close"){
                    if(socket != '' && socket != undefined && socket != null){
                        socket.close();
                    }   
                }
                console.log("mainsocket收到消息了"+message);
            }else if(objMsg == "url"){
                window.location.href = controlMsg;
            }
        }; 
    }

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
            if(num>232){
                reutrn;
            }
	        if(num != "" && num != undefined && num != null){
	    		if(imgSrc != undefined && imgSrc != '' && imgSrc != null){
	    		    document.getElementById(num).src=imgSrc;// $("#"+num)[0].src = imgSrc;
	    		    document.getElementById(num).title=name;
	    		    smallAndBig(num);
                    signNumber +=1;
                    signNumberFun(signNumber);
	    		}
	    	}
      	};
	}
    //ajax 请求头像数据
    function getData(){
        $.ajax({
            url:ip+'api/user/reguserlist',//http://localhost:9999/
            type:'get',
            async:false,
            // data:{name:'yang',age:25},
            // timeout:5000,    //超时时间
            dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
            success:function(data){
                if(data != "" && data != null && data != undefined){  //200为正常返回
            	   insertImg(data);
                } 
            },
            error:function(){
             	console.log("没有从数据库中搜索到数据!");
            }
        })
    }
    // 插入微信头像  
    function insertImg(data_){
        var data = data_;
    	var i=0
        var _num = data.length;
        signNumber = _num;
        signNumberFun(signNumber);
        while(i<data.length){
            var imgSrc = data[i].avatar;
            var num = data[i].num;
            if(num>235){
                return;
            }
            var name = data[i].name; 
            if(num != "" && num != undefined && num != null){
                if(imgSrc != undefined && imgSrc != '' && imgSrc != null){
                    document.getElementById(num).src=imgSrc;// $("#"+num)[0].src = imgSrc;
                    document.getElementById(num).title=name;
                    smallAndBig(num);
                }else{
                    document.getElementById(num).src="../../img/gif.jpg";// $("#"+num)[0].src = imgSrc;
                    document.getElementById(num).title=name;
                    smallAndBig(num);
                }
            }
            i++;
        }
    }
    // 将头像放大和缩小 
    function smallAndBig(num){
    	setTimeout(function(){
    		$("#"+num).css({
                "animation":"bigPicture 3s 0s 1"
            })
    	},0);
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
    window.setInterval("AnimationFun()",50000);
    function AnimationFun(){
        var flag =Math.ceil(Math.random()*3);
    	if(flag==1){
    		// animationFunOne();
    	}else if(flag==2){
    		animationFunTwo();
    	}else if(flag==3){
            freePictureFun();
        }
        // animationFunTwo();
    }
    // 旋转字体
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
    		"-webkit-animation":"revolving 10s 0s 1",
    		"animation":"revolving 10s 0s 1",
    	});
    }
    // 单个放大图片(  ?单个图片放大会被其他头像覆盖)
    function animationFunTwo(){
        $(".newLineDiv").each(function(){
            $(this)[0].style.zIndex = 1;
        })
        var number = Math.ceil(Math.random()*230);
        var imgsrc = $("#"+number)[0].src;
        if(imgsrc != ip +"img/xiaowanzi.png"){ 
            $("#"+number).css({
                "z-index":"3",
                "animation":"animated_bigPic 10s 1"
            })
        }
    }
// 让图片自由移动的方法
    function freePictureFun(){
        var arr = ["wobble","bounceInDown","bounceOut","rubberBand","flip","zoomOutRight","hinge"];

        for(var i= 0 ;i<5;i++){
            var number = Math.ceil(Math.random()*230);
            var temp_num = Math.round(Math.random()*7);
            $("#"+number).css({
                "animation":""
            })

            var imgsrc = $("#"+number)[0].src;
            if(imgsrc != ip+ "img/xiaowanzi.png"){ 
                $("#"+number).css({
                    "animation":arr[temp_num]+" 12s 0s 1"
                })

            }
        }
    }

    function adjust(){
        // location.reload(false);
    }

    function signNumberFun(value){
        $("#signNumber").html(value);
    };
