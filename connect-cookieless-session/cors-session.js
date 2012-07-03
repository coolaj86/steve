/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
(function () {
  "use strict";

  var MemoryStore = require('./memory-store')
    ;

  function Session() {

    if (!this) {
      return new Session();
    }
    this.virgin = true;
    this.createdAt = Date.now();
    this.corsStore = MemoryStore.create();
    this.store = this.corsStore;
  }
  Session.prototype.touch = function () {
    this.touchedAt = Date.now();
  };

  function create() {
    return new Session();
  }

  Session.create = create;
  module.exports = Session;
}());
