(function () {
  "use strict";

  var stack = require('./lib/stack')
    , addSendJson = require('./lib/jason-res-json')
    , corsSession = require('./lib/connect-cors-session')
    , queryparser = require('connect-queryparser')
    , xcors = require('connect-xcors')
    , cors
    , session
    , connect
    ;


  connect = stack.create(
      addSendJson()
  );

  cors = xcors();
  session = corsSession();
  connect.addMiddleware(
      cors
    , queryparser()
    , session
  );

  cors.config.headers = cors.config.headers.concat(session.headers.slice());

  module.exports = connect;
}());
