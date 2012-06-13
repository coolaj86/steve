/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
/*
 * SERVER
 */
(function () {
  "use strict";

  require('http-json')(require('http'));

  var connect = require('connect')
    , cookielessSession = require('connect-cookieless-session')
    , pathname = require('connect-pathname')
    , gcf = require('express-chromeframe')
    , nowww = require('nowww')
    , xcors = require('connect-xcors')
    , cors = xcors()
    , session = cookielessSession()
    , app = connect()
    ;

  connect.router = require('connect_router');
  connect.corsPolicy = cors.config;

  cors.config.headers = cors.config.headers.concat(session.headers.slice());

  app
    .use(nowww())
    .use(gcf())
    .use(pathname())
    .use(connect.query())
    .use(connect.json())
    .use(connect.urlencoded())
    .use(cors)
    .use(session)
    .use(connect.favicon())
    .use(connect.static(__dirname + '/../public'))
    .use(connect.static(__dirname + '/../var/public'))
    ;

  module.exports = app;
}());
