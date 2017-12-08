var sm = {};
sm.notImage = "https://demo.personium.io/HomeApplication/__/icons/no_app_image.png";
sm.imgBinaryFile = null;
sendCount = 0;

additionalCallback = function() {
    // display the candidate search result and prepare information of the recipient 

    $(function () {
        var filter = "";
        // initialization of image file
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

        var urlPre = 'https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/OData/User?$inlinecount=allpages&$top=10000&$filter=substringof(%27';
        var cellName;
        var urlSuff = '%27,Services)';
        switch (type) {
        case "1":
            cellName = 'hn-app-genki';
            fillInSurveyCalorieSmile();
            break;
        case "2":
            cellName = 'hn-app-neurosky';
            fillInSurveyLifeBeat();
            break;
        default:
            cellName = 'hn-app-genki';
            fillInSurveyCalorieSmile();
            break;
        }

        var url = [urlPre, cellName, urlSuff].join("");

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

        filter = "(";
        for (var i in ages) {
          var age = ages[i];
          if (i > 0) {
            filter += "+or+";
          }
          if (age < 100) {
            filter += "(Birthday+ge+%27" + stBirths[i] + "%27+and+Birthday+le+%27" + enBirths[i] + "%27)";
          } else {
            filter += "(Birthday+le+%27" + enBirths[i] + "%27)";
          }
        }

        filter += ")+and+(";
        for (var i in sexs) {
          var sex = sexs[i];
          if (i > 0) {
            filter += "+or+";
          }
          filter += "(Sex+eq+" + sex + ")";
        }

        filter += ")+and+(";
        for (var i in areas) {
          var area = areas[i];
          if (i > 0) {
              filter += "+or+";
          }
          filter += "(substringof%28%27" + area + "%27,Address%29)";
        }
        filter += ")";

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

          sendCount = response.d.results.length;
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
              imgFilePath = Common.boxUrl + "AttachImage/" + nowYear + nowMonth + nowDay + "_" + file.name;
              putImageFile(imgFilePath, file.name, file).done(function(response) {
                  console.log(response);
                  sendMessage(imgFilePath);
              }).fail(function(response) {
                  console.log(response);
                  alert(i18next.t("msg.error.failedToSendMessage"));
              });
              //testPhotoSave();
          } else {
              sendMessage(null);
              sessionStorage.setItem("ImageFileName", null);
          }
        });

        function fillInSurveyCalorieSmile() {
            $("#iMassageTitle").attr("value", i18next.t("glossary:survey.title.calorieSmile"));
            $("#iMassageBody").val(i18next.t("glossary:survey.messageBody.value.calorieSmile"));
            $("#iPurpose")
                .attr("data-i18n", "[placeholder]glossary:survey.purpose.placeholder.storeB")
                .val(i18next.t("glossary:survey.purpose.value.default"))
                .localize();
            $("#targetItem")
                .attr("data-i18n", "glossary:pdsCalorieSmile")
                .localize();
            $("#targetData")
                .attr("data-i18n", "glossary:survey.targetData.calorieSmile")
                .localize();
        };

        function fillInSurveyLifeBeat() {
            $("#iMassageTitle").attr("value", i18next.t("glossary:survey.title.lifeBeat"));
            $("#iMassageBody").val(i18next.t("glossary:survey.messageBody.value.lifeBeat"));
            $("#iPurpose")
                .attr("data-i18n","[placeholder]glossary:survey.purpose.placeholder.hospitalC")
                .val(i18next.t("glossary:survey.purpose.value.default"))
                .localize();
            $("#targetItem")
                .attr("data-i18n", "glossary:pdsLifeBeat")
                .localize();
            $("#targetData")
                .attr("data-i18n", "glossary:survey.targetData.lifeBeat")
                .localize();
        };

        function sendMessage(imgFilePath) {
          cellUrl = Common.cellUrl;
          sendMessageUrl = cellUrl + "__message/send";
          sendTo = sessionStorage.getItem("SendToCell");
          token = Common.token;
          var type = sessionStorage.getItem("SearchData");
          var name = "ShokujiViewer";
          var appCellUrl = "https://demo.personium.io/hn-app-genki/"
          if (type !== "1") {
            name = "StressViewer";
            appCellUrl = "https://demo.personium.io/hn-app-neurosky/";
          }

          var messageBody = {};
          messageBody.BoxBound = false; // hot fixes
          messageBody.To = sendTo;
          messageBody.Type = "req.relation.build";
          messageBody.RequestRelation = appCellUrl + "__relation/__/" + name;
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
          location.href = "./previewSendMessage.html";

        };

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
        };
    });
}

