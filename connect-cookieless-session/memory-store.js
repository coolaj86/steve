/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
(function () {
  "use strict";

  function nextTick(fn, val) {
    process.nextTick(function () {
      fn(val);
    });
  }

  function Store() {
    if (!this) {
      return new Store();
    }
    this.store = {};
  }
  Store.prototype.get = function (key, fn) {
    var val = this.store[key]
      ;

    if (fn) {
      nextTick(fn, val);
    }
    return val;
  };
  Store.prototype.set = function (key, val, fn) {
    this.store[key] = val;
    if (fn) {
      nextTick(fn);
    }
  };
  Store.prototype.delete = function (key, fn) {
    delete this.store[key];
    if (fn) {
      nextTick(fn);
    }
  };

  function create() {
    return new Store();
  }

  Store.create = create;
  module.exports = Store;
}());
