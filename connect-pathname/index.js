/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
(function () {
  "use strict";

  var url = require('url')
    , querystring = require('querystring')
    ;

  function pathnameParser(req, res, next) {
    var urlObj
      ;

    if (req.pathname) {
      next();
      return;
    }

    urlObj = url.parse(req.url);
    req.pathname = req.pathname || urlObj.pathname;

    // since we've already parsed the url, we might
    // save the duplication and do the query
    if (!req.query) {
      req.query = req.query || querystring.parse((urlObj.search||"").substr(1));
    }

    next();
  }

  function create() {
    return pathnameParser;
  }

  module.exports = create;
}());
