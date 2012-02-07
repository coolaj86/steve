(function () {
  "use strict";

  var stack = require('./lib/stack')
    , gcf = require('express-chromeframe')
    , addSendJson = require('./lib/steve-res-json')
    , corsSession = require('./lib/connect-cors-session')
    , nowww = require('nowww')
    , pathname = require('./lib/connect-pathname')
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
      nowww()
    , connect.query()
    , pathname()
    , cors
    , session
    , gcf()
  );

  // TODO push into middleware layer
  cors.config.headers = cors.config.headers.concat(session.headers.slice());

  module.exports = connect;
}());
