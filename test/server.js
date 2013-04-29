/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
/*
 * SERVER
 */
(function () {
  "use strict";

  require('../http-json')(require('http'));

  var connect = require('connect')
    , gcf = require('express-chromeframe')
    , xcors = require('connect-xcors')
    , cookielessSession = require('../connect-cookieless-session')
    , pathname = require('../connect-pathname')
    , nowww = require('../connect-nowww')
    ;

  connect.router = require('connect_router');

  function create(sessionOpts) {
    var app = connect()
      , cors = xcors()
      , session = cookielessSession(sessionOpts)
      ;

    app.corsPolicy = cors.config;

    cors.config.headers = cors.config.headers.concat(session.headers.slice());

    // standard stuff from the steve template
    app
      // .use(function (req, res, next) {
        // console.log(req.url, 'request received');
        // next();
      // })
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

    // resources we will actually use to test
    app.use('/resource1', function (req, res) {
      var count = null
        , age = null
        ;

      if (req.session) {
        age = Date.now() - req.session.createdAt;
        count = req.session.store.get('resource1') || 0;
        req.session.store.set('resource1', count + 1);
      }

      res.json({description: 'this resource tests JSON stuff', count: count, age:age});
    });
    app.use('/secondResource', function (req, res) {
      var count = null;

      if (req.session) {
        count = req.session.store.get('secondResource') || 0;
        req.session.store.set('secondResource', count + 1);
      }

      res.setHeader('content-type', 'test/plain; charset="UTF-8"');
      res.end(count.toString());
    });
    app.use('/3rdResource', function (req, res) {
      var count = null;

      if (req.session) {
        count = req.session.store.get('3rdResource') || 0;
        req.session.store.set('3rdResource', count + 1);
      }

      res.json(count);
    });

    return app;
  }

  module.exports = create;
}());
