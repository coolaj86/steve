connect-subdomains
===

Adds `req.subdomains`, which is an array of subdomains

Usage
===

    (function () {
      "use strict";

      var connect = require('connect')
        , subdomains = require('connect-subdomains')
        ;

      connect()
        .use(subdomains())
        .use(function (req, res, next) {
            console.log(req.subdomains);
            next();
          })
        .listen(3000)
        ;
    }());
