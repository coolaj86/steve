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

    fn && nextTick(fn, val);
    return val;
  };
  Store.prototype.set = function (key, val, fn) {
    this.store[key] = val;
    fn && nextTick(fn);
  };
  Store.prototype.delete = function (key, fn) {
    delete store[key];
    fn && nextTick(fn);
  };

  function create() {
    return new Store();
  }

  Store.create = create;
  module.exports = Store;
}());
