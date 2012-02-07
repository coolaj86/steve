(function () {
  "use strict";
  
  var connect = require('./lib/index')
    , request = require('ahr2')
    , server
    ;

  server = connect.createServer();

  server.listen(6767, function () {
    request.get('http://localhost:6767/').when(function (err, ahr, data) {
      server.close();
      if (err) {
        console.error(err);
        return;
      }

      console.info('data:');
      console.log(data.toString('utf8'));
    });
  });

}());
