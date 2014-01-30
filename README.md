# Node AMQP Container

## Description

Abstract away the cruft when dealing with AMQP.
Mainly Configuration and a few methods, AMQP is now fairly simple.

## Getting Started

Using NPM + Package.json, simply just run `npm install`

## Usage / Configuration

Simple AMQP Publish / Subscribe

```js
var amqpFactory = require('node-amqp-container');

var options = {
  host: '10.0.2.15',
  port: 5672,
  vhost: '/',
  login: 'guest',
  password: 'guest',
  exchange  : {
    name : 'amq.direct',
    passive : true,
    confirm : true //confirm delivery of publishes - CPU Hit
  }
};

//You can supply an instance of AMQP, or get the default node-amqp
var amqpInstance = amqpFactory.getInstance(AMQP, options);

amqpInstance.on('ready', function() {

  //Publish Message To Exchange With Specific Routing Key
  amqpInstance.publish(routingKey, message, options, function() {
    //Callback For Publish
  });

  //Subscribe to Queue on a Specific Exchange
  amqpInstance.subscribe(queueName, exchangeName, options);

  //Catch Message From Subscribed Queue
  amqpInstance.on('message', function(queueName, rawMessage, metaData) {
    //New Message From AMQP
  });
});


Advanced AMQP Publish / Subscribe

```js
  var options = {
    host: '10.0.2.15',
    port: 5672,
    vhost: '/',
    login: 'guest',
    password: 'guest',
    exchange  : {
      name : 'amq.direct',
      passive : true,
      confirm : true //confirm delivery of publishes - CPU Hit
    }
  };

  var amqpFactory = require('node-amqp-container');

  var inst = amqpFactory.getInstance(AMQP, options);

  inst.on('ready', function() {
    //Subscribe / Create Queue on with Acknowledgements
    inst.subscribe(queue, options.exchange.name, null, { durable : true, autoDelete : false }, { ack : true });
  });

  //Publish Message For Test To Consumes
  inst.on('exchangeBound', function() {
    inst.publish(queue, { foo : 'bar' }, { contentType : 'application/json'}, function(err) {
      //Publish Callback
    });
  });

  //Listen For Message Event With Acknowledgements
  inst.on('message', function(queueName, message, meta, next) {
    //calling next(reject, requeue) will acknowledge the current message and get the next
  });

```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

## Release History

- 0.1.4 Fixed issue with queue binding
- 0.1.3 Fixed issue with exchange binding
- 0.1.2 Streamlined subscribe method
- 0.1.1 Added Singleton Connect Method
- 0.1.0 Initial release

## License

Licensed under the Apache 2.0 license.

## Author

Chris Miller