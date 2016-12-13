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
        nowdo.parent().find(".cvotenum b").html(parseInt(nowvote) + 1);
        alert("亲！您为征名【" + baby + "】投了一票！谢谢您的投票！");

    });
});