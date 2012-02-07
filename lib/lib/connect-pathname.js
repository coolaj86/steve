(function () {
  "use strict";

  var url = require('url')
    ;

  function pathnameParser(req, res, next) {
    var urlObj
      ;

    urlObj = req.query || url.parse(req.url, true);
    req.query = urlObj.query || {};
    req.pathname = req.pathname || urlObj.pathname || '/';

    next();
  }

  function create() {
    return pathnameParser;
  }

  module.exports = create;
}());
