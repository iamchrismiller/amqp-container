/*global process */

"use strict";

//node
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Queue = require('./queue');

//Empty AMQP Mock Object
function AMQP() {
  // Call the super EventEmitter constructor.
  EventEmitter.call(this);
  // Mock Connection Object
  this.connection = {};
}

//Inherit EventEmitter Prototype Methods
AMQP.prototype = Object.create( EventEmitter.prototype );

AMQP.prototype.publish = function(routingKey, message, options, callback) {
  callback(false);
};

AMQP.prototype.queue = function(name, options, callback) {
  return new Queue(this, null, name, options, callback);
};

//Most Connection Creation Call
AMQP.prototype.createConnection = function () {
  var self = this;

  this.connection = {
    publish : function(routingKey, message, options, callback) {
      if (typeof callback === 'function') callback()
    }
  };

  process.nextTick(function () {
    self.emit("ready");
  });

  return this;
};


AMQP.prototype.exchange = function(name, options, callback) {
  var self = this;

  callback({
    name : name,
    connection : this.connection
  });

  process.nextTick(function () {
    self.emit("exchangeBound");
  });

  return this;
};


module.exports = AMQP;
