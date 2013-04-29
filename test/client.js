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

    function testTimeout(nextTest) {
      var sessionId = uuid.v4()
        , resources = [
              '/resource1'
            , '/secondResource'
            , '/3rdResource'
          ]
        , reqCounts = {}
        , prevReqTime = null
        ;

      resources.forEach(function (res) {
        reqCounts[res] = 0;
      });
      reqCounts.all = 0;

      function makeReq(index) {
        var res
          ;

        while (isNaN(index) || index < 0 || index >= resources.length) {
          index = Math.floor(Math.random()*resources.length);
        }
        res = resources[index];

        function handleResp(err, ahr, resp) {
          var now = Date.now()
            , timeDiff = now - prevReqTime
            , count
            , age
            ;

          assert.ifError(err);

          assert.strictEqual(extractSessionHeader(ahr.headers), sessionId, "session ID isn't contained in the response headers");
          if (typeof resp === 'string' || Buffer.isBuffer(resp)) {
            count = Number(resp);
          }
          else {
            assert.strictEqual(resp[sessionKey], sessionId, "session ID isn't contained in the JSON response");
            if (typeof resp.result === 'object') {
              count = resp.result.count;
              age = resp.result.age;
            }
            else {
              count = Number(resp.result);
            }
          }

          if (timeDiff < sessionOpts.maxAge - 100) {
            assert.strictEqual(count, reqCounts[res], "session's count of requests doesn't match our request count");

            if (reqCounts.all > 4) {
              timeDiff = sessionOpts.maxAge + sessionOpts.purgeInterval + 1000;
              setTimeout(makeReq, timeDiff, 1);
            }
            else {
              timeDiff = sessionOpts.maxAge * (3.75 + Math.random())/5 - 100;
              setTimeout(makeReq, timeDiff);
            }
            reqCounts[res] += 1;
            reqCounts.all  += 1;
            prevReqTime = now;
          }
          else if (timeDiff < sessionOpts.maxAge + sessionOpts.purgeInterval + 100) {
            throw new Error("ambiguous time difference in the timeout test");
          }
          else {
            assert.strictEqual(count, 0, "count didn't reset after allowing session to expire");
            if (age !== undefined) {
              assert.of(age < 100, "age is greater than 100ms for what should be a new session");
            }
            nextTest();
          }
        }

        sessionReq(handleResp, res, sessionId);
      }

      prevReqTime = Date.now();
      makeReq();
    }

    function testMaxCount(nextTest) {
      var sessionIds = []
        , sessionCounts = {}
        , curCount
        , randIntervalId
        , newIntervalId
        ;

      function noop() {
      }

      function makeReq(cb, id) {
        if (typeof cb !== 'function') {
          id = cb;
          cb = noop;
        }
        while (!id) {
          if (sessionIds.length <= 0) {
            throw new TypeError('no ID given and no previous IDs to use');
          }
          id = sessionIds[Math.floor(Math.random()*sessionIds.length)];
        }

        function handleResp(err, ahr, resp) {
          var index
            ;
          assert.ifError(err);

          assert.strictEqual(extractSessionHeader(ahr.headers), id, "session ID isn't contained in the response headers");
          assert.strictEqual(resp[sessionKey], id, "session ID isn't contained in the JSON response");
          assert.strictEqual(resp.result.count, sessionCounts[id], "session's count of requests doesn't match our request count");

          sessionCounts[id] += 1;

          index = sessionIds.indexOf(id);
          while (index >= 0) {
            sessionIds.splice(index, 1);
            index = sessionIds.indexOf(id);
          }
          sessionIds.unshift(id);
          cb();
        }

        sessionReq(handleResp, '/resource1', id);
      }

      function finishTest() {
        sessionReq(function (err, ahr, resp) {
          var expectedCount = Math.floor(0.8*sessionOpts.maxCount)
            , remainingSessions
            ;
          assert.ifError(err);
          curCount = resp.result;

          assert.ok(Math.abs(curCount - expectedCount) < 2, "expected count doesn't match actual count after exceeding max count");

          // this part checks to make sure it was the newest session that survived
          remainingSessions = sessionIds.slice(0, curCount);
          forEachAsync(remainingSessions, makeReq).then(nextTest);
        }, '/session-count');
      }

      function createSession() {
        var id = uuid.v4()
          ;

        curCount += 1;
        sessionCounts[id] = 0;

        if (curCount > sessionOpts.maxCount) {
          clearInterval(randIntervalId);
          clearInterval(newIntervalId);
          setTimeout(finishTest, 1000);
        }

        makeReq(id);
      }

      // this isn't really a session request, but it's
      // easier to do it this way anyway
      sessionReq(function (err, ahr, resp) {
        var index
          ;
        assert.ifError(err);
        curCount = resp.result;

        for (index = curCount; index < 0.8 * sessionOpts.maxCount; index += 1) {
          createSession();
        }

        setTimeout(function () {
          randIntervalId = setInterval(makeReq, 100);
          newIntervalId  = setInterval(createSession, 1500);
        }, 1000);
      }, '/session-count');
    }

    sequence.then(testMethods);
    sequence.then(testCreation);

    // only test the timeout if it isn't going to make the test run forever
    if (sessionOpts.maxAge + sessionOpts.purgeInterval < 90*1000) {
      sequence.then(testTimeout);
    }
    // only test the max count if it's low enough to be managable
    if (sessionOpts.maxCount <= 50) {
      sequence.then(testMaxCount);
    }
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
