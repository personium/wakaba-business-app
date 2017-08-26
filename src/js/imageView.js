var iv = {};

iv.getName = function(path) {
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
    var appUrlMatch = location.href.split("#");
    var appUrlSplit = appUrlMatch[0].split("/");
    iv.appUrl = appUrlSplit[0] + "//" + appUrlSplit[2] + "/" + appUrlSplit[3] + "/";
    if (appUrlSplit[0].indexOf("file:") == 0) {
        iv.appUrl = "https://demo.personium.io/hn-ll-app/";
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
                iv.boxName = split[split.length - 1];
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
    var cellUrl = sessionStorage.getItem("ISCellUrl");
    iv.dispUserName(cellUrl);

    //sessionStorage.setItem("RSImageCellUrl" , "https://demo.personium.io/hn-user-0194/");
    var getImageUrl = sessionStorage.getItem("RSImageCellUrl") + "io_personium_demo_hn-app-genki/GenkiKunData/shokuji_info?$top=10000&$orderby=shokuji_date%20desc,time%20asc";
    var imageUrl = sessionStorage.getItem("RSImageCellUrl") + "io_personium_demo_hn-app-genki/";
    var token = Common.token;
    console.log(token);
    // retrieve image's directory info
    $.ajax({
      type: "GET",
      dataType: "json",
      url: getImageUrl,
      headers: {
          'Authorization':'Bearer ' + token,
          'Accept':'application/json'
      }
    }).done(function(data) {
      console.log(data);
        var dataList = data.d.results;
        var html = "";
        var nowDate = "";

        for (var i in dataList) {
            var imageSrc = dataList[i].photo;
            var imageName = "";
            if (imageSrc) {
                imageName = imageSrc.match(".+/(.+?)([\?#;].*)?$")[1];
            }
            var shokujiDate = dataList[i].shokuji_date;
            var dateId = shokujiDate.replace(/\//g, "");
            var shokujiTime = dataList[i].time;
            var timeId = shokujiTime.replace(/:/g, "");
            var noId = dataList[i].no;
            console.log(shokujiDate);
            console.log(shokujiTime);

            var html = '';
            if (nowDate !== shokujiDate) {
                if (i > 0) {
                    html += '</table><br><br>';
                }

                nowDate = shokujiDate;
                html = '<table border="1" class="photoTable" style="margin-left:auto; margin-right:auto;" id="td' + dateId + '"><tr>';
                html += '<td style="text-align:left" colspan="3">' + nowDate + '</td>';
                html += '</tr><tr>';
                html += '<td style="text-align:left;" data-i18n="glossary:photo"></td>';
                html += '<td style="text-align:left" data-i18n="glossary:date"></td>';
                html += '<td style="text-align:left" data-i18n="glossary:comment"></td>';
                html += '</tr></table>';

                $('#dvMainArea').append(html).localize();
            }

            html = '<tr>';
            html += '<td class="widthImg heightTd" style="text-align:center"><img style="width:100%;" id="im' + dateId + timeId + noId + '" src="' + imageUrl + 'Images/' + imageName + '"></td>';
            html += '<td class="widthImg" style="text-align:left">' + shokujiTime + '</td>';
            html += '<td class="widthComm" style="text-align:left">' + dataList[i].shokuji_comment + '</td>';
            html += '</tr>';

            $("#td" + dateId).append(html);
            //dispPhotoImage(imageName, dateId, timeId)
        }
        $(".thumbnails img").MyThumbnail({
          thumbWidth:  350,
          thumbHeight: 200,
        });
        if (dataList.length > 0) {
            $('#dvMainArea').css("display", "block");
        } else {
            Common.displayMessageByKey("msg.error.dataNotFound");
        }
    }).fail(function(data) {
        Common.displayMessageByKey("msg.error.failedToRetrieveData");
    });
};

iv.dispUserName = function(cellUrl) {
    iv.getProfile(cellUrl).done(function(prof) {
        var html = '<h4><img src=' + prof.Image + ' width="20" height="20" style="margin-right:20px" ></img>' + prof.DisplayName + '</h4>';
        $('#loginUserName').html(html);
    });
};

iv.getProfile = function(url) {
  return $.ajax({
    type: "GET",
    url: url + '__/profile.json',
    dataType: 'json',
    headers: {'Accept':'application/json'}
  })
};
