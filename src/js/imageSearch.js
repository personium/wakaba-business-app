var is = {};

additionalCallback = function() {
  var appUrlMatch = location.href.split("#");
  var appUrlSplit = appUrlMatch[0].split("/");
  is.appUrl = appUrlSplit[0] + "//" + appUrlSplit[2] + "/" + appUrlSplit[3] + "/";
  if (appUrlSplit[0].indexOf("file:") == 0) {
    is.appUrl = "https://demo.personium.io/hn-ll-app/";
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
      is.boxName = split[split.length - 1];
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

  if (Common.checkParam()) {
    if (sessionStorage.getItem("SearchData") != null) {
      $('#inputData').val(sessionStorage.getItem("SearchData"));
    }
    if (sessionStorage.getItem("SearchAge") != null) {
      var ages = sessionStorage.getItem("SearchAge").split(",");
      $("input[name='inputAge']").val(ages);
    } else {
      is.allCheckAge();
    }
    if (sessionStorage.getItem("SearchSex") != null) {
      var sexs = sessionStorage.getItem("SearchSex").split(",");
      $("input[name='inputSex']").val(sexs);
    } else {
      is.allCheckSex();
    }
    if (sessionStorage.getItem("SearchArea") != null) {
      var areas = sessionStorage.getItem("SearchArea").split(",");
      $("input[name='inputArea']").val(areas);
    } else {
      is.allCheckArea();
    }
  }

  Common.setIdleTime();

  //Initial rendering
  Common.getTargetToken('https://demo.personium.io/hn-ll/').done(function(data) {
    sessionStorage.setItem("ISExtToken", data.access_token);
    $(document.body).css("cursor", "wait");
    is.getDefaultSearchUserInfo(data.access_token).done(function(res) {
      var cnt = res.d.__count;
      if (cnt > 10) {
          is.displaySearchResult(cnt);
          $('#exeSend').hide();
      } else if (cnt > 0) {
          is.displaySearchResultFew();
      } else {
          is.displaySearchResultNone();
      }
      $('#resultPanel').css("display", "block");
      $('#errorMsg').hide();
    }).fail(function(data) {
      Common.displayMessageByKey("candidateFilter:msg.error.noSearchPermission");
    }).always(function() {
        $(document.body).css("cursor", "auto");
        Common.dispUserName(Common.cellUrl);
    });
  });

  $('#exeSearch').on('click', function () {
    if (is.checkSearchParam()) {
        $('#resultPanel').css("display", "none");
        Common.getTargetToken('https://demo.personium.io/hn-ll/').done(function(data) {
          sessionStorage.setItem("ISExtToken", data.access_token);
          $(document.body).css("cursor", "wait");
          is.getSearchUserInfo(data.access_token).done(function(res) {
            var cnt = res.d.__count;
            if (cnt > 10) {
              is.displaySearchResult(cnt);
              $('#exeSend').show();
            } else if (cnt > 0) {
                is.displaySearchResultFew();
            } else {
                is.displaySearchResultNone();
            }
            $('#resultPanel').css("display", "block");
            $('#errorMsg').hide();
          }).fail(function(data) {
            Common.displayMessageByKey("candidateFilter:msg.error.noSearchPermission");
          }).always(function() {
            $(document.body).css("cursor", "auto");
          });
        });
    }
  });

  $('#exeReset').on('click', function () {
    $('#inputData').val(1);
    is.relAllCheckAge();
    is.relAllCheckSex();
    is.relAllCheckArea();
    Common.getTargetToken('https://demo.personium.io/hn-ll/').done(function(data) {
      sessionStorage.setItem("ISExtToken", data.access_token);
      $(document.body).css("cursor", "wait");
      is.getDefaultSearchUserInfo(data.access_token).done(function(res) {
        var cnt = res.d.__count;
        if (cnt > 10) {
            is.displaySearchResult(cnt);
            $('#exeSend').hide();
        } else if (cnt > 0) {
            is.displaySearchResultFew();
        } else {
            is.displaySearchResultNone();
        }
        $('#resultPanel').css("display", "block");
        $('#errorMsg').hide();
      }).fail(function(data) {
        Common.displayMessageByKey("candidateFilter:msg.error.noSearchPermission");
      }).always(function() {
        $(document.body).css("cursor", "auto");
      });
    });
  });

  $('#exeSend').on('click', function () {
    location.href = "./sendMessage.html";
  });
};

is.allCheckAge = function() {
    $("input[name='inputAge']").prop('checked', true);
};

is.relAllCheckAge = function() {
    $("input[name='inputAge']").prop('checked', false);
};

is.allCheckArea = function() {
    $("input[name='inputArea']").prop('checked', true);
};

is.relAllCheckArea = function() {
    $("input[name='inputArea']").prop('checked', false);
};

is.allCheckSex = function() {
    $("input[name='inputSex']").prop('checked', true);
};

is.relAllCheckSex = function() {
    $("input[name='inputSex']").prop('checked', false);
};

is.checkSearchParam = function() {
    if ($('.inputAge :checked').length <= 0) {
        Common.displayMessageByKey("candidateFilter:msg.info.specifyAge");
        $('#exeSend').hide();
        return false;
    }
    if ($('.inputSex :checked').length <= 0) {
        Common.displayMessageByKey("candidateFilter:msg.info.specifyGender");
        $('#exeSend').hide();
        return false;
    }
    if ($('.inputArea :checked').length <= 0) {
        Common.displayMessageByKey("candidateFilter:msg.info.specifyLocation");
        $('#exeSend').hide();
        return false;
    }

    return true;
};

is.getSearchUserInfo = function(extToken) {
  var filter = "";

  var data = $('#inputData').val();
  if (data > 0) {
    sessionStorage.setItem("SearchData", data);
  }

  var ages = "";
  var stBirths = "";
  var enBirths = "";
  var checkAges = $('.inputAge :checked').map(function() {
      return $(this).val();
  }).get();
  filter = "(";
  for (var i in checkAges) {
      var age = checkAges[i];
      ages +=  age + ",";

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

      stBirths += stBirth + ",";
      enBirths += enBirth + ",";

      if (i > 0) {
        filter += "+or+";
      }
      if (age < 100) {
        filter += "(Birthday+ge+%27" + stBirth + "%27+and+Birthday+le+%27" + enBirth + "%27)";
      } else {
        filter += "(Birthday+le+%27" + enBirth + "%27)";
      }
  }
  ages = ages.substr(0,ages.length-1);
  stBirths = stBirths.substr(0,stBirths.length-1);
  enBirths = enBirths.substr(0,enBirths.length-1);
  sessionStorage.setItem("SearchAge", ages);
  sessionStorage.setItem("SearchStBirth", stBirths);
  sessionStorage.setItem("SearchEnBirth", enBirths);

  var sexs = "";
  var checkSexs = $('.inputSex :checked').map(function() {
      return $(this).val();
  }).get();
  filter += ")+and+(";
  for (var i in checkSexs) {
      var sex = checkSexs[i];
      sexs +=  sex + ",";
      if (i > 0) {
        filter += "+or+";
      }
      filter += "(Sex+eq+" + sex + ")";
  }
  sexs = sexs.substr(0,sexs.length-1);
  sessionStorage.setItem("SearchSex", sexs);

  var areas = "";
  var checkAreas = $('.inputArea :checked').map(function() {
      return $(this).val();
  }).get();
  filter += ")+and+(";
  for (var i in checkAreas) {
      var area = checkAreas[i];
      areas +=  area + ",";
      if (i > 0) {
          filter += "+or+";
      }
      filter += "(substringof%28%27" + area + "%27,Address%29)";
  }
  filter += ")";
  areas = areas.substr(0,areas.length-1);
  sessionStorage.setItem("SearchArea", areas);

  switch (data) {
    case "1":
    var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/OData/User?$inlinecount=allpages&$top=0&$filter=substringof(%27hn-app-genki%27,Services)';
    //var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/genkikun-users-info/DemoData?$inlinecount=allpages&$top=10000&$filter=MealPhotoFlag+eq+true';
    break;
    case "2":
    var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/OData/User?$inlinecount=allpages&$top=0&$filter=substringof(%27hn-app-neurosky%27,Services)';
    break;
  }

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

is.getDefaultSearchUserInfo = function(extToken) {
  var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/OData/User?$inlinecount=allpages&$top=0';
  //var url = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/genkikun-users-info/DemoData?$inlinecount=allpages&$top=10000&$filter=MealPhotoFlag+eq+true';
  return $.ajax({
    type: "GET",
    url: url,
    headers: {
      'Authorization':'Bearer ' + extToken,
      'Accept':'application/json'
    }
  });
};

is.displaySearchResult = function(candidateCount) {
    $('#searchResult').html(candidateCount);
    $('#resultText')
        .attr("data-i18n", "candidateFilter:searchResult")
        .localize({
            count: parseInt(candidateCount)
        })
        .show(); // convert to integer explicitly to make use of the pluralize function
};

is.displaySearchResultFew = function() {
    $('#searchResult')
        .attr("data-i18n", "candidateFilter:searchResult_few")
        .localize();
    $('#resultText').hide();

    $('#exeSend').hide();
};

is.displaySearchResultNone = function() {
    $('#searchResult')
        .attr("data-i18n", "candidateFilter:searchResult_none")
        .localize();
    $('#resultText').hide();

    $('#exeSend').hide();
};
