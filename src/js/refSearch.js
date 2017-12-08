var rs = {};

rs.getName = function(path) {
  var collectionName = path;
  var recordsCount = 0;
  if (collectionName != undefined) {
    recordsCount = collectionName.length;
    var lastIndex = collectionName.lastIndexOf("/");
    if (recordsCount - lastIndex === 1) {
      collectionName = path.substring(0, recordsCount - 1);
      recordsCount = collectionName.length;
      lastIndex = collectionName.lastIndexOf("/");
    }
    collectionName = path.substring(lastIndex + 1, recordsCount);
  }
  return collectionName;
};

additionalCallback = function() {
  Common.setIdleTime();

  // Tabの動作設定
  // 1page1tabまで（暫定）
  $(document).on("click", ".tab a", function(){
    var tab_id = $(this).attr("href");
    var tabs = $($(this).parents(".tab")[0]);
    tabs.find("li").removeClass('current');
    $(".tab-content").hide();
    $(tab_id).show();
    $(this).parent("li").addClass('current');
    return false;
  });
  // switcher
  // 1page1switcherまで（暫定）
  $(document).on("click", ".switch-trigger", function(){
    var sw_id = $(this).attr("href");
    $(".switch-pages").hide();
    $(sw_id).show();
    return false;
  });
  // サイドナビのカレントクリック
  $(document).on("click", ".side-nav .current a", function(){
    return false;
  });

  //タイトルでフィルタをかけた人数と検索条件を表示
  rs.getSentMessageAPI().done(function(response){
    var arr = response.d.results;
    var check1 = {};
    for ( i=0; i<arr.length; i++ ) {
      check1[arr[i]['Title']] = arr[i];
    };
    filtered = [];
    for (var key in check1) {
      filtered.push(check1[key]);
    }
    $("#refSearchTitle").html(filtered[0].Title);
    var ts = parseInt(filtered[0]['__published'].replace("/Date(","").replace(")/",""));
    var d = new Date(ts);
    var year  = d.getFullYear();
    var month = toDoubleDigits(d.getMonth() + 1);
    var day  = toDoubleDigits(d.getDate());
    sentDate = year + '/' + month + '/' + day;
    $("#refSearchSentDate").html(sentDate);

    var body = filtered[0].Body.replace(/"\"/g ,"");
    body = body.substr( 1 );
    body = body.substr( 0, body.length-1 );
    sessionStorage.setItem("MessageBody", body);
    var bodyarr = JSON.parse(body);
    var sTerm = bodyarr.TermStart;
    var eTerm = bodyarr.TermEnd;
    $("#refSearchTerm").attr("data-i18n","[html]glossary:survey.surveyPeriod").localize({ startDate: sTerm, endDate: eTerm });
    if (sTerm) {
      $("#inputTermS").val(sTerm.replace(/\//g, "-"));
    }
    if (eTerm) {
      $("#inputTermE").val(eTerm.replace(/\//g, "-"));
    }
    var age = bodyarr.SearchAge.split(",");
    var sex = bodyarr.SearchSex.split(",");
    var area = bodyarr.SearchArea.split(",");
    if ( bodyarr.Type == null ) {
      var type = 1;
      var typeStr = "CalorieSmile";
      var offerStr = "glossary:survey.targetData.calorieSmile";
    } else {
      var type = bodyarr.Type;
      
      switch (type) {
        case "1":
          var typeStr = "glossary:pdsCalorieSmile";
          var offerStr = "glossary:survey.targetData.calorieSmile";
          rs.appCellUrl = "https://demo.personium.io/hn-app-genki/";
          break;
        case "2":
          var typeStr = "glossary:pdsLifeBeat";
          var offerStr = "glossary:survey.targetData.lifeBeat";
          rs.appCellUrl = "https://demo.personium.io/hn-app-neurosky/";
          break;
      }
    }
    sessionStorage.setItem("appType", type);

    var ageStr = "";
    for (i=0; i<age.length; i++){
      if (i !== 0) {
        ageStr += i18next.t("comma");
      }
      ageStr += i18next.t(["candidateFilter:age.options.", age[i], "s"].join(""));
    }
    $("#targetAge").html(ageStr);

    var sexStr = "";
    for (i=0; i<sex.length; i++){
      if (i !== 0) {
        sexStr += i18next.t("comma");
      }
      switch (sex[i]) {
        case "1":
          sexStr += i18next.t("candidateFilter:gender.options.male");
          break;
        case "2":
          sexStr += i18next.t("candidateFilter:gender.options.female");
          break;
      }
    }
    $("#targetSex").html(sexStr);

    var areaStr = "";
    for (i=0; i<area.length; i++){
      if (i !== 0) {
        areaStr += ",";
      }
      //$(':checkbox[name="inputArea"][value=' + area[i] + ']').prop('checked',true);
      areaStr += area[i];
    }
    $("#targetArea").html(Common.translateLocations(areaStr));

    $("#targetData,#targetAttribute").attr("data-i18n", typeStr).localize();
    $("#targetOffer").attr("data-i18n", offerStr).localize();

    // 依頼内容
    // タイトル
    $("#iMassageTitle").val(filtered[0].Title);
    // イメージ画像
    var imgUrl = bodyarr.ImgUrl;
    if (imgUrl === null) {
      $("#imgName")
          .attr("data-i18n", "noImageAvailable")
          .localize();
      $("#imgPreview").css("display","none");
    } else {
      var imgNm = rs.getName(imgUrl);
      $("#imgName").html(imgNm);
      $("#imgPreview").attr("src",imgUrl);
    }
    // 本文
    $("#iBody").val(bodyarr.Body);
    // 利用目的
    $("#iPurpose").val(bodyarr.Text);

    for (i=filtered.length - 1; i>-1; i--){
      var seq = 0;
      for (j=0; j<arr.length; j++){
        if ( filtered[i]['Title'] == arr[j]['Title'] ){
          str = arr[j]['To'];
          seq = seq + str.split('https').length - 1;
        }
      }
      $("#acceptCount").append(seq);
      sessionStorage.setItem("SearchSeq", seq);
      var userCellUrl = sessionStorage.getItem("ISCellUrl");
      rs.dispUserName(userCellUrl);
    };
  });

  $('#resultPanel').css("display", "none");
  $('#searchResult').empty();
  $('#resultData').empty();
  Common.getTargetToken('https://demo.personium.io/hn-ll/').done(function(data) {
    sessionStorage.setItem("ISExtToken", data.access_token);
    $(document.body).css("cursor", "wait");
    rs.getSearchUserInfo(data.access_token).done(function(res) {
      console.log(res);
      var results = res.d.results;
      rs.getReceivedMessageAPI().done(function(msgs) {
        var cnt = msgs.d.__count;
        var msg = msgs.d.results;
        var dispFlag = false;
        var acceptCnt = 0;
        var rejectCnt = 0;
        if (cnt > 0) {
          for (var i in results) {
            console.log(results[i].CellURL);
            var cellUrl = results[i].CellURL + '/';
            var newLine = msg.filter(function(item, index) {
              if (item.From === cellUrl) return true;
            });
            if (newLine.length > 0) {
              var pLine = newLine.filter(function(item, index) {
                if ((item.Body.indexOf("承認") >= 0) || (item.Body.indexOf("approved") >= 0)) return true;
              });
              var nLine = newLine.filter(function(item, index) {
                if ((item.Body.indexOf("キャンセル") >= 0) || (item.Body.indexOf("canceled") >= 0)) return true;
              });
              // 0:対象外 1:承認 2:キャンセル
              var statusType = 0;
              if (pLine.length > 0 && nLine.length > 0) {
                var pNewTime = pLine[pLine.length - 1].__updated;
                var nNewTime = nLine[nLine.length - 1].__updated;
                if (pNewTime > nNewTime) {
                  statusType = 1;
                } else {
                  statusType = 2;
                }
              } else if (pLine.length > 0) {
                statusType = 1;
              } else if (nLine.length > 0) {
                statusType = 2;
              }
              if (statusType == 1) {
                var pNewTime = pLine[pLine.length - 1].__updated;
                acceptCnt = acceptCnt + 1;
                var searchData = [];

                // リスト追加
                var extToken = data.access_token;
                var userInfo = rs.getUserInfo(extToken, cellUrl).done(function(userInfo) {
                });
                var acceptDate = rs.getRecievedMessageAPI(cellUrl).done(function(acceptDate) {
                });
                $.when( userInfo, acceptDate ).done(function ( userInfo, acceptDate ) {
                  console.log(userInfo);
                  var arr = {};
                  arr['No'] = $("#searchResult").children().length + 1;
                  arr['Address'] = Common.japanese2EnglishLocation(userInfo[0].d.results[0].Address);
                  arr['CellURL'] = userInfo[0].d.results[0].CellURL + '/';
                  console.log(arr.CellURL);
                  if (userInfo[0].d.results[0].Sex == 1 ){
                    var sex = "candidateFilter:gender.options.male";
                  } else {
                    var sex = "candidateFilter:gender.options.female";
                  }
                  arr['Sex'] = sex;
                  var birthday = userInfo[0].d.results[0].Birthday;
                  var today = new Date();
                  today = today.getFullYear()*10000+today.getMonth()*100+100+today.getDate();
                  birthday = parseInt(birthday.replace(/-/g,''));
                  arr['Age'] = Math.floor((today-birthday)/10000);

                  var ts = parseInt(acceptDate[0].d.results[0].__published.replace("/Date(","").replace(")/",""));
                  var d = new Date(ts);
                  var year  = d.getFullYear();
                  var month = toDoubleDigits(d.getMonth() + 1);
                  var day  = toDoubleDigits(d.getDate());
                  var hour = toDoubleDigits(d.getHours());
                  var minutes = toDoubleDigits(d.getMinutes());
                  date = year + '/' + month + '/' + day + ' ' + hour + ':' + minutes;
                  arr['AcceptDate'] = date;
                  var arrNo = ("00" + arr.No).slice(-3);
                  var html = '<tr>';
                  html += '<td><a href="#detail' + arrNo + '" class="switch-trigger">' + arrNo + '</a></td>';
                  html += '<td data-i18n="' + arr.Sex + '">' + '</td>';
                  html += '<td>' + arr.Age + '</td>';
                  html += '<td>' + arr.Address + '</td>';
                  html += '<td>' + arr.AcceptDate + '</td>';
                  html += '</tr>';
                  $('#searchResult')
                    .append(html)
                    .localize();
                  rs.createDispImage(arr.CellURL, arrNo);
                });
                var toDoubleDigits = function(num) {
                  num += "";
                  if (num.length === 1) {
                    num = "0" + num;
                  }
                 return num;
                };
                dispFlag = true;
              } else if (statusType == 2) {
                  rejectCnt = rejectCnt + 1;
              }
            }
          }
        }
        var candidateCount = sessionStorage.getItem("SearchSeq");
        $('#issue,#targetCnt').text(candidateCount);
        $('#resultText')
            .attr("data-i18n", "candidateFilter:searchResult")
            .localize({
                count: parseInt(candidateCount)
            }); // convert to integer explicitly to make use of the pluralize function
        $('#accept').text(acceptCnt);
        $('#reject').text(rejectCnt);
        $('#pending').text(parseInt(candidateCount) - (acceptCnt + rejectCnt));
        if (!dispFlag) {
          $('#searchResult').empty();
          var html = '<tr><td colspan=5><label data-i18n="msg.error.failedToReceiveApproval"></label></td></tr>';
          $('#searchResult')
            .append(html)
            .localize();
        }
      });
      $('#resultPanel').css("display", "block");
    }).fail(function(data) {
        Common.displayMessageByKey("candidateFilter:msg.error.noSearchPermission");
    }).always(function() {
      $(document.body).css("cursor", "auto");
    });
  });

  var toDoubleDigits = function(num) {
    num += "";
    if (num.length === 1) {
      num = "0" + num;
    }
   return num;
  };
};

rs.dispUserName = function(userCellUrl) {
    rs.getProfile(userCellUrl).done(function(prof) {
        var html = '<img src=' + prof.Image + '></img>' + prof.DisplayName;
        $('#loginUserName').html(html);
    });
};

rs.createDispImage = function(cellUrl, no) {
  var id = "detail" + no;
  var html = '<div id="' + id + '" class="switch-pages" style="display:none;">';
  html += '<div class="bread">';
  html += '<a href="#list-view" class="switch-trigger" data-i18n="glossary:listOfApproved"></a>';
  html += '<span>＞</span><span data-i18n="glossary:dataItem" data-i18n-options=\'{ "value": "' + no +'" }\'></span>';
  html += '</div></div>';
  $('#resultData')
    .append(html)
    .localize();
  Common.getTargetToken(cellUrl).done(function(extData) {
    // BoxURL 取得
    Common.getTargetBoxURL(cellUrl, extData.access_token, rs.appCellUrl, function(boxUrl) {
      rs.getShokujiImageAPI(boxUrl, extData.access_token).done(function(data) {
        var dataList = data.d.results;
        html = "";
        var nowDate = "";
        for (var i in dataList) {
            var imageSrc = dataList[i].photo;
            var imageName = "";
            if (imageSrc) {
                imageName = imageSrc.match(".+/(.+?)([\?#;].*)?$")[1];
            }
            var shokujiDate = dataList[i].shokuji_date;
            var dateId = shokujiDate.replace(/\/|\-/g, "");
            var shokujiTime = dataList[i].time;
            var timeId = shokujiTime.replace(/:/g, "");
            var dispTimeS = shokujiTime.split(':');
            var dispTime = dispTimeS[0] + ":" + dispTimeS[1];
            var noId = dataList[i].no;
  
            var html = '';
            if (nowDate !== shokujiDate) {
                nowDate = shokujiDate;
                html = '<section class="meal-section"><h4>' + nowDate.replace(/\/|\-/g, ".") + '</h4><div class="daily-meal" id="td' + no + dateId + '"></div></section>';
  
                $('#' + id).append(html);
            }
  
            html = '<div class="meal">';
            html += '<div class="picture">';
            html += '<img id="im' + no + dateId + timeId + noId + '" alt="食べ物">';
            html += '</div>';
            html += '<div class="time">' + dispTime + '</div>';
            var comm = dataList[i].shokuji_comment;
            if (!comm) {
                comm = "";
            }
            html += '<div class="comment">' + comm + '</div>';
            html += '</div>';
  
            $("#td" + no + dateId).append(html);
            rs.setPhoto(boxUrl, extData.access_token, no, dateId, timeId, noId, imageName);
        }
      }).fail(function(data) {
        html = '<section class="meal-section">';
        html += '<h4 data-i18n="msg.error.dataNotFound"></h4>';
        html += '</section>';
        $('#' + id)
          .append(html)
          .localize();
      });
    });
  }).fail(function(extData) {
    html = '<section class="meal-section">';
    html += '<h4 data-i18n="msg.error.failedToRetrieveData"></h4>';
    html += '</section>';
    $('#' + id)
      .append(html)
      .localize();
  });
};

rs.setPhoto = function(boxUrl, extToken, arrNo, dateId, timeId, noId, imageName) {
    var ext = imageName.split('.')[1];
    var contentType = "image/jpeg";
    switch (ext) {
        case "png":
            contentType = "image/png";
            break;
        case "gif":
            contentType = "image/gif";
            break;
    }
    var filePath = boxUrl + 'Images/' + imageName;
    var oReq = new XMLHttpRequest();
    oReq.open("GET", filePath);
    oReq.responseType = "blob";
    oReq.setRequestHeader("Content-Type", contentType);
    oReq.setRequestHeader("Authorization", "Bearer " + extToken);
    oReq.onload = function(response) {
        var blob = oReq.response;
        var file = new File([blob], imageName);
        try {
            var reader = new FileReader();
        } catch (e) {
            return;
        }

        reader.onload = function(event) {
            $("#im" + arrNo + dateId + timeId + noId).attr('src',event.target.result);
        }
        reader.readAsDataURL(file, "UTF-8");
    }
    oReq.send();
};

rs.getProfile = function(url) {
  return $.ajax({
    type: "GET",
    url: url + '__/profile.json',
    dataType: 'json',
    headers: {'Accept':'application/json'}
  })
};

rs.getSearchUserInfo = function(extToken) {

//var data = $('#inputData').val();
var data = sessionStorage.getItem("appType");
console.log(data);

  switch (data) {
    case "1":
    //var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/genkikun-users-info/DemoData?$inlinecount=allpages&$top=0&$filter=MealPhotoFlag+eq+true';
    var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/OData/User?$top=10000&$filter=substringof(%27hn-app-genki%27,Services)';
    break;
    case "2":
    var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/OData/User?$top=10000&$filter=substringof(%27hn-app-neurosky%27,Services)';
    break;
  }
  console.log(url);

  return $.ajax({
    type: "GET",
    url: url,
    headers: {
      'Authorization':'Bearer ' + extToken,
      'Accept':'application/json'
    }
  });
};

rs.getUserInfo = function(extToken, cellUrl) {
  var filter = "";

  //var data = $('#inputData').val();
  var data = sessionStorage.getItem("appType");
  if (data > 0) {
    sessionStorage.setItem("appType", data);
  }

  var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/OData/User?$top=10000&$filter=CellURL+eq+\'' + cellUrl.substr( 0, cellUrl.length-1 ) + '\'';

  return $.ajax({
    type: "GET",
    url: url,
    headers: {
      'Authorization':'Bearer ' + extToken,
      'Accept':'application/json'
    }
  });
};

rs.getReceivedMessageAPI = function() {
  return $.ajax({
    type: "GET",
    url: Common.cellUrl + '__ctl/ReceivedMessage?&$inlinecount=allpages&$filter=InReplyTo%20eq%20%27' + sessionStorage.getItem("RQmessageId") + '%27',
    headers: {
      'Authorization':'Bearer ' + Common.token,
      'Accept':'application/json'
    }
  });
};

rs.getSentMessageAPI = function(){
  return $.ajax({
    type: "GET",
    url: Common.cellUrl + '__ctl/SentMessage?$inlinecount=allpages&$top=10000&$filter=__id%20eq%20%27' + sessionStorage.getItem("RQmessageId") + '%27',
    headers: {
      'Authorization':'Bearer ' + Common.token,
      'Accept':'application/json'
    }
  });
}

rs.getRecievedMessageAPI = function(){
  return $.ajax({
    type: "GET",
    url: Common.cellUrl + '__ctl/SentMessage?$inlinecount=allpages&$top=10000&$filter=__id%20eq%20%27' + sessionStorage.getItem("RQmessageId") + '%27&$filter=From%20eq%20%27' + +'%27',
    headers: {
      'Authorization':'Bearer ' + Common.token,
      'Accept':'application/json'
    }
  });
}

rs.getShokujiImageAPI = function(boxUrl, extToken) {
  return $.ajax({
    type: "GET",
    dataType: "json",
    url: boxUrl + "GenkiKunData/shokuji_info?$top=10000&$orderby=shokuji_date%20desc,time%20asc",
    headers: {
        'Authorization':'Bearer ' + extToken,
        'Accept':'application/json'
    }
  });
};

rs.calculateAge = function(birthday){
  var today=new Date();
  today=today.getFullYear()*10000+today.getMonth()*100+100+today.getDate();
  birthday=parseInt(birthday.replace(/-/g,''));
  return(Math.floor((today-birthday)/10000));
}
