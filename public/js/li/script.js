$(document).ready(function () {
    $('.artist_l li').each(function (m) {
        $(this).find('a').css('top', -150);
        $(this).hover(function () {
            $(this).find('a').animate({
                'top': '0'
            },
            200)
        },
        function () {
            $(this).find('a').animate({
                'top': 150
            },
            {
                duration: 200,
                complete: function () {
                    $(this).css('top', -150)
                }
            })
        })
    });

    $(".artist_l li .cvote").click(function () {
        var nowdo = $(this);
        var baby = nowdo.parent().parent().find(".tag_txt").html();
        var nowvote = nowdo.parent().find(".cvotenum b").html();

        var key = nowdo.parent().find(".vote-key").html();

        var data = new Object();
        data.number = parseInt(nowvote) + 1;
        data.name = nowdo.parent().parent().find(".tag_txt").html();
        data.key = key;
       // alert("亲！您为征名【" + baby + "】投了一票！谢谢您的投票！");
        //alert(data.name);
        $.ajax({
            url:'http://localhost:9999/li/changenumber',
            type:'post',
            async:false,
            data:data,
            dataType:'text',    //返回的数据格式：json/xml/html/script/jsonp/text
            success:function(data){

                if(data == "OK"){
                    nowdo.parent().find(".cvotenum b").html(parseInt(nowvote) + 1);
                }

            },
            error:function(data){
                console.log("更新失败" + data);
            }
        })

    });
});

