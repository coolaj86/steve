(function () {
  "use strict";
  
  var connect = require('./lib/index')
    , request = require('ahr2')
    , assert = require('assert')
    , server
    , protocol = 'http:'
    , hostname = 'localhost'
    , port = '6767'
    , pathname = '/path/to/resource'
    , search = 'search=query&foo=bar&userSession=alphabetSoup'
    , url = pathname + '?' + search
    , fullurl = protocol + '//' + hostname + ':' + port + pathname + '?' + search
    , query = {
          search: 'query'
        , foo: 'bar'
        , userSession: 'alphabetSoup'
      }
    ;

  server = connect.createServer(function (req, res, next) {
    res.json({
        "url": req.url
      //, "adddress": req.socket.address()
      //, "protocol": req.protocol
      , "pathname": req.pathname
      , "query": req.query
      //, "search": req.search
      , "path": req.path
      , "headers": req.headers
    });
  });

  server.listen(port, function () {
    var headers
      ;

    headers = {
        "X-User-Session": "headerSession"
      , "User-Agent": "FooBarUrl"
    };

    request.get(fullurl, null, { headers: headers }).when(function (err, ahr, resp) {
      var data
        ;

      server.close();
      if (err) {
        console.error(err);
        return;
      }

      data = resp.result;
      assert.strictEqual("headersession", resp.userSession, "sessions aren't a lowercase match");
      assert.strictEqual("foobarurl", data.headers['user-agent'], 'user-agent is a lowercase match');
      assert.strictEqual(url, data.url, "urls don't match");
      //assert.strictEqual(protocol, data.protocol, "protocol don't match");
      //assert.strictEqual(hostname, data.hostname, "hostnames don't match");
      //assert.strictqual(port, data.port, "ports don't match");
      assert.strictEqual(pathname, data.pathname, "pathnames don't match");
      //assert.strictEqual(search, data.search, "searchs don't match");
      assert.deepEqual(query, data.query, "queries don't match");
      console.log('tests pass (ctrl+c to exit)');
    });
  });

}());
