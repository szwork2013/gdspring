/**
 * Created by lixy on 2016/11/24.
 */

var id = "b51eddfa-19ae-4c96-bc9c-a6da0ae96e52";
var currTotalCount = 0; //所有奖项剩余数
var logAwards = new Array();  //存储已经抽奖过的奖项id
var luckIndex = 2;

var isDuringRquest = false;   //控制快速
//var audio;   //背景音乐

var currAwards = {
    id: "",
    total: 0,  //当前奖项总数
    count: 0,  //当前奖项剩余数
    name: ""   //当前奖项名称
};

$(function () {
    InitAwards();
    InitPerlist();

    bindActivityEvent();
});

//绑定事件
var bindActivityEvent = function () {

    //绑定开始按钮点击事件
    $(".dvStartButton").bind("click", function () {

        if (isDuringRquest) {
            return;
        }

        isDuringRquest = true;
        setTimeout(function () {
            isDuringRquest = false;
        }, 500);

        if (isRolling === 1)
            stopScroll();
        else
            startScroll();
    });

    //选项下拉效果
    $(".dvAwardSelect").bind("click", function () {
        elementDisplay(".dvAwardSelectContent", 1);
    });
    $(".dvAwardSelect").bind("mouseleave", function () {
        elementDisplay(".dvAwardSelectContent", 3);
    });
    $(".dvAwardSelectContent").bind("mouseleave", function () {
        elementDisplay(".dvAwardSelectContent", 3);
    });
    $(".dvAwardSelectContent").bind("mouseenter", function () {
        elementDisplay(".dvAwardSelectContent", 2);
    });

    //奖项选择事件
    $(".dvAwardSelectContent ul").on("click", "li", function () {
        awardSelect(this);
    });

    //audio = document.getElementById("audio");
}

//键盘按下事件
var keyCode;
var isAlert = false;
$(document).keypress(function (event) {
    var e = event || window.event;
    keyCode = e.keyCode || e.which;
    if (!(isAlert) && (keyCode === 32 || keyCode === 13)) {
        $(".dvStartButton").click();
    }
});

var InitAwards = function () {

    /* $.ajax({
     type: "get",
     url: "/api/Lottery/GetAwardsListEx/" + id,
     contentType: "application/json; charset=utf-8",
     data: null,
     async: false,
     cache: false,
     timeout: 20000,
     success: function (awardslist) {

     if (awardslist == null || awardslist.length === 0) {
     alert("没有奖项");
     return;
     }

     var strList = "";
     $.each(awardslist, function (k, v) {
     currTotalCount += v.Number;
     strList += '<li id="' + v.InnerID + '" awardlevel="' + v.AwardsLevel + '"  awardcount="' + v.Number + '" awardphoto="' + v.Photo + '" prizename="' + v.PrizeName + '">' + v.AwardsName + '</li>';
     });

     $(".dvAwardSelectContent ul").append(strList);

     $.each(awardslist, function (k, v) {

     //初始化全局变量
     logAwards.push(v.InnerID);
     currAwards.total = v.Number;
     currAwards.count = v.Number;
     currAwards.id = v.InnerID;

     $("#imgAwards").attr("src", getQiniuUrl(v.Photo));
     $(".dvAwardSelectMiddleTitle").empty().html(v.AwardsName);
     //$(".dvDisplayRewards div").empty().html(v.PrizeName + "(" + v.Number + "名)");
     $(".dvDisplayRewards div").empty().html(v.PrizeName);

     if (v.Status === 2) {

     currTotalCount -= v.Number;  //减去已经抽完的奖项
     }
     else if (v.Status === 0 || v.Status === 1) {

     currAwards.total = v.Number;
     currAwards.count = v.Number - v.DrawedNumber;
     currAwards.id = v.InnerID;

     currTotalCount -= v.DrawedNumber;   //减去已经抽完的奖项
     return false;
     }
     return true;
     });

     if (currTotalCount === 0) {
     $(".lblCheckList").removeClass("smartCommonCssUnvisiable");
     }
     },
     error: function () {

     }
     });*/
}

var InitPerlist = function () {

    /* $.get("/api/Lottery/GetNoWinPerList/" + id, null, function (perlist) {
     if (perlist == null || perlist.length === 0) {
     alert("获取参与人员失败");
     return;
     }

     var strList = "";
     $.each(perlist, function (k, v) {
     strList += '<li id="' + v.InnerID + '" openid=' + v.OpenID + '><img src="' + v.WeChatHeadPortrait + '" height="35px" width="35px"><span>' + v.WeChatNick + '</span></li>';
     });

     $('#ulPerPool').empty().append(strList);

     //将人员账号装入抽奖器
     //loadulPerPool(perlist);

     $.get("/api/Lottery/GetLastWinPerModel/" + id, null, function (v) {
     if (v != null) {
     $(".ulLuckList").empty().append("<li id=\"" + v.InnerID + "\" ondblclick=delLuckDog('" + v.OpenID + "','" + currAwards.id + "')><img src=\"" + v.WeChatHeadPortrait + "\" height=\"100px\" width=\"100px\"><label class='lblName' style=\"font-size:30px;width:100%;text-align:center;float: left;\">" + v.WeChatNick + "</label><label class='lblNumber smartCommonCssUnvisiable'>" + v.OpenID + "</label></li>");
     }
     });
     });*/
}

/**
 * 将参与人员账号装入抽奖器.
 */
var loadulPerPool = function (perlist) {
    //var strList = "";
    //var winLi = "";
    //$.each(perlist, function(k, v) {

    //    //已经中奖人
    //    if (v.AwardsLevel !== 0) {
    //        if (v.Spare1 === "1") {
    //            //上次中奖的人员
    //            winLi = '<li id="' + v.InnerID + '" openid=' + v.OpenID + '><img src="' + v.WeChatHeadPortrait + '" height="35px" width="35px"><span>' + v.WeChatNick + '</span></li>';
    //            $(".ulLuckList").empty().append("<li id=\"" + v.InnerID + "\" ondblclick=delLuckDog('" + v.OpenID + "','" + currAwards.id + "')><img src=\"" + v.WeChatHeadPortrait + "\" height=\"100px\" width=\"100px\"><label class='lblName' style=\"font-size:30px;width:100%;text-align:center;float: left;\">" + v.WeChatNick + "</label><label class='lblNumber smartCommonCssUnvisiable'>" + v.OpenID + "</label></li>");

    //        }
    //    } else
    //        strList += '<li id="' + v.InnerID + '" openid=' + v.OpenID + '><img src="' + v.WeChatHeadPortrait + '" height="35px" width="35px"><span>' + v.WeChatNick + '</span></li>';
    //});

    //$('#ulPerPool').empty().append(strList);

    //if (winLi !== "") {
    //    $('#ulPerPool li').eq(1).after(winLi);
    //}

}

var isRolling = 0; //是否正在滚动
var interval;      //滚动器
var intervalSlow;
var luckyDogId = '';

/* 开始滚动 */
var startScroll = function () {

    /* if (currTotalCount <= 0) {
     artWarning('所有奖品已抽完！');
     return;
     }

     if (currAwards.count <= 0) {
     artWarning('该奖项已抽完！');
     return;
     }

     $('.liLuckyDog').remove();

     if ($("#ulPerPool li").length <= 5) {
     artWarning('参与人员不足,至少需要5人！');
     return;
     }*/

    //luckIndex = 2;
    interval = setInterval(scrollList, 50);

    isRolling = 1;
    //alert("stop")
    $(".dvStartButton").removeClass("dvBackrgoundStart").addClass("dvBackrgoundStop");
    //audio.play();
}

/*停止滚动*/
var stopScroll = function () {
    setTimeout(slowToStop, Math.floor(Math.random() * 250));
}

/**
 * 抽奖滚动.
 */
var scrollList = function () {
    var activitorList = $("#ulPerPool");
    var scrollWrapW = -($(activitorList).find('li').eq(0).outerHeight(true) + $(activitorList).find('li').eq(1).outerHeight(true)) + 'px';

    $(activitorList).animate({top: scrollWrapW}, {
        duration: 20,
        step: function () {
            $(activitorList).find("li").removeClass("liLuckyDog");
        },
        complete: function () {
            $(activitorList).append($(activitorList).find('li:first'));
            $(activitorList).find("li").eq(luckIndex).addClass("liLuckyDog");
        }
    });
}

/**
 * 设置滚动停止的随机数，防止人为作弊.
 */
var slowToStop = function () {

    //阻止获取数据
    clearInterval(interval);
    setTimeout(setLuckDog, 50);
    isRolling = 0;

    $(".dvStartButton").removeClass("dvBackrgoundStop").addClass("dvBackrgoundStart");
}

/**
 * 设置获奖名单.
 */
var setLuckDog = function () {

    var luckDom = $("#ulPerPool li[class='liLuckyDog']");
    var perid = $(luckDom).attr("id");
    var openid = $(luckDom).attr("openid");
    var nickname = $(luckDom).find("span").html();
    var headportrait = $(luckDom).find("img").attr("src");

    $(".ulLuckList").empty();
    $(".ulLuckList").append("<li id=\"" + perid + "\" ondblclick=delLuckDog('" + openid + "','" + currAwards.id + "')><img src=\"" + headportrait + "\" height=\"100px\" width=\"100px\"><label class='lblName' style=\"font-size:30px;width:100%;text-align:center;float: left;\">" + nickname + "</label><label class='lblNumber smartCommonCssUnvisiable'>" + openid + "</label></li>");

    //记录中奖信息
    if (openid != undefined) {
        recordWinInfo(openid);
    }
}


/**
 *记录中奖信息
 */
var recordWinInfo = function (openid) {

    //获取中奖信息 中奖类型
    var bearType = $(".dvAwardSelectMiddleTitle").text();
    layer.msg("记录中奖信息" + bearType);

    var json = [{ActivityId: id, OpenID: openid, AwardsID: currAwards.id}];

    //提交数据
    /* $.ajax({
     type: "POST",
     url: "/api/Lottery/UpdateDrawResult",
     data: JSON.stringify(json),
     contentType: "application/json; charset=utf-8",
     async: true,
     cache: false,
     timeout: 20000,
     beforeSend: function () {
     currAwards.count--;
     currTotalCount--;
     },
     complete: function () {

     //当前奖项抽完时显示统计按钮
     if (currAwards.count === 0) {
     $(".lblCheckList").removeClass("smartCommonCssUnvisiable");
     }

     if (currTotalCount <= 0) {
     //关闭活动
     $.ajax({
     type: "GET",
     url: "/api/Lottery/CloseActivity/" + id,
     success: function () {
     }
     });
     }

     //setTimeout(function () { audio.pause(); }, 500);

     },
     success: function () {

     delCookie('failureSave');
     },
     error: function () {
     currAwards.count++;
     currTotalCount++;
     }
     });*/
    return "";
};

/**
 * 控制语言列表显示情况.
 * type  {string} 类型：1 交替显示；2 显示；3 隐藏
 */
var elementDisplay = function (element, type) {

    if (type === 1) {
        $(element).toggle();
    }
    else if (type === 2) {
        $(element).show();
    }
    else if (type === 3) {
        $(element).hide();
    }
}

/**
 * 奖项选择事件.
 obj   {object} 当前点击的对象.
 */
var awardSelect = function (obj) {

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
    currAwards.count = currAwards.total;

    //清空显示项
    $(".dvAwardSelectMiddleTitle").empty();

    //给显示项赋值
    $(".dvAwardSelectMiddleTitle").html($(obj).html());

    $("#imgAwards").attr("src", getQiniuUrl($(obj).attr("awardphoto")));

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
var delLuckDog = function (openid, awardsid) {

    art.dialog({
        title: '确认',
        icon: 'question',
        content: '是否重抽？',
        opacity: 0,	// 透明度
        lock: true,
        ok: function () {
            $.ajax({
                url: "/api/Lottery/WaiverDrawResult/" + id + "/" + openid + "/" + awardsid,
                type: "GET",
                async: true,
                cache: false,
                success: function (data) {
                    if (data === "1") {
                        location.reload();
                    }
                    else if (data === "-1") {
                        artWarning('奖品已被领取！');
                    }
                    else {
                        artWarning('操作失败！');
                    }
                },
                error: function () {
                    //artError('发送微信失败！');
                }
            });
        },
        cancel: function () {
            return true;
        }
    });
}

/**
 * 查看全部中奖名单
 */
var checkLuckList = function () {


   /* art.dialog.open('/Lottery/Lottery/ActivityLuckList?activityid=' + id,
        {
            id: "dialog",
            lock: true,
            width: '1000px',
            height: '800px'
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
    $(".aui_close").attr("style", "position:absolute;top:32px;");*/
}

/**
 * 设置全局变量的值
 * intIndex  {int} 要设置的当前ID数组的索引.
 */
var setGlobalValue = function (intIndex) {

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
artDialog = function (message) {
    isAlert = true;
    art.dialog({
        id: 'alert',
        content: message,
        opacity: 0,	// 透明度
        lock: true,
        focus: false,
        ok: function () {
            return true;
        },
        close: function () {
            isAlert = false;
        }
    });
}

/**
 * 警告提示
 */
artWarning = function (message) {
    isAlert = true;
    art.dialog({
        id: 'alert',
        content: message,
        icon: 'warning',
        opacity: 0,	// 透明度
        lock: true,
        focus: false,
        ok: function () {
            return true;
        },
        close: function () {
            isAlert = false;
        }
    });
}

/**
 * 出错提示
 */
artError = function (message) {
        isAlert = true;
        art.dialog({
            id: 'alert',
            content: message,
            icon: 'error',
            opacity: 0,	// 透明度
            lock: true,
            focus: false,
            ok: function () {
                return true;
            },
            close: function () {
                isAlert = false;
            }
        });
    }

