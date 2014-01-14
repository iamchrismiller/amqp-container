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

  this.connection = {
    publish : function(routingKey, message, options, callback) {
      if (typeof callback === 'function') callback()
    }
  };

  setTimeout(function() {
    this.emit("ready");
  }.bind(this));

  return this;
};


AMQP.prototype.exchange = function(name, options, callback) {
  callback({
    name : name,
    connection : this.connection
  });

  setTimeout(function() {
    this.emit("exchangeBound");
  }.bind(this));

  return this;
};


module.exports = AMQP;
