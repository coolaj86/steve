connect-pathname
===

Adds `req.pathname` and `req.query`

Usage
===

    (function () {
      "use strict";

      var connect = require('connect')
        , pathname = require('connect-pathname')
        ;

      connect()
        .use(pathname())
        ,listen(3000)
        ;
    }());
