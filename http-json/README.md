http-json
===

A `connect` / `http` module which extends `http.ServerResponse.prototype`.

Usage
===

    (function () {
      "use strict";

      require('http-json').init(require('http'));

      var connect = require('connect')
        ;

      connect().use(function () {
        res.meta('foo-secret', 42);

        // Randomly generate an error
        if (Date.now() % 3) {
          res.error(new Error("What time is it? Error time!"));
          res.json();
          return;
        }

        res.json("What time is it? Success time!");
      }).listen(2323);
      // http://localhost:2323/

    }());

Response
---

    {
        "success": true
      , "errors": []
      , "foo-secret": 42
      , "timestamp": 1339631260781
      , "result": "What time is it? Success time!"
    }

API
===

http.ServerResponse.prototype.json(result, params)
---

Pass in some `result` object to be attached as `result`

  * sets `Content-Type: application/json; charset=utf-8`
  * calls `res.write(JSON.stringify({ timestamp: Date.now(), result: result, ... }))`
  * calls `res.end()`

Optional `params` may be an object such as this

    {
        debug: false        // set `true` if the response should be pretty-printed
                            // also, stack traces should not be removed
      , stringified: false  // set `true` if the result is already `JSON.stringify()`'d
    }

http.ServerResponse.prototype.meta(key, value)
---

Add a field to the "header" (sibling of `result`, `success`, etc)

http.ServerResponse.prototype.error(Error)
---

Add an Error to the `error` array and set `success` to false.

**Note**: By default, stack traces will be removed from errors.
