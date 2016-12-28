var connectIP = $("#mainIP").html();
var ip =connectIP.split("|")[0];
var socketUrl=connectIP.split("|")[1];

// 主监听socket   用来控制 次监听socket
var mainSocket='';
var mainUrl= socketUrl +'mainsocket';
// 次监听socket
var socket = '';
var url = socketUrl+'msgClick';
var flag = 0;
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
        
    };
}

function clickFun(){
    $("#btnclsid").css({
        "animation": "none"
    })
    $("#btnclsid").css({
        "animation": "gelatine 0s 1"
    })
    setTimeout(sendMassage(),1000);
    
}
function sendMassage(){
    $.ajax({
        url:ip+'management/clicktostartlucky',//http://localhost:9999/       ?click:"click:1"
        type:'post',
        async:false,
        data:{"click":"click:1"},
        success:function(data){
            $("#btnclsid").css({
                "animation": "none"
            })
            $("#btnclsid").css({
                "animation": "pulse 1s infinite alternate"
            })
            if(flag ==0){
                $("#btnclsid")[0].src = "../../img/sj-stop.png";
                flag = 1;
            }else if(flag ==1){
                $("#btnclsid")[0].src = "../../img/sj-star.png";
                flag = 0;
            }
            
            layer.msg("消息发送成功");
        },
        error:function(){
          layer.msg("消息发送失败");
        }
    })
}


