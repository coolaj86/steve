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
