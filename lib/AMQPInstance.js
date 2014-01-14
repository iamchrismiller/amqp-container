/*global require, module*/

// Exchange._onMethod (/srv/or-node-amqp/node_modules/amqp/lib/exchange.js:70:39)
// Fatal error: 'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them
// "use strict";

//node
var EventEmitter = require( "events" ).EventEmitter;
var util = require('util');

//local
var AMQPConnection = require('./AMQPConnection');
var logger = require('./adapters/logger').getInstance('AMQP-instance');

/**
 * AMQP Instance Object
 * Simplifies AMQP Interactions Produce/Consumer
 * @param AMQP
 * @param options
 * @constructor
 */
var AMQPInstance = function (AMQP, options) {
  logger.info("AMQP Instance Construct:" + JSON.stringify(options || {}));
  if (!AMQP) {
    throw new Error("You Must Supply AMQP Class Instance To The Constructor");
  }
  // Call the super EventEmitter constructor.
  EventEmitter.call( this );
  //defaults are handled by AMQP
  this.options = options || {};
  //Setup Null Connection Handler
  this._rawConnection = null;
  this.connection = null;
  //AMQP Exchange Object
  this.exchange = null;
  //Raw AMQP Object
  this.AMQP = AMQP;
  //Run Connect / Event Handlers
  this.connect();
};

//Inherit EventEmitter Prototype Methods
AMQPInstance.prototype = Object.create( EventEmitter.prototype );

/**
 * Connect to AMQP Instance and Fire Events
 * @returns {*}
 */
AMQPInstance.prototype.connect = function() {
  //AMQP Connection Object With EventEmitter
  this._rawConnection = new AMQPConnection(this.AMQP, this.options);
  //AMQP Connection Object
  this.connection = this._rawConnection.connection;
  //Wait for connection to become established.
  this.connection.on('ready', this._onReady.bind(this));
  //Catch AMQP Connection Errors
  this.connection.on('error', this._onError.bind(this));
  return this;
};

/**
 * On AMQP Connection Ready Event
 * @private
 */
AMQPInstance.prototype._onReady = function () {
  logger.info("AMQP Connection Established: ", new Date().toJSON());
  this.emit('ready');
  var exchangeName = this.options.exchange && this.options.exchange.name ? this.options.exchange.name : '#';
  this._bindToExchange(exchangeName, this.options.exchange ? this.options.exchange : {});
};

/**
 * On AMQP Connection Error Event
 * @param error
 * @private
 */
AMQPInstance.prototype._onError = function (error) {
  logger.error("AMQP Error Caught: ", error);
  this.emit('error', error);
};

/**
 * Bind Connection To Exchange
 * Set Local Exchange Options
 * @param exchangeName
 * @param options
 *   type 'fanout', 'direct', or 'topic' (default)
 *   passive (boolean)
 *   durable (boolean)
 *   autoDelete (boolean, default true)
 * @private
 */
AMQPInstance.prototype._bindToExchange = function (exchangeName, options) {
  logger.info("AMQP Binding To Exchange: " + exchangeName + " : ", new Date().toJSON());
  var self = this;
  this.exchange = this.connection.exchange(exchangeName, options, function (exchange) {
    self._exchangeBound.apply(self, [exchange]);
  });
};

/**
 * Exchange Is Bound, Emit Event
 * @param exchange
 * @private
 */
AMQPInstance.prototype._exchangeBound = function(exchange) {
  logger.info("AMQP Exchange " + exchange.name + " Bound: ", new Date().toJSON());
  this._setExchange(exchange);
  this.emit('exchangeBound', exchange);
};

/**
 * Set Exchange Object To Local Context
 * @param exchange
 * @private
 */
AMQPInstance.prototype._setExchange = function(exchange) {
  this.exchange = exchange;
};

/**
 * Publish Message to Queue
 * @param routingKey
 * @param message
 * @param options
 *   mandatory (boolean, default false)
 *   immediate (boolean, default false)
 *   contentType (default 'application/octet-stream')
 *   contentEncoding
 *   headers
 *   deliveryMode
 *   priority (0-9)
 *   correlationId
 *   replyTo
 *   expiration
 *   messageId
 *   timestamp
 *   userId
 *   appId
 *   clusterId
 * @param callback
 *   the callback is optional and is only used when confirm is turned on for the exchange
 */
AMQPInstance.prototype.publish = function (routingKey, message, options, callback) {
  logger.info('Publishing: ' + routingKey + " : Message : " + JSON.stringify(message));
  if (!this.exchange) {
    throw new Error("Error Publishing Message: Exchange Not Bound");
  }

  if (options && !callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
  }

  this.exchange.connection.publish(routingKey, message, options, function(err) {
    logger.info('Callback From Publish: "%s" %s %s', routingKey, JSON.stringify(message), JSON.stringify(options));
    if (typeof callback === 'function') callback(err);
  }.bind(this));
};


/**
 * Subscribe To a queue and bind to exchange
 * @param queueName
 * @param exchangeName
 * @param routingKey
 * @param queueOptions
 *  passive - (false) If set, the server will not create the queue.
 *  durable - (false) Durable queues remain active when a server restarts.
 *                    Non-durable (transient queues) are purged if/when a server restarts.
 *  exclusive - (false) Exclusive queues may only be consumed from by the current connection.
 *  autoDelete - (true) If set, the queue is deleted when all consumers have finished using it.
 *                      Last consumer can be cancelled either explicitly or because its channel is closed.
 *  noDeclare - (false) If set, the queue will not be declared, this will allow a queue to be deleted if you don't know its previous options.
 *  arguments - ({}) a map of additional arguments to pass in when creating a queue.
 *  closeChannelOnUnsubscribe - (false) If set, the channel will close on unsubscrube
 *@param subscribeOptions
 *  ack - (false),
 *  prefetchCount - (1)
 */
AMQPInstance.prototype.subscribe = function (queueName, exchangeName, routingKey, queueOptions, subscribeOptions) {
  var self = this;
  this.connection.queue(queueName, queueOptions ? queueOptions : {}, function(queue) {
    logger.info('AMQP Queue "%s" ready', queue.name);

    if (!exchangeName) exchangeName = '#';

    var bindArgs = [exchangeName];
    if (routingKey) bindArgs.push(routingKey);
    //Bind Callback
    bindArgs.push(function () {
      logger.info('AMQP Queue "%s" Bound to "%s" Exchange', queueName, exchangeName);
      self.emit('queueBound');
    });

    queue.bind.apply(queue, bindArgs);

    //Subscribe To Queue
    queue.subscribe(subscribeOptions ? subscribeOptions : {}, function(message, headers, deliveryInfo){
      logger.debug('AMQP Queue "%s" processing message : %s', queue.name, util.inspect(message, false, 5));
      self.onMessage.apply(self, [queueName, message, {headers : headers, deliveryInfo : deliveryInfo}, queue.shift.bind(queue)]);
    });

  });
};

/**
 * On New Queue Message
 * @param queueName
 * @param rawMessage
 * @param metadata
 * @param shift
 */
AMQPInstance.prototype.onMessage = function(queueName, rawMessage, metaData, shift) {
  this.emit('message', queueName, rawMessage, metaData, shift);
};

module.exports = AMQPInstance;