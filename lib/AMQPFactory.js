/*global module, require */

//local
var OptionParser = require('./util/optionParser');
var AMQPInstance = require('./AMQPInstance');

module.exports = {

  _instances : [],

  /**
   * Singleton Instance Factory
   * @param AMQP
   * @param options
   * @returns {*}
   */
  getInstance : function (AMQP, options) {
    if (!AMQP) {
      //Require AMQP Lib
      AMQP = require('amqp');
    }

    var optionParser = new OptionParser(options);
    //Get Custom Instance Key Based On HOST:PORT:VHOST
    var instanceKey = optionParser.getInstanceKey(['host', 'port', 'vhost']);
    if (!this._instances[instanceKey]) {
      return this._instances[instanceKey] = new AMQPInstance(AMQP, options);
    }
    return this._instances[instanceKey].connect();
  }
};