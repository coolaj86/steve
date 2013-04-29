(function () {
  "use strict";

  var http = require('http')
    , forEachAsync = require('forEachAsync')
    , createServer = require('./server')
    , makeRequests = require('./client')
    , testOpts = [
          {
              purgeInterval: 500
            , maxAge: 10*1000
            , urlPrefix: 'obscure-string-that-would-never-be-default'
          }
        , {
              maxCount: 20
            , sessionKey: 'session_ID'
          }
        , {
              alwaysCreate: false
            , sessionHeader: 'X-Super-Secret-Session-ID'
          }
      ]
    ;

  function runTest(cb, sessionOpts) {
    var server
      ;

    function finished() {
      console.log('tests finished for session options', JSON.stringify(sessionOpts, null, '  '));
      server.close();
      cb();
    }

    server = http.createServer(createServer(sessionOpts));

    server.listen(0, function () {
      var port = server.address().port;

      makeRequests(finished, port, sessionOpts);
    });
  }

  if (require.main === module) {
    forEachAsync(testOpts, runTest).then(function () {
      process.exit(0);
    });
  }
  else {
    module.exports = runTest;
  }

}());
