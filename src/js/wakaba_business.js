var Common = {};
const APP_BOX_NAME = 'io_personium_demo_hn-ll-app';

$(document).ready(function() {
    i18next
    .use(i18nextXHRBackend)
    .use(i18nextBrowserLanguageDetector)
    .init({
        preload: ['ja'],
        fallbackLng: 'en',
        ns: ['common', 'glossary', 'candidateFilter'],
        defaultNS: 'common',
        debug: true,
        backend: {
            // load from i18next-gitbook repo
            loadPath: './locales/{{lng}}/{{ns}}.json',
            crossDomain: true
        }
    }, function(err, t) {
        initJqueryI18next();

        Common.setAppCellUrl();

        Common.setAccessData();

        if (!Common.checkParam()) {
            return;
        }
        
        Common.startOAuth2(function() {
            Common.getBoxUrlAPI().done(function(data, textStatus, request) {
                let tempInfo = {
                    data: data,
                    request: request,
                    targetCellUrl: Common.cellUrl
                };
                let boxUrl = Common.getBoxUrlFromResponse(tempInfo);
                console.log(boxUrl);
                Common.boxUrl = Common.preparePersoniumUrl(boxUrl);
                if ((typeof additionalCallback !== "undefined") && $.isFunction(additionalCallback)) {
                    additionalCallback();
                }
            }).fail(function(error) {
                console.log(error.responseJSON.code);
                console.log(error.responseJSON.message.value);
            })
        });
        
        updateContent();
    });
});

/*
 * Need to move to a function to avoid conflicting with the i18nextBrowserLanguageDetector initialization.
 */
function initJqueryI18next() {
    // for options see
    // https://github.com/i18next/jquery-i18next#initialize-the-plugin
    jqueryI18next.init(i18next, $, {
        useOptionsAttr: true
    });
}

/*
 * Currently the REST API does not support CORS.
 * Therefore, for CORS case, the default Box name is used.
 */
Common.getBoxUrlFromResponse = function(info) {
    let urlFromHeader = info.request.getResponseHeader("Location");
    let urlFromBody = info.data.Url;
    let boxUrl = urlFromHeader || urlFromBody;
    
    return boxUrl;
};

Common.setAppCellUrl = function() {
    var appUrlSplit = _.first(location.href.split("#")).split("/");

    if (_.contains(appUrlSplit, "localhost") || _.contains(appUrlSplit, "file:")) {
        Common.appUrl = APP_URL; // APP_URL must be defined by each App
    } else {
        Common.appUrl = _.first(appUrlSplit, 4).join("/") + "/"; 
    }

    return;
};

Common.setAccessData = function() {
    var hash = location.hash.substring(1);
    var params = hash.split("&");
    for (var i in params) {
      var param = params[i].split("=");
      var id = param[0];
      switch (id) {
        case "cell":
            Common.cellUrl = param[1]; 
            sessionStorage.setItem("ISCellUrl", Common.cellUrl);
            break;
        case "refresh_token":
            Common.refToken = param[1];
            sessionStorage.setItem("ISRefToken", param[1]);
            break;
      }
    }
};

Common.getBoxUrlAPI = function(toCellUrl, toAccToken) {
    let cellUrl = toCellUrl;
    if (!cellUrl) {
        cellUrl = Common.cellUrl;
    }
    let token = toAccToken;
    if (!token) {
        token = Common.token;
    }

    return $.ajax({
        type: "GET",
        url: cellUrl + "__box",
        headers: {
            'Authorization':'Bearer ' + token,
            'Accept':'application/json'
        }
    });
};

function updateContent() {
    // start localizing, details:
    // https://github.com/i18next/jquery-i18next#usage-of-selector-function
    $('[data-i18n]').localize();
}

Common.target = sessionStorage.getItem("ISTarget");
Common.cellUrl = sessionStorage.getItem("ISCellUrl");
Common.token = sessionStorage.getItem("ISToken");
Common.refToken = sessionStorage.getItem("ISRefToken");
Common.expires = sessionStorage.getItem("ISExpires");
Common.refExpires = sessionStorage.getItem("ISRefExpires");

Common.IDLE_TIMEOUT =  3600000;
Common.LASTACTIVITY = new Date().getTime();
const APP_URL = "https://demo.personium.io/hn-ll-app/";
getEngineEndPoint = function() {
    return Common.appUrl + "__/src/Engine/getAppAuthToken";
};
getStartOAuth2EngineEndPoint = function() {
    return Common.appUrl + "__/src/Engine/start_oauth2";
};

// Make sure Unit/Cell/Box URL contains ending slash ('/')  
Common.preparePersoniumUrl = function(url) {  
    let tempUrl = url;  
  
    if (url.slice(-1) != '/') {  
        tempUrl = url + '/';  
    }  
  
    return tempUrl;  
};

// This method checks idle time
Common.setIdleTime = function() {
    // Create Session Expired Modal
    Common.appendSessionExpiredDialog();

    setInterval(Common.checkIdleTime, 3300000);
    document.onclick = function() {
      Common.LASTACTIVITY = new Date().getTime();
    };
    document.onmousemove = function() {
      Common.LASTACTIVITY = new Date().getTime();
    };
    document.onkeypress = function() {
      Common.LASTACTIVITY = new Date().getTime();
    };
};

Common.appendSessionExpiredDialog = function() {
    // Session Expiration
    var html = [
        '<div id="modal-session-expired" class="modal fade" role="dialog" data-backdrop="static">',
            '<div class="modal-dialog">',
                '<div class="modal-content">',
                    '<div class="modal-header login-header">',
                        '<h4 class="modal-title">',
                            i18next.t("sessionExpiredDialog.title"),
                        '</h4>',
                    '</div>',
                    '<div class="modal-body">',
                        i18next.t("sessionExpiredDialog.message"),
                    '</div>',
                    '<div class="modal-footer">',
                        '<button type="button" class="btn btn-primary" id="b-session-relogin-ok" >OK</button>',
                    '</div>',
               '</div>',
           '</div>',
        '</div>'
    ].join("");
    var modal = $(html);
    $(document.body).append(modal);
    $('#b-session-relogin-ok').on('click', function() { Common.closeTab(); });
};

/*
 * clean up data and close tab
 */
Common.closeTab = function() {
    window.close();
};

Common.checkIdleTime = function() {
  if (new Date().getTime() > Common.LASTACTIVITY + Common.IDLE_TIMEOUT) {
    $('#modal-session-expired').modal('show');
  } else {
      Common.refreshToken();
  }
};

Common.startOAuth2 = function(callback) {
    let endPoint = getStartOAuth2EngineEndPoint();
    let cellUrl = Common.cellUrl;
    let params = $.param({
        cellUrl: cellUrl
    });
    $.ajax({
        type: "POST",
        xhrFields: {
            withCredentials: true
        },
        url: endPoint + "?" + params,
        headers: {
            'Accept':'application/json'
        }
    }).done(function(appCellToken) {
        // update sessionStorage
        Common.updateSessionStorage(appCellToken);
        if ((typeof callback !== "undefined") && $.isFunction(callback)) {
            callback();
        };
    }).fail(function(error) {
        console.log(error.responseJSON);
        $('#modal-session-expired').modal('show');
    });
}
Common.refreshToken = function(callback) {
    Common.getAppAuthToken(Common.cellUrl, getEngineEndPoint()).done(function(appToken) {
        Common.refreshTokenAPI(appToken.access_token).done(function(data) {
            Common.updateSessionStorage(data);

            if ((typeof callback !== "undefined") && $.isFunction(callback)) {
                callback();
            };
        }).fail(function(data) {
            $('#modal-session-expired').modal('show');
        });
    });
};
Common.updateSessionStorage = function(data) {
    Common.token = data.access_token;
    Common.refToken = data.refresh_token;
    Common.expires = data.expires_in;
    Common.refExpires = data.refresh_token_expires_in;
    sessionStorage.setItem("ISToken", data.access_token);
    sessionStorage.setItem("ISRefToken", data.refresh_token);
    sessionStorage.setItem("ISExpires", data.expires_in);
    sessionStorage.setItem("ISRefExpires", data.refresh_token_expires_in);
}

Common.getTargetBoxURL = function(toCellUrl, toTransAccToken, appCellUrl, callback) {
    let engineEndPoint = appCellUrl + "__/html/Engine/getAppAuthToken";
    Common.getAppAuthToken(toCellUrl, engineEndPoint).done(function(appToken){
        Common.getToAppAuthToken(toCellUrl, toTransAccToken, appCellUrl, appToken.access_token).done(function(toAppAuthToken){
            Common.getBoxUrlAPI(toCellUrl, toAppAuthToken.access_token).done(function(data, textStatus, request) {
                let tempInfo = {
                    data: data,
                    request: request,
                    targetCellUrl: toCellUrl
                };
                let boxUrl = Common.getBoxUrlFromResponse(tempInfo);
                if ((typeof callback !== "undefined") && $.isFunction(callback)) {
                    callback(Common.preparePersoniumUrl(boxUrl));
                };
            })
        })
    })
}

// Get App Authentication Token
Common.getAppAuthToken = function(cellUrl, engineEndPoint) {
    return $.ajax({
        type: "POST",
        url: engineEndPoint,
        data: {
                p_target: cellUrl
        },
        headers: {'Accept':'application/json'}
    });
};

Common.getToAppAuthToken = function(cellUrl, transAccToken, appCellUrl, appCellToken) {
    return $.ajax({
        type: "POST",
        url: cellUrl + "__token",
        data: {
            grant_type: "urn:ietf:params:oauth:grant-type:saml2-bearer",
            assertion: transAccToken,
            client_id: appCellUrl,
            client_secret: appCellToken
        },
        header: {'Accept':'application/json'}
    });
}

Common.refreshTokenAPI = function(appCellToken) {
    return $.ajax({
        type: "POST",
        url: Common.cellUrl + '__token',
        processData: true,
        dataType: 'json',
        data: {
               grant_type: "refresh_token",
               refresh_token: Common.refToken,
               client_id: Common.appUrl,
               client_secret: appCellToken
        },
        headers: {'Accept':'application/json'}
    })
};

Common.getTargetToken = function(extCellUrl) {
  return $.ajax({
                type: "POST",
                url: Common.cellUrl + '__token',
                processData: true,
		dataType: 'json',
                data: {
                        grant_type: "refresh_token",
                        refresh_token: Common.refToken,
                        p_target: extCellUrl
                },
		headers: {'Accept':'application/json'}
         });
};

Common.dispUserName = function(cellUrl) {
    Common.getProfile(cellUrl).done(function(prof) {
        $('img#loginUserIcon').attr({"src":prof.Image});
        $('#loginUserName').html(prof.DisplayName);
    });
};

Common.getProfile = function(url) {
  return $.ajax({
    type: "GET",
    url: url + '__/profile.json',
    dataType: 'json',
    headers: {'Accept':'application/json'}
  })
};

Common.checkParam = function() {
    var msg_key = "";
    if (Common.cellUrl === null) {
        msg_key = "msg.error.targetCellNotSelected";
    }

    if (msg_key.length > 0) {
        Common.displayMessageByKey(msg_key);
        $("#exeSearch").prop('disabled', true);
        return false;
    }

    return true;
};

Common.displayMessageByKey = function(msg_key) {
    if (msg_key) {
        $('#errorMsg').attr("data-i18n", msg_key)
            .localize()
            .show();
    } else {
        $('#errorMsg').hide();
    }
};

/*
 * For demo to display English location since the WebDAV is in Japanese
 */
Common.translateLocations = function(locations) {
    var strList = locations.split(",");
    strList = $.map(strList, function(location){
        return Common.japanese2EnglishLocation(location);
    });

    return strList.join(",");
};

Common.japanese2EnglishLocation = function(location) {
    var str;
    switch (location) {
    case i18next.t("candidateFilter:location.options.area0", { lng: 'ja' }):
        str = i18next.t("candidateFilter:location.options.area0");
        break;
    case i18next.t("candidateFilter:location.options.area1", { lng: 'ja' }):
        str = i18next.t("candidateFilter:location.options.area1");
        break;
    case i18next.t("candidateFilter:location.options.area2", { lng: 'ja' }):
        str = i18next.t("candidateFilter:location.options.area2");
        break;
    case i18next.t("candidateFilter:location.options.area3", { lng: 'ja' }):
        str = i18next.t("candidateFilter:location.options.area3");
        break;
    case i18next.t("candidateFilter:location.options.area4", { lng: 'ja' }):
        str = i18next.t("candidateFilter:location.options.area4");
        break;
    default:
        str = location;
    }

    return str;
};