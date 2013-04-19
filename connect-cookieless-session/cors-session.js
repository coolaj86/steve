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
    // this parameter is used to determine if the session has expired.
    // use process.uptime() to make it independent of the system clock
    this.lastUsed = process.uptime();
    this.corsStore = MemoryStore.create();
    this.store = this.corsStore;
  }
  Session.prototype.touch = function () {
    this.touchedAt = Date.now();
    this.lastUsed = process.uptime();
  };

  function create() {
    return new Session();
  }

  Session.create = create;
  module.exports = Session;
}());
