    // 主监听socket   用来控制 次监听socket
    var mainSocket='';
    var mainUrl="ws://www.jskplx.com/mainsocket";

// 次监听socket
    var socket = '';
    var url = "ws://www.jskplx.com/wxmsg";
    var flag=1;
    var temp = 0;
     // var chars = ['0','1','2','3','4','5','6','7','8','9','啊','哦','额','一','五','与','波','破','莫','分','的','特','了','内','个','可','和','一','五','与','字','次','是','值','吃','是'];
   
    var msgNumber=0;

    $(function() {
        mainWebSocket();
        getwebsocket();

        getmessages();//初始化获取  发送的消息数量



        getsavedawardOfChat();
    })

// 连接mainWebSocket  服务
    function mainWebSocket(){
        if ('WebSocket' in window)
            mainSocket = new WebSocket(url);
        else if ('MozWebSocket' in window)
            mainSocket = new MozWebSocket(url);
        //打开连接时触发
        mainSocket.onopen = function() {
            console.log('OPEN: ' + mainSocket.protocol);
        };
        //收到消息时触发
        mainSocket.onmessage = function(message) {
            console.log("mainsocket收到消息了"+message);
            var string = message.split(":");
            var objMsg = string[0];
            var controlMsg = string[0];
            if(objMsg == "chat"){
                if(controlMsg == "open"){
                    getwebsocket();
                }else if(controlMsg == "close"){
                    if(socket != '' && socket != undefined && socket != null){
                        socket.close();
                    }
                }
                console.log("mainsocket处理完消息了"+message);
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


            if(imgSrc != undefined && imgSrc != '' && imgSrc != null){
                insertMessage(data);
            }else{
                data.avatar = "../../img/xiaolian.png"
                insertMessage(data);
            }
            var num = $("#messageCount").html();   
            $("#messageCount").html((parseInt(num)+1));

            msgNumber = parseInt(num)+1;
            if(msgNumber==8||msgNumber==88||msgNumber==188){    //  消息达到多少条  对用发奖品+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                saveawardOfChat(data); 
            }
        };
    }
    function saveawardOfChat(data){
        $.ajax({
            url:'http://localhost:9999/chatwall/chat/recordChatAwardPeople',
            type:'post',
            async:false,
            data:data,
            dataType:'json', 
            success:function(reply){//存取成功后 返回 "1"

                $("#"+data.userid).css({  //可以定位到  中奖消息的id 

                })
                $(".chatAwardImgStyle").each(function(){
                    
                    if($(this)[0].src == ''){
                        $(this)[0].src = data.avatar;
                        $(this)[0].title = data.name;
                        return false;//用于跳出each循环
                    }

                })
            },
            error:function(){
                var num = $("#messageCount").html();   
                $("#messageCount").html((parseInt(num)-1));
            }
        })
    }
    function getsavedawardOfChat(){
        $.ajax({
            url:'http://localhost:9999/chatwall/chat/chatRecordAward',
            type:'get',
            async:false,
            dataType:'json', 
            success:function(reply){//存取成功后 返回 "1"
                var _length = reply.length;
                for( var i=0;i<_length;i++){
                    $(".chatAwardImgStyle:eq("+i+")")[0].src = reply[i].avatar;
                    $(".chatAwardImgStyle:eq("+i+")")[0].title = reply[i].name;
                }

                /*$(".chatAwardImgStyle").each(function(index){
                    if($(this)[0].src == ''){
                        $(this)[0].src = reply[index].avatar;
                        $(this)[0].title = reply[index].name;
                    }
                })*/
            },
            error:function(){
                console.log("未获取到数据!");
            }
        })
    }

    // window.setInterval("insertMessage()",3000);
    function insertMessage(data){

        var position = getRandom()*20;
        var message = data.text;
        var image = data.image;
        var id = data.userid;
        if(message != undefined && message != null && message != ''){
            var messageLength = (message.length)*25;
            messageLength = messageLength > 300 ? messageLength:300;
            appendText(position,message,messageLength,data,id);
        }else if(image != undefined && image != null && image != ''){
            appendImage(position,image,data,id);
        }
    }
    // 接受到纯文字
    function appendText(position,message,messageLength,data,id){
        $("#rootwall").append(
            "<marquee direction=left  style='position:fixed;z-index:999;' vspace='"+position+"px;' loop='1'>" +
                "<div id='"+id+"' class='' style='background:url(../../img/111.jpg) no-repeat;background-size:cover;width:"+(messageLength)+"px;'>" +
                    "<img src='"+data.avatar+"' style='height: 100px;width: 100px;float: left;'>" +
                    "<div style='height: 80px;width: "+messageLength+"px;padding-top: 20px;font-size: 17pt;'>"+message+"</div>" +
                "</div>" +
            "</marquee>"
        );
    }
    // 接受到图片
    function appendImage(position,image,data,id){
        $("#rootwall").append(
            "<marquee direction=left  style='position:fixed;z-index:999;' vspace='"+position+"px;' loop='1'>" +
                "<div id='"+id+"' style='width: 380px;'>"+
                    "<div class='' style=''>" +
                        "<img src='"+data.avatar+"' style='height: 80px;width:80px;float:left;'>" +
                    "</div>" +
                    "<img src='"+image+"' style='max-width: 300px;max-height:300px;'>" +
                "</div>"+
            "</marquee>"
        );
    }

    // 获取随机数(确定弹出位置)
    function getRandom(){
        while(1){
            var num = Math.ceil(Math.random()*30);//生成 0 - 20 的随机数
            if(Math.abs(temp-num)>=2){
                temp = num;
                return num
            }
        }
    }
    // 产生随机长度的字符串
    function generateMixed() {
         var res = "";
         var length =  Math.ceil(Math.random()*30);
         for(var i = 0; i < length ; i ++) {
             var id = Math.ceil(Math.random()*35);
             res += chars[id];
         }
         return res;
    }


    // 初始化获取消息的数量的方法
    function getmessages(){
        $.ajax({
            url:'http://localhost:9999/chatwall/chat/chatmessage',
            type:'get',
            async:false,
            dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
            success:function(reply){
                msgNumber = reply.length;
                $("#messageCount").html(reply.length);
            },
            error:function(){
                console.log("没有从数据库中搜索到数据!");
            }
        })
    }