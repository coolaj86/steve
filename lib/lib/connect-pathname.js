(function () {
  "use strict";

  var url = require('url')
    , querystring = require('querystring')
    ;

  function pathnameParser(req, res, next) {
    var urlObj
      ;

    urlObj = url.parse(req.url);
    req.pathname = req.pathname || urlObj.pathname;
    req.query = req.query || querystring.parse(urlObj.search);

    next();
  }

  function create() {
    return pathnameParser;
  }

  module.exports = create;
}());
