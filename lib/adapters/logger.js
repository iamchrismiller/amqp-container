/*global module, require*/


//npm
var log4js = require('log4js');

//Load log4 Config
log4js.configure(__dirname + '/../../log4js.json');

//Global LogLevel
var logLevel = log4js.levels.INFO;

var logger = {

  _instances : [],

  /**
   * Description
   * @method getInstance
   * @param {} name
   * @return MemberExpression
   */
  getInstance : function(name) {
    if (!this._instances[name]) {
      this._instances[name] = log4js.getLogger(name);
    }
    this._instances[name].setLevel(logLevel);
    return this._instances[name];
  },

  /**
   * Description
   * @method setLogLevel
   * @param {} level
   * @return 
   */
  setLogLevel : function(level) {
    level = level.toUpperCase();
    if (Object.keys(log4js.levels).indexOf(level) !== -1) {
      //Set Global For All New Loggers
      logLevel = level;
      //Set All Active Logger Levels
      for(var instName in this._instances) {
        this._instances[instName].setLevel(logLevel);
      }
    } else {
      throw new Error("Log Level %s not recognized", level);
    }
  }
};

/**
 * Log4js Wrapper
 * @param loggerName
 * @returns {Logger}
 */
module.exports = {

  /**
   * Description
   * @method getInstance
   * @param {} loggerName
   * @return CallExpression
   */
  getInstance : function(loggerName) {
    return logger.getInstance(loggerName);
  },

  /**
   * Description
   * @method setLogLevel
   * @param {} level
   * @return 
   */
  setLogLevel : function(level) {
    logger.setLogLevel(level);
  }
};
