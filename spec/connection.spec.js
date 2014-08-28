'use strict';

//Test Harness Containing Pointer To Lib
var harness = require('./test.harness');
var AMQPConnection = require(harness.lib + 'AMQPConnection');

//Require Mocked Libraries
var AMQP = require('./mocks/amqp');
var AMQPLibInstance = new AMQP();

//Connection Test Suite
describe('AMQP Connection Suite', function() {

  beforeEach(function() {
    spyOn(AMQPLibInstance, 'createConnection');
  });

  it('Should Throw Error When Constructing Without AMQP Instance Param', function (){
    expect(function() {
      new AMQPConnection();
    }).toThrow(new Error("You Must Supply AMQP Class To The AMQP Connection"));

    expect(AMQPLibInstance.createConnection).not.toHaveBeenCalled;
  });

  it('Should have a AMQPConnection object with default options', function (){
    var connectionObject = new AMQPConnection(AMQPLibInstance, {});
    expect(connectionObject.options).toEqual(
      { host: 'localhost',
        port: 5672,
        vhost: '/',
        login: 'guest',
        password: 'guest',
        authMechanism: 'AMQPLAIN',
        ssl: {},
        defaultExchangeName: '',
        reconnect: true,
        reconnectBackoffStrategy: 'linear',
        reconnectBackoffTime: 1000,
        reconnectExponentialLimit: 120000
      }
    );
    expect(AMQPLibInstance.createConnection).toHaveBeenCalled;
  });

  it('Should have a AMQPConnection object with merged options', function (){
    var connectionObject = new AMQPConnection(AMQPLibInstance, {host : '127.0.0.1', reconnect : false});
    expect(connectionObject.options.host).toEqual('127.0.0.1');
    expect(connectionObject.options.reconnect).toEqual(false);
    expect(AMQPLibInstance.createConnection).toHaveBeenCalled;
  });

});

