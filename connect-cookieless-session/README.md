cookieless-session
===

Because sometimes you just don't want to use cookies...

Looks for query (or body) parameter `userSession` or HTTP header `X-User-Session` as a session key. 

Currently only the user session keys are used.

Usage
===

There are 4 ways to set the session

  * via HTTP Header: `X-User-Session: 0123456789abcdef`
  * via url `/user-session/0123456789abcdef/path/to/resource`
    * Note: the session middleware will automatically rename the url to just `/path/to/resource`
  * via query parameter: `/path/to/resource?userSession=0123456789abcdef`
  * via json body: `{ "userSession": "0123456789abcdef" }`
  * TODO cookies

    (function () {
      "use strict";

      var connect = require('connect')
        , session = require('connect-cookieless-session').create()
        ;

      // a simple http basic authorization
      function authn(req, res, next) {
        var token = []
          ;

        req.session.count = req.session.count || 0;
        req.session.count += 1;

        res.end("I've seen you " + req.session.count + " times");
      }

      connect
        .use(session)
        .use(shoppingCart)
        .use(authn)
        ;

    }());

API
===

  * HttpRequest#session - every request will have a session, which is a plain object
  * HttpRequest#session.createdAt - the time at which the session was created
  * HttpRequest#session.touchedAt - updated each time the session is touched
  * HttpRequest#json - if `http-json` is being used then `res.json` is overwritten such that the session is automatically added via `res.meta`
