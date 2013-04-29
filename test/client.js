(function () {
  "use strict";

  var path = require('path')
    , assert = require('assert')
    , request = require('ahr2')
    , uuid = require('node-uuid')
    , forEachAsync = require('forEachAsync')
    , createSequence = require('sequence')
    ;

  function runTest(finished, port, sessionOpts) {
    var sessionHeader = sessionOpts.sessionHeader || 'X-User-Session'
      , sessionKey = sessionOpts.sessionKey || 'userSession'
      , urlPrefix = sessionOpts.urlPrefix || 'user-session'
      , sequence = createSequence()
      ;

    function sessionReq(cb, url, sessionId, method) {
      var opts = {
              protocol: 'http'
            , method: 'GET'
            , hostname: 'localhost'
            , port: port
            , pathname: url
          }
        ;

      if (sessionId !== undefined) {
        if (isNaN(method) || method < 0 || method > 3) {
          method = Math.floor(Math.random()*4);
        }
        if (method === 0) {
          // windows path will use \ instead of /, which is wrong for HTTP
          opts.pathname = path.join('/', urlPrefix, sessionId, url).replace(/\\/g, '/');
        }
        else if (method === 1) {
          opts.headers = {};
          opts.headers[sessionHeader] = sessionId;
        }
        else if (method === 2) {
          opts.method = 'POST';
          opts.body = {};
          opts.body[sessionKey] = sessionId;
        }
        else {
          opts.query = {};
          opts.query[sessionKey] = sessionId;
        }
      }

      request(opts).when(cb);
    }

    function extractSessionHeader(headers) {
      var value;

      Object.keys(headers).some(function (key) {
        if (key.toLowerCase() === sessionHeader.toLowerCase()) {
          value = headers[key];
          return true;
        }
      });

      return value;
    }

    function testMethods(nextTest) {
      var sessionId = uuid.v4()
        , methods = [0,1,2,3,2,3,1,0,4,4,4,4]
        ;

      forEachAsync(methods, function (next, val, index) {
        sessionReq(function (err, ahr, resp) {
          assert.ifError(err);

          assert.strictEqual(extractSessionHeader(ahr.headers), sessionId, "session ID isn't contained in the response headers");
          assert.strictEqual(resp[sessionKey], sessionId, "session ID isn't contained in the JSON response");
          assert.strictEqual(resp.result.count, index, "session's count of requests doesn't match our request count");

          next();
        }, '/resource1', sessionId, val);
      }).then(nextTest);
    }

    function testCreation(nextTest) {
      var shouldCreate = sessionOpts.alwaysCreate || !sessionOpts.hasOwnProperty('alwaysCreate')
        , reqCount = 0
        , sessionId
        ;

      function handleResp(err, ahr, resp) {
        assert.ifError(err);

        if (shouldCreate) {
          if (reqCount === 0) {
            sessionId = extractSessionHeader(ahr.headers);
          }

          assert.strictEqual(extractSessionHeader(ahr.headers), sessionId, "session ID isn't contained in the response headers");
          assert.strictEqual(resp[sessionKey], sessionId, "session ID isn't contained in the JSON response");
          assert.strictEqual(resp.result, reqCount, "session's count of requests doesn't match our request count");
        }
        else {
          assert.strictEqual(extractSessionHeader(ahr.headers), 'null', "session ID isn't null in the response headers when not specified");
          assert.strictEqual(resp[sessionKey], null, "session ID isn't null in the JSON body when not specified");
          assert.strictEqual(resp.result, null, "count doesn't match expected for a non-session");
          nextTest();
        }

        if (reqCount > 2) {
          return nextTest();
        }
        reqCount += 1;
        sessionReq(handleResp, '/3rdResource', sessionId);
      }

      sessionReq(handleResp, '/3rdResource');
    }

    sequence.then(testMethods);
    sequence.then(testCreation);
    sequence.then(finished);

    /*
    request.get(fullurl, null, { headers: headers }).when(function (err, ahr, resp) {
      var data
        ;

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
      assert.strictEqual(0, data.count);

      request.get(fullurl, null, { headers: headers }).when(function (err, ahr, resp2) {
        if (err) {
          console.error(err);
          return;
        }
        assert.strictEqual(1, resp2.result.count);
        server.close();
        console.log('tests pass (ctrl+c to exit)');
      });
    });
    */
  }


  module.exports = runTest;
}());
