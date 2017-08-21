var Common = {};

$(document).ready(function() {
    i18next
    .use(i18nextXHRBackend)
    .use(i18nextBrowserLanguageDetector)
    .init({
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
        
        if ((typeof additionalCallback !== "undefined") && $.isFunction(additionalCallback)) {
            additionalCallback();
        }
        
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

// This method checks idle time
Common.setIdleTime = function() {
    // Create Session Expired Modal
    Common.createSessionExpired();

    Common.appGetTargetToken().done(function(appToken) {
        Common.refreshTokenAPI(appToken.access_token).done(function(data) {
            Common.token = data.access_token;
            Common.refToken = data.refresh_token;
            Common.expires = data.expires_in;
            Common.refExpires = data.refresh_token_expires_in;
            sessionStorage.setItem("ISToken", data.access_token);
            sessionStorage.setItem("ISRefToken", data.refresh_token);
            sessionStorage.setItem("ISExpires", data.expires_in);
            sessionStorage.setItem("ISRefExpires", data.refresh_token_expires_in);
        }).fail(function(data) {
            $('#modal-session-expired').modal('show');
        });
    });

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
}
Common.createSessionExpired = function() {
    html = '<div id="modal-session-expired" class="modal fade" role="dialog" data-backdrop="static">';
    html += '<div class="modal-dialog">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header login-header">';
    html += '<h4 class="modal-title">Session out</h4>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += 'セッションが切れました。アプリを再起動して下さい。';
    html += '</div>';
    html += '<div class="modal-footer">';
    html += '<button type="button" class="btn btn-primary" id="b-session-relogin-ok" >Close</button>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    modal = $(html);
    $(document.body).append(modal);

    // append event
    $('#b-session-relogin-ok').on('click', function () {
        open(location, '_self').close();
    });
};
Common.checkIdleTime = function() {
  if (new Date().getTime() > Common.LASTACTIVITY + Common.IDLE_TIMEOUT) {
    $('#modal-session-expired').modal('show');
  } else {
      Common.refreshToken();
  }
};

Common.refreshToken = function() {
    Common.appGetTargetToken().done(function(appToken) {
        Common.refreshTokenAPI(appToken.access_token).done(function(data) {
            Common.token = data.access_token;
            Common.refToken = data.refresh_token;
            Common.expires = data.expires_in;
            Common.refExpires = data.refresh_token_expires_in;
            sessionStorage.setItem("ISToken", data.access_token);
            sessionStorage.setItem("ISRefToken", data.refresh_token);
            sessionStorage.setItem("ISExpires", data.expires_in);
            sessionStorage.setItem("ISRefExpires", data.refresh_token_expires_in);
        });
    });
};

Common.refreshTokenAPI = function(appCellToken) {
    return $.ajax({
        type: "POST",
        url: Common.cellUrl + '__token',
        processData: true,
        dataType: 'json',
        data: {
               grant_type: "refresh_token",
               refresh_token: Common.refToken,
               client_id: "https://demo.personium.io/hn-ll-app/",
               client_secret: appCellToken
        },
        headers: {'Accept':'application/json'}
    })
};

Common.appGetTargetToken = function() {
  return $.ajax({
                type: "POST",
                url: 'https://demo.personium.io/hn-ll-app/__token',
                processData: true,
		dataType: 'json',
                data: {
                        grant_type: "password",
			username: "tokenAcc",
			password: "personiumtoken",
                        p_target: Common.cellUrl
                },
		headers: {'Accept':'application/json'}
         });
}

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
    if (Common.target === null) {
        msg_key = "msg.error.targetCellNotSelected";
    } else if (Common.token === null) {
        msg_key = "msg.error.tokenMissing";
    } else if (Common.refToken === null) {
        msg_key = "msg.error.refreshTokenMissing";
    } else if (Common.expires === null) {
        msg_key = "msg.error.tokenExpiryDateMissing";
    } else if (Common.refExpires === null) {
        msg_key = "msg.error.refreshTokenExpiryDateMissing";
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
