(function () {
  "use strict";

  // TODO use one config and then auto camelcase headers
  var defaultSessionKey = 'userSession'
    , defaultSessionAppKey = 'appSession'
    , defaultSessionHeader = 'X-User-Session'
    , sessionHeader = defaultSessionHeader
    , lcSessionHeader = sessionHeader.toLowerCase()
    , defaultSessionAppHeader = 'X-App-Session'
    ;

  function random() {
    return 0.5 - Math.random();
  }

  function create(options) {
    options = options || {};

    var http = require('http')
      , resProto = http.ServerResponse.prototype
      //, sendJsonProto = resProto.json
      , secret = options.secret || (Math.random() * Date.now()).toString('36').split('').sort(random).join('')
      , sessionKey = options.sessionKey || defaultSessionKey
      , lcSessionKey = sessionKey.toLowerCase()
      , purgeInterval = options.purgeInterval || 10 * 60 * 1000
      , maxAge = options.maxAge || 60 * 60 * 1000
      , db = {}
      ;

    resProto.sessionSendJson = resProto.json;
    resProto.json = function (data, opts) {
      this.meta(sessionKey, this.sessionId);
      this.sessionSendJson(data, opts);
    };

    // TODO fingerprint to prevent theft by Wireshark sniffers
    // TODO rolling fingerprint that is different for each request
    function createSessionId() {
      return (secret + 
        Date.now().toString('36') + 
        (Math.random() * 19860616).toString('36')
      ).split('').sort(random).join('').replace(/[\W]/g, '').substr(0, 32);
    }

    function purge() {
      var now = Date.now()
        , val
        ;

      Object.keys(db).forEach(function (key) {
        val = db[key];
        if ((now - val.timestamp) > maxAge) {
          delete db[key];
        }
      });
    }

    function session(req, res, next) {
        var sessionId
          , timestamp = Date.now()
          ;

        // TODO add Cookie support
        if (sessionId = req.headers[lcSessionHeader]) {
          req.sessionId = sessionId;
        } else if (sessionId = req.body && req.body[sessionKey]) {
          req.sessionId = sessionId;
        } else if (sessionId = req.query[sessionKey]) {
          req.sessionId = sessionId;
        } else {
          req.sessionId = sessionId = createSessionId();
        }

        if (!(req.session = db[sessionId])) {
          req.session = db[sessionId] = {};
          req.session.virgin = true;
          req.session.createdAt = timestamp;
        } else {
          delete req.session.virgin;
        }

        // TODO else if (req.expireSession) { delete a replaced session }
        res.sessionId = req.sessionId;
        req.session.touchedAt = timestamp;
        res.setHeader(sessionHeader, sessionId);

      next();
    }

    setInterval(purge, purgeInterval);

    session.headers = [lcSessionHeader];
    return session;
  }

  module.exports = create;
}());
