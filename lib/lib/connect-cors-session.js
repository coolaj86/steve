(function () {
  "use strict";

  // TODO use one config and then auto camelcase headers
  var http = require('http')
    , UUID = require('node-uuid')
    , MemoryStore = require('./memory-store')
    , CorsSession = require('./cors-session')
    , defaultSessionKey = 'userSession'
    , defaultSessionAppKey = 'appSession'
    , defaultSessionHeader = 'X-User-Session'
    , defaultSessionAppHeader = 'X-App-Session'
    , resProto = http.ServerResponse.prototype
    ;

  function random() {
    return 0.5 - Math.random();
  }

  function create(options) {
    options = options || {};

    var sessionHeader = defaultSessionHeader
      , lcSessionHeader = sessionHeader.toLowerCase()
      , sessionKey = options.sessionKey || defaultSessionKey
      , lcSessionKey = sessionKey.toLowerCase()
      , appSession = {}
      , purgeInterval = options.purgeInterval || 10 * 60 * 1000
      , maxAge = options.maxAge || 60 * 60 * 1000
      ;

    // don't use the prototype?
    resProto.corsSessionSendJson = resProto.json;
    resProto.json = function (data, opts) {
      this.meta(sessionKey, this.sessionId);
      this.corsSessionSendJson(data, opts);
    };

    function purge() {
      var now = Date.now()
        , val
        ;

      Object.keys(appSession).forEach(function (key) {
        val = appSession[key];
        if ((now - val.timestamp) > maxAge) {
          if (appSession[key]) {
            delete appSession[key].corsStore
          }
          delete appSession[key];
        }
      });
    }

    // TODO fingerprint to prevent theft by Wireshark sniffers
    // TODO rolling fingerprint that is different for each request
    function connectSession(req, res, next) {
        var sessionId
          ;

        // TODO add Cookie support?
        sessionId = req.sessionId = req.headers[lcSessionHeader]
          || (req.body && req.body[sessionKey])
          || req.query[sessionKey]
          || UUID.v4()
          ;

        req.session = appSession[sessionId];

        if (!req.session) {
          req.session = appSession[sessionId] = CorsSession.create();
        } else {
          delete req.session.virgin;
        }

        // TODO else if (req.expireSession) { delete a replaced session }
        req.session.touch();
        res.setHeader(sessionHeader, sessionId);
        // used by res.json
        res.sessionId = sessionId;
        next();
    }

    setInterval(purge, purgeInterval);

    // to allow headers through CORS
    connectSession.headers = [lcSessionHeader];
    return connectSession;
  }

  module.exports = create;
}());
