/*global require, module*/

'use strict';

//NPM Dependencies
var _ = require('underscore');

//Local Dependencies
var logger = require('./adapters/logger').getInstance('AMQP-connection');

/**
 * AMQP Connection Object
 * @param AMQP
 * @param options
 * @constructor
 */
/**
 * Description
 * @method AMQPConnection
 * @param {} AMQP
 * @param {} options
 * @return ThisExpression
 */
var AMQPConnection = function (AMQP, options) {
  logger.info("AMQP Connection Construct:" + JSON.stringify(options));

  if (!AMQP) {
    throw new Error("You Must Supply AMQP Class To The AMQP Connection");
  }

  this.options = _.defaults(options, {
    host : 'localhost',
    port : 5672,
    vhost : '/',
    login : 'guest',
    password : 'guest',
    authMechanism : 'AMQPLAIN',
    ssl : {},
    defaultExchangeName : '',
    reconnect : true,
    reconnectBackoffStrategy : 'linear',
    reconnectBackoffTime : 1000,
    reconnectExponentialLimit : 120000
  });

  //Create AMQP Connection
  this.connection = AMQP.createConnection({
    host          : this.options.host,
    port          : this.options.port,
    vhost         : this.options.vhost,
    login         : this.options.login,
    password      : this.options.password,
    authMechanism : this.options.authMechanism,
    ssl           : this.options.ssl
  }, {
    defaultExchangeName : this.options.defaultExchangeName,
    reconnect : this.options.reconnect,
    reconnectBackoffStrategy : this.options.reconnectBackoffStrategy,
    reconnectBackoffTime : this.options.reconnectBackoffTime,
    reconnectExponentialLimit : this.options.reconnectExponentialLimit
  });
};

module.exports = AMQPConnection;