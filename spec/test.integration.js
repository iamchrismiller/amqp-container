'use strict';

//Test Harness Containing Pointer To Lib
var harness = require('./test.harness');
var AMQPFactory = require(harness.lib + 'AMQPFactory');

//Load Actual AMQP Library For Integration Tests
var AMQP = require('amqp');

//Connection Test Suite
describe('AMQP Integration Publishing Suite', function() {

  var queue = 'test-queue';
  var options = {
    host: '10.0.2.15',
    port: 5672,
    vhost: '/',
    login: 'guest',
    password: 'guest',
    //create an exchange for tests
    exchange  : {
      name : 'amq.direct',
      passive : true,
      confirm : true //confirm delivery of publishes
    }
  };

  xit('Should publish message to specified queue and consume it via "message" event', function(done) {
    var inst = AMQPFactory.getInstance(AMQP, options);

    inst.on('ready', function() {
      //Subscribe / Create Queue on
      inst.subscribe(queue, options.exchange.name, null, { durable : true, autoDelete : false }, { ack : true });
    });

    //Publish Message For Test To Consumes
    inst.on('exchangeBound', function() {
      inst.publish(queue, { test : true }, { contentType : 'application/json'}, function(err) {
        expect(err).toBeFalsy();
      });
    });

    //Listen For Message Event
    inst.on('message', function(queueName, message, meta, next) {
      expect(queueName).toEqual(queue);
      expect(message).toEqual({ test : true});
      done();
    });
  });

  it('Should publish multiple message to specified queue and consume them with ack', function(done) {
    var inst = AMQPFactory.getInstance(AMQP, options);
    var messageCount = 0;
    var publishCount = 0;

    inst.on('ready', function() {
      //Subscribe / Create Queue on
      inst.subscribe(queue, options.exchange.name, null, { durable : true, autoDelete : false }, { ack : true });
    });

    //Publish Message For Test To Consumes
    inst.on('exchangeBound', function() {
      for (var i = 0; i<3; i++) {
        inst.publish(queue, { test : true}, { contentType : 'application/json'}, function(err) {
          expect(err).toBeFalsy();
        });
        publishCount++;
      }
    });

    //Listen For Message Event
    inst.on('message', function(queueName, message, meta, ackShift) {
      expect(queueName).toEqual(queue);
      expect(message).toEqual({ test : true});

      messageCount++;

      if (messageCount === publishCount) {
        ackShift();
        done();
      } else {
        ackShift();
      }
    });
  });
});
