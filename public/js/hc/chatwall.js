    var connectIP = $("#mainIP").html();
    var ip =connectIP.split("|")[0];
    var socketUrl=connectIP.split("|")[1];

    // 主监听socket   用来控制 次监听socket
    var mainSocket='';
    var mainUrl= socketUrl +'mainsocket';
    // 次监听socket
    var socket = '';
    var url = socketUrl+'wxmsg';

    var flag=1;
    var temp = 0;
    var msgNumber=0;

    var msgArr = [];//临时记录发送过来的消息

    $(function() {
        mainWebSocket();
        getwebsocket();

        getmessages();//初始化获取  发送的消息数量

        getsavedawardOfChat();
    })
    
    //定时更新当前数据
    $(function() {
        setInterval(function(){
            getmessages();
            getsavedawardOfChat();
        },25000);
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
            console.log("mainsocket收到消息了"+message);
            var string = message.data.split(":");
            var objMsg = string[0];
            var controlMsg = string[1];
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
        socket.onmessage = function(data) {
            var data = JSON.parse(data.data);
            if(parseInt(data.flag) == 0){
                // msgArr.push(data);
                showmessage(data);
                
                var num = $("#messageCount").html();   
                $("#messageCount").html((parseInt(num)+1));
            }else{
                console.log(data);
                showAwardOfChat(data);
            }
        };
    }

    /*
     * 创建一个定时器  定时的读取存放消息的临时数组
     */
     // $(function() {
     //       setInterval(function(){
     //        if(msgArr.length <= 30){
     //            showMessageFun(msgArr);
     //        }
     //        // 如果数组的长度大于规定长度 截取数组的后三十未数据
     //        else{
     //            var newarr = msgArr.slice(-30,-1);
     //            showMessageFun(newarr); 
     //         }
     //       },1000);
     //    })
    // window.setInterval(readMsgArr(),1500);不同的浏览器,可能会出现问题

    /*
     *展示消息的方法(预处理)
     */
    // function showMessageFun(data){
    //     for(var i=0;i<data.length;i++){
    //         var time = Math.ceil(Math.random()*800);
    //         setTimeout(showmessage(data.pop()),time);
    //     }
    // }
    /*
     * 展示消息的方法
     */
    function showmessage(data){
        var imgSrc = data.avatar;
        if(imgSrc != undefined && imgSrc != '' && imgSrc != null){
            insertMessage(data);
        }else{
            data.avatar = "../../img/xiaolian.png";
            insertMessage(data);
        }
    }
    /*
     * 展示中奖人员的方法的方法
     */
    function showAwardOfChat(data){
        var chatid = "#chataward" + data.chataward;
        $(chatid)[0].src = data.avatar;
        $(chatid)[0].title = data.name;
        // $(".noCssStyle").each(function(){ 
        //     if($(this)[0].src == ''){
        //         $(this)[0].src = data.avatar;
        //         $(this)[0].title = data.name;
        //         return false;//用于跳出each循环
        //     }
        // })
    }

    /*
     * 获取 中奖人员的方法的方法
     */
    function getsavedawardOfChat(){
        $.ajax({
            url:ip+'chatwall/chat/chatRecordAward',
            type:'get',
            async:true,
            //dataType:'json', 
            success:function(data){
                //var reply = data.data;
                //var _length = reply.length;
                $.each(data.data,(index, item)=>{
                    var chatid = "#chataward"+item.chataward;
                    $(chatid)[0].src = item.avatar;
                    $(chatid)[0].title = item.name;
                });
                //for( var i=0;i<_length; i++){
                //    console.log(i);
                    //var chatid = "#chataward"+reply[i].chataward;
                //    console.log(chatid);
                //    console.log(reply[i].chataward);
                    //$(chatid)[0].src = reply[i].avatar;
                    //$(chatid)[0].title = reply[i].name;
                    //$(".noCssStyle:eq("+i+")")[0].src = reply[i].avatar;
                    //$(".noCssStyle:eq("+i+")")[0].title = reply[i].name;
                //}
            },
            error:function(){
                console.log("未获取到数据!");
            }
        })
    }
    
    /*
     * 插入消息
     */
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

    /*
     * 接受到纯文字
     */
    function appendText(position,message,messageLength,data,id){
        var speed = Math.ceil(Math.random()*60 +10);//移动的速度
        $("#rootwall").append(
            "<marquee scrollamount="+speed+" direction=left style='position:fixed;z-index:999;' vspace='"+position+"px;' loop='1'>" +
                "<div id='"+id+"' class='' style='width:"+(messageLength)+"px;'>" +/*background:url(../../img/111.jpg) no-repeat;background-size:cover;*/
                    "<img src='"+data.avatar+"' style='height: 40px;width: 40px;float: left;'>" +
                    "<div style='line-height: 40px;vertical-align: middle;height: 40px;color: white;max-width:380px;font-size: 17pt;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;'>&nbsp;"+message+"</div>" +
                "</div>" +
            "</marquee>"
        );
    }
  
    /*
     * 接受到图片
     */  
    function appendImage(position,image,data,id){
        var speed = Math.ceil(Math.random()*60 +10);//移动的速度
        $("#rootwall").append(
            "<marquee scrollamount="+speed+" direction=left  style='position:fixed;z-index:999;' vspace='"+position+"px;' loop='1'>" +
                "<div id='"+id+"' style='width: 280px;'>"+
                    "<div class='' style=''>" +
                        "<img src='"+data.avatar+"' style='height: 40px;width:40px;float:left;'>" +
                    "</div>" +
                    "<img src='"+image+"' style='max-width: 280px;max-height:280px;'>" +
                "</div>"+
            "</marquee>"
        );
    }
    /*
     * 获取随机数(确定弹出位置)
     */
    function getRandom(){
        while(1){
            var num = Math.ceil(Math.random()*30);//生成 0 - 20 的随机数
            if(Math.abs(temp-num)>=2){
                temp = num;
                return num
            }
        }
    }
    /*
     * 产生随机长度的字符串
     */ 
    function generateMixed() {
         var res = "";
         var length =  Math.ceil(Math.random()*30);
         for(var i = 0; i < length ; i ++) {
             var id = Math.ceil(Math.random()*35);
             res += chars[id];
         }
         return res;
    }

    /*
     * 初始化获取消息的数量的方法
     */
    function getmessages(){
        $.ajax({
            url:ip+'chatwall/chat/chatmessage',//http://localhost:9999/
            type:'get',
            async:false,
            dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
            success:function(data){
                msgNumber = data.len;
                $("#messageCount").html(msgNumber);
            },
            error:function(){
                console.log("没有从数据库中搜索到数据!");
            }
        })
    }