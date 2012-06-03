/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
(function () {
  "use strict";

  function removeStack(key, val) {
    if (val instanceof Error) {
      delete val.stack;
    }
    return val;
  }

  function create(http) {
    var reqProto = http.ClientRequest.prototype
      , resProto = http.ServerResponse.prototype
      ;

    resProto.error = function (msg, code, opts) {
      var self = this
        ;

      self.errors = self.errors || [];
      if ('object' !== typeof opts) {
        opts = {};
      }

      opts.message = msg;
      opts.code = code;
      self.errors.push(opts);
    };

    // For adding things like 'session'
    resProto.meta = function (key, val) {
      var self = this
        ;

      self.responseMeta = self.responseMeta || {};

      // set
      if (undefined !== val) {
        self.responseMeta[key] = val;
        return;
      }

      // get
      if (1 === arguments.length) {
        return val;
      }

      // delete
      delete self.responseMeta[key];
    };

    resProto.getJson = function (data, opts) {
      var self = this
        , json
        , response = {}
        , space
        , replacer
        ;

      Object.keys(self.responseMeta || {}).forEach(function (key) {
        response[key] = self.responseMeta[key];
      });

      opts = opts || {};
      space = (opts.debug) ? '  ': null;
      replacer = (opts.debug) ? null : removeStack;
      response.timestamp = Date.now();
      response.errors = self.errors || [];
      response.error = !!(response.error || (response.errors.length ? true : false));
      response.success = !response.error;
      response.result = data;

      self.statusCode = self.statusCode || opts.statusCode || (response.error ? 400 : 200);

      try {
        json = JSON.stringify(response, replacer, space);
      } catch(e) {
        delete e.stack;
        self.statusCode = 500;
        json = JSON.stringify({ error: true, errors: [e], statusCode: 500 }, replacer, space);
      }

      return json;
    };

    // TODO maybe jsonp
    resProto.json = function (data, opts) {
      var self = this
        , jsons
        ;

      opts = opts || {};
      
      if ('string' === typeof data && opts.stringified) {
        jsons = self.getJson('STEVE-TPL-XYZ-987', opts).split('"STEVE-TPL-XYZ-987"');
        jsons = [
            jsons[0]
          , data
          , jsons[1]
        ];
      } else {
        jsons = [self.getJson(data, opts)];
      }

      self.charset = self.charset || 'utf-8';
      // TODO allow override for application/sometype+json extensions
      self.setHeader('Content-Type', 'application/json');

      jsons.forEach(function (item) {
        self.write(item);
      });
      self.end();
    };
  }

  module.exports = create;
}());
