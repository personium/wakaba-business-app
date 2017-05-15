var ISCommon = {};

ISCommon.target = sessionStorage.getItem("ISTarget");
ISCommon.cellUrl = sessionStorage.getItem("ISCellUrl");
ISCommon.token = sessionStorage.getItem("ISToken");
ISCommon.refToken = sessionStorage.getItem("ISRefToken");
ISCommon.expires = sessionStorage.getItem("ISExpires");
ISCommon.refExpires = sessionStorage.getItem("ISRefExpires");

ISCommon.IDLE_TIMEOUT =  3600000;
ISCommon.LASTACTIVITY = new Date().getTime();

// This method checks idle time
ISCommon.setIdleTime = function() {
    // Create Session Expired Modal
    ISCommon.createSessionExpired();

    ISCommon.refreshTokenAPI().done(function(data) {
        ISCommon.token = data.access_token;
        ISCommon.refToken = data.refresh_token;
        ISCommon.expires = data.expires_in;
        ISCommon.refExpires = data.refresh_token_expires_in;
        sessionStorage.setItem("ISToken", data.access_token);
        sessionStorage.setItem("ISRefToken", data.refresh_token);
        sessionStorage.setItem("ISExpires", data.expires_in);
        sessionStorage.setItem("ISRefExpires", data.refresh_token_expires_in);
    }).fail(function(data) {
        $('#modal-session-expired').modal('show');
    });

    setInterval(ISCommon.checkIdleTime, 3300000);
    document.onclick = function() {
      ISCommon.LASTACTIVITY = new Date().getTime();
    };
    document.onmousemove = function() {
      ISCommon.LASTACTIVITY = new Date().getTime();
    };
    document.onkeypress = function() {
      ISCommon.LASTACTIVITY = new Date().getTime();
    };
}
ISCommon.createSessionExpired = function() {
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
ISCommon.checkIdleTime = function() {
  if (new Date().getTime() > ISCommon.LASTACTIVITY + ISCommon.IDLE_TIMEOUT) {
    $('#modal-session-expired').modal('show');
  } else {
      ISCommon.refreshToken();
  }
};

ISCommon.refreshToken = function() {
    ISCommon.refreshTokenAPI().done(function(data) {
        ISCommon.token = data.access_token;
        ISCommon.refToken = data.refresh_token;
        ISCommon.expires = data.expires_in;
        ISCommon.refExpires = data.refresh_token_expires_in;
        sessionStorage.setItem("ISToken", data.access_token);
        sessionStorage.setItem("ISRefToken", data.refresh_token);
        sessionStorage.setItem("ISExpires", data.expires_in);
        sessionStorage.setItem("ISRefExpires", data.refresh_token_expires_in);
    });
};

/*
ISCommon.dispUserName = function(cellUrl) {
    ISCommon.getProfile(cellUrl).done(function(prof) {
        var html = '<h4><img src=' + prof.Image + ' width="20" height="20" style="margin-right:20px" ></img>' + prof.DisplayName + '</h4>';
        $('#loginUserName').html(html);
    });
};
*/

ISCommon.dispUserName = function(cellUrl) {
    ISCommon.getProfile(cellUrl).done(function(prof) {
        $('img#loginUserIcon').attr({"src":prof.Image});
        $('#loginUserName').html(prof.DisplayName);
    });
};

ISCommon.getProfile = function(url) {
  return $.ajax({
    type: "GET",
    url: url + '__/profile.json',
    dataType: 'json',
    headers: {'Accept':'application/json'}
  })
};

ISCommon.refreshTokenAPI = function() {
    return $.ajax({
        type: "POST",
        url: ISCommon.cellUrl + '__auth',
        processData: true,
        dataType: 'json',
        data: {
               grant_type: "refresh_token",
               refresh_token: ISCommon.refToken
        },
        headers: {'Accept':'application/json'}
    })
};

ISCommon.getTargetToken = function(extCellUrl) {
  return $.ajax({
                type: "POST",
                url: ISCommon.cellUrl + '__auth',
                processData: true,
		dataType: 'json',
                data: {
                        grant_type: "refresh_token",
                        refresh_token: ISCommon.refToken,
                        p_target: extCellUrl
                },
		headers: {'Accept':'application/json'}
         });
};
