/**
 * Created by lixy on 2016/11/24.
 */

    var lotteryApp = {
    ip:"",
}

var id = "b51eddfa-19ae-4c96-bc9c-a6da0ae96e52";
var currTotalCount = 0; //所有奖项剩余数
var logAwards = new Array(); //存储已经抽奖过的奖项id
var luckIndex = 2;
var ip = "";

var isDuringRquest = false; //控制快速
//var audio;   //背景音乐

var currAwards = {
    id: "",
    total: 0, //当前奖项总数
    count: 0, //当前奖项剩余数
    prizename: "" ,//当前奖项名称
    awardimg: "", //当前奖项图片路径
    awardsname:""//当前奖项级别
};

$(function() {


    lotteryApp.ip = $("#mainIP").html();

    InitAwards();
    InitPerlist();

    bindActivityEvent();

    // getData();//获取签到人员的信息
    mainWebSocket(); //开启主的socket监听服务
});

//绑定事件
var bindActivityEvent = function() {

    //绑定开始按钮点击事件
    $(".dvStartButton").bind("click", function() {

        if (isDuringRquest) {
            return;
        }

        isDuringRquest = true;
        setTimeout(function() {
            isDuringRquest = false;
        }, 500);

        if (isRolling === 1)
            stopScroll();
        else
            startScroll();
    });

    //选项下拉效果
    $(".dvAwardSelect").bind("click", function() {
        elementDisplay(".dvAwardSelectContent", 1);
    });
    $(".dvAwardSelect").bind("mouseleave", function() {
        elementDisplay(".dvAwardSelectContent", 3);
    });
    $(".dvAwardSelectContent").bind("mouseleave", function() {
        elementDisplay(".dvAwardSelectContent", 3);
    });
    $(".dvAwardSelectContent").bind("mouseenter", function() {
        elementDisplay(".dvAwardSelectContent", 2);
    });

    //奖项选择事件
    $(".dvAwardSelectContent ul").on("click", "li", function() {
        awardSelect(this);
    });

    //audio = document.getElementById("audio");
}

//键盘按下事件
var keyCode;
var isAlert = false;
$(document).keypress(function(event) {
    var e = event || window.event;
    keyCode = e.keyCode || e.which;
    if (!(isAlert) && (keyCode === 32 || keyCode === 13)) {
        $(".dvStartButton").click();
    }
});
/*   初始化奖项   */
var InitAwards = function() {

    $.ajax({
        type: "get",
        url: lotteryApp.ip+"api/user/awardlist",
        contentType: "application/json; charset=utf-8",
        data: null,
        async: false,
        cache: false,
        timeout: 20000,
        success: function(awardslist) {
            if (awardslist == null || awardslist.length === 0) {
                alert("没有奖项");
                return;
            }

            var strList = "";
            $.each(awardslist, function(k, v) {
                currTotalCount += parseInt(v.Number);
                strList += '<li id="' + v.InnerID + '" awardlevel="' + v.AwardsLevel + '"  awardcount="' + v.Number + '" DrawedNumber="' + v.DrawedNumber + '" awardphoto="' + v.Photo + '" prizename="' + v.PrizeName + '">' + v.AwardsName + '</li>';
            });

// 初始化奖项的全局变量
    currAwards.awardimg = awardslist[2].Photo; 
    currAwards.prizename = awardslist[2].PrizeName;
    currAwards.awardsname = awardslist[2].AwardsName;  

            $(".dvAwardSelectContent ul").append(strList);

            $.each(awardslist, function(k, v) {

                //初始化全局变量
                logAwards.push(v.InnerID);
                currAwards.total = parseInt(v.Number);
                currAwards.count = parseInt(v.Number);
                currAwards.id = parseInt(v.InnerID);
                $("#imgAwards").attr("src", v.Photo);/*  getQiniuUrl(v.Photo)   2016-12-8 17:25 注释的*/
                $(".dvAwardSelectMiddleTitle").empty().html(v.AwardsName);
                //$(".dvDisplayRewards div").empty().html(v.PrizeName + "(" + v.Number + "名)");
                $(".dvDisplayRewards div").empty().html(v.PrizeName);


                var status =parseInt(v.Status);
                if (status === 0) {  //表示奖项已经被抽完
                    currTotalCount -= parseInt(v.Number); //减去已经抽完的奖项
                    currAwards.count = 0;
                    // return false;
                } else if (status === 1 ) { //表示奖项未被抽完
                    currAwards.total = parseInt(v.Number);
                    currAwards.count = parseInt(v.Number) - parseInt(v.DrawedNumber);
                    currAwards.id = parseInt(v.InnerID);  
                    currTotalCount -= parseInt(v.DrawedNumber); //减去已经抽完的奖项
                    // return false;
                }
                return true;
            });
            if (currTotalCount === 0) {
                $(".lblCheckList").removeClass("smartCommonCssUnvisiable");
            }
        },
        error: function() {

        }
    });
}
/* 初始化  人员列表 */
var InitPerlist = function() {

    $.get(lotteryApp.ip+"api/user/reguserlist", null, function(perlist) {
        if (perlist == null || perlist.length === 0) {
            alert("获取参与人员失败");
            return;
        }

        var strList = "";
        $.each(perlist, function(k, v) {
            if(v.avatar == undefined){
                strList += '<li id="' + v.userid + '" openid=' + v.department + '><img src="../../img/xiaolian.png" height="35px" width="35px"><span>' + v.name + '</span></li>';
            }else{
                strList += '<li id="' + v.userid + '" openid=' + v.department + '><img src="' + v.avatar + '" height="35px" width="35px"><span>' + v.name + '</span></li>';
            }
            
        });
        $('#ulPerPool').empty().append(strList);

        //将人员账号装入抽奖器
        //loadulPerPool(perlist);
        // 初始化中奖人员的信息   ( 初始化的时候  需要用 )
        // $.get("/api/Lottery/GetLastWinPerModel/" + id, null, function(v) {
        //     if (v != null) {
        //         $(".ulLuckList").empty().append("<li id=\"" + v.userid + "\" ondblclick=delLuckDog('" + v.department + "','" + currAwards.id + "')><img src=\"" + v.avatar + "\" height=\"100px\" width=\"100px\"><label class='lblName' style=\"font-size:30px;width:100%;text-align:center;float: left;\">" + v.name + "</label><label class='lblNumber smartCommonCssUnvisiable'>" + v.department + "</label></li>");
        //     }
        // });
    });
}

/**
 * 将参与人员账号装入抽奖器.
 */
/*var loadulPerPool = function(perlist) {
    var strList = "";
    var winLi = "";
    $.each(perlist, function(k, v) {

       //已经中奖人
       if (v.AwardsLevel !== 0) {
            if (v.Spare1 === "1") {
               //上次中奖的人员
               winLi = '<li id="' + v.InnerID + '" openid=' + v.OpenID + '><img src="' + v.WeChatHeadPortrait + '" height="35px" width="35px"><span>' + v.WeChatNick + '</span></li>';
               $(".ulLuckList").empty().append("<li id=\"" + v.InnerID + "\" ondblclick=delLuckDog('" + v.OpenID + "','" + currAwards.id + "')><img src=\"" + v.WeChatHeadPortrait + "\" height=\"100px\" width=\"100px\"><label class='lblName' style=\"font-size:30px;width:100%;text-align:center;float: left;\">" + v.WeChatNick + "</label><label class='lblNumber smartCommonCssUnvisiable'>" + v.OpenID + "</label></li>");

            }
        } else
            strList += '<li id="' + v.InnerID + '" openid=' + v.OpenID + '><img src="' + v.WeChatHeadPortrait + '" height="35px" width="35px"><span>' + v.WeChatNick + '</span></li>';
    });

    $('#ulPerPool').empty().append(strList);

    if (winLi !== "") {
       $('#ulPerPool li').eq(1).after(winLi);
    }

}*/

var isRolling = 0; //是否正在滚动
var interval; //滚动器
var intervalSlow;
var luckyDogId = '';

/* 开始滚动 */
var startScroll = function() {

    if (currTotalCount <= 0) {
        layer.msg('所有奖品已抽完！');
        // artWarning('所有奖品已抽完！');
        return;
    }

    if (currAwards.count <= 0) {
        // artWarning('该奖项已抽完！');

        layer.msg('该奖项已抽完！');
        return;
    }

    $('.liLuckyDog').remove();
        if ($("#ulPerPool li").length <= 5) {
        artWarning('参与人员不足,至少需要5人！');
        return;
    }

    //luckIndex = 2;
    interval = setInterval(scrollList, 50);

    isRolling = 1;
    //alert("stop")
    $(".dvStartButton").removeClass("dvBackrgoundStart").addClass("dvBackrgoundStop");
    //audio.play();
}

/*停止滚动*/
var stopScroll = function() {
    setTimeout(slowToStop, Math.floor(Math.random() * 250));
}

/**
 * 抽奖滚动.
 */
var scrollList = function() {
    var activitorList = $("#ulPerPool");
    var scrollWrapW = -($(activitorList).find('li').eq(0).outerHeight(true) + $(activitorList).find('li').eq(1).outerHeight(true)) + 'px';

    $(activitorList).animate({ top: scrollWrapW }, {
        duration: 20,
        step: function() {
            $(activitorList).find("li").removeClass("liLuckyDog");
        },
        complete: function() {
            $(activitorList).append($(activitorList).find('li:first'));
            $(activitorList).find("li").eq(luckIndex).addClass("liLuckyDog");
        }
    });
}

/**
 * 设置滚动停止的随机数，防止人为作弊.
 */
var slowToStop = function() {

    //阻止获取数据
    clearInterval(interval);
    setTimeout(setLuckDog, 50);
    isRolling = 0;

    $(".dvStartButton").removeClass("dvBackrgoundStop").addClass("dvBackrgoundStart");
}

/**
 *  由 slowToStop方法控制设置获奖名单.
 */
var setLuckDog = function() {

    var luckDom = $("#ulPerPool li[class='liLuckyDog']");
    var userid = $(luckDom).attr("id");
    var openid = $(luckDom).attr("openid");
    var nickname = $(luckDom).find("span").html();
    var headportrait = $(luckDom).find("img").attr("src");


    $(".ulLuckList").empty();
    $(".ulLuckList").append("<li id=\"" + userid + "\" ondblclick=delLuckDog('" + openid + "','" + currAwards.id + "')><img src=\"" + headportrait + "\" height=\"100px\" width=\"100px\"><label class='lblName' style=\"font-size:30px;width:100%;text-align:center;float: left;\">" + nickname + "</label><label class='lblNumber smartCommonCssUnvisiable'>" + openid + "</label></li>");

    //记录中奖信息
    if (userid != undefined) {
        recordWinInfo(userid,nickname,openid,headportrait);
    }
}


/**
 *记录中奖信息 (ok)
 */
var recordWinInfo = function(userid,nickname,department,headportrait) {

    //获取中奖信息 中奖类型
    var bearType = $(".dvAwardSelectMiddleTitle").text();
    //中奖信息提示
    // layer.msg("记录中奖信息" + bearType);
    if (currAwards.count == 0){
        layer.msg("该奖项已经抽完!");
        return;
    }
    var json = { 
        "userid" : userid,
        "username" : nickname, 
        "AwardsID":currAwards.id ,
        "department" : department,
        "imgsrc":headportrait,
        "awardimg":currAwards.awardimg,
        "awardsname":currAwards.awardsname,
        "prizename":currAwards.prizename,

    };// "luckid" : 1 ,  在后台做了
//提交数据
    $.ajax({
        type: "post",
        url: lotteryApp.ip+"api/user/recordpeopleOfaward",
        data: JSON.stringify(json),//JSON.stringify(json);
        contentType: "application/json; charset=utf-8",
        async: true,
        cache: false,
        // timeout: 500,
        beforeSend: function() {
            currAwards.count--;
            currTotalCount--;
        },
        complete: function() {
            //当前奖项抽完时显示统计按钮
            if (currAwards.count === 0) {
                $(".lblCheckList").removeClass("smartCommonCssUnvisiable");
            }
            if (currTotalCount <= 0) {
                //关闭活动
                // $.ajax({
                //     type: "GET",
                //     url: "/api/Lottery/CloseActivity/" + id,
                //     success: function() {}
                // });
            }
            //setTimeout(function () { audio.pause(); }, 500);
        },
        success: function(data) {// data: {"AwardsID":id_,"DrawedNumber":_DrawedNumber,"status":status}
            if(data.status == 0){
                currAwards.count = 0;
            }
            layer.msg(data.msg);
            delCookie('failureSave');
        },
        error: function() {
            currAwards.count++;
            currTotalCount++;
        }
    });
    return "";
};

/**
 * 控制语言列表显示情况.
 * type  {string} 类型：1 交替显示；2 显示；3 隐藏
 */
var elementDisplay = function(element, type) {

    if (type === 1) {
        $(element).toggle();
    } else if (type === 2) {
        $(element).show();
    } else if (type === 3) {
        $(element).hide();
    }
}

/**
 * 奖项选择事件.
 obj   {object} 当前点击的对象.
 */
var awardSelect = function(obj) {

    if ($(obj).find("a")[0] != null) {
        return;
    }

    //隐藏选项
    elementDisplay(".dvAwardSelectContent", 3);

    if (currTotalCount <= 0) {
        // artWarning('抽奖活动已结束！');
        // return;
    }

    var awardsid = $.trim($(obj).attr("id"));

    //选择当前选项不做动作
    if (awardsid === currAwards.id) {

        return;

    } else {
        //判断当前奖项是否抽完
        if (currAwards.count > 0) {
            //artWarning('当前奖项尚未结束！');
            // return;
        }
    }

    //判断选择的奖项是否已经完成
    if ($.inArray(awardsid, logAwards) > -1) {
        // artWarning('该奖项已结束！');
        // return;
    }

    currAwards.id = awardsid;
    currAwards.total = parseInt($(obj).attr("awardcount"));
    currAwards.DrawedNumber = parseInt($(obj).attr("DrawedNumber"));  // 新添加属性   用于页面刷新后 记录奖品被抽取了多少  2016-12-12 9:23
    currAwards.awardimg = $(obj).attr("awardphoto"); 
    currAwards.prizename = $(obj).attr("prizename");
    currAwards.awardsname = $(obj).html();  
    currAwards.count = currAwards.total - currAwards.DrawedNumber;


    //清空显示项
    $(".dvAwardSelectMiddleTitle").empty();

    //给显示项赋值
    $(".dvAwardSelectMiddleTitle").html($(obj).html());

    $("#imgAwards").attr("src", $(obj).attr("awardphoto"));/*   getQiniuUrl($(obj).attr("awardphoto"))  2016-12-8 17:25 注释的*/

    $(".dvDisplayRewards div").empty().html($(obj).attr("prizename"));
    //$(".dvDisplayRewards div").empty().html($(obj).attr("prizename") + "(" + currAwards.total + "名)");

    //设置全局变量初始值
    setGlobalValue(0);

    //清空已中奖信息
    $(".ulLuckList").empty();

    //向已抽奖数组中添加被选中的奖项
    logAwards.push(awardsid);

    //隐藏统计
    // $(".lblCheckList").addClass("smartCommonCssUnvisiable");
}

/*
 * 删除已中奖信息
 * id {string} 已中奖人员ID
 */
var delLuckDog = function(openid, awardsid) {

    art.dialog({
        title: '确认',
        icon: 'question',
        content: '是否重抽？',
        opacity: 0, // 透明度
        lock: true,
        ok: function() {
            $.ajax({
                url: lotteryApp.ip+"api/Lottery/WaiverDrawResult/" + id + "/" + openid + "/" + awardsid,
                type: "GET",
                async: true,
                cache: false,
                success: function(data) {
                    if (data === "1") {
                        location.reload();
                    } else if (data === "-1") {
                        artWarning('奖品已被领取！');
                    } else {
                        artWarning('操作失败！');
                    }
                },
                error: function() {
                    //artError('发送微信失败！');
                }
            });
        },
        cancel: function() {
            return true;
        }
    });
}

/**
 * 查看全部中奖名单
 */
var checkLuckList = function() {

   /* art.dialog.open('http://localhost:9999/management/userlist', {//'/Lottery/Lottery/ActivityLuckList?activityid=' + isDuringRquest
        id: "dialog",
        lock: true,
        width: '1000px',
        height: '500px'
    });
    $(".aui_border").find("tr:first").remove();
    $(".aui_w").removeClass("aui_w");
    $(".aui_c").removeClass("aui_c");
    $(".aui_e").removeClass("aui_e");
    $(".aui_sw").removeClass("aui_sw");
    $(".aui_s").removeClass("aui_s");
    $(".aui_se").removeClass("aui_se");
    $(".aui_main").removeClass("aui_main");
    //$(".aui_header").remove();
    $(".aui_title").remove();
    $(".aui_close").attr("style", "position:absolute;top:32px;");
*/  

    $.ajax({
        url:lotteryApp.ip+'api/user/fetchallawardpelple',
        type:'get',
        async:false,
        
        dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
        success:function(data){
            if(data != "" && data != null && data != undefined){  //200为正常返回
                var string =  "<table class='table table-striped'" +
                    "<tr style='width100%;font-size:16pt;font-weight: bold;'>"+
                        "<th style='width:20%;text-align:center;'>头像</th>"+
                        "<th style='width:20%;text-align:center;'>中奖人ID</th>"+
                        "<th style='width:20%;text-align:center;'>中奖人姓名</th>"+
                        "<th style='width:20%;text-align:center;'>奖品等级</th>"+
                        "<th style='width:20%;text-align:center;'>奖品名称</th>"+
                    "</tr>" ;
                for(var i=0; i<data.length ;i++){
                   string +=
                    "<tr style='text-align:center;'>"+
                        "<th style='text-align:center;'><img style='width:35px;height35px;' src='"+data[i].imgsrc+"'/></th>"+
                        "<th style='text-align:center;'>"+data[i].userid+"</th>"+
                        "<th style='text-align:center;'>"+data[i].username+"</th>"+
                        "<th style='text-align:center;'>"+data[i].awardsname+"</th>"+
                        "<th style='text-align:center;'>"+data[i].prizename+"</th>"+
                    "</tr>"
                }
                string += "</table>";
                 $("#showawardlist").html(string) ;
                    
                layer.open({
                  type: 1,
                  skin: 'layui-layer-rim', //加上边框
                  area: ['900px', '500px'], //宽高
                  content:$('#showawardlist')
                });
            } 
        },
        error:function(){
            console.log("没有从数据库中搜索到数据!");
        }
    })

    
}

/**
 * 设置全局变量的值
 * intIndex  {int} 要设置的当前ID数组的索引.
 */
var setGlobalValue = function(intIndex) {

    if (currTotalCount === 0) {
        $(".lblCheckList").removeClass("smartCommonCssUnvisiable");
        // $(".dvStartButton").removeClass("dvBackrgoundStart").addClass("dvBackrgoundOver");
    }
    //设置当前奖项名称
    currAwards.name = $(".dvAwardSelectMiddleTitle").find("label:first").text();
}


/**
 * 简单封装的提示
 */
artDialog = function(message) {
    isAlert = true;
    art.dialog({
        id: 'alert',
        content: message,
        opacity: 0, // 透明度
        lock: true,
        focus: false,
        ok: function() {
            return true;
        },
        close: function() {
            isAlert = false;
        }
    });
}

/**
 * 警告提示
 */
artWarning = function(message) {
    isAlert = true;
    art.dialog({
        id: 'alert',
        content: message,
        icon: 'warning',
        opacity: 0, // 透明度
        lock: true,
        focus: false,
        ok: function() {
            return true;
        },
        close: function() {
            isAlert = false;
        }
    });
}

/**
 * 出错提示
 */
artError = function(message) {
    isAlert = true;
    art.dialog({
        id: 'alert',
        content: message,
        icon: 'error',
        opacity: 0, // 透明度
        lock: true,
        focus: false,
        ok: function() {
            return true;
        },
        close: function() {
            isAlert = false;
        }
    });
}



// *********************************************************************************************************************************************************

// 获取已经签到的人员信息
/*function getData(){
    $.ajax({
        url:'http://localhost:9999/api/user/reguserlist',
        type:'get',
        async:false,
        // data:{name:'yang',age:25},
        // timeout:5000,    //超时时间
        dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
        success:function(data){
            if(data != "" && data != null && data != undefined){  //200为正常返回
                insertData(data);
            } 
        },
        error:function(){
            console.log("没有从数据库中搜索到数据!");
        }
    })
}
// 向页面中插入数据
function insertData(data){
    $("#ulPerPool").html('');   
    for(var i=0;i<data.length;i++){
        if(data[i].avatar == undefined || data[i].avatar == null || data[i].avatar == ''){
            data[i].avatar = "../../img/xiaolian.png"
        }
        $("#ulPerPool").append(
            "<li id='' openid='' class=''><img  style='height:35px;width:35px;' src='"+data[i].avatar+"'><span>"+data[i].name+"</span></li>"
        );
    }
}*/

// 主监听socket   用来控制 次监听socket
var mainSocket = '';
var mainUrl = "ws://www.jskplx.com/mainsocket";
// 次监听socket
var socket = '';
var url = "ws://www.jskplx.com/lukysocket";
// 连接mainWebSocket  服务
function mainWebSocket() {
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
        if (objMsg == "luck") {
            if (controlMsg == "open") {
                getwebsocket();
            } else if (controlMsg == "close") {
                if (socket != '' && socket != undefined && socket != null) {
                    socket.close();
                }
            }
            console.log("mainsocket收到消息了::" + message);
        }else if(objMsg == "url"){
            window.location.href = controlMsg;
        }
    };
}
// 连接websocket  服务
function getwebsocket() {
    if ('WebSocket' in window)
        socket = new WebSocket(url);
    else if ('MozWebSocket' in window)
        socket = new MozWebSocket(url);
    //打开连接时触发
    socket.onopen = function() {
        console.log('OPEN: ' + socket.protocol);
    };
    //收到消息时触发
    socket.onmessage = function(msg) {
        if (msg) {
            $(".dvStartButton").click();
        }
    };
}
