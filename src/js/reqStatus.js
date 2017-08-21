var rq = {};

rq.getName = function(path) {
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
    rq.appUrl = appUrlSplit[0] + "//" + appUrlSplit[2] + "/" + appUrlSplit[3] + "/";
    if (appUrlSplit[0].indexOf("file:") == 0) {
        rq.appUrl = "https://demo.personium.io/hn-ll-app/";
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
                rq.boxName = split[split.length - 1];
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
    var cellUrl = sessionStorage.getItem("ISCellUrl");
    Common.dispUserName(cellUrl);
    Common.setIdleTime();
});

rq.moveDispImage = function(cellUrl) {
    sessionStorage.setItem("RSImageCellUrl", cellUrl);
    location.href = "./imageView.html";
};

rq.checkAreaLength = function() {
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

rq.getProfile = function(url) {
    return $.ajax({
	type: "GET",
	url: url + '__/profile.json',
	dataType: 'json',
        headers: {'Accept':'application/json'}
    })
};

$(document).ready(function() {
  $.ajax({
    type: "GET",
    dataType: "json",
    url: Common.cellUrl + '__ctl/SentMessage?$inlinecount=allpages&$top=10000',
    headers: {
        'Authorization':'Bearer ' + Common.token,
        'Accept':'application/json'
      }
    }).done(function(response){
      var arr = response.d.results;
/*
      var check1 = {};
      for ( i=0; i<arr.length; i++ ) {
        check1[arr[i]['Title']] = arr[i];
      };
      filtered = [];
      for (var key in check1) {
        filtered.push(check1[key]);
      }
*/
      var listUrl = '<table class="sortable-table" style="width: 100%;"><thead><tr><th class="sortable">状況</th><th>リクエスト名</th><th class="sortable">対象者</th><th class="sortable">発行日</th><th class="sortable">受付終了日</th></tr></thead><tbody>'
//      for (i=filtered.length - 1; i>-1; i--){
      for (i=arr.length - 1; i>-1; i--){
        var sentDate = 0
        var seq = 0;
//        for (j=0; j<arr.length; j++){
//        if ( filtered[i]['Title'] == arr[j]['Title'] ){
            str = arr[i]['To'];
            seq = seq + str.split('https').length - 1;
//          }
//        }
//        var ts = parseInt(filtered[i]['__published'].replace("/Date(","").replace(")/",""));
//        var ts = parseInt(arr[i]['__published'].replace("/Date(","").replace(")/",""));
//        var d = new Date(ts);
//        var year  = d.getFullYear();
//        var month = toDoubleDigits(d.getMonth() + 1);
//        var day  = toDoubleDigits(d.getDate());
//        sentDate = year + '/' + month + '/' + day;
//        listUrl = listUrl +'<tr><td>収集中</td><td><a href="./refSearch.html" onclick="rq.setMessageTitle(this)">' + filtered[i]['Title'] + '</a></td><td>' + seq + '人</td><td>' + sentDate + '</td></tr>'
        var messageTitle = "";
        if ( arr[i]['Title'].length == 0 ){
          messageTitel = "(件名なし)";
        } else {
          messageTitel = arr[i]['Title'];
        }
        var messageId = arr[i]['__id'];
        var body = arr[i]['Body'].replace( /"\"/g ,"" );
        body = body.substr( 1 );
        body = body.substr( 0, body.length-1 );
        var termStart = JSON.parse(body).TermStart;
        var termEnd = JSON.parse(body).TermEnd;
        console.log(messageTitel);
        console.log(messageId);
        listUrl = listUrl +'<tr><td><span class="tag lime">収集中</span></td><td><a href="./refSearch.html" onclick="rq.setMessageTitle(\'' + messageTitel + '\', \'' + messageId + '\')">' + messageTitel + '</a></td><td>' + seq + '人</td><td>' + termStart + '</td><td>' + termEnd + '</td></tr>'
      }
      listUrl = listUrl +'<tr><td><span class="tag">終了</span></td><td>購入嗜好調査への協力のお願い</td><td>20人</td><td>2017/02/10</td><td>2017/04/10</td></tr></tbody></table>'
      $("#messageList").append(listUrl);
    }).fail(function(response){
      console.log(response);
    });

    var toDoubleDigits = function(num) {
      num += "";
      if (num.length === 1) {
        num = "0" + num;
      }
     return num;
    };
});

rq.getReceivedMessageAPI = function() {
  return $.ajax({
                type: "GET",
                //url: Common.cellUrl + '__ctl/ReceivedMessage?$filter=From+eq+%27' + cellUrl + '%27+and+substringof%28%27承認%27,Body%29&$inlinecount=allpages',
                url: Common.cellUrl + '__ctl/ReceivedMessage?&$inlinecount=allpages',
                headers: {
                    'Authorization':'Bearer ' + Common.token,
                    'Accept':'application/json'
                }
  });
};

rq.setMessageTitle = function(messageTitel, messageId) {
    sessionStorage.setItem("RQmessageTitle", messageTitel);
    sessionStorage.setItem("RQmessageId", messageId);
};
