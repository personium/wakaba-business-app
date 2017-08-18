var sm = {};
sm.notImage = "https://demo.personium.io/HomeApplication/__/icons/no_app_image.png";
sm.imgBinaryFile = null;
sendCount = 0;

$(document).ready(function() {
//入力内容を表示する
　$(function () {
      var filter = "";
      // イメージファイル初期化
      $("#idImgFile").attr('src', sm.notImage);
      Common.dispUserName(Common.cellUrl);

      var messageBody = sessionStorage.getItem("MessageBody");
      var body = JSON.parse(messageBody);
      var title = body.Title;
      var pBody = body.Body.replace( /"\"/g ,"" );
      pBody = pBody.substr( 1 );
      pBody = pBody.substr( 0, pBody.length-1 );
      pBody = JSON.parse(pBody);

      var message = pBody.Body;
      var purpose = pBody.Text;
      var dataType = pBody.Type;
      var sexs = pBody.SearchSex.split(",");
      var ages = pBody.SearchAge.split(",");
      var areas = pBody.SearchArea;
      var sendCount = pBody.sendCount;
      var imgUrl = pBody.ImgUrl;
      var termStart = pBody.TermStart.replace( /\//g,"-" );
      var termEnd = pBody.TermEnd.replace( /\//g,"-" );
      sessionStorage.setItem("TermEnd", termEnd);

      switch (dataType) {
        case "1":
        var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/OData/User?$inlinecount=allpages&$top=10000&$filter=substringof(%27hn-app-genki%27,Services)';
        $("#target").html('食事データ');
        $("#targetItem").html('CalorieSmile（食事データ）');
        $("#targetData").html('食事記録（写真）、撮影日時、コメント');
        break;
        case "2":
        var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/OData/User?$inlinecount=allpages&$top=10000&$filter=substringof(%27hn-app-neurosky%27,Services)';
        $("#target").html('ストレスデータ');
        $("#targetItem").html('ストレスデータ');
        $("#targetData").html('ストレスデータ、コメント');
        break;
        default:
        var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/OData/User?$inlinecount=allpages&$top=10000&$filter=substringof(%27hn-app-genki%27,Services)';
        $("#target").html('食事データ');
        $("#targetItem").html('CalorieSmile（食事データ）');
        $("#targetData").html('食事記録（写真）、撮影日時、コメント');
        break;
      }

      $("#targetNumberOfPeople").html(sendCount);
      $("#targetArea").html(areas);

      $("#iMassageTitle").attr("value",title);
      $("#iMassageBody").html(message);
      $("#iPurpose").html(purpose);
      $('#termStart').attr("value",termStart);
      $('#termEnd').attr("value",termEnd);

      var dispSex = "";
      for (var i in sexs) {
        if (i > 0) dispSex += ",";
        switch (sexs[i]) {
          case "1":
            dispSex += "男性";
            break;
          case "2":
            dispSex += "女性";
            break;
        }
      }
      $("#targetSex").html(dispSex);

      var dispAge = "";
      for (var i in ages) {
        var age = ages[i];
        if (i > 0) {
          dispAge += ",";
        }
        if (age < 100) {
          dispAge += age + "代";
        } else {
          dispAge += age + "歳以上";
        }
      }
      $("#targetAge").html(dispAge);

      if (imgUrl != null) {
        var fileName = imgUrl.split('/')[0]
        $("#imageName").html(sessionStorage.getItem("ImageFileName"));
        $('#image').attr("src",imgUrl);
				sessionStorage.setItem("ImageSrc", imgUrl);
      } else {
        $("#imageName").html("No Image");
        $('#image').attr("src","https://demo.personium.io/HomeApplication/__/icons/no_app_image.png");
      }

  //入力内容を取得して、対象のセルにメッセージを送信する
  $('#b-send-message').on('click', function() {
    sendMessage();
  });

//入力内容チェック
  $(function() {
    $("#iMassageTitle").blur(function() {
       if ( !isColCheckTitle($(this).val()) ) {
          $(this).focus();
       }
    });
  });

  $(function() {
    $("#iPurpose").blur(function() {
       if ( !isColCheckPurpose($(this).val()) ) {
          $(this).focus();
       }
    });
  });

  $(function() {
    $("#iTerm1").blur(function() {
       if ( !isNumericYear($(this).val()) ) {
          $(this).focus();
       }
    });
  });

  $(function() {
    $("#iTerm2").blur(function() {
       if ( !isNumericMonth($(this).val()) ) {
          $(this).focus();
       }
    });
  });

  $(function() {
    $("#iTerm3").blur(function() {
       if ( !isNumericDay($(this).val()) ) {
          $(this).focus();
       }
    });
  });

  function sendMessage() {
    cellUrl = Common.cellUrl;
    sendMessageUrl = cellUrl + "__message/send";
    sendTo = sessionStorage.getItem("SendToCell");
    token = Common.token;
    var name = "ShokujiViewer";
    if (dataType !== "1") {
      name = "StressViewer"
    }

    $.ajax({
      type: 'POST',
      url: sendMessageUrl,
      dataType: 'json',
      headers: {'Authorization': 'Bearer ' + token,'Accept': 'application/json'},
      data: messageBody
    }).done(function(response){
      console.log(response);
      var j = 0
      for (var i = 0 ; i < response.d.results.Result.length ; i ++) {
        if ( response.d.results.Result[i].Code == "201" ) {
          j = j + 1 ;
        }
      }

      if ( response.d.results.Result.length == j ) {
        sessionStorage.removeItem("ImageSrc");
        sessionStorage.removeItem("TermEnd");
        location.href = "./sendMessageResult.html";
      } else {
        alert( response.d.results.Result.length + "件中 " + j + "件の送信に成功しました\n" +
      　　　　　response.d.results.Result.length + "件中 " + ( response.d.results.Result.length - j ) + "件の送信に失敗しました" );
      	history.back();
      }
    }).fail(function(response){
      console.log(response);
      alert("メッセージの送信に失敗しました");
      history.back();
    });
	
  }

  function isColCheckTitle(value) {
    if ( value == null )
    return;
    if( value.length > 30 ) {
      alert("30文字以内で入力してください");
      return false;
    }
    return true;
  }

  function isColCheckPurpose(value) {
    if ( value == null )
    return;
    if( value.length > 200 ) {
      alert("200文字以内で入力してください");
      return false;
    }
    return true;
  }

  function isNumeric(value) {
    if ( value == null )
    return;
    if( value.match( /[^0-9.,-]+/ ) ) {
      alert("半角数字で入力して下さい。");
      return false;
    }
    return true;
  }

  function isNumericYear(value) {
    if ( value == null )
    return;
    if( value.match( /[^0-9.,-]+/ ) ) {
      alert("半角数字で入力して下さい。");
      return false;
    }
    if ( parseInt(value) < 1970  ) {
      alert("有効な日付を入力してください。");
      return false;
    }
    return true;
  }

  function isNumericMonth(value) {
    if ( value == null )
    return;
    if( value.match( /[^0-9.,-]+/ ) ) {
      alert("半角数字で入力して下さい。");
      return false;
    }
    if ( parseInt(value) > 12  ) {
      alert("有効な日付を入力してください。");
      return false;
    }
    if ( value.length !== 2  ) {
      alert("月は2桁で入力してください。");
      return false;
    }
    return true;
  }

  function isNumericDay(value) {
    if ( value == null )
    return;
    if( value.match( /[^0-9.,-]+/ ) ) {
      alert("半角数字で入力して下さい。");
      return false;
    }
    if ( parseInt(value) > 31  ) {
      alert("有効な日付を入力してください。");
      return false;
    }
    if ( value.length !== 2  ) {
      alert("日付は2桁で入力してください。");
      return false;
    }
    return true;
  }

 });
});
