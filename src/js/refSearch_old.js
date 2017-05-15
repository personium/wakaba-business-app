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

$(document).ready(function() {
    var appUrlMatch = location.href.split("#");
    var appUrlSplit = appUrlMatch[0].split("/");
    rs.appUrl = appUrlSplit[0] + "//" + appUrlSplit[2] + "/" + appUrlSplit[3] + "/";
    if (appUrlSplit[0].indexOf("file:") == 0) {
        rs.appUrl = "https://demo.personium.io/hn-ll-app/";
    }

    var hash = location.hash.substring(1);
    var params = hash.split("&");
    for (var i in params) {
        var param = params[i].split("=");
        var id = param[0];
        switch (id) {
            case "target":
                Common.target = param[1];
                sessionStorage.setItem("ISTarget", param[1]);
                var urlSplit = param[1].split("/");
                Common.cellUrl = urlSplit[0] + "//" + urlSplit[2] + "/" + urlSplit[3] + "/";
                sessionStorage.setItem("ISCellUrl", Common.cellUrl);
                var split = Common.target.split("/");
                rs.boxName = split[split.length - 1];
            case "token":
                Common.token = param[1];
                sessionStorage.setItem("ISToken", param[1]);
            case "ref":
                Common.refToken = param[1];
                sessionStorage.setItem("ISRefToken", param[1]);
            case "expires":
                Common.expires = param[1];
                sessionStorage.setItem("ISExpires", param[1]);
            case "refexpires":
                Common.refExpires = param[1];
                sessionStorage.setItem("ISRefExpires", param[1]);
        }
    }

    if (rs.checkParam()) {
       if (sessionStorage.getItem("SearchAge") != null) {
           $('#inputAge').val(sessionStorage.getItem("SearchAge"));
       }
       if (sessionStorage.getItem("SearchSex") != null) {
           $('#inputSex').val(sessionStorage.getItem("SearchSex"));
       }
       if (sessionStorage.getItem("SearchArea") != null) {
           $('#inputArea').val(sessionStorage.getItem("SearchArea"));
       }
    }

    Common.setIdleTime();

    $('#exeSearch').on('click', function () {
        $('#resultPanel').css("display", "none");
        $('#searchResult').empty();
        Common.getTargetToken('https://demo.personium.io/hn-ll/').done(function(data) {
            sessionStorage.setItem("ISExtToken", data.access_token);
            $(document.body).css("cursor", "wait");
            rs.getSearchUserInfo(data.access_token).done(function(res) {
                var results = res.d.results;
                rs.getReceivedMessageAPI().done(function(msgs) {
                    var cnt = msgs.d.__count;
                    var msg = msgs.d.results;
                    var dispFlag = false;
                    var acceptCnt = 0;
                    var rejectCnt = 0;
                    if (cnt > 0) {
                        for (var i in results) {
                            var cellUrl = results[i].CellURL + '/';
                            var newLine = msg.filter(function(item, index) {
                                if (item.From === cellUrl) return true;
                            });
                            if (newLine.length > 0) {
                                var pLine = newLine.filter(function(item, index) {
                                    if (item.Body.indexOf("承認") >= 0) return true;
                                });
                                var nLine = newLine.filter(function(item, index) {
                                    if (item.Body.indexOf("キャンセル") >= 0) return true;
                                });
                                if (pLine.length > 0) {
                                    var pNewTime = pLine[pLine.length - 1].__updated;
                                    acceptCnt = acceptCnt + 1;
                                    if (nLine.length > 0) {
                                        var nNewTime = nLine[nLine.length - 1].__updated;
                                        rejectCnt = rejectCnt + 1;
                                        if (pNewTime > nNewTime) {
                                            rs.dispResult(cellUrl);
                                            dispFlag = true;
                                        }
                                    } else {
                                        rs.dispResult(cellUrl);
                                        dispFlag = true;
                                    }
                                }
                            }
                        }
                    }
                    $('#accept').append(acceptCnt);
                    $('#reject').append(rejectCnt);
                    $('#pending').append(parseInt(sessionStorage.getItem("SearchSeq")) - (acceptCnt + rejectCnt));
                    if (!dispFlag) {
                        var html = '<label>提供に同意されている保持者が見つかりません。</label>';
                        $('#searchResult').append(html);
                    }
                });
                $('#resultPanel').css("display", "block");
            }).fail(function(data) {
                $('#errorMsg').html("検索権限がありません。");
                $('#errorMsg').css("display", "block");
            }).always(function() {
                $(document.body).css("cursor", "auto");
            });
        });
    });

    $('#exeReset').on('click', function () {
       $('#inputAge').val(0);
       $('#inputSex').val(0);
       $('#inputArea').val("");
    });

    //タイトルでフィルタをかけた人数を表示
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
      };
    });

});

rs.dispResult = function(cellUrl) {
    rs.getProfile(cellUrl).done(function(prof) {
        var html = '<tr><td width="20%" align="center"><a class="allToggle" href="javascript:void(0)" onClick="rs.moveDispImage(\'' + cellUrl + '\');return false;">' + prof.DisplayName + '</a></td></tr>';
        $('#searchResult').append(html);
    });
};

rs.moveDispImage = function(cellUrl) {
    sessionStorage.setItem("RSImageCellUrl", cellUrl);
    location.href = "./imageView.html";
};

rs.checkParam = function() {
    var msg = "";
    if (Common.target === null) {
        msg = '対象セルが設定されていません。';
    } else if (Common.token === null) {
        msg = 'トークンが設定されていません。';
    } else if (Common.refToken === null) {
        msg = 'リフレッシュトークンが設定されていません。';
    } else if (Common.expires === null) {
        msg = 'トークンの有効期限が設定されていません。';
    } else if (Common.refExpires === null) {
        msg = 'リフレッシュトークンの有効期限が設定されていません。';
    }

    if (msg.length > 0) {
        $('#errorMsg').html(msg);
        $('#errorMsg').css("display", "block");
        $("#exeSearch").prop('disabled', true);
        return false;
    }

    return true;
};

rs.checkAreaLength = function() {
    var area = $('#inputArea').val();
    if (area.length === 1) {
        $("#exeSearch").prop('disabled', true);
        $('#errorMsg').html("地域の条件には2文字以上の文字を入力して下さい。");
        $('#errorMsg').css("display", "block");
    } else {
        $("#exeSearch").prop('disabled', false);
        $('#errorMsg').css("display", "none");
    }
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
    var filter = "";

    var age = $('#inputAge').val();
    var sex = $('#inputSex').val();
    var area = $('#inputArea').val();
    if (age > 0) {
        sessionStorage.setItem("SearchAge", age);

        var nowDate = new Date();
        var nowYear = nowDate.getFullYear();
        var enYear = nowYear - age;
        var enMonth = nowDate.getMonth() + 1;
        enMonth = ("0" + enMonth).slice(-2);
        var enDay = ("0" + nowDate.getDate()).slice(-2);

        var enBirth = enYear + "-" + enMonth + "-" + enDay;
        var stDate = new Date(enYear, nowDate.getMonth(), nowDate.getDate());
        stDate.setFullYear(stDate.getFullYear() - 10);
        stDate.setDate(stDate.getDate() + 1);
        var stMonth = stDate.getMonth() + 1;
        stMonth = ("0" + stMonth).slice(-2);
        var stDay = ("0" + stDate.getDate()).slice(-2);
        var stBirth = stDate.getFullYear() + "-" + stMonth + "-" + stDay;

        sessionStorage.setItem("SearchStBirth", stBirth);
        sessionStorage.setItem("SearchEnBirth", enBirth);

        if (age < 100) {
            filter = "Birth+ge+%27" + stBirth + "%27+and+Birth+le+%27" + enBirth + "%27";
        } else {
            filter = "Birth+le+%27" + enBirth + "%27";
        }
    } else {
        sessionStorage.removeItem("SearchAge");
        sessionStorage.removeItem("SearchStBirth");
        sessionStorage.removeItem("SearchEnBirth");
    }
    if (sex !== "0") {
        sessionStorage.setItem("SearchSex", sex);
        if (filter.length > 0) {
            filter += "+and+";
        }
        filter += "Sex+eq+" + sex;
    } else {
        sessionStorage.removeItem("SearchSex");
        //sessionStorage.setItem("SearchSex", null);
    }
    if (area.length > 0) {
        sessionStorage.setItem("SearchArea", area);
        if (filter.length > 0) {
            filter += "+and+";
        }
        filter += "substringof%28%27" + area + "%27,Address%29";
    } else {
        sessionStorage.removeItem("SearchArea");
        //sessionStorage.setItem("SearchArea", null);
    }

    //var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/genkikun-users-info/DemoData?$inlinecount=allpages&$top=0&$filter=MealPhotoFlag+eq+true';
    var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/genkikun-users-info/DemoData?$top=10000&$filter=MealPhotoFlag+eq+true';
    if (filter.length > 0) {
        url += '+and+' + filter;
    }

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
                //url: Common.cellUrl + '__ctl/ReceivedMessage?$filter=From+eq+%27' + cellUrl + '%27+and+substringof%28%27承認%27,Body%29&$inlinecount=allpages',
//                url: Common.cellUrl + '__ctl/ReceivedMessage?&$inlinecount=allpages',
                url: Common.cellUrl + '__ctl/ReceivedMessage?&$inlinecount=allpages&$filter=Title%20eq%20%27RE%3A%20' + sessionStorage.getItem("RQmessageTitle") + '%27',
                headers: {
                    'Authorization':'Bearer ' + Common.token,
                    'Accept':'application/json'
                }
  });
};

 rs.getSentMessageAPI = function(){
   return $.ajax({
     type: "GET",
     url: Common.cellUrl + '__ctl/SentMessage?$inlinecount=allpages&$top=10000&$filter=Title%20eq%20%27' + sessionStorage.getItem("RQmessageTitle") + '%27',
     headers: {
       'Authorization':'Bearer ' + Common.token,
       'Accept':'application/json'
     }
   });
 }
