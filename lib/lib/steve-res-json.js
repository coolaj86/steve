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

      resProto.error = function (msg, code, opts) {
        this.errors = this.errors || [];
        if ('object' !== typeof opts) {
          opts = {};
        }

        opts.message = msg;
        opts.code = code;
        this.errors.push(opts);
      };

      // For adding things like 'session'
      resProto.meta = function (key, val) {
        this.responseMeta = this.responseMeta || {};

        // set
        if (undefined !== val) {
          this.responseMeta[key] = val;
          return;
        }

        // get
        if (1 === arguments.length) {
          return val;
        }

        // delete
        delete this.responseMeta[key];
      }

      // TODO maybe jsonp
      resProto.json = function (data, opts) {
        var self = this
          , json
          , response = {}
          , space
          ;

        Object.keys(this.responseMeta || {}).forEach(function (key) {
          response[key] = self.responseMeta[key];
        });

        opts = opts || {};
        space = (config.debug || opts.debug) ? '  ': null
        response.timestamp = Date.now();
        response.errors = self.errors || [];
        response.error = !!(response.error || (response.errors.length ? true : false));
        response.success = !response.error;
        response.result = data;

        this.statusCode = this.statusCode || opts.statusCode || (response.error ? 400 : 200);

        try {
          json = JSON.stringify(response, null, space);
        } catch(e) {
          this.statusCode = 500;
          json = JSON.stringify({ error: true, errors: [e] }, null, space);
        }

        this.charset = this.charset || 'utf-8';
        this.setHeader('Content-Type', 'application/json');
        this.end(json);
      };

    }
    return handler;
  }

  module.exports = create;
}());
