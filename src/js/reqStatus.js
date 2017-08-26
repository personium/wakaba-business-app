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
        var listUrl = [
            '<table class="sortable-table" style="width: 100%;">',
                '<thead>',
                    '<tr>',
                        '<th class="sortable" data-i18n="glossary:survey.status.title"></th>',
                        '<th data-i18n="glossary:survey.requestName"></th>',
                        '<th class="sortable" data-i18n="glossary:survey.candidate"></th>',
                        '<th class="sortable" data-i18n="glossary:survey.dateOfIssue"></th>',
                        '<th class="sortable" data-i18n="glossary:survey.deadline"></th>',
                    '</tr>',
                '</thead>',
                '<tbody>'
        ].join("");
        for (i=arr.length - 1; i>-1; i--) {
            var sentDate = 0
            var seq = 0;
            str = arr[i]['To'];
            seq = seq + str.split('https').length - 1;
            var messageTitle = "";
            if ( arr[i]['Title'].length == 0 ){
                messageTitel = i18next.t("glossary:survey.title.noTitle");
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
            listUrl = listUrl + [
                '<tr>',
                    '<td><span class="tag lime" data-i18n="glossary:survey.status.collecting"></span></td>',
                    '<td><a href="./refSearch.html" onclick="rq.setMessageTitle(\'' + messageTitel + '\', \'' + messageId + '\')">' + messageTitel + '</a></td>',
                    '<td>' + seq + '</td>',
                    '<td>' + termStart + '</td>',
                    '<td>' + termEnd + '</td>',
                '</tr>'
            ].join("");
        }
        listUrl = listUrl + [
            // dummy data
            '<tr>',
                '<td><span class="tag" data-i18n="glossary:survey.status.finished"></span></td>',
                '<td data-i18n="glossary:survey.title.dummy"></td>',
                '<td>20</td>',
                '<td>2017/02/10</td>',
                '<td>2017/04/10</td>',
            '</tr></tbody></table>'
        ].join("");
        $("#messageList")
            .append(listUrl)
            .localize();
    }).fail(function(response){
        console.log(response);
    });

    // following is not used
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
