'use strict';

//Test Harness Containing Pointer To Lib
var harness = require('./test.harness');

var AMQPFactory = require(harness.lib + 'AMQPFactory');
var AMQPInstance = require(harness.lib + 'AMQPInstance');
var AMQPConnection = require(harness.lib + 'AMQPConnection');

//Require Mocked Libraries
var AMQP = require('./mocks/amqp');
var AMQPLibInstance = new AMQP();

//Connection Test Suite
describe('AMQP Instance Suite', function () {

  it('Should Throw Error When Constructing Without AMQP Library Instance Param', function () {
    expect(function () {
      new AMQPInstance();
    }).toThrow(new Error("You Must Supply AMQP Class Instance To The Constructor"));
  });

  it('Should get an instance with an AMQPConnection object', function () {
    var inst = new AMQPInstance(AMQPLibInstance);
    expect(inst._rawConnection instanceof AMQPConnection).toBeTruthy();
  });

  it('Should have event emitter prototype methods (on, emit)', function() {
    var inst = new AMQPInstance(AMQPLibInstance);
    expect(typeof inst.on === 'function').toBeTruthy();
    expect(typeof inst.emit === 'function').toBeTruthy();
  });

  it('Should Emit "ready" event when AMQPConnection is ready', function(done) {
    var inst = new AMQPInstance(AMQPLibInstance);
    inst.on('ready', function() {
      expect(arguments).toBeTruthy();
      done();
    });
  });

  it('Should Emit "exchangeBound" event when AMQP exchange is bound', function(done) {
    var inst = new AMQPInstance(AMQPLibInstance);
    inst.on('exchangeBound', function(exchange) {
      expect(exchange.name).toBeTruthy();
      done();
    });
  });

  it('Should publish message to queue with specific routingKey', function(done) {
    var inst = new AMQPInstance(AMQPLibInstance);
    inst.on('exchangeBound', function() {
      inst.publish('testRoute', {foo : { bar : 'baz'}}, {}, function(err) {
        expect(err).toBeFalsy();
        done();
      });
    });
  });

});

