/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
(function () {
  "use strict";

  function subdomainParser(req, res, next) {
    var host
      ;

    if (req.headers.host) {
      // get rid of trailing :<port>, then split on '.'
      req.subdomains = req.headers.host.split(':')[0].split('.').slice(0, -1);
    }

    next();
  }

  function create() {
    return subdomainParser;
  }

  module.exports = create;
}());
