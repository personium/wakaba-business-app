var sm = {};
sm.notImage = "https://demo.personium.io/HomeApplication/__/icons/no_app_image.png";
sm.imgBinaryFile = null;
sendCount = 0;

additionalCallback = function() {
//検索結果を表示し、メール送信先を作成する
　$(function () {
      var filter = "";
      // イメージファイル初期化
      var imgSrc = sessionStorage.getItem("ImageSrc");
			if (imgSrc != null) {
        $("#idImgFile").attr('src', imgSrc);
        sessionStorage.removeItem("ImageSrc");
			} else {
        $("#idImgFile").attr('src', sm.notImage);
			}

      Common.dispUserName(Common.cellUrl);

      var type = sessionStorage.getItem("SearchData");
      var areas = sessionStorage.getItem("SearchArea").split(",");
      var ages = sessionStorage.getItem("SearchAge").split(",");
      var stBirths = sessionStorage.getItem("SearchStBirth").split(",");
      var enBirths = sessionStorage.getItem("SearchEnBirth").split(",");
      var sexs = sessionStorage.getItem("SearchSex").split(",");
      var extToken = sessionStorage.getItem("ISExtToken");
      var termEnd = sessionStorage.getItem("TermEnd");

      switch (type) {
        case "1":
        var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/OData/User?$inlinecount=allpages&$top=10000&$filter=substringof(%27hn-app-genki%27,Services)';
        $("#iMassageTitle").attr("placeholder","お食事写真提供のお願い");
        $("#iPurpose").attr("placeholder","○○スーパーの・・・");
        $("#iMassageTitle").attr("value","お食事写真提供のお願い");
        $("#iMassageBody").html("新商品企画のために、お食事データの提供をお願いします。");
        $("#iPurpose").html("新商品企画のため");
        $("#targetItem").attr("data-i18n", "glossary:pdsCalorieSmile").localize();
        $("#targetData").html('食事記録（写真）、撮影日時、コメント');
        break;
        case "2":
        var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/OData/User?$inlinecount=allpages&$top=10000&$filter=substringof(%27hn-app-neurosky%27,Services)';
        $("#iMassageTitle").attr("placeholder","ストレスデータ提供のお願い");
        $("#iPurpose").attr("placeholder","○○病院の・・・");
        $("#iMassageTitle").attr("value","ストレスデータ提供のお願い");
        $("#iMassageBody").html("新商品企画のために、ストレスデータの提供をお願いします。");
        $("#iPurpose").html("新商品企画のため");
        $("#targetItem").html('ストレスデータ');
        $("#targetData").html('ストレスデータ、コメント');
        break;
        default:
        var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/OData/User?$inlinecount=allpages&$top=10000&$filter=substringof(%27hn-app-genki%27,Services)';
        $("#iMassageTitle").attr("placeholder","お食事写真提供のお願い");
        $("#iPurpose").attr("placeholder","○○スーパーの・・・");
        $("#iMassageTitle").attr("value","お食事写真提供のお願い");
        $("#iMassageBody").html("新商品企画のために、お食事データの提供をお願いします。");
        $("#iPurpose").html("新商品企画のため");
        $("#targetItem").attr("data-i18n", "glossary:pdsCalorieSmile").localize();
        $("#targetData").html('食事記録（写真）、撮影日時、コメント');
        break;
      }

      // 募集期間初期化
      /*
      var nowDate = new Date();
      var nowYear = nowDate.getFullYear();
      $('#iTerm1').val(nowYear);
      var nowMonth = nowDate.getMonth() + 1;
      nowMonth = ("0" + nowMonth).slice(-2);
      $('#iTerm2').val(nowMonth);
      var nowDay = ("0" + nowDate.getDate()).slice(-2);
      $('#iTerm3').val(nowDay);
      */

      var nowDate = new Date();
      var nowYear = nowDate.getFullYear();
      var nowMonth = nowDate.getMonth() + 1;
      nowMonth = ("0" + nowMonth).slice(-2);
      var nowDay = ("0" + nowDate.getDate()).slice(-2);
      var term = nowYear + "-" + nowMonth + "-" + nowDay;
      $('#termStart').val(term);
      if (termEnd != null) {
        $('#termEnd').val(termEnd);
        sessionStorage.removeItem("TermEnd");
      } else {
        $('#termEnd').val(term);
      }

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
      //if ( sexs == 1) {
      //  var dispSex = "男性";
      //} else if ( sex == 2 ) {
      //  var dispSex = "女性";
      //} else {
      //  var dispSex = "全て";
      //}

      var dispAge = "";
      filter = "(";
      for (var i in ages) {
        var age = ages[i];
        if (i > 0) {
          filter += "+or+";
          dispAge += ",";
        }
        if (age < 100) {
          filter += "(Birthday+ge+%27" + stBirths[i] + "%27+and+Birthday+le+%27" + enBirths[i] + "%27)";
          dispAge += age + "代";
        } else {
          filter += "(Birthday+le+%27" + enBirths[i] + "%27)";
          dispAge += age + "歳以上";
        }
      }

      //if ( age == null) {
      //  age = "全て";
      //  dispAge = age;
      //} else if (age < 100) {
      //    filter = "Birth+ge+%27" + stBirth + "%27+and+Birth+le+%27" + enBirth + "%27";
      //    dispAge = age + "代";
  　　//} else {
      //    filter = "Birth+le+%27" + enBirth + "%27";
      //    dispAge = age + "代";
      //}

      filter += ")+and+(";
      for (var i in sexs) {
        var sex = sexs[i];
        if (i > 0) {
          filter += "+or+";
        }
        filter += "(Sex+eq+" + sex + ")";
      }

      //if ( sex !== null) {
      //  if (filter.length > 0) {
      //          filter += "+and+";
      //  }
      //  filter += "Sex+eq+" + sex;
      //}

      var dispArea = "";
      filter += ")+and+(";
      for (var i in areas) {
        var area = areas[i];
        if (i > 0) {
            filter += "+or+";
            dispArea += ",";
        }
        filter += "(substringof%28%27" + area + "%27,Address%29)";
        dispArea += area;
      }
      filter += ")";

      //if ( area == null) {
      //  area = "指定なし";
      //} else {
      //  if (filter.length > 0) {
      //    filter += "+and+";
      //  }
      //filter += "substringof%28%27" + area + "%27,Address%29";
      //}

      if (filter.length > 0) {
          url += '+and+' + filter;
      }
      console.log(filter);
      $.ajax({
          type: "GET",
          url: url,
          headers: {
              'Authorization':'Bearer ' + extToken,
              'Accept':'application/json'
          }
      }).done(function(response){
        sendTo = "";
        for ( var i = 0; i < response.d.results.length; i ++ ) {
          sendTo = sendTo + response.d.results[i].CellURL + ",";
        }
        $('#searchItem').html(
        "年齢：" + dispAge + "<br>" +
        "性別：" + dispSex + "<br>" +
        "地域：" + dispArea
        );
        sendCount = response.d.results.length;
        $('#searchResult').html(sendCount + " 人の該当者にデータ提供依頼を送信します。")
        sendTo = sendTo.substr( 0, sendTo.length-1 );
        if ( sendTo.length !== 0 ) {
          sessionStorage.setItem("SendToCell", sendTo);
        } else {
          sessionStorage.removeItem("SendToCell");
        }
      });

  //選択された画像を取得して、プレビュー表示する
  $('#attachImgFile').on('change', function() {
    var file = this.files[0];
    if (file) {
        try {
            var reader = new FileReader();
//            reader.onload = function() {
//                var ar = new Unit8Array(reader.result);
//                sm.imgBinaryFile = ar;
//            }
//            reader.readAsArrayBuffer(file);
        } catch (e) {
            return;
        }

        reader.readAsDataURL(file, "UTF-8");
	reader.onload = loaded;
	reader.onerror = errorHandler;
    }
  });

  //入力内容を取得して、対象のセルにメッセージを送信する
  $('#b-send-message').on('click', function() {
    var file = document.getElementById("attachImgFile").files[0];
    var imgFilePath = "";
    if (file) {
        var nowDate = new Date();
        var nowYear = nowDate.getFullYear();
        var nowMonth = nowDate.getMonth() + 1;
        var nowDay = ("0" + nowDate.getDate()).slice(-2);
        sessionStorage.setItem("ImageFileName", file.name);
        imgFilePath = Common.target + "/AttachImage/" + nowYear + nowMonth + nowDay + "_" + file.name;
        putImageFile(imgFilePath, file.name, file).done(function(response) {
            console.log(response);
            sendMessage(imgFilePath);
        }).fail(function(response) {
            console.log(response);
            alert("メッセージの送信に失敗しました");
        });
        //testPhotoSave();
    } else {
        sendMessage(null);
        sessionStorage.setItem("ImageFileName", null);
    }
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

  function sendMessage(imgFilePath) {
    cellUrl = Common.cellUrl;
    sendMessageUrl = cellUrl + "__message/send";
    sendTo = sessionStorage.getItem("SendToCell");
    token = Common.token;
    var type = sessionStorage.getItem("SearchData");
    var name = "ShokujiViewer";
    if (type !== "1") {
      name = "StressViewer"
    }

    var messageBody = {};
    messageBody.BoxBound = true;
    messageBody.To = sendTo;
    messageBody.Type = "req.relation.build";
    messageBody.RequestRelation = cellUrl + "__relation/__/" + name;
    messageBody.RequestRelationTarget = cellUrl;
    messageBody.Title = $('#iMassageTitle').val();
    //messageBody.Body = $('#iPurpose').val();

    var mBody = {};
    mBody.Body = $('#iMassageBody').val();
    mBody.Text = $('#iPurpose').val();
    mBody.Type = sessionStorage.getItem("SearchData");
    mBody.ImgUrl = imgFilePath;
    mBody.SearchAge = sessionStorage.getItem("SearchAge");
    mBody.SearchSex = sessionStorage.getItem("SearchSex");
    mBody.SearchArea = sessionStorage.getItem("SearchArea");
    mBody.sendCount = sendCount;
    mBody.TermStart = $('#termStart').val().split('-')[0] + "/" + $('#termStart').val().split('-')[1] + "/" + $('#termStart').val().split('-')[2];
    mBody.TermEnd = $('#termEnd').val().split('-')[0] + "/" + $('#termEnd').val().split('-')[1] + "/" + $('#termEnd').val().split('-')[2];
    //mBody.Payback = parseInt($('#iPayback').val());
    //mBody.Limit = parseInt($('#iLimit').val());
    messageBody.Body = "'" + JSON.stringify(mBody) + "'";
    messageBody = JSON.stringify(messageBody);
    sessionStorage.setItem("MessageBody", messageBody);
    /*
    $.ajax({
      type: 'POST',
      url: sendMessageUrl,
      dataType: 'json',
      headers: {'Authorization': 'Bearer ' + token,'Accept': 'application/json'},
      data: JSON.stringify(messageBody)
    }).done(function(response){
      console.log(response);
      var j = 0
      for (var i = 0 ; i < response.d.results.Result.length ; i ++) {
        if ( response.d.results.Result[i].Code == "201" ) {
          j = j + 1 ;
        }
      }

      if ( response.d.results.Result.length == j ) {
        alert( response.d.results.Result.length + "件中 " + j + "件の送信に成功しました" );
      } else {
        alert( response.d.results.Result.length + "件中 " + j + "件の送信に成功しました\n" +
      　　　　　response.d.results.Result.length + "件中 " + ( response.d.results.Result.length - j ) + "件の送信に失敗しました" );
      }

      history.back();
    }).fail(function(response){
      console.log(response);
      alert("メッセージの送信に失敗しました");
    });
    */
    location.href = "./previewSendMessage.html";

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

  function loaded(evt) {
    sm.imgBinaryFile = evt.target.result;
    $("#idImgFile").attr('src', sm.imgBinaryFile);
    $(document.body).css("cursor", "auto");
  };

  function errorHandler(evt) {
    if (evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
      alert("Error reading file...");
    }
  };

  function putImageFile(imgPath, imgName, file) {
    var ext = imgName.split('.')[1];
    var contentType = "image/jpeg";
    switch (ext) {
        case "png":
            contentType = "image/png";
            break;
        case "gif":
            contentType = "image/gif";
            break;
    }
    return $.ajax({
        type: "PUT",
        url: imgPath,
        data: file,
        processData: false,
        headers: {'Authorization': 'Bearer ' + Common.token,'Content-Type': contentType},
    });
  }
 });
}
