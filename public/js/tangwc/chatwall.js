    // 主监听socket   用来控制 次监听socket
    var mainSocket='';
    var mainUrl="ws://www.jskplx.com/mainsocket";

// 次监听socket
    var socket = '';
    var url = "ws://www.jskplx.com/wxmsg";
    var flag=1;
    var temp = 0;
     // var chars = ['0','1','2','3','4','5','6','7','8','9','啊','哦','额','一','五','与','波','破','莫','分','的','特','了','内','个','可','和','一','五','与','字','次','是','值','吃','是'];
   
    $(function() {
        mainWebSocket();
        getwebsocket();

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
            }
        };
    }
    // window.setInterval("insertMessage()",3000);
    function insertMessage(data){

        var position = getRandom()*20;
        var message = data.text;
        var image = data.image;
        if(message != undefined && message != null && message != ''){
            var messageLength = (message.length)*25;
            messageLength = messageLength > 300 ? messageLength:300;
            appendText(position,message,messageLength,data);
        }else if(image != undefined && image != null && image != ''){
            appendImage(position,image,data);
        }
    }
    // 接受到纯文字
    function appendText(position,message,messageLength,data){
        $("#rootwall").append(
            "<marquee direction=left  style='position:fixed;z-index:999;' vspace='"+position+"px;' loop='1'>" +
                "<div class='' style='background:url(../../img/111.jpg) no-repeat;background-size:cover;width:"+(messageLength)+"px;'>" +
                    "<img src='"+data.avatar+"' style='height: 100px;width: 100px;float: left;'>" +
                    "<div style='height: 80px;width: "+messageLength+"px;padding-top: 20px;font-size: 17pt;'>"+message+"</div>" +
                "</div>" +
            "</marquee>"
        );
    }
    // 接受到图片
    function appendImage(position,image,data){
        $("#rootwall").append(
            "<marquee direction=left  style='position:fixed;z-index:999;' vspace='"+position+"px;' loop='1'>" +
                "<div style='width: 380px;'>"+
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