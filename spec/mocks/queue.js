"use strict";

//node
var EventEmitter = require('events').EventEmitter;
var util = require('util');

//Empty AMQP Queue Object
function Queue(connection, channel, name, options, callback) {

  this.connection = connection;
  this.channel = channel;
  this.name = name;
  this.exchange = null;
  this.routingKey = null;
  this.options = options;
  this._openCallback = callback;

  // Call the super EventEmitter constructor.
  EventEmitter.call(this);
}

//Inherit EventEmitter Prototype Methods
Queue.prototype = Object.create( EventEmitter.prototype );


Queue.prototype.bind = function(exchange, routingKey, callback) {
  this.exchange = exchange;
  if (routingKey) this.routingKey = routingKey;
  callback(this);
};

module.exports = Queue;
