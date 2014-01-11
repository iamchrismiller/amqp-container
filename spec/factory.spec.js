'use strict';

//Test Harness Containing Pointer To Lib
var harness = require('./test.harness');
var AMQPFactory = require(harness.lib + 'AMQPFactory');
var AMQPInstance = require(harness.lib + 'AMQPInstance');

//Require Mocked Libraries
var AMQP = require('./mocks/amqp');
var AMQPLibInstance = new AMQP();

//Connection Test Suite
describe('AMQP Factory Suite', function () {

  afterEach(function() {
    AMQPFactory._instances = [];
  });

  it('Should not have a constructor but should have a singleton instance Method', function () {
    expect(typeof AMQPFactory).toBe('object');
    expect(AMQPFactory.getInstance).toBeDefined();
  });

  it('Should get an instance of AMQPInstance', function () {
    expect(AMQPFactory.getInstance(AMQPLibInstance, {}) instanceof AMQPInstance).toBeTruthy();
  });

  it('Should have a cached (memory) copy of all AMQPInstance instances', function () {
    AMQPFactory.getInstance(AMQPLibInstance, {host : '127.0.0.1', port : 5679});
    AMQPFactory.getInstance(AMQPLibInstance, {host : '10.0.2.15', port : 5679});
    expect(Object.keys(AMQPFactory._instances).length).toBe(2);
  });

});

