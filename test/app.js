(function () {
  "use strict";

  var connect = require('../lib/index');

  connect.createServer(
      connect.static(__dirname + '/public')
    , function (req, res, next) {
        console.log("I'll handle it from here, friend!");
        res.json({ hello: 'friend' });
      }
  ).listen("5080");
  console.log('listening on port ' + 5080);
}());
