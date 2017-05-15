function(request){
  // GET ˆÈŠO‚Í405
  if(request.method !== "GET") {
     return {
            status : 405,
            headers : {"Content-Type":"application/json"},
            body : ['{"error":"method not allowed"}']
     };
  }
  
  var queryValue = request.queryString;
  if (queryValue === "") {
      return {
             status : 400,
             headers : {"Content-Type":"application/json"},
             body : ['{"error":"required parameter not exist."}']
      };
  }
  var params = dc.util.queryParse(queryValue);

  var filter = "";
  if (params.age && params.stBirth && params.enBirth) {
    if (params.age < 100) {
        filter = "Birth+ge+%27" + params.stBirth + "%27+and+Birth+le+%27" + enBirth + "%27";
    } else {
        filter = "Birth+le+%27" + params.enBirth + "%27";
    }
  }

  if (params.sex) {
    if (filter.length > 0) {
        filter += "+and+";
    }
    filter += "Sex+eq+" + params.sex;
  }

  if (params.area) {
    if (filter.length > 0) {
        filter += "+and+";
    }
    filter += "substringof%28%27" + params.area + "%27,Address%29";
  }

  var rootUrl = "https://demo.personium.io/";
  var apiUrl = https://demo.personium.io/hn-ll/io_personium_demo_hn-ll-app/genkikun-users-info/DemoData?$inlinecount=allpages&$top=0&$filter=MealPhotoFlag+eq+true';

  if (filter.length > 0) {
      apiUrl += '+and+' + filter;
  }

  // Get uuid
  var neuroUrl = {
      "cellUrl": rootUrl + "hn-app-neurosky/",
      "userId":"admin",
      "password":"personium"
  };
  var neuroCell = dc.as(neuroUrl).cell();
  var neuroOdata = neuroCell.box().odata('NeuroSkyData');
  var uuidRes = neuroOdata.entitySet('users').query().filter("mail eq '" + params.username + "'").select('__id').run().d.results;
  if (uuidRes.length == 0) {
    return {
      status : "200",
      headers : {"Content-Type":"application/json"},
      body : ['-1']
    };
  }
  var uuid = uuidRes[0].__id;

  // Get UserCell Token
  var userUrl = {
      "cellUrl": rootUrl + "hn-user-" + uuid + "/",
      "userId":"me",
      "password":"personium"
  };
  var userCell = dc.as(userUrl).cell();
  var ret = userCell.getToken();
  var cellToken = ret.access_token;
  var refToken = ret.refresh_token;

  // Update UserCell Token
  neuroOdata.entitySet("users").merge(
    uuid,
    {
      'token': cellToken,
      'ref-token': refToken
    },
    "*"
  );

  // Return uuid
  return {
    status: 200,
    headers: {"Content-Type":"text/html"},
    body: [uuid]
  };
}
