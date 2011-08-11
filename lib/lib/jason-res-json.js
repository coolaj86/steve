(function () {
  "use strict";

  var g_http = require('http')
    ;

  function create(config) {
    config = config || {};

    function handler(reqProto, resProto, http) {
      if (!resProto) {
        resProto = g_http.ServerResponse.prototype;
      }

      function toJSON() {
        if (debug) {
        }
      }

      resProto.error = function (msg, code, other) {
        this.errors = this.errors || [];
        if ('object' !== typeof opts) {
          opts = {};
        }

        opts.message = msg;
        opts.code = code;
        this.errors.push(opts);
      };

      // TODO maybe jsonp
      resProto.json = function (data, opts) {
        var json;

        opts = opts || {};
        data.errors = this.errors || [];
        data.error = data.error || (data.errors.length ? true : false);

        console.log('statusCode', this.statusCode);
        this.statusCode = this.statusCode || opts.statusCode || (data.error ? 400 : 200);
        console.log(this.statusCode);

        try {
          if (config.debug || opts.debug) {
            json = JSON.stringify(data, null, '  ');
          } else {
            json = JSON.stringify(data);
          }
        } catch(e) {
          this.statusCode = 500;
          if (config.debug || opts.debug) {
            json = JSON.stringify({ error: true, errors: [e] });
          } else {
            json = JSON.stringify({ error: true, errors: [e] }, null, '  ');
          }
        }

        this.charset = this.charset || 'utf-8';
        this.setHeader('Content-Type', 'application/json');
        this.end(json);
      };

      console.log('jsonRes', resProto);
    }
    return handler;
  }

  module.exports = create;
}());
