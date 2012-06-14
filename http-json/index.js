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

      self._errors = self._errors || [];
      if ('object' !== typeof opts) {
        opts = {};
      }

      opts.message = msg;
      opts.code = code;
      self._errors.push(opts);
    };

    // For adding things like 'session'
    resProto.meta = function (key, val) {
      var self = this
        ;

      self._responseMeta = self._responseMeta || {};

      // set
      if (undefined !== val) {
        self._responseMeta[key] = val;
        return;
      }

      // get
      if (1 === arguments.length) {
        return val;
      }

      // delete
      delete self._responseMeta[key];
    };

    resProto._getJson = function (data, opts) {
      var self = this
        , json
        , response = {}
        , space
        , replacer
        ;

      Object.keys(self._responseMeta || {}).forEach(function (key) {
        response[key] = self._responseMeta[key];
      });

      opts = opts || {};
      space = (opts.debug) ? '  ': null;
      replacer = (opts.debug) ? null : removeStack;
      response.timestamp = Date.now();
      response.errors = self._errors || [];
      response.success = !response.errors.length;
      response.result = data;

      self.statusCode = self.statusCode || opts.statusCode || (!response.success ? 400 : 200);

      try {
        json = JSON.stringify(response, replacer, space);
      } catch(e) {
        delete e.stack;
        self.statusCode = 500;
        json = JSON.stringify({ timestamp: Date.now(), success: false, errors: [e], statusCode: 500 }, replacer, space);
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
        jsons = self._getJson('STEVE-TPL-XYZ-987', opts).split('"STEVE-TPL-XYZ-987"');
        jsons = [
            jsons[0]
          , data
          , jsons[1]
        ];
      } else {
        jsons = [self._getJson(data, opts)];
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
  module.exports.init = create;
}());
