
var user_id;
var user_department;
var user_num;
var flag = 1;

var connectIP = $("#mainIP").html();
var ip =connectIP.split("|")[0];

  $(function(){
    getSatausFun();
  })


  function searchFun(){
    var that = this;
      var table = $("#tableNo").val();
      var department = $("#selectDepartment option:selected").val();

      var issign = $('#radioDivId input[name="issignRadio"]:checked ').val();

      if(table == '' || table == null || table == undefined){
          table='';
      }
      if(department == '' || department == null || department == undefined){
          department='';
      }
      if(issign == '' || issign == null || issign == undefined){
          issign='';
      }
      // if(table =='' && department == '' && issign == '')
      //   return;
      var data = {"table":table,"department":department, "issign":issign}
       $.ajax({
          url:ip+'api/user/selectUsers',//http://localhost:9999/
          type:'post',
          async:false,
          data:data,
          dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
          success:function(data){
            $("#AnchorTable tr:first").nextAll().remove();
            var number_ = data.items.length;
            $("#totalNum").html(number_);
            for(var i=0;i<data.items.length;i++){
              var item = data.items[i];
              $("#AnchorTable tr:nth-child("+(i+1)+")").after(
                '<tr id='+item.num+'>'  +
                  '<td>'+item.num+'</td>' +
                  '<td>'+item.name+'</td>' +
                  '<td>'+item.userid+'</td>' +
                  '<td>'+item.department+'</td>' +
                  '<td class="tablenumber">'+item.table+'</td>' +
                  '<td><img src="'+item.avatar+'" style="width:40px;height:40px"/></td>' +
                  '<td id='+item.userid+'>'+item.issign+'</td>' +
                  '<td>' +
                '<button  style="margin-left: 200px;" onclick=resetSignup("'+item.userid+'");>签到重置</button>' +
                '<button  style="margin-left: 200px;" onclick=popUpWindow("'+item.userid+'","'+item.department+'","'+item.num+'");>修改信息</button>' +
                  '</td>' +
                '</tr>'
              );
            }
          },
          error:function(){
            console.log("没有从数据库中搜索到数据!");
          }
      })
  }
  function resetSignup(uid){ 
     $.ajax({
        url:ip+'api/user/resetuser',//http://localhost:9999/  
        type:'post',
        async:false,
        data:{UserId:uid},
        dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
        success:function(data){
           $("#"+uid).html(data.issign);
           layer.msg("修改成功");
        },
        error:function(){
          console.log("没有从数据库中搜索到数据!");
        }
    })
  }
  function popUpWindow(){
    $("#setTable").modal("show");
  }
  function popUpWindowSingle(uid,department,num){
    user_id = '';
    user_department = '';
    user_num = '';
    $("#setTableSingle").modal("show");
    user_id = uid;
    user_department = department;
    user_num = num;

  }
  function changeInfoSingle(){

    var table = $("#tableNumberSingle").val();
    $("#tableNumberSingle").val('');
    if(isNaN(table)){
        alert("请输入正确的桌号");
        return ;
    }

    $.ajax({
        url:ip+'api/user/resetuserinfo',//http://localhost:9999/
        type:'post',
        async:false,
        data:{"UserId":user_id,"table":table,"department":''},
        dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
        success:function(data){
          alert("修改成功!");
          $("#setTableSingle").modal("hide");
          location.reload(true);
        },
        error:function(){
          alert("修改桌号失败, 请重新修改!");
        }
    })
    
  }
  function changeInfo(){
    var department = $("#setInfoDepartment option:selected").val();
    var table = $("#tableNumber").val();
    $("#tableNumber").val('');
    if(isNaN(table)){
        alert("请输入正确的桌号");
        return ;
    }
    if(department == '' || department == null || department == undefined){
        department = ''
    }
    $.ajax({
        url:ip+'api/user/resetuserinfo',//http://localhost:9999/
        type:'post',
        async:false,
        data:{"UserId":user_id,"table":table,"department":department},
        dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
        success:function(data){
          alert("修改成功!");
          $("#setTable").modal("hide");
          location.reload(true);
        },
        error:function(){
          alert("修改桌号失败, 请重新修改!");
        }
    })
    
  }

// 页面socket连接控制方法
  function sendMsgFun(param){
      var value = $("#"+param+"select option:selected").val();
      var _vlalue = 0;
      var msg = '';
      if(value == 0){
        msg = param+":open";
        _vlalue = 1;
      }else if(value == 1){
        msg = param+":close";
         _vlalue = 0;
      }
      $.ajax({
          url:ip+'management/mainsocketcontrol',//http://localhost:9999/
          type:'post',
          async:false,  
          data:{"meassage":msg},
          dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
          success:function(data){
            alert("消息发送成功");
          },
          error:function(){
            alert("消息发送失败");
          }
      })
      saveStatusFun(param,_vlalue);
      if(value % 2==0){   
          $("#"+param+"select").get(0).options[1].selected = true;     
      }else if(value % 2==1){    
          $("#"+param+"select").get(0).options[0].selected = true;     
      }
  }
  // 在数据库中保存页面修改的状态
  function saveStatusFun(param,value){
      $.ajax({
          url:ip+'management/saveStatusFun',//http://localhost:9999/
          type:'post',
          async:false, 
          data:{"pageName":param,"value":value}, 
          dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
          success:function(data){
            console.log("页面状态修改成功");
          },
          error:function(){
            console.log("页面状态修改失败");
          }
      })
  }
  // 获取数据库中的页面状态
  function getSatausFun(){
    
    $.ajax({
        url:ip+'management/statusFun',//http://localhost:9999/
        type:'get',
        async:false, 
        dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
        success:function(data){
          var len = data.items.length;

          for(var x=0; x<len ;x++){
            var name = data.items[x].pageName;
            var status = data.items[x].status;
            var count=$("#"+name+"select").get(0).options.length;
            for(var i=0;i<count;i++){
              if($("#"+name+"select").get(0).options[i].value == status){
                $("#"+name+"select").get(0).options[i].selected = true;          
                break;  
              }  
            }
          }
        
        },
        error:function(){
          console.log("获取页面状态失败");
        }
    })
  }
// 页面连接跳转
  function transationFun(param){
      $.ajax({//redirectcontrol
          url:ip+'management/redirectcontrol',//http://localhost:9999/
          type:'post',
          async:false,
          data:{"url":"url:"+param},
          dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
          success:function(data){
            alert("消息发送成功");
          },
          error:function(){
            alert("消息发送失败");
          }
      })
  }
//重置 聊天页面数据库中的数据
  function resetChatDBFun(){
      layer.confirm('删除 聊天页面 数据库中的数据？ 请谨慎操作!!!', {
          btn: ['是的','不要了'] //按钮
      }, function(){
          layer.closeAll();
          $.ajax({//redirectcontrol
              url:ip+'management/resetChatDB',//http://localhost:9999/
              type:'post',
              async:false,
              // data:{"url":"url:"+param},
              // dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
              success:function(data){
                alert(data);
              },
              error:function(){
                alert("数据库中没有数据");
              }
          })
      }, function(){
          layer.closeAll();
      }); 
  }
//重置 抽奖 页面数据库中的数据
  function resetLuckDBFun(){
      layer.confirm('删除 抽奖页面 数据库中的数据？ 请谨慎操作!!!', {
          btn: ['是的','不要了'] //按钮
      }, function(){
          layer.closeAll();
          $.ajax({//redirectcontrol
              url:ip+'management/resetLuckDB',//http://localhost:9999/
              type:'post',
              async:false,
              // data:{"url":"url:"+param},
              // dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
              success:function(data){
                alert(data);
              },
              error:function(){
                alert("数据库中没有数据");
              }
          })
      }, function(){
          layer.closeAll();
      }); 
  }

//重置 签到 页面数据库中的数据
  function resetHeadDBFun(){
      layer.confirm('删除 抽奖页面 数据库中的数据？ 请谨慎操作!!!', {
          btn: ['是的','不要了'] //按钮
      }, function(){
          layer.closeAll();
          $.ajax({//redirectcontrol
              url:ip+'management/resetHeadDB',//http://localhost:9999/
              type:'post',
              async:false,
              // data:{"url":"url:"+param},
              // dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
              success:function(data){
                alert(data);
              },
              error:function(){
                alert("数据库中没有数据");
              }
          })
      }, function(){
          layer.closeAll();
      }); 
  }
//重新拉取微信数据库信息
  function fetchAllUser(){
      $.ajax({//redirectcontrol
          url:ip+'api/user/fetchallusers',//http://localhost:9999/
          type:'get',
          async:true,
          success:function(data){
            layer.msg("拉取数据成功");
          },
          error:function(){
            layer.msg("没有获取到数据");
          }
      })
  }
  // 录入抽奖页面奖品信息
  function recordLukyAwardMessage(){
      $("#recordLukyAward").modal("show");
  }
  // 保存抽奖页面奖品信息
  function saveluckyawardmessage(){
      var AwardsLevel = $("#luckyawardAwardsLevel").val();
      var _Number = $("#luckyawardNumber").val();
      var Photo = $("#luckyawardPhoto").val();
      var PrizeName = $("#luckyawardPrizeName").val();
      var AwardsName = $("#luckyawardAwardsName").val();

      if(Photo.indexOf("img")<=0){
          Photo = "../../img/"+Photo;
      }

      var data = {
          "AwardsID":parseInt(AwardsLevel),
          "AwardsLevel":parseInt(AwardsLevel),
          "Number":parseInt(_Number),
          "Photo":Photo,
          "PrizeName":PrizeName,
          "AwardsName":AwardsName,
          "InnerID":parseInt(AwardsLevel),
          "DrawedNumber":0,
          "Status":1
      }
      $.ajax({
          url:ip+'li/saveluckyawardmessage',
          type:'post',
          data:data,
          async:true,
          success:function(data){
            layer.msg(data);
            $("#recordLukyAward").modal("hide");
          },
          error:function(){
            layer.msg("保存失败");
          }
      })
  }
  // 获取抽奖页面奖品信息
  function getLukyAwardMessage(){
      $("#AnchorluckyawarlistTable tr:first").nextAll().remove();
      $.ajax({//redirectcontrol
          url:ip+'api/user/awardlist',//http://localhost:9999/
          type:'get',
          async:true,
          success:function(data){
            showAwardList(data);
          },
          error:function(){
            layer.msg("没有获取到数据");
          }
      })
  }
  // 展示抽奖页面奖品信息
  function showAwardList(data){
    var string = '';
    for(var i = 0; i<data.length ;i++){
      string += ''+
      '<tr id="luckyaward'+data[i].AwardsLevel+'">'+
          '<td>'+data[i].PrizeName+'</td>'+
          '<td>'+data[i].AwardsLevel+'</td>'+
          '<td>'+data[i].Number+'</td>'+
          '<td>'+data[i].Photo+'</td>'+
          '<td>'+data[i].AwardsName+'</td>'+
          '<td style="cursor:pointer" onclick=editluckyaward("luckyaward'+data[i].AwardsLevel+'");>操作</td>'+
      '</tr>';
    }
    $("#luckyawarlist").after(string);
    $("#getLukyAward").modal("show");
  }
  // 编辑抽奖页面奖品信息
  function editluckyaward(param){

    $("#getLukyAward").modal("hide");
      var arr = [];
      $("#"+param+">td").each(function(){
        arr.push($(this).html());
      });

      $("#luckyawardAwardsLevel").val(arr[1]);
      $("#luckyawardNumber").val(arr[2]);
      $("#luckyawardPhoto").val(arr[3]);
      $("#luckyawardPrizeName").val(arr[0]);
      $("#luckyawardAwardsName").val(arr[4]);
    

      
      $("#recordLukyAward").modal("show");
  }
  // 从当前开始随机生成时间
  function createTimes(){
      var date = new Date().getTime();//14818508 41108(前) |14818509 56992(当前)
      var timeQuantum = 1000*60*1;//设置产生的时间在那个时间段内 
      // var interval = 50;//设置每个时间点的最小间隔
      var dateArr = [];
      for(var i=0;i<10;i++){
          dateArr.push(date+Math.ceil(Math.random()*timeQuantum)) 
      } 
      dateArr=dateArr.sort();
      $.ajax({
          url:ip+'management/savetimes',//http://localhost:9999/
          type:'post',
          async:false, 
          data:{"date":dateArr.toString()},
          // dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
          success:function(data){
              layer.msg("生成成功");
          },
          error:function(){
              layer.msg("保存失败");
          }
      })
  }
  //删除随机生成的时间
  function deleteTimes(){
      $.ajax({
          url:ip+'management/deletetimes',//http://localhost:9999/
          type:'post',
          async:false, 
          // dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
          success:function(data){
              layer.msg("删除成功");
          },
          error:function(){
              layer.msg("删除失败");
          }
      })
      


  }
