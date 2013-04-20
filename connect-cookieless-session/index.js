/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
(function () {
  "use strict";

  // TODO use one config and then auto camelcase headers
  var UUID = require('node-uuid')
    //, MemoryStore = require('./memory-store')
    , CorsSession = require('./cors-session')
    //, defaultSessionAppKey = 'appSession'
    //, defaultSessionAppHeader = 'X-App-Session'
    ;

  function create(options) {
    options = options || {};

    var appSession = {}
      , sessionHeader = options.sessionHeader || 'X-User-Session'
      , lcSessionHeader = sessionHeader.toLowerCase()
      , sessionKey = options.sessionKey || 'userSession'
      , lcSessionKey = sessionKey.toLowerCase()
      , urlPrefix = options.urlPrefix || 'user-session'
      , urlSessionRegExp = new RegExp('^/' + urlPrefix + '/([^/]*)(.*)')
      , purgeInterval = options.purgeInterval || 10 * 60 * 1000
      // we switched to using process.uptime (seconds), but we don't
      // want to change the API which is in milliseconds
      , maxAge = (options.maxAge || 60 * 60 * 1000) / 1000
      , maxCount = options.maxCount || Infinity
      ;

    function purge() {
      var now = process.uptime()
        ;

      Object.keys(appSession).forEach(function (key) {
        // don't know why this would be neccesary, but there was a
        // check for falsey values before so it might be needed somehow
        if (!appSession[key] instanceof CorsSession) {
          delete appSession[key];
        }
        else if ((now - appSession.lastUsed) > maxAge) {
          delete appSession[key].corsStore;
          delete appSession[key];
        }
      });
    }
    setInterval(purge, purgeInterval);

    function forcePurge() {
      var allKeys
        , excessCount
        , excessKeys
        ;

      allKeys = Object.keys(appSession);

      // remove enough to put us at 80% capacity to avoid calling this
      // function too often
      excessCount = Math.round(allKeys.length - 0.8 * maxCount);
      if (excessCount <= 0) {
        return;
      }

      allKeys = allKeys.sort(function (a ,b) {
        // again, don't know how non-CorsSession objects could get in here,
        // but if they do, move them to the front of the list for removal
        if (!appSession[a] instanceof CorsSession) {
          return -1;
        }
        if (!appSession[b] instanceof CorsSession) {
          return 1;
        }

        return appSession[a].lastUsed - appSession[b].lastUsed;
      });

      excessKeys = allKeys.slice(0, excessCount);

      excessKeys.forEach(function (key) {
        delete appSession[key];
      });
    }

    // TODO fingerprint to prevent theft by Wireshark sniffers
    // TODO rolling fingerprint that is different for each request
    function connectSession(req, res, next) {
        var sessionId
          , m
          ;

        // TODO add Cookie support?
        sessionId = req.sessionId = req.headers[lcSessionHeader]
          || (req.body && req.body[sessionKey])
          || req.query[sessionKey]
          || UUID.v4()
          ;

        m = urlSessionRegExp.exec(req.url);
        if (m) {
          // add trailing slash, at the least
          sessionId = m[1];
          req.url = m[2] || '/';
        }

        req.session = appSession[sessionId];

        if (!req.session) {
          req.session = appSession[sessionId] = CorsSession.create();
          if (Object.keys(appSession).length > maxCount) {
            forcePurge();
          }
        } else {
          delete req.session.virgin;
        }

        // TODO else if (req.expireSession) { delete a replaced session }
        req.session.touch();
        res.setHeader(sessionHeader, sessionId);
        if (res.meta) {
          res.meta(sessionKey, sessionId);
        }

        next();
    }

    // to allow headers through CORS
    connectSession.headers = [lcSessionHeader];

    return connectSession;
  }

  module.exports = create;
  module.exports.create = create;
}());
