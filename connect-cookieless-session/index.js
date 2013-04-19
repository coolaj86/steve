/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
(function () {
  "use strict";

  // TODO use one config and then auto camelcase headers
  var http = require('http')
    , UUID = require('node-uuid')
    //, MemoryStore = require('./memory-store')
    , CorsSession = require('./cors-session')
    , defaultSessionKey = 'userSession'
    , defaultUrlPrefix = 'user-session'
    //, defaultSessionAppKey = 'appSession'
    , defaultSessionHeader = 'X-User-Session'
    //, defaultSessionAppHeader = 'X-App-Session'
    , resProto = http.ServerResponse.prototype
    ;

  function create(options) {
    options = options || {};

    var sessionHeader = defaultSessionHeader
      , lcSessionHeader = sessionHeader.toLowerCase()
      , sessionKey = options.sessionKey || defaultSessionKey
      , lcSessionKey = sessionKey.toLowerCase()
      , appSession = {}
      , purgeInterval = options.purgeInterval || 10 * 60 * 1000
      // we switched to using process.uptime (seconds), but we don't
      // want to change the API which is in milliseconds
      , maxAge = (options.maxAge || 60 * 60 * 1000) / 1000
        // TODO use string
      , reSessionUrl = /\/user-session\/([^\/]*)(.*)/
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

        m = reSessionUrl.exec(req.url);
        if (m) {
          // add trailing slash, at the least
          sessionId = m[1];
          req.url = m[2] || '/';
        }

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

    // to allow headers through CORS
    connectSession.headers = [lcSessionHeader];

    if (resProto.json) {
      if (!resProto._corsSessionSendJson) {
        resProto._corsSessionSendJson = resProto.json;
        resProto.json = function (data, opts) {
          this.meta(sessionKey, this.sessionId);
          this._corsSessionSendJson(data, opts);
        };
      }
    }

    /*
    if (!resProto._corsSessionSend) {
      resProto._corsSessionSend = resProto.end;
      resProto.end = function (data) {
        this.setHeader(sessionHeader, this.sessionId);
        this._corsSessionSend(data);
      };
    }
    */

    return connectSession;
  }

  module.exports = create;
  module.exports.create = create;
}());
