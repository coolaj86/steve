#cookieless-session#
Because sometimes you just don't want to use cookies...

Looks for a session ID in the request and manages sessions with the
information extracted.

There are 4 ways to set the session

  * via HTTP Header: `X-User-Session: 0123456789abcdef`
  * via url `/user-session/0123456789abcdef/path/to/resource`
    * Note: the session middleware will automatically rename the url to just `/path/to/resource`
  * via query parameter: `/path/to/resource?userSession=0123456789abcdef`
  * via json body: `{ "userSession": "0123456789abcdef" }`
  * TODO cookies


#Options#
The following options can be feed into the create function

  * sessionHeader: header field we look for in the request and set in the response.
    Defaults to "X-User-Session".
  * sessionKey: the key we look for in the query string and the body in the request
    and set in the HTTP JSON meta. Defaults to "userSession"
  * urlPrefix: the resource we check for the URL provided session ID. Defaults to "user-session"
  * maxAge: the time (in milliseconds) after which an established session will
    expire. Defaults to one hour.
  *purgeInterval: the time (in milliseconds) between checks for expired sessions.
    Defaults to 10 minutes.
  * maxCount: the maximum number of sessions allowed. When the limit is reached, the
    oldest sessions will be destroyed until we are at 80% of the limit. Defaults to Infinity.
  * alwaysCreate: create a session for every request that doesn't specify a session ID.
    Defaults to true.


#API#

  * HttpRequest#session - every request will have a session, which is a plain object
  * HttpRequest#session.createdAt - the time at which the session was created
  * HttpRequest#session.touchedAt - updated each time the session is touched
  * HttpRequest#session.store - the object in which you can store any information relavent to the session
  * HttpRequest#session.store.set - store a key value pair
  * HttpRequest#session.store.get - retrieve any key that was set previously
  * HttpRequest#session.store.delete - remove any key that was set previously

The session ID will automatically be set in the response headers, and if HTTP JSON is
used it will set the ID in the meta as well.


#Example#

        (function () {
          "use strict";

          var connect = require('connect')
            , session = require('connect-cookieless-session').create({maxCount:100})
            ;

          // a simple http basic authorization
          function authn(req, res, next) {
            var count
              ;

            count = req.session.store.get('count') || 0;
            req.session.store.set('count', count + 1);

            res.end("I've seen you " + count + " times before");
          }

          connect
            .use(session)
            .use(shoppingCart)
            .use(authn)
            ;

        }());